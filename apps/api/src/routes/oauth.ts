import 'dotenv/config';
import { Hono } from 'hono';
import { eq, and, gt } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import { db, users, oauthStates, encrypt } from '../db';

const TESLA_AUTH_BASE = 'https://auth.tesla.com/oauth2/v3';
const TESLA_OWNERSHIP_BASE = 'https://ownership.tesla.com/mobile-app';
const REDIRECT_URI = 'tesla://auth/callback';
const TESLA_CLIENT_ID = 'ownerapi';

export const oauthRouter = new Hono();

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  // 43–128 URL-safe base64 characters as per RFC 7636
  return randomBytes(40).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

function generateState(): string {
  return randomBytes(24).toString('hex');
}

// ── GET /api/oauth/start?userId=xxx ───────────────────────────────────────────

oauthRouter.get('/api/oauth/start', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) {
    return c.json({ error: 'userId query parameter is required' }, 400);
  }

  // Verify user exists
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

  await db.insert(oauthStates).values({
    userId,
    state,
    codeVerifier,
    createdAt: now,
    expiresAt,
  });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TESLA_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid email offline_access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${TESLA_AUTH_BASE}/authorize?${params.toString()}`;

  return c.json({ authUrl });
});

// ── POST /api/oauth/complete ──────────────────────────────────────────────────

oauthRouter.post('/api/oauth/complete', async (c) => {
  const body = await c.req.json<{
    userId?: string;
    callbackUrl?: string;
  }>().catch(() => ({ userId: undefined, callbackUrl: undefined }));

  const { userId, callbackUrl } = body;

  if (!userId || !callbackUrl) {
    return c.json({ error: 'userId and callbackUrl are required' }, 400);
  }

  // Parse the tesla://auth/callback?code=...&state=... URL
  let code: string | null = null;
  let returnedState: string | null = null;

  try {
    // Node URL parser doesn't understand the tesla:// scheme, so swap it
    const parseable = callbackUrl.replace(/^tesla:\/\//, 'https://tesla.local/');
    const parsed = new URL(parseable);
    code = parsed.searchParams.get('code');
    returnedState = parsed.searchParams.get('state');
  } catch {
    return c.json({ error: 'Invalid callbackUrl format' }, 400);
  }

  if (!code || !returnedState) {
    return c.json({ error: 'callbackUrl must contain code and state parameters' }, 400);
  }

  // Verify state and retrieve codeVerifier
  const now = new Date();

  const [storedState] = await db
    .select()
    .from(oauthStates)
    .where(
      and(
        eq(oauthStates.userId, userId),
        eq(oauthStates.state, returnedState),
        gt(oauthStates.expiresAt, now),
      ),
    )
    .limit(1);

  if (!storedState) {
    return c.json(
      { error: 'Invalid or expired OAuth state. Please restart the login flow.' },
      400,
    );
  }

  // Clean up the used state record
  await db.delete(oauthStates).where(eq(oauthStates.id, storedState.id));

  // Exchange code for tokens
  let accessToken: string;
  let refreshToken: string;

  try {
    const tokenRes = await fetch(`${TESLA_AUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: TESLA_CLIENT_ID,
        code,
        code_verifier: storedState.codeVerifier,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text().catch(() => '');
      throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`);
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      token_type: string;
    };

    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Tesla token exchange error:', message);
    return c.json({ error: `Token exchange failed: ${message}` }, 502);
  }

  // Fetch user's Tesla appointment data
  let appointmentData: unknown = null;

  try {
    const apptRes = await fetch(
      `${TESLA_OWNERSHIP_BASE}/service/appointments`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (apptRes.ok) {
      appointmentData = await apptRes.json();
    } else {
      console.warn(
        'Failed to fetch Tesla appointments:',
        apptRes.status,
        await apptRes.text().catch(() => ''),
      );
    }
  } catch (err) {
    console.warn('Error fetching Tesla appointments:', err);
  }

  // Retrieve user's machine URL and instance secret
  const [user] = await db
    .select({
      id: users.id,
      flyMachineUrl: users.flyMachineUrl,
      instanceSecret: users.instanceSecret,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Push tokens + config to the user's Fly machine
  if (user.flyMachineUrl && user.instanceSecret) {
    try {
      const { decrypt } = await import('../db');
      const secret = decrypt(user.instanceSecret);

      const pushRes = await fetch(`${user.flyMachineUrl}/api/internal/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Instance-Secret': secret,
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          appointmentData,
        }),
      });

      if (!pushRes.ok) {
        console.error(
          'Failed to push tokens to machine',
          user.flyMachineUrl,
          pushRes.status,
          await pushRes.text().catch(() => ''),
        );
      }
    } catch (err) {
      console.error('Error pushing tokens to machine:', err);
    }
  }

  // Persist encrypted refresh token
  await db
    .update(users)
    .set({ encryptedRefreshToken: encrypt(refreshToken) })
    .where(eq(users.id, userId));

  return c.json({ ok: true, appointmentData });
});
