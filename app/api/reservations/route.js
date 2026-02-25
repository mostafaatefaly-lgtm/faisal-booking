export const dynamic = "force-dynamic";
import { kv } from '@vercel/kv';
import { listByDate, overlap, time } from '../common';

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const role = searchParams.get('role');
  const email= searchParams.get('email');
  if(!date) return new Response(JSON.stringify({ error:'حدد التاريخ' }), { status:400 });
  const rows = await listByDate(date);
  const filtered = role==='admin'? rows : rows.filter(r=> r.creator_email===email);
  return Response.json({ ok:true, rows: filtered });
}

export async function POST(req){
  try{
    const body = await req.json();
    const { title, creator_email, attendees=[], date, startHour, startMin, endHour, endMin } = body||{};
    if(!title || !creator_email || !date) return new Response(JSON.stringify({ error:'حقول ناقصة' }), { status:400 });
    const start = time(startHour,startMin); const end = time(endHour,endMin);
    if(end<=start) return new Response(JSON.stringify({ error:'وقت النهاية يجب أن يكون بعد البداية' }), { status:400 });
    const rows = await listByDate(date);
    const conflict = rows.some(r => r.status!=='cancelled' && overlap(start,end,r.start_time,r.end_time));
    if(conflict) return new Response(JSON.stringify({ error:'يوجد تعارض مع حجز آخر' }), { status:409 });

    const id = await kv.incr('reservation:seq');
    const now = new Date().toISOString();
    const rec = { id, title, creator_email, attendees: (attendees||[]), date, start_time:start, end_time:end, status:'pending', created_at:now, updated_at:now };
    await kv.set(`reservation:${id}`, rec);
    await kv.sadd(`reservations:${date}`, id);

    
await kv.lpush(
  'notifications',
  {
    message: `تم إنشاء حجز جديد: ${title} (${date} ${start}-${end})`,
    created_at: new Date().toISOString()
  }
);

    await kv.lpush('notifications', { type:'created', reservation_id:id, message:`تم إنشاء حجز: ${title} (${date} ${start}-${end})`, created_at:now });

    // optional email via Resend later
    return Response.json({ ok:true, id });
  }catch(e){
    return new Response(JSON.stringify({ error:'خطأ غير متوقع' }), { status:500 });
  }
}
