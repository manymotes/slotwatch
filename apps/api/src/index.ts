import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { billingRouter } from './routes/billing';
import { oauthRouter } from './routes/oauth';
import { provisionRouter } from './routes/provision';

// ── App ───────────────────────────────────────────────────────────────────────

const app = new Hono();

// Logging
app.use('*', logger());

// CORS — allow the web app origin (and localhost in development)
const allowedOrigins = [
  process.env.WEB_APP_URL ?? 'https://slotwatch.app',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return null; // non-browser / server-to-server
      if (allowedOrigins.includes(origin)) return origin;
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    credentials: true,
    maxAge: 86400,
  }),
);

// ── Stripe webhook: must be mounted BEFORE the JSON body-parser middleware ───
// The stripe signature check needs the raw body, which Hono streams by default.
app.route('/', billingRouter);

// ── API routes ────────────────────────────────────────────────────────────────
app.route('/', oauthRouter);
app.route('/', provisionRouter);

// ── Fallback ──────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// ── Server ────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3000', 10);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`SlotWatch API running on http://localhost:${info.port}`);
    console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
  },
);

export default app;
