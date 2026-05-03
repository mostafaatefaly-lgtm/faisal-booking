// app/api/test-email/route.js
// TEMPORARY — delete this file after confirming emails work

export const dynamic = 'force-dynamic';
import { Resend } from 'resend';

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return Response.json({
        ok: false,
        error: 'RESEND_API_KEY is not set in Vercel environment variables'
      });
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from:    'Meeting Room <meeting.room@faisal-binsaedan.com>',
      to:      'm.abdullah@faisal-binsaedan.com',
      subject: '✅ Test Email — Booking System',
      html:    `
        <div style="font-family:Tahoma,Arial,sans-serif;padding:32px;direction:rtl">
          <h2 style="color:#2563eb">✅ الإيميل يعمل!</h2>
          <p>إذا وصلك هذا البريد، فإن إعدادات Resend تعمل بشكل صحيح.</p>
          <p style="color:#64748b;font-size:13px">RESEND_API_KEY: ${apiKey.slice(0,8)}...${apiKey.slice(-4)}</p>
        </div>
      `
    });

    if (result.error) {
      return Response.json({ ok: false, error: result.error });
    }

    return Response.json({ ok: true, message: 'Email sent! Check m.abdullah@faisal-binsaedan.com', id: result.data?.id });

  } catch (e) {
    return Response.json({ ok: false, error: e.message });
  }
}
