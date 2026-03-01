export const dynamic = 'force-dynamic';
import { kv } from '@vercel/kv';
import { listByDate, overlap, time } from '../common';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const role = searchParams.get('role');
  const email = searchParams.get('email');

  if (!date) {
    return new Response(JSON.stringify({ error: 'حدد التاريخ' }), { status: 400 });
  }

  const rows = await listByDate(date);
  const filtered = role === 'admin' ? rows : rows.filter(r => r.creator_email === email);
  return Response.json({ ok: true, rows: filtered });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title,
      creator_email,
      attendees = [],
      date,
      startHour,
      startMin,
      endHour,
      endMin
    } = body || {};

    if (!title || !creator_email || !date) {
      return new Response(JSON.stringify({ error: 'حقول ناقصة' }), { status: 400 });
    }

    const start = time(startHour, startMin);
    const end = time(endHour, endMin);
    if (end <= start) {
      return new Response(JSON.stringify({ error: 'وقت النهاية يجب أن يكون بعد البداية' }), { status: 400 });
    }

    const rows = await listByDate(date);
    const conflict = rows.some(r => r.status !== 'cancelled' && overlap(start, end, r.start_time, r.end_time));
    if (conflict) {
      return new Response(JSON.stringify({ error: 'يوجد تعارض مع حجز آخر' }), { status: 409 });
    }

    const id = await kv.incr('reservation:seq');
    const now = new Date().toISOString();

    const rec = {
      id,
      title,
      creator_email,
      attendees: attendees || [],
      date,
      start_time: start,
      end_time: end,
      status: 'pending',
      created_at: now,
      updated_at: now
    };

    // Save reservation + index by date
    await kv.set(`reservation:${id}`, rec);
    await kv.sadd(`reservations:${date}`, id);

    // --- Notifications ---
    // Admin list
    await kv.lpush('notifications', {
      message: `تم إنشاء حجز جديد: ${title} (${date} ${start}-${end}) بواسطة ${creator_email}`,
      created_at: now
    });

    // User-specific list
    await kv.lpush(`notifications:${creator_email}`, {
      message: `تم استلام طلب حجزك: ${title} (${date} ${start}-${end}) — الحالة: قيد الانتظار`,
      created_at: now
    });

    // Send Email
      import { sendMail } from '../_lib/mailer';

// ... after kv.lpush(...) admin + user notifications:
const adminTo = process.env.NOTIFY_ADMIN || '';
if (adminTo) {
  await sendMail({
    to: adminTo,
    subject: 'حجز جديد - قاعة الاجتماعات',
    html: `<p><b>عنوان:</b> ${title}</p>
           <p><b>التاريخ:</b> ${date}</p>
           <p><b>الوقت:</b> ${start} - ${end}</p>
           <p><b>من:</b> ${creator_email}</p>`
  });
}

await sendMail({
  to: creator_email,
  subject: 'تم استلام طلب الحجز',
  html: `<p>تم استلام طلب حجزك: <b>${title}</b></p>
         <p>${date} — ${start} إلى ${end}</p>
         <p>الحالة الحالية: <b>قيد الانتظار</b
    

    return Response.json({ ok: true, id });
  } catch (e) {
    console.error('POST /reservations error', e);
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع' }), { status: 500 });
  }
}
