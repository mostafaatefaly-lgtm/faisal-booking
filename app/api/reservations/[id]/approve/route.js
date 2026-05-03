export const dynamic = 'force-dynamic';
import { kv } from '@vercel/kv';
import { sendApprovedToUser } from '../../mailer';

export async function POST(req, { params }) {
  const id  = Number(params.id);
  const body = await req.json();

  if (body?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'مسموح للمسؤول فقط' }), { status: 403 });
  }

  const key = `reservation:${id}`;
  const rec = await kv.get(key);
  if (!rec) return new Response(JSON.stringify({ error: 'غير موجود' }), { status: 404 });

  rec.status     = 'approved';
  rec.updated_at = new Date().toISOString();
  await kv.set(key, rec);

  await kv.lpush('notifications', {
    message:    `تم قبول الحجز رقم ${id} — ${rec.title} (${rec.date} ${rec.start_time}-${rec.end_time})`,
    created_at: rec.updated_at,
  });
  await kv.lpush(`notifications:${rec.creator_email}`, {
    message:    `✅ تم قبول حجزك — ${rec.title} (${rec.date} ${rec.start_time}-${rec.end_time})`,
    created_at: rec.updated_at,
  });

  // ── Send email to user ──────────────────────────────────
  try {
    await sendApprovedToUser({
      id,
      title:        rec.title,
      date:         rec.date,
      start:        rec.start_time,
      end:          rec.end_time,
      creatorEmail: rec.creator_email,
      attendees:    Array.isArray(rec.attendees) ? rec.attendees.join(', ') : (rec.attendees || ''),
      roomName:     'قاعة الاجتماعات الرئيسية',
      status:       'approved',
    });
  } catch (e) {
    console.error('Approve email failed:', e.message);
  }

  return Response.json({ ok: true });
}
