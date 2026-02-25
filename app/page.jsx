'use client';
import { useEffect, useState } from 'react';
import './globals.css';

export default function Home() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('book');
  const [form, setForm] = useState({
    title: '',
    attendees: '',
    date: '',
    sh: '09',
    sm: '00',
    eh: '10',
    em: '00'
  });
  const [myDate, setMyDate] = useState('');
  const [adDate, setAdDate] = useState('');
  const [myRows, setMyRows] = useState([]);
  const [adRows, setAdRows] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setForm(v => ({ ...v, date: today }));
    setMyDate(today);
    setAdDate(today);
  }, []);

  async function api(path, opt = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...opt
    });

    const js = await res.json();
    if (!res.ok) throw new Error(js.error || 'خطأ');
    return js;
  }

  async function login() {
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;

    const res = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, role, password })
    });

    setSession({ email, role });

    const today = new Date().toISOString().slice(0, 10);
    loadMy(email, role, today);
    if (role === 'admin') loadAdmin(today);
  }

  async function create() {
    const payload = {
      title: form.title,
      creator_email: session.email,
      attendees: form.attendees.split(',').map(s => s.trim()),
      date: form.date,
      startHour: form.sh,
      startMin: form.sm,
      endHour: form.eh,
      endMin: form.em
    };

    await api('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    alert('تم إنشاء الحجز بنجاح');
    loadMy(session.email, session.role, form.date);
  }

  async function loadMy(email, role, date) {
    const res = await api(
      `/api/reservations?date=${date}&email=${email}&role=${role}`
    );
    setMyRows(res.rows);
  }

  async function loadAdmin(date) {
    const res = await api(`/api/reservations?date=${date}&role=admin`);
    setAdRows(res.rows);
  }

  async function approve(id) {
    await api(`/api/reservations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ role: session.role })
    });
    loadAdmin(adDate);
  }

  async function cancelR(id) {
    await api(`/api/reservations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ role: session.role })
    });
    loadAdmin(adDate);
  }

  return (
    <div className="container">
      {!session && (
        <div id="login">
          <div className="row">
            <div className="col">
              <label>البريد الإلكتروني</label>
              <input id="email" type="email" />
            </div>
            <div className="col">
              <label>الدور</label>
              <select id="role">
                <option value="user">موظف</option>
                <option value="admin">مسؤول</option>
              </select>
            </div>
            <div className="col">
              <label>كلمة المرور</label>
              <input id="password" type="password" />
            </div>
            <div className="col" style={{ alignSelf: 'end' }}>
              <button onClick={login}>دخول</button>
            </div>
          </div>
        </div>
      )}

      {session && (
        <div id="app">
          <h1>حجز قاعة الاجتماعات</h1>
        </div>
      )}
    </div>
  );
}
