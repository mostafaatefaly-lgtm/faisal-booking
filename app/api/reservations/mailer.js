import { Resend } from 'resend';

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = 'Meeting Room <meeting.room@faisal-binsaedan.com>';
const ADMIN    = 'm.abdullah@faisal-binsaedan.com';

function formatDateAr(dateStr) {
  const days   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function emailWrapper(title, accentColor, icon, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Tahoma,Arial,sans-serif;direction:rtl">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%">
    <tr>
      <td style="background:linear-gradient(135deg,${accentColor},${accentColor}cc);padding:36px 32px;text-align:center">
        <div style="font-size:48px;margin-bottom:12px">${icon}</div>
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:bold">نظام حجز قاعة الاجتماعات</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">${title}</p>
      </td>
    </tr>
    <tr><td style="padding:32px">${bodyHtml}</td></tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="margin:0;color:#94a3b8;font-size:12px">هذا البريد أُرسل تلقائياً — الرجاء عدم الرد عليه</p>
        <p style="margin:4px 0 0;color:#94a3b8;font-size:12px">© فيصل بن سعدان — نظام حجز القاعات</p>
      </td>
    </tr>
  </table>
  </td></tr></table>
</body></html>`;
}

function bookingTable(r) {
  const statusLabel = { pending:'قيد الانتظار', approved:'✅ مقبول', cancelled:'❌ ملغي' };
  const statusBg    = { pending:'#fef3c7', approved:'#d1fae5', cancelled:'#fee2e2' };
  const statusColor = { pending:'#92400e', approved:'#065f46', cancelled:'#991b1b' };

  const rows = [
    ['📋 عنوان الاجتماع', r.title],
    ['📅 التاريخ',        formatDateAr(r.date)],
    ['🕐 الوقت',         `<span dir="ltr">${r.start} – ${r.end}</span>`],
    ['📍 القاعة',        r.roomName || 'قاعة الاجتماعات الرئيسية'],
    ['👤 طالب الحجز',    `<span dir="ltr">${r.creatorEmail}</span>`],
    r.attendees ? ['👥 المدعوون', `<span dir="ltr">${r.attendees}</span>`] : null,
    ['📌 الحالة',        `<span style="display:inline-block;padding:4px 14px;border-radius:20px;font-weight:bold;font-size:13px;background:${statusBg[r.status]};color:${statusColor[r.status]}">${statusLabel[r.status]}</span>`],
    ['🔢 رقم الحجز',     `<span style="font-family:monospace;color:#94a3b8">#${r.id}</span>`],
  ].filter(Boolean);

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
    ${rows.map(([label, value], i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
      <td style="padding:12px 16px;font-weight:bold;color:#374151;font-size:13px;width:140px;border-bottom:1px solid #e2e8f0">${label}</td>
      <td style="padding:12px 16px;color:#1e293b;font-size:13px;border-bottom:1px solid #e2e8f0">${value}</td>
    </tr>`).join('')}
  </table>`;
}

// ── 1. New booking → Admin ────────────────────────────────────────
export async function sendNewBookingToAdmin(reservation) {
  const body = `
    <p style="font-size:15px;color:#1e293b;margin:0 0 20px">📬 <strong>طلب حجز جديد</strong> يحتاج مراجعتك والبت فيه.</p>
    ${bookingTable({ ...reservation, status: 'pending' })}
    <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:12px;border-right:4px solid #2563eb">
      <p style="margin:0;font-size:13px;color:#1e40af">💡 يرجى تسجيل الدخول إلى النظام لقبول أو رفض هذا الطلب.</p>
    </div>`;

  return resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    subject: `📅 طلب حجز جديد: ${reservation.title}`,
    html:    emailWrapper('طلب حجز جديد يحتاج موافقتك', '#2563eb', '📋', body),
  });
}

// ── 2. Approved → User ────────────────────────────────────────────
export async function sendApprovedToUser(reservation) {
  const body = `
    <p style="font-size:15px;color:#065f46;margin:0 0 20px">🎉 <strong>تمت الموافقة على طلب حجزك!</strong> القاعة محجوزة لك في الوقت المحدد.</p>
    ${bookingTable({ ...reservation, status: 'approved' })}
    <div style="margin-top:24px;padding:16px;background:#d1fae5;border-radius:12px;border-right:4px solid #10b981">
      <p style="margin:0;font-size:13px;color:#065f46">✅ نتمنى لك اجتماعاً ناجحاً وموفقاً!</p>
    </div>`;

  return resend.emails.send({
    from:    FROM,
    to:      reservation.creatorEmail,
    subject: `✅ تمت الموافقة على حجزك: ${reservation.title}`,
    html:    emailWrapper('تمت الموافقة على حجزك', '#10b981', '✅', body),
  });
}

// ── 3. Cancelled → User ───────────────────────────────────────────
export async function sendCancelledToUser(reservation) {
  const body = `
    <p style="font-size:15px;color:#991b1b;margin:0 0 20px">نأسف لإبلاغك أنه <strong>تم إلغاء طلب حجزك</strong> من قِبَل المسؤول.</p>
    ${bookingTable({ ...reservation, status: 'cancelled' })}
    <div style="margin-top:24px;padding:16px;background:#fee2e2;border-radius:12px;border-right:4px solid #ef4444">
      <p style="margin:0;font-size:13px;color:#991b1b">💡 يمكنك تقديم طلب حجز جديد في وقت آخر عبر النظام.</p>
    </div>`;

  return resend.emails.send({
    from:    FROM,
    to:      reservation.creatorEmail,
    subject: `❌ تم إلغاء حجزك: ${reservation.title}`,
    html:    emailWrapper('تم إلغاء طلب حجزك', '#ef4444', '❌', body),
  });
}
