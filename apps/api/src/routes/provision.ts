import 'dotenv/config';
import { Hono } from 'hono';
import Stripe from 'stripe';
import { eq, not, isNull } from 'drizzle-orm';
import { db, users } from '../db';
import { suspendAll, countMachines } from '../fly';
import { sendAdminNotification } from '../email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

export const provisionRouter = new Hono();

// ── Admin auth middleware helper ───────────────────────────────────────────────

function isAdminAuthorized(c: { req: { header: (name: string) => string | undefined } }): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const provided = c.req.header('x-admin-key') ?? c.req.header('authorization')?.replace(/^Bearer\s+/i, '');
  return provided === adminKey;
}

// ── GET /api/health ───────────────────────────────────────────────────────────

provisionRouter.get('/api/health', async (c) => {
  try {
    const machineCount = await countMachines();
    return c.json({ ok: true, machines: machineCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Health check error:', message);
    return c.json({ ok: false, error: message, machines: 0 }, 500);
  }
});

// ── POST /api/provision/kill-switch ──────────────────────────────────────────

provisionRouter.post('/api/provision/kill-switch', async (c) => {
  if (!isAdminAuthorized(c)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json<{ reason?: string }>().catch(() => ({ reason: undefined }));
  const reason = body.reason ?? 'No reason provided';

  const results: {
    flyMachinesSuspended: string[];
    stripeSubscriptionsPaused: number;
    errors: string[];
  } = {
    flyMachinesSuspended: [],
    stripeSubscriptionsPaused: 0,
    errors: [],
  };

  // 1. Suspend all Fly machines
  try {
    const { suspended } = await suspendAll();
    results.flyMachinesSuspended = suspended;
    console.log(`Kill switch: suspended ${suspended.length} Fly machines`);
  } catch (err) {
    const msg = `Failed to suspend Fly machines: ${err instanceof Error ? err.message : String(err)}`;
    console.error(msg);
    results.errors.push(msg);
  }

  // 2. Pause all active Stripe subscriptions
  try {
    const activeUsers = await db
      .select({
        id: users.id,
        email: users.email,
        stripeSubscriptionId: users.stripeSubscriptionId,
      })
      .from(users)
      .where(not(isNull(users.stripeSubscriptionId)));

    const pauseResults = await Promise.allSettled(
      activeUsers
        .filter((u) => u.stripeSubscriptionId)
        .map(async (u) => {
          await stripe.subscriptions.update(u.stripeSubscriptionId!, {
            pause_collection: {
              behavior: 'void',
            },
          });

          await db
            .update(users)
            .set({ subscriptionStatus: 'paused' })
            .where(eq(users.id, u.id));
        }),
    );

    let paused = 0;
    for (const r of pauseResults) {
      if (r.status === 'fulfilled') {
        paused++;
      } else {
        const msg = `Failed to pause a subscription: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`;
        console.error(msg);
        results.errors.push(msg);
      }
    }

    results.stripeSubscriptionsPaused = paused;
    console.log(`Kill switch: paused ${paused} Stripe subscriptions`);
  } catch (err) {
    const msg = `Failed to pause Stripe subscriptions: ${err instanceof Error ? err.message : String(err)}`;
    console.error(msg);
    results.errors.push(msg);
  }

  // 3. Notify admin
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendAdminNotification(adminEmail, {
        subject: 'SlotWatch Kill Switch Activated',
        body: [
          `Kill switch activated at ${new Date().toISOString()}.`,
          `Reason: ${reason}`,
          `Fly machines suspended: ${results.flyMachinesSuspended.length}`,
          `Stripe subscriptions paused: ${results.stripeSubscriptionsPaused}`,
          results.errors.length > 0
            ? `Errors:\n${results.errors.join('\n')}`
            : 'No errors.',
        ].join('\n\n'),
      });
    }
  } catch (err) {
    const msg = `Failed to send admin notification: ${err instanceof Error ? err.message : String(err)}`;
    console.error(msg);
    results.errors.push(msg);
  }

  const status = results.errors.length > 0 ? 207 : 200;
  return c.json(
    {
      ok: results.errors.length === 0,
      ...results,
    },
    status,
  );
});
