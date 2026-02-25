import { kv } from '@vercel/kv';

export async function POST(req, { params }){
  const id = Number(params.id);
  const body = await req.json();
  if(body?.role !== 'admin') return new Response(JSON.stringify({ error:'مسموح للمسؤول فقط' }), { status:403 });
  const key = `reservation:${id}`;
  const rec = await kv.get(key);
  if(!rec) return new Response(JSON.stringify({ error:'غير موجود' }), { status:404 });
  rec.status='cancelled'; rec.updated_at = new Date().toISOString();
  await kv.set(key, rec);
  await kv.lpush('notifications', { type:'cancelled', reservation_id:id, message:`تم إلغاء الحجز (${id})`, created_at: rec.updated_at });
  return Response.json({ ok:true });
}