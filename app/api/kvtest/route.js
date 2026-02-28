export const dynamic = 'force-dynamic';
import { kv } from '@vercel/kv';

export async function GET(req) {
  try {
    const ts = new Date().toISOString();

    // 1) Simple SET/GET
    await kv.set('diag:ping', ts);
    const ping = await kv.get('diag:ping');

    // 2) Push to notifications (admin list)
    await kv.lpush('notifications', { message: `DIAG ping @ ${ts}`, created_at: ts });
    const admin = await kv.lrange('notifications', 0, 0); // latest item only

    // 3) Push to a specific user list (replace your test email below)
    const email = 'tester@example.com';
    await kv.lpush(`notifications:${email}`, { message: `USER ping @ ${ts}`, created_at: ts });
    const user = await kv.lrange(`notifications:${email}`, 0, 0);

    return Response.json({
      ok: true,
      setget: ping === ts,
      admin_last: admin?.[0] || null,
      user_last: user?.[0] || null
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
}
