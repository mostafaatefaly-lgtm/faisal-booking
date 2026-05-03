export const dynamic = 'force-dynamic';
import { sendNewBookingToAdmin } from './mailer';

import { kv } from '@vercel/kv';
import { listByDate, overlap, time } from '../common';
import { sendMail } from '../_lib/mailer';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
@@ -36,7 +38,7 @@
    }

    const start = time(startHour, startMin);
    const end = time(endHour, endMin);
    const end   = time(endHour, endMin);
    if (end <= start) {
      return new Response(JSON.stringify({ error: 'وقت النهاية يجب أن يكون بعد البداية' }), { status: 400 });
    }
@@ -47,7 +49,7 @@
      return new Response(JSON.stringify({ error: 'يوجد تعارض مع حجز آخر' }), { status: 409 });
    }

    const id = await kv.incr('reservation:seq');
    const id  = await kv.incr('reservation:seq');
    const now = new Date().toISOString();

    const rec = {
@@ -67,46 +69,42 @@
    await kv.set(`reservation:${id}`, rec);
    await kv.sadd(`reservations:${date}`, id);

    // --- Notifications ---
    // Admin list
    // Admin notifications list
    await kv.lpush('notifications', {
      message: `تم إنشاء حجز جديد: ${title} (${date} ${start}-${end}) بواسطة ${creator_email}`,
      created_at: now
    });

    // User-specific list
    // User-specific notifications list
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
    // EMAILS
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
    
    await sendMail({
      to: creator_email,
      subject: 'تم استلام طلب الحجز',
      html: `<p>تم استلام طلب حجزك: <b>${title}</b></p>
             <p>${date} — ${start} إلى ${end}</p>
             <p>الحالة الحالية: <b>قيد الانتظار</b></p>`
    });

    return Response.json({ ok: true, id });
  } catch (e) {
    console.error('POST /reservations error', e);
    return new Response(JSON.stringify({ error: 'خطأ غير متوقع' }), { status: 500 });
  }
}
