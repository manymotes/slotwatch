#!/usr/bin/env npx ts-node
/**
 * SlotWatch Health Monitor
 * Run: npx ts-node scripts/health-check.ts
 * Force email: FORCE_REPORT=true npx ts-node scripts/health-check.ts
 * Dry-run (skip real email send): TEST_MODE=true npx ts-node scripts/health-check.ts
 */

import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import * as nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SITE_URL = "https://slotwatch-web.pages.dev";
const NOTIFY_EMAIL = "motesmass@gmail.com";
const WATCHER_STATUS_PATH = "/Users/kendallmotes/tesla/state/watcher-status.json";
const TOKEN_CACHE_PATH = "/Users/kendallmotes/tesla/state/token-cache.json";
const TEST_MODE = process.env.TEST_MODE === "true" || process.env.TEST_MODE === "1";
const FORCE_REPORT = process.env.FORCE_REPORT === "true" || process.env.FORCE_REPORT === "1";

const SMTP_CONFIG = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "golf@theopencourse.app",
    pass: "${SMTP_PASS}",
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
  warn?: boolean;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function httpGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      })
      .on("error", reject);
  });
}

function httpPost(
  url: string,
  payload: Record<string, unknown>
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = mod.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function checkSite(): Promise<CheckResult> {
  const name = "Deployed site (slotwatch-web.pages.dev)";
  try {
    const { status } = await httpGet(`${SITE_URL}/`);
    if (status === 200) {
      return { name, ok: true, message: `HTTP ${status}` };
    }
    return { name, ok: false, message: `Expected 200, got HTTP ${status}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, ok: false, message: `Request failed: ${msg}` };
  }
}

async function checkEmailApi(): Promise<CheckResult> {
  const name = "Email API (/api/notify)";
  // Use ?dry=1 param when TEST_MODE is set to avoid real sends
  const url = `${SITE_URL}/api/notify${TEST_MODE ? "?dry=1" : ""}`;
  try {
    const { status, body } = await httpPost(url, {
      email: "health-check@test.com",
      source: "health-check",
    });
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(body);
    } catch {
      // ignore parse errors
    }
    if (status === 200 && parsed["ok"] === true) {
      return { name, ok: true, message: `HTTP ${status}, ok=true` };
    }
    return {
      name,
      ok: false,
      message: `HTTP ${status}, body: ${body.slice(0, 200)}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, ok: false, message: `Request failed: ${msg}` };
  }
}

function checkWatcherStatus(): CheckResult {
  const name = "Mac Mini watcher status";
  try {
    if (!fs.existsSync(WATCHER_STATUS_PATH)) {
      return {
        name,
        ok: false,
        message: `File not found: ${WATCHER_STATUS_PATH}`,
      };
    }
    const raw = fs.readFileSync(WATCHER_STATUS_PATH, "utf-8");
    const data = JSON.parse(raw) as {
      lastCheck?: string;
      configured?: boolean;
    };

    if (data.configured !== true) {
      return { name, ok: false, message: `"configured" is not true in watcher-status.json` };
    }

    if (!data.lastCheck) {
      return { name, ok: false, message: `"lastCheck" field missing from watcher-status.json` };
    }

    const lastCheckMs = new Date(data.lastCheck).getTime();
    if (isNaN(lastCheckMs)) {
      return { name, ok: false, message: `"lastCheck" is not a valid date: ${data.lastCheck}` };
    }

    const ageMs = Date.now() - lastCheckMs;
    const ageHours = ageMs / (1000 * 60 * 60);

    if (ageHours > 2) {
      return {
        name,
        ok: false,
        message: `Last check was ${ageHours.toFixed(1)}h ago (threshold: 2h). lastCheck=${data.lastCheck}`,
      };
    }

    return {
      name,
      ok: true,
      message: `configured=true, lastCheck ${(ageHours * 60).toFixed(0)}m ago`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, ok: false, message: `Error reading watcher status: ${msg}` };
  }
}

function checkTeslaToken(): CheckResult {
  const name = "Tesla API token";
  try {
    if (!fs.existsSync(TOKEN_CACHE_PATH)) {
      return {
        name,
        ok: false,
        message: `Token cache not found: ${TOKEN_CACHE_PATH}`,
      };
    }
    const raw = fs.readFileSync(TOKEN_CACHE_PATH, "utf-8");
    const data = JSON.parse(raw) as {
      access_token?: string;
      expires_at?: number | string;
      expiry?: number | string;
    };

    // Support multiple expiry field names
    const expiryRaw = data.expires_at ?? data.expiry;
    if (!expiryRaw) {
      return {
        name,
        ok: true,
        warn: true,
        message: `Token file found but no expiry field detected — cannot verify freshness`,
      };
    }

    // Handle epoch seconds vs milliseconds vs ISO string
    let expiryMs: number;
    if (typeof expiryRaw === "string") {
      expiryMs = new Date(expiryRaw).getTime();
    } else if (expiryRaw > 1e12) {
      // Already milliseconds
      expiryMs = expiryRaw;
    } else {
      // Seconds
      expiryMs = expiryRaw * 1000;
    }

    const remainingMs = expiryMs - Date.now();
    const remainingHours = remainingMs / (1000 * 60 * 60);

    if (remainingMs <= 0) {
      return {
        name,
        ok: false,
        message: `Token EXPIRED ${Math.abs(remainingHours).toFixed(1)}h ago`,
      };
    }

    if (remainingHours < 1) {
      return {
        name,
        ok: true,
        warn: true,
        message: `Token expiring soon — ${(remainingHours * 60).toFixed(0)} minutes remaining`,
      };
    }

    return {
      name,
      ok: true,
      message: `Token valid, expires in ${remainingHours.toFixed(1)}h`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name, ok: false, message: `Error reading token cache: ${msg}` };
  }
}

// ---------------------------------------------------------------------------
// Email summary
// ---------------------------------------------------------------------------

async function sendSummaryEmail(results: CheckResult[]): Promise<void> {
  const hasIssues = results.some((r) => !r.ok);
  const hasWarnings = results.some((r) => r.warn);
  const subject =
    hasIssues
      ? "SlotWatch Health: ISSUES FOUND"
      : "SlotWatch Health: OK";

  const lines = results.map((r) => {
    const icon = r.ok ? (r.warn ? "WARN" : " OK ") : "FAIL";
    return `[${icon}] ${r.name}\n       ${r.message}`;
  });

  const body = [
    `SlotWatch Health Report — ${new Date().toISOString()}`,
    ``,
    ...lines,
    ``,
    hasIssues
      ? "Action required — one or more checks failed."
      : hasWarnings
      ? "All checks passed with warnings."
      : "All checks passed.",
    ``,
    `Run manually: npx ts-node scripts/health-check.ts`,
  ].join("\n");

  if (TEST_MODE) {
    console.log("\n[TEST_MODE] Would send email:");
    console.log(`  To: ${NOTIFY_EMAIL}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${body}`);
    return;
  }

  const transporter = nodemailer.createTransport(SMTP_CONFIG);
  await transporter.sendMail({
    from: `"SlotWatch Monitor" <${SMTP_CONFIG.auth.user}>`,
    to: NOTIFY_EMAIL,
    subject,
    text: body,
  });
  console.log(`\nSummary email sent to ${NOTIFY_EMAIL} — "${subject}"`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`SlotWatch Health Check — ${new Date().toISOString()}`);
  console.log(`TEST_MODE=${TEST_MODE}  FORCE_REPORT=${FORCE_REPORT}\n`);

  // Run async checks concurrently, sync checks inline
  const [siteResult, emailApiResult] = await Promise.all([
    checkSite(),
    checkEmailApi(),
  ]);

  const watcherResult = checkWatcherStatus();
  const tokenResult = checkTeslaToken();

  const results: CheckResult[] = [
    siteResult,
    emailApiResult,
    watcherResult,
    tokenResult,
  ];

  // Print results
  for (const r of results) {
    const icon = r.ok ? (r.warn ? "WARN" : " OK ") : "FAIL";
    console.log(`[${icon}] ${r.name}`);
    console.log(`       ${r.message}`);
  }

  const hasIssues = results.some((r) => !r.ok);
  console.log(`\nOverall: ${hasIssues ? "ISSUES FOUND" : "OK"}`);

  // Send email if there are issues or FORCE_REPORT is set
  if (hasIssues || FORCE_REPORT) {
    await sendSummaryEmail(results);
  } else {
    console.log("No issues — skipping email (set FORCE_REPORT=true to override)");
  }

  process.exit(hasIssues ? 1 : 0);
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(2);
});
