export const dynamic = 'force-dynamic';

import { kv } from '@vercel/kv';
import { sendMail } from '../../../_lib/mailer';

export async function POST(req, { params }) {
  const id = Number(params.id);
  const body = await req.json();
  if (body?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'مسموح للمسؤول فقط' }), { status: 403 });
  }

  const key = `reservation:${id}`;
  const rec = await kv.get(key);
  if (!rec) return new Response(JSON.stringify({ error: 'غير موجود' }), { status: 404 });

  rec.status = 'cancelled';
  rec.updated_at = new Date().toISOString();
  await kv.set(key, rec);

  await kv.lpush('notifications', {
    message: `تم إلغاء الحجز رقم ${id} — ${rec.title} (${rec.date} ${rec.start_time}-${rec.end_time})`,
    created_at: rec.updated_at
  });
  await kv.lpush(`notifications:${rec.creator_email}`, {
    message: `❌ تم إلغاء حجزك — ${rec.title} (${rec.date} ${rec.start_time}-${rec.end_time})`,
    created_at: rec.updated_at
  });

  await sendMail({
    to: rec.creator_email,
    subject: `تم إلغاء الحجز #${id}`,
    html: `<p>تم إلغاء حجزك:</p>
           <p><b>${rec.title}</b> — ${rec.date} ${rec.start_time} - ${rec.end_time}</p>`
  });

  return Response.json({ ok: true });
}
