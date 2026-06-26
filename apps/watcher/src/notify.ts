/**
 * Notification module — tries every configured channel independently.
 * A failure on one channel never prevents the others from firing.
 *
 * Supported channels (all opt-in via environment variables):
 *   Email   — EMAIL_SMTP_* + EMAIL_TO / EMAIL_FROM
 *   SMS     — TWILIO_SID / TWILIO_TOKEN / TWILIO_FROM / SMS_TO
 *   ntfy.sh — NTFY_TOPIC
 */

import nodemailer from "nodemailer";

// ── Helpers ────────────────────────────────────────────────────────────────

function env(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

function envRequired(key: string): string | undefined {
  const v = env(key);
  return v && v.length > 0 ? v : undefined;
}

// ── Email ──────────────────────────────────────────────────────────────────

function buildHtmlEmail(subject: string, message: string): string {
  // Convert newlines to <br> for the plain message body
  const htmlMessage = message
    .split("\n")
    .map((line) => {
      // Slot lines look like "• 2025-08-15 09:30 — Tesla Service Center"
      if (line.startsWith("•")) {
        return `<div class="slot-line">${escapeHtml(line)}</div>`;
      }
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(subject)}</title>
<style>
  body {
    margin: 0; padding: 0;
    background: #0d0f12;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #e2e8f0;
  }
  .wrapper {
    max-width: 560px;
    margin: 40px auto;
    background: #16191f;
    border: 1px solid #2a2f3a;
    border-radius: 12px;
    overflow: hidden;
  }
  .header {
    background: #1a1f2b;
    border-bottom: 1px solid #2a2f3a;
    padding: 24px 32px;
  }
  .header-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #64b5f6;
    margin: 0 0 6px 0;
  }
  .header-title {
    font-size: 20px;
    font-weight: 700;
    color: #f0f4ff;
    margin: 0;
  }
  .body {
    padding: 28px 32px;
  }
  p {
    margin: 0 0 12px 0;
    font-size: 15px;
    line-height: 1.6;
    color: #b0bec5;
  }
  p:last-child { margin-bottom: 0; }
  .slot-line {
    display: block;
    background: #1e2330;
    border-left: 3px solid #64b5f6;
    border-radius: 0 6px 6px 0;
    padding: 10px 16px;
    margin: 6px 0;
    font-size: 14px;
    font-weight: 500;
    color: #e2e8f0;
    font-variant-numeric: tabular-nums;
  }
  .footer {
    border-top: 1px solid #2a2f3a;
    padding: 16px 32px;
    font-size: 12px;
    color: #546e7a;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-eyebrow">SlotWatch Alert</div>
      <h1 class="header-title">${escapeHtml(subject)}</h1>
    </div>
    <div class="body">
      ${htmlMessage}
    </div>
    <div class="footer">
      Sent by SlotWatch &mdash; your Tesla service appointment watcher
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(subject: string, message: string): Promise<void> {
  const to = envRequired("EMAIL_TO");
  const from = envRequired("EMAIL_FROM");
  const host = env("EMAIL_SMTP_HOST") ?? "smtp.gmail.com";
  const port = parseInt(env("EMAIL_SMTP_PORT") ?? "587", 10);
  const user = envRequired("EMAIL_SMTP_USER");
  const pass = envRequired("EMAIL_SMTP_PASS");

  if (!to || !from || !user || !pass) {
    return; // Channel not configured
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"SlotWatch" <${from}>`,
    to,
    subject,
    text: message,
    html: buildHtmlEmail(subject, message),
  });

  console.log(`[notify] Email sent to ${to}`);
}

// ── SMS via Twilio REST API ────────────────────────────────────────────────

async function sendSms(message: string): Promise<void> {
  const sid = envRequired("TWILIO_SID");
  const token = envRequired("TWILIO_TOKEN");
  const from = envRequired("TWILIO_FROM");
  const to = envRequired("SMS_TO");

  if (!sid || !token || !from || !to) {
    return; // Channel not configured
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;

  const body = new URLSearchParams({ To: to, From: from, Body: message });

  const credentials = Buffer.from(`${sid}:${token}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`Twilio SMS failed: ${res.status} — ${text}`);
  }

  const json = (await res.json()) as { sid?: string };
  console.log(`[notify] SMS sent (Twilio SID: ${json.sid ?? "unknown"})`);
}

// ── ntfy.sh ────────────────────────────────────────────────────────────────

async function sendNtfy(subject: string, message: string): Promise<void> {
  const topic = envRequired("NTFY_TOPIC");
  if (!topic) return;

  const url = `https://ntfy.sh/${encodeURIComponent(topic)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Title: subject,
      Priority: "high",
      Tags: "car,calendar",
    },
    body: message,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`ntfy push failed: ${res.status} — ${text}`);
  }

  console.log(`[notify] ntfy push sent to topic "${topic}"`);
}

// ── Public interface ───────────────────────────────────────────────────────

/**
 * Fire all configured notification channels.
 * Errors on individual channels are logged but never re-thrown.
 */
export async function notify(message: string, subject: string): Promise<void> {
  const channels: Array<{ name: string; fn: () => Promise<void> }> = [
    { name: "email", fn: () => sendEmail(subject, message) },
    { name: "sms", fn: () => sendSms(message) },
    { name: "ntfy", fn: () => sendNtfy(subject, message) },
  ];

  await Promise.allSettled(
    channels.map(async ({ name, fn }) => {
      try {
        await fn();
      } catch (err) {
        console.error(
          `[notify] ${name} channel error:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    })
  );
}
