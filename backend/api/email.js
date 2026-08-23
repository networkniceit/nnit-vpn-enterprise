// Email sending via Resend (https://resend.com)
// Uses raw fetch — no extra npm package needed, since Node 18+ has fetch built in.
// Requires RESEND_API_KEY to be set in Railway's Variables tab for this service
// (same key you already use for the freelance backend, or a separate one —
// either works, Resend keys aren't tied to a specific project).

async function sendResetPasswordEmail(toEmail, resetLink) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set — cannot send email. Falling back to console log.');
    console.log(`[DEV] Password reset link for ${toEmail}: ${resetLink}`);
    return { sent: false, reason: 'RESEND_API_KEY not configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'NNIT VPN <onboarding@resend.dev>',
        to: [toEmail],
        subject: 'Reset your NNIT VPN password',
        html: `
          <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #00CFFF;">NNIT VPN</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to set a new password. This link expires in 1 hour.</p>
            <p><a href="${resetLink}" style="background: #00CFFF; color: #0B0B1F; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a></p>
            <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 12px;">Network Nice IT Tec (NNIT) — networkniceit@gmail.com</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return { sent: false, reason: data.message || 'Resend API error' };
    }

    return { sent: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { sent: false, reason: error.message };
  }
}

module.exports = { sendResetPasswordEmail };