
// app/layout.jsx

export const metadata = {
  title: "حجز قاعة الاجتماعات",
  description: "نظام حجز قاعة الاجتماعات"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

// app/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState('book');
  const [form, setForm] = useState({ title:'', attendees:'', date:'', sh:'09', sm:'00', eh:'10', em:'00' });
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

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const mins = ['00', '15', '30', '45'];

  async function api(path, opt = {}) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opt });
    const js = await res.json();
    if (!res.ok) throw new Error(js.error || 'خطأ');
    return js;
  }

  async function login() {
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const res = await api('/api/login', { method:'POST', body: JSON.stringify({ email, role, password }) });
    if (!res.ok && res.error) return alert(res.error);
    setSession({ email, role });
    setTab('book');
    loadMy(email, role, myDate);
    if (role === 'admin') loadAdmin(adDate);
  }

  async function create() {
    if (!session) return alert('سجّل الدخول أولاً');
    const payload = {
      title: form.title.trim(),
      creator_email: session.email,
      attendees: form.attendees.split(',').map(s => s.trim()).filter(Boolean),
      date: form.date,
      startHour: form.sh, startMin: form.sm,
      endHour: form.eh, endMin: form.em
    };
    try {
      await api('/api/reservations', { method:'POST', body: JSON.stringify(payload) });
      alert('تم إنشاء الحجز (قيد الانتظار)');
      loadMy(session.email, session.role, myDate);
    } catch (e) { alert(e.message); }
  }

  async function loadMy(email, role, date) {
    email = email || session?.email; role = role || session?.role; date = date || myDate;
    if (!email || !role || !date) return;
    const r = await api(`/api/reservations?date=${date}&email=${encodeURIComponent(email)}&role=${role}`);
    setMyRows(r.rows || []);
  }

  async function loadAdmin(date) {
    date = date || adDate; if (!date) return;
    const r = await api(`/api/reservations?date=${date}&role=admin`);
    setAdRows(r.rows || []);
  }

  async function approve(id) {
    await api(`/api/reservations/${id}/approve`, { method:'POST', body: JSON.stringify({ role: session.role }) });
    loadAdmin(adDate); loadMy();
  }
  async function cancelR(id) {
    await api(`/api/reservations/${id}/cancel`, { method:'POST', body: JSON.stringify({ role: session.role }) });
    loadAdmin(adDate); loadMy();
  }

  return (
    <div className="container">
      <h1>حجز قاعة الاجتماعات</h1>
      <div className="tabs">
        <div className={`tab ${tab==='book'?'active':''}`} onClick={() => setTab('book')}>حجز جديد</div>
        <div className={`tab ${tab==='my'?'active':''}`} onClick={() => setTab('my')}>حجوزاتي</div>
        <div className={`tab ${tab==='admin'?'active':''}`} onClick={() => setTab('admin')}>لوحة المسؤول</div>
      </div>

      {!session && (
        <div id="login">
          <div className="row">
            <div className="col">
              <label>البريد الإلكتروني</label>
              <input id="email" type="email" placeholder="you@company.com" />
            </div>
            <div className="col">
              <label>الدور</label>
              <select id="role"><option value="user">موظف</option><option value="admin">مسؤول</option></select>
            </div>
            <div className="col">
              <label>كلمة المرور</label>
              <input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="col" style={{ alignSelf: 'end' }}>
              <button onClick={login}>دخول</button>
            </div>
          </div>
          <div className="banner">استخدم كلمة مرور الموظف أو المسؤول التي زوّدناكم بها داخليًا.</div>
        </div>
      )}

      {session && (
        <div id="app">
          <div className="banner">قاعة الاجتماعات الرئيسية — الطابق الأرضي — سعة 12 شخص</div>

          {tab === 'book' && (
            <div id="view-book">
              <h3>١) التاريخ والوقت</h3>
              <div className="row">
                <div className="col"><label>التاريخ</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="col"><label>بداية الاجتماع</label>
                  <div className="row">
                    <div className="col">
                      <select value={form.sh} onChange={e => setForm({ ...form, sh: e.target.value })}>
                        {hours.map(h => (<option key={h} value={h}>{h}</option>))}
                      </select>
                    </div>
                    <div className="col">
                      <select value={form.sm} onChange={e => setForm({ ...form, sm: e.target.value })}>
                        {mins.map(m => (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col"><label>نهاية الاجتماع</label>
                  <div className="row">
                    <div className="col">
                      <select value={form.eh} onChange={e => setForm({ ...form, eh: e.target.value })}>
                        {hours.map(h => (<option key={h} value={h}>{h}</option>))}
                      </select>
                    </div>
                    <div className="col">
                      <select value={form.em} onChange={e => setForm({ ...form, em: e.target.value })}>
                        {mins.map(m => (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <h3>٢) تفاصيل الاجتماع</h3>
              <div className="row">
                <div className="col"><label>العنوان</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان الاجتماع" />
                </div>
                <div className="col"><label>الحضور (إيميلات مفصولة بفواصل)</label>
                  <input value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} placeholder="a@x.com, b@y.com" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}><button onClick={create}>إنشاء الحجز</button></div>
            </div>
          )}

          {tab === 'my' && (
            <div id="view-my">
              <div className="row">
                <div className="col"><label>التاريخ</label>
                  <input type="date" value={myDate} onChange={e => { setMyDate(e.target.value); loadMy(undefined, undefined, e.target.value); }} />
                </div>
                <div className="col" style={{ alignSelf: 'end' }}>
                  <button className="secondary" onClick={() => loadMy()}>تحديث</button>
                </div>
              </div>
              <div className="list">
                {myRows.length ? myRows.map(r => (
                  <div className="card" key={r.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><strong>{r.title}</strong> — {r.date} {r.start_time}–{r.end_time}</div>
                      <span className={`badge ${r.status}`}>{r.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>أنشأه: {r.creator_email}</div>
                  </div>
                )) : (<div className="card">لا توجد حجوزات</div>)}
              </div>
            </div>
          )}

          {tab === 'admin' && session.role === 'admin' && (
            <div id="view-admin">
              <div className="row">
                <div className="col"><label>تاريخ</label>
                  <input type="date" value={adDate} onChange={e => { setAdDate(e.target.value); loadAdmin(e.target.value); }} />
                </div>
                <div className="col" style={{ alignSelf: 'end' }}>
                  <button className="secondary" onClick={() => loadAdmin()}>تحديث</button>
                </div>
              </div>
              <div className="list">
                {adRows.length ? adRows.map(r => (
                  <div className="card" key={r.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><strong>{r.title}</strong> — {r.date} {r.start_time}–{r.end_time}</div>
                      <span className={`badge ${r.status}`}>{r.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>أنشأه: {r.creator_email}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => approve(r.id)}>قبول</button>
                      <button className="secondary" onClick={() => cancelR(r.id)}>إلغاء</button>
                    </div>
                  </div>
                )) : (<div className="card">لا توجد حجوزات</div>)}
              </div>
            </div>
          )}

          {tab === 'admin' && session.role !== 'admin' && (
            <div className="card">هذه الصفحة للمسؤول فقط</div>
          )}
        </div>
      )}
    </div>
  );
}
