import 'dotenv/config';
import nodemailer from 'nodemailer';

function createTransport(): nodemailer.Transporter {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables are required',
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? 'SlotWatch <hello@slotwatch.app>';

export async function sendWelcomeEmail(
  to: string,
  dashboardUrl: string,
): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: 'Welcome to SlotWatch — your instance is ready',
    text: [
      'Welcome to SlotWatch!',
      '',
      'Your personal Tesla service appointment monitor is now running.',
      '',
      `Open your dashboard to connect your Tesla account:`,
      dashboardUrl,
      '',
      'Once connected, SlotWatch will watch for earlier service appointments',
      'and notify you the moment a slot opens up.',
      '',
      '— The SlotWatch team',
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:32px 16px">
  <h1 style="font-size:24px;margin-bottom:8px">Welcome to SlotWatch</h1>
  <p style="color:#555;margin-bottom:24px">Your personal Tesla service appointment monitor is now running.</p>
  <a href="${dashboardUrl}"
     style="display:inline-block;background:#cc0000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">
    Open Dashboard
  </a>
  <p style="margin-top:24px;color:#555">
    Once connected, SlotWatch watches for earlier service appointments
    and notifies you the moment a slot opens up.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0">
  <p style="font-size:12px;color:#999">SlotWatch · You're receiving this because you signed up.</p>
</body>
</html>`,
  });
}

export async function sendAdminNotification(
  to: string,
  { subject, body }: { subject: string; body: string },
): Promise<void> {
  const transport = createTransport();

  await transport.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    text: body,
  });
}
