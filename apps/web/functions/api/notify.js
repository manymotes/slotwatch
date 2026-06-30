const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmail(env, { to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SlotWatch <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const email = (body.email || "").trim();
  if (!email || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "Valid email required" }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    // Notify admin
    await sendEmail(env, {
      to: env.ADMIN_EMAIL || "motesmass@gmail.com",
      subject: `SlotWatch — New signup: ${email}`,
      html: `<p>New early access signup: <strong>${email}</strong></p><p>Source: ${body.source || "landing"}</p><p>Time: ${new Date().toISOString()}</p>`,
    });

    // Try to confirm to user — best effort, won't fail the request
    sendEmail(env, {
      to: email,
      subject: "You're on the SlotWatch early access list",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px">
          <h2 style="color:#111;font-size:24px;margin-bottom:8px">You're on the list ✓</h2>
          <p style="color:#555;font-size:16px;line-height:1.6">We'll alert you when SlotWatch launches — the tool that watches Tesla service centers for cancellations and texts you the moment an earlier slot opens.</p>
          <p style="color:#555;font-size:16px;line-height:1.6;margin-top:16px">In the meantime, you can <a href="https://github.com/manymotes/slotwatch" style="color:#e31937">self-host the open source version</a> for free today.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
          <p style="color:#999;font-size:12px">Not affiliated with Tesla, Inc. You can ignore this email if you didn't sign up.</p>
        </div>
      `,
    }).catch(() => {}); // ignore if Resend blocks non-verified recipients

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Email error:", err.message);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
