// app/api/reservations/route.js
// Add this import at the TOP of your existing file:
//
//   import { sendNewBookingToAdmin } from '@/app/lib/email';
//
// Then find your POST handler and add the sendNewBookingToAdmin call
// after the reservation is successfully saved to KV.
//
// ─────────────────────────────────────────────────────────────────
// FULL UPDATED FILE — replace your existing route.js with this:
// ─────────────────────────────────────────────────────────────────

import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { sendNewBookingToAdmin } from './mailer';


function generateId() {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// ── GET /api/reservations ─────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date  = searchParams.get('date');
  const email = searchParams.get('email');
  const role  = searchParams.get('role');

  try {
    let reservationIds = [];

    if (date) {
      reservationIds = await kv.smembers(`reservations:${date}`) || [];
    } else if (email) {
      reservationIds = await kv.smembers(`user:${email}:reservations`) || [];
    } else {
      // Get all — scan keys (admin view without date filter)
      reservationIds = await kv.smembers('reservations:all') || [];
    }

    const reservations = await Promise.all(
      reservationIds.map(id => kv.get(`reservation:${id}`))
    );

    const filtered = reservations
      .filter(Boolean)
      .filter(r => email ? r.creatorEmail === email : true)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start.localeCompare(b.start);
      });

    return NextResponse.json({ reservations: filtered });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST /api/reservations ────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, start, end, title, attendees, creatorEmail } = body;

    if (!date || !start || !end || !title || !creatorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Check for slot conflicts
    const dayIds = await kv.smembers(`reservations:${date}`) || [];
    const dayReservations = await Promise.all(dayIds.map(id => kv.get(`reservation:${id}`)));

    const conflict = dayReservations.filter(Boolean).some(r =>
      r.status !== 'cancelled' && r.start < end && r.end > start
    );

    if (conflict) {
      return NextResponse.json({ error: 'هذا الوقت محجوز مسبقاً' }, { status: 409 });
    }

    // Create reservation
    const id = generateId();
    const reservation = {
      id,
      roomId:       1,
      roomName:     'قاعة الاجتماعات الرئيسية',
      date,
      start,
      end,
      title,
      attendees:    attendees || '',
      creatorEmail,
      status:       'pending',
      createdAt:    new Date().toISOString(),
    };

    // Save to KV
    await Promise.all([
      kv.set(`reservation:${id}`, reservation),
      kv.sadd(`reservations:${date}`, id),
      kv.sadd(`reservations:all`, id),
      kv.sadd(`user:${creatorEmail}:reservations`, id),
      kv.lpush('notifications', JSON.stringify({
        id:   generateId(),
        msg:  `📅 طلب حجز جديد من ${creatorEmail}: "${title}" بتاريخ ${date} من ${start} إلى ${end}`,
        time: new Date().toLocaleTimeString('ar-SA'),
        read: false,
      })),
    ]);

    // ── Send email to admin ──────────────────────────────────────
    try {
      await sendNewBookingToAdmin(reservation);
    } catch (emailErr) {
      // Don't fail the booking if email fails — just log it
      console.error('Email to admin failed:', emailErr.message);
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
