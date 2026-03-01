// app/api/_lib/mailer.js
import { Resend } from 'resend';

export async function sendMail({ to, subject, html }) {
  try {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFY_FROM || 'Meeting Room <onboarding@resend.dev>';
    if (!key || !to) return { skipped: true };
    const resend = new Resend(key);
    const res = await resend.emails.send({ from, to, subject, html });
    return { ok: true, id: res?.id || null };
  } catch (e) {
    console.error('Email error:', e);
    return { ok: false, error: e.message };
  }
}
