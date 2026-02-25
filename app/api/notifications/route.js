import { kv } from '@vercel/kv';
export async function GET(){
  const items = await kv.lrange('notifications', 0, 99);
  return Response.json({ ok:true, rows: items||[] });
}