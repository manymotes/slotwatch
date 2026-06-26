import express, { Request, Response } from 'express';
import path from 'path';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'fs';

config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const PORT = parseInt(process.env.PORT || '3001');
const INSTANCE_SECRET = process.env.INSTANCE_SECRET || '';

// DATA_DIR: default is ../state relative to this compiled file's location (dist/)
// In dev (ts-node, __dirname = src/), we go up two levels
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'state');

function dataPath(file: string) {
  return path.join(DATA_DIR, file);
}

function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ── Tesla headers (shared pattern from personal project) ──────────────────────

const TESLA_HEADERS: Record<string, string> = {
  'x-tesla-user-agent': 'TeslaApp/4.57.0/b937ef26/ios/26.5.1',
  'User-Agent': 'TeslaV4/4306 CFNetwork/3860.600.12 Darwin/25.5.0',
  'Accept-Language': 'en',
};

// ── Token helpers ─────────────────────────────────────────────────────────────

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let _tokenCache: TokenCache | null = null;

async function refreshAccessToken(refreshToken: string): Promise<TokenCache> {
  const { default: fetch } = await import('node-fetch');
  const res = await (fetch as any)('https://auth.tesla.com/oauth2/v3/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: 'ownerapi',
      refresh_token: refreshToken,
      scope: 'openid email offline_access',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Write rotated tokens to disk
  ensureDataDir();
  writeFileSync(dataPath('.access_token'), data.access_token, { mode: 0o600 });
  writeFileSync(dataPath('.refresh_token'), data.refresh_token, { mode: 0o600 });

  const cache: TokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
  _tokenCache = cache;
  return cache;
}

async function getAccessToken(): Promise<string> {
  // In-memory cache
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.accessToken;
  }

  // Try stored access token (decode JWT exp)
  const accessFile = dataPath('.access_token');
  if (existsSync(accessFile)) {
    try {
      const stored = readFileSync(accessFile, 'utf8').trim();
      const payload = JSON.parse(
        Buffer.from(stored.split('.')[1], 'base64').toString(),
      );
      const expiresAt = payload.exp * 1000 - 300_000;
      if (Date.now() < expiresAt) {
        _tokenCache = { accessToken: stored, expiresAt };
        return stored;
      }
    } catch {
      // fall through to refresh
    }
  }

  // Refresh using stored refresh token
  const refreshFile = dataPath('.refresh_token');
  if (!existsSync(refreshFile)) {
    throw new Error('No tokens found. Connect your Tesla account to get started.');
  }
  const refreshToken = readFileSync(refreshFile, 'utf8').trim();
  console.log('[dashboard] Access token expired — refreshing...');
  const cache = await refreshAccessToken(refreshToken);
  return cache.accessToken;
}

// ── Tesla fetch helper ────────────────────────────────────────────────────────

async function teslaFetch(url: string, options: object = {}): Promise<any> {
  const { default: fetch } = await import('node-fetch');
  const token = await getAccessToken();
  const res = await (fetch as any)(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...TESLA_HEADERS,
      ...((options as any).headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tesla API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function ownershipUrl(p: string, vin: string): string {
  return `https://ownership.tesla.com${p}&vin=${vin}`;
}

// ── Config helpers ────────────────────────────────────────────────────────────

interface TeslaConfig {
  vin: string;
  activities: any[];
  lat: number;
  lon: number;
  serviceVisitId: number;
}

function getTeslaConfig(): TeslaConfig | null {
  const f = dataPath('tesla-config.json');
  if (!existsSync(f)) return null;
  return JSON.parse(readFileSync(f, 'utf8'));
}

// ── Middleware: auth check for internal routes ─────────────────────────────────

function requireInstanceSecret(req: Request, res: Response, next: () => void) {
  const secret = req.headers['x-instance-secret'] as string | undefined;
  if (!INSTANCE_SECRET || secret !== INSTANCE_SECRET) {
    res.status(403).json({ ok: false, error: 'Forbidden' });
    return;
  }
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET / — serve index.html (handled by static middleware above, but explicit fallback)
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// GET /api/meta
app.get('/api/meta', (_req: Request, res: Response) => {
  res.json({ emailTo: process.env.EMAIL_TO || '' });
});

// GET /api/status — watcher status
app.get('/api/status', (_req: Request, res: Response) => {
  try {
    const f = dataPath('watcher-status.json');
    if (!existsSync(f)) return void res.json({ ok: true, status: null });
    res.json({ ok: true, status: JSON.parse(readFileSync(f, 'utf8')) });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/config — combined watch + tesla config
app.get('/api/config', (_req: Request, res: Response) => {
  try {
    const watchFile = dataPath('watch-config.json');
    const teslaFile = dataPath('tesla-config.json');
    const watch = existsSync(watchFile) ? JSON.parse(readFileSync(watchFile, 'utf8')) : null;
    const tesla = existsSync(teslaFile) ? JSON.parse(readFileSync(teslaFile, 'utf8')) : null;
    const connected = existsSync(dataPath('.access_token')) || existsSync(dataPath('.refresh_token'));
    res.json({ ok: true, watch, tesla, connected });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/config/watch — save watch config
app.post('/api/config/watch', (req: Request, res: Response) => {
  try {
    ensureDataDir();
    const { trtIds, dateFrom, dateTo, locationNames } = req.body as {
      trtIds: number[];
      dateFrom: string;
      dateTo: string;
      locationNames: Record<number, string>;
    };
    writeFileSync(dataPath('watch-config.json'), JSON.stringify({ trtIds, dateFrom, dateTo, locationNames }, null, 2));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/internal/tokens — called by the SaaS API after OAuth completes
// Protected by INSTANCE_SECRET header
app.post('/api/internal/tokens', requireInstanceSecret as any, (req: Request, res: Response) => {
  try {
    ensureDataDir();
    const { access_token, refresh_token, vin, activities, lat, lon, serviceVisitId } = req.body as {
      access_token: string;
      refresh_token: string;
      vin: string;
      activities: any[];
      lat: number;
      lon: number;
      serviceVisitId: number;
    };

    writeFileSync(dataPath('.access_token'), access_token, { mode: 0o600 });
    writeFileSync(dataPath('.refresh_token'), refresh_token, { mode: 0o600 });

    const teslaConfig: TeslaConfig = { vin, activities, lat, lon, serviceVisitId };
    writeFileSync(dataPath('tesla-config.json'), JSON.stringify(teslaConfig, null, 2));

    // Invalidate in-memory cache
    _tokenCache = null;

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/oauth/start — returns the Tesla OAuth URL (generated by parent API, proxied here)
// In practice the customer container gets the URL injected via /api/internal/tokens.
// This route supports the in-dashboard OAuth flow: redirect to the SaaS API /oauth/start.
app.get('/api/oauth/start', (_req: Request, res: Response) => {
  // The SaaS API URL is injected via environment variable SAAS_API_URL
  const saasUrl = process.env.SAAS_API_URL;
  if (!saasUrl) {
    return void res.status(503).json({ ok: false, error: 'SAAS_API_URL not configured' });
  }
  // Forward — let the caller redirect
  res.json({ ok: true, url: `${saasUrl}/oauth/start` });
});

// POST /api/oauth/complete — paste tesla:// callback URL, exchange code for tokens
app.post('/api/oauth/complete', async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url: string };
    if (!url || !url.startsWith('tesla://')) {
      return void res.status(400).json({ ok: false, error: 'Expected a tesla:// callback URL' });
    }

    // Delegate to SaaS API which holds the PKCE code_verifier
    const saasUrl = process.env.SAAS_API_URL;
    if (!saasUrl) {
      return void res.status(503).json({ ok: false, error: 'SAAS_API_URL not configured' });
    }

    const { default: fetch } = await import('node-fetch');
    const r = await (fetch as any)(`${saasUrl}/oauth/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-instance-secret': INSTANCE_SECRET },
      body: JSON.stringify({ url }),
    });
    const data: any = await r.json();
    if (!r.ok || data.ok === false) throw new Error(data.error || `HTTP ${r.status}`);

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /api/appointments — proxy to Tesla API
app.get('/api/appointments', async (_req: Request, res: Response) => {
  try {
    const tc = getTeslaConfig();
    if (!tc) return void res.status(503).json({ ok: false, error: 'Tesla account not connected yet' });

    const data: any = await teslaFetch(
      ownershipUrl('/mobile-app/service/appointments?deviceLanguage=en&deviceCountry=US&ttpLocale=en_US', tc.vin),
    );
    res.json({
      ok: true,
      appointments: data?.data?.serviceAppointments ?? [],
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/locations/search — geocode + nearest Tesla service centers
app.post('/api/locations/search', async (req: Request, res: Response) => {
  try {
    const tc = getTeslaConfig();
    if (!tc) return void res.status(503).json({ ok: false, error: 'Tesla account not connected yet' });

    const { address, latitude, longitude } = req.body as {
      address?: string;
      latitude?: number;
      longitude?: number;
    };

    let lat = latitude ?? tc.lat;
    let lon = longitude ?? tc.lon;

    if (address) {
      const { default: fetch } = await import('node-fetch');
      const geoRes = await (fetch as any)(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'SlotWatch/1.0 (service-watcher)' } },
      );
      const geo: any[] = await geoRes.json();
      if (!geo.length) {
        return void res.status(400).json({ ok: false, error: 'Address not found — try a city name or zip code' });
      }
      lat = parseFloat(geo[0].lat);
      lon = parseFloat(geo[0].lon);
    }

    const data: any = await teslaFetch(
      ownershipUrl('/mobile-app/service/locations/nearest?deviceLanguage=en&deviceCountry=US&ttpLocale=en_US', tc.vin),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: 'US',
          activities: tc.activities,
          latitude: lat,
          longitude: lon,
          isRescheduleOnly: true,
          fetchSlots: true,
          serviceVisitId: tc.serviceVisitId,
        }),
      },
    );

    const rawLocs: any[] = data?.data?.locations?.Tesla_Center_Service ?? [];
    const locations = rawLocs.map((loc) => ({
      trtId: loc.trtID,
      functionId: loc.functionID,
      name: loc.locationName,
      city: `${loc.city}, ${loc.state}`,
      address: `${loc.streetName}, ${loc.city}, ${loc.state} ${loc.zipCode}`,
      distance: loc.distance,
      timezone: loc.ianaTimeZoneId ?? 'America/Denver',
      slots: loc.slots ?? {},
    }));

    res.json({ ok: true, locations, geocoded: { lat, lon } });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[dashboard] Serving on port ${PORT}, data dir: ${DATA_DIR}`);
});
