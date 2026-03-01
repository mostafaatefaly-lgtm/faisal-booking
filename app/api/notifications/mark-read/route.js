// app/api/notifications/mark-read/route.js
export const dynamic = 'force-dynamic';
import { kv } from '@vercel/kv';

export async function POST(req) {
  try {
    const { role, email } = await req.json();
    const key = role === 'admin'
      ? 'notif:last_read_at:admin'
      : (email ? `notif:last_read_at:${email}` : null);

    if (!key) {
      return new Response(JSON.stringify({ ok:false, error:'missing role/email' }), { status: 400 });
    }

    const now = new Date().toISOString();
    await kv.set(key, now);
    return Response.json({ ok: true, last_read_at: now });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error: String(e) }), { status: 500 });
  }
}
