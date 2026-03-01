export const dynamic = 'force-dynamic';
import { kv } from '@vercel/kv';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const role  = searchParams.get('role');
  const email = searchParams.get('email');

  const listKey = role === 'admin'
    ? 'notifications'
    : (email ? `notifications:${email}` : 'notifications');

  const lastKey = role === 'admin'
    ? 'notif:last_read_at:admin'
    : (email ? `notif:last_read_at:${email}` : null);

  const [items, lastRead] = await Promise.all([
    kv.lrange(listKey, 0, 99),
    lastKey ? kv.get(lastKey) : null
  ]);

  const last = lastRead ? new Date(lastRead).getTime() : 0;
  const rows = (items || []).map(n => {
    const created = n?.created_at ? new Date(n.created_at).getTime() : 0;
    return { ...n, read: last && created <= last };
  });

  return Response.json({ ok: true, rows });
}
