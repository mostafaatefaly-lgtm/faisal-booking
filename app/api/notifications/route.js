export const dynamic = 'force-dynamic';
import { kv } from '@vercel/kv';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const role  = searchParams.get('role');
  const email = searchParams.get('email');

  const key = role === 'admin'
    ? 'notifications'
    : (email ? `notifications:${email}` : 'notifications');

  const items = await kv.lrange(key, 0, 99);
  return Response.json({ ok: true, rows: items || [] });
}
