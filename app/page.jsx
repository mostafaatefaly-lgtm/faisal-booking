// app/page.jsx
'use client';
import { useEffect, useState, useCallback } from 'react';

/* ========== كائن التنسيقات (مقتبس من index.html الأصلي) ========== */
const s = {
  app:{fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif",background:"#f8fafc",minHeight:"100vh",color:"#1e293b",direction:"rtl"},
  header:{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8},
  headerLeft:{display:"flex",alignItems:"center",gap:10},
  logo:{fontWeight:800,fontSize:18,color:"#1e293b"},
  adminBadge:{background:"#7c3aed",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:4},
  nav:{display:"flex",gap:4},
  navBtn:{background:"none",border:"none",padding:"8px 16px",cursor:"pointer",fontSize:14,color:"#64748b",borderRadius:6,fontFamily:"inherit"},
  navActive:{background:"#eff6ff",color:"#2563eb",fontWeight:700},
  userInfo:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2},
  rolePill:{color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20},
  emailText:{fontSize:11,color:"#94a3b8"},
  notifBtn:{background:"none",border:"1px solid #e2e8f0",padding:"7px 13px",borderRadius:8,cursor:"pointer",position:"relative",fontSize:15},
  badge:{position:"absolute",top:-5,left:-5,background:"#ef4444",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800},
  notifPanel:{position:"absolute",left:0,top:46,width:360,background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.14)",maxHeight:440,overflowY:"auto",zIndex:200},
  notifHeader:{padding:"14px 18px",fontWeight:800,fontSize:14,borderBottom:"1px solid #e2e8f0"},
  notifEmpty:{padding:24,color:"#94a3b8",fontSize:14,textAlign:"center"},
  notifItem:{padding:"12px 18px",borderBottom:"1px solid #f1f5f9"},
  notifMsg:{fontSize:13,color:"#334155",lineHeight:1.7},
  notifTime:{fontSize:11,color:"#94a3b8",marginTop:4,direction:"ltr",textAlign:"left"},
  logoutBtn:{background:"none",border:"1px solid #e2e8f0",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:13,color:"#64748b",fontFamily:"inherit"},
  refreshBtn:{background:"none",border:"1px solid #2563eb",color:"#2563eb",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600},
  main:{maxWidth:900,margin:"0 auto",padding:"32px 16px"},
  pageTitle:{fontSize:26,fontWeight:800,marginBottom:8,color:"#0f172a"},
  subtitle:{fontSize:13,color:"#64748b",marginBottom:24},
  section:{background:"#fff",borderRadius:14,padding:24,marginBottom:20,border:"1px solid #e2e8f0"},
  sectionTitle:{fontWeight:800,fontSize:16,marginBottom:18,display:"flex",alignItems:"center",gap:10},
  stepNum:{background:"#2563eb",color:"#fff",borderRadius:"50%",width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,flexShrink:0},
  roomBanner:{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"2px solid #2563eb",borderRadius:14,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:16},
  roomBannerIcon:{fontSize:40},
  roomBannerName:{fontWeight:800,fontSize:18,color:"#1e40af",marginBottom:4},
  roomBannerMeta:{fontSize:14,color:"#3b82f6"},
  row:{display:"flex",gap:16,flexWrap:"wrap"},
  fieldGroup:{flex:1,minWidth:150,marginBottom:16},
  label:{display:"block",fontWeight:700,fontSize:13,marginBottom:6,color:"#374151"},
  input:{width:"100%",padding:"10px 12px",border:"1px solid #d1d5db",borderRadius:8,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit"},
  availNote:{marginTop:-4,marginBottom:12,fontSize:13,color:"#ef4444"},
  timeRow:{display:"flex",alignItems:"center",gap:6},
  timeSelect:{flex:1,padding:"10px 8px",border:"1px solid #d1d5db",borderRadius:8,fontSize:15,outline:"none",fontFamily:"monospace",textAlign:"center",cursor:"pointer"},
  timeSep:{fontSize:20,fontWeight:800,color:"#2563eb",lineHeight:1},
  btnPrimary:{background:"#2563eb",color:"#fff",border:"none",padding:"12px 32px",borderRadius:10,fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"inherit"},
  successBanner:{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:12,padding:"14px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:14,lineHeight:1.6},
  closeBtn:{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#374151"},
  empty:{color:"#94a3b8",padding:48,textAlign:"center",fontSize:15},
  resList:{display:"flex",flexDirection:"column",gap:12},
  adminCard:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20},
  adminCardTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},
  adminActions:{display:"flex",gap:6},
  actionBtn:{border:"none",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"},
  statusBadge:{padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700},
  resId:{fontSize:12,color:"#94a3b8",fontFamily:"monospace"},
  resTitle:{fontWeight:800,fontSize:16,marginBottom:10},
  resMeta:{display:"flex",gap:16,flexWrap:"wrap",fontSize:13,color:"#64748b"},
  resAttendees:{marginTop:8,fontSize:13,color:"#64748b"},
  approvedNote:{marginTop:10,fontSize:12,color:"#065f46",background:"#d1fae5",padding:"6px 12px",borderRadius:8},
  cancelledNote:{marginTop:10,fontSize:12,color:"#991b1b",background:"#fee2e2",padding:"6px 12px",borderRadius:8},
  statsRow:{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"},
  statCard:{flex:1,minWidth:100,background:"#fff",border:"2px solid",borderRadius:12,padding:"18px 12px",textAlign:"center"},
  statNum:{fontSize:38,fontWeight:800},
  statLabel:{fontSize:13,color:"#64748b",marginTop:4},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"},
  modal:{background:"#fff",borderRadius:16,padding:28,width:"92%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",direction:"rtl"},
  loginWrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#e0e7ff,#f0f9ff)",padding:16},
  loginCard:{background:"#fff",borderRadius:24,padding:"40px 36px",width:"100%",maxWidth:420,boxShadow:"0 16px 56px rgba(37,99,235,0.16)"},
  loginIcon:{fontSize:52,marginBottom:12},
  loginTitle:{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 6px"},
  loginSub:{color:"#64748b",fontSize:14,marginBottom:24},
  rolesRow:{display:"flex",gap:10,marginBottom:22},
  roleInfo:{flex:1,background:"#f8fafc",borderRadius:12,padding:12,display:"flex",flexDirection:"column",gap:5,border:"1px solid #e2e8f0"},
  roleDesc:{fontSize:11,color:"#64748b"},
  eyeBtn:{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,padding:0},
  errorMsg:{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:12},
};

/* ========== ثوابت ومساعدات ========== */
const HOURS = Array.from({ length: 14 }, (_, i) => String(i + 7).padStart(2, '0'));
const MINUTES = ['00','15','30','45'];
const STATUS_AR = { pending:'قيد الانتظار', approved:'مقبول', cancelled:'ملغي' };
const MAIN_ROOM = { name:'قاعة الاجتماعات الرئيسية', capacity:20, floor:'الطابق الرئيسي' }; // عرض فقط

function today() { return new Date().toISOString().slice(0,10); }
function parseTime(t) { const [h='09',m='00']=String(t||'09:00').split(':'); return {h,m}; }
function toTime(h,m){ return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }
function formatDate(d){ return new Date(`${d}T00:00:00`).toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); }

/* ========== API Helper (Next.js routes) ========== */
async function api(path, opt={}) {
  const res = await fetch(path, { headers:{'Content-Type':'application/json'}, ...opt });
  const js = await res.json();
  if(!res.ok) throw new Error(js.error || 'خطأ');
  return js;
}

export default function Page() {
  const [view,setView] = useState('book');
  const [session,setSession] = useState(null);
  const [showNotif,setShowNotif] = useState(false);
  const [notifications,setNotifications] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading,setLoading] = useState(false);
  const [loadingRes,setLoadingRes] = useState(false);

  const [booking,setBooking] = useState({ date: today(), start:'09:00', end:'10:00', title:'', attendees:'' });
  const [bookingSuccess,setBookingSuccess] = useState(null);
  const [filterDate,setFilterDate] = useState(today());
  const [myDate,setMyDate] = useState(today());
  const [adDate,setAdDate] = useState(today());

  /* تسجيل الدخول */
  async function login() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const role  = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const r = await api('/api/login', { method:'POST', body: JSON.stringify({ email, role, password }) });
    if(!r.ok && r.error) return alert(r.error);
    setSession({ email, role });
    setView('book'); setMyDate(today()); setAdDate(today());
    loadMy(email, role, today());
    if (role==='admin') loadAdmin(today());
  }

  /* إنشاء الحجز */
  async function create() {
    if(!session) return alert('سجّل الدخول أولاً');
    if(booking.start >= booking.end) return alert('وقت النهاية يجب أن يكون بعد البداية');
    setLoading(true);
    try {
      const payload = {
        title: booking.title.trim(),
        creator_email: session.email,
        attendees: booking.attendees.split(',').map(s=>s.trim()).filter(Boolean),
        date: booking.date,
        startHour: parseTime(booking.start).h,
        startMin : parseTime(booking.start).m,
        endHour  : parseTime(booking.end).h,
        endMin   : parseTime(booking.end).m
      };
      const r = await api('/api/reservations', { method:'POST', body: JSON.stringify(payload) });
      setBookingSuccess({ ...booking, id: r.id });
      setBooking({ date: today(), start:'09:00', end:'10:00', title:'', attendees:'' });
      loadMy();
      loadNotifs();
    } catch(e){ alert(e.message); }
    finally { setLoading(false); }
  }

  /* جلب الإشعارات */
  const loadNotifs = useCallback(async ()=>{
    try { const r = await api('/api/notifications'); setNotifications(r.rows || []); } catch(e) {}
  },[]);

  /* حجوزاتي */
  async function loadMy(email, role, date) {
    email = email || session?.email; role = role || session?.role; date = date || myDate;
    if(!email || !role || !date) return;
    setLoadingRes(true);
    try {
      const r = await api(`/api/reservations?date=${date}&email=${encodeURIComponent(email)}&role=${role}`);
      setReservations(r.rows || []);
    } finally { setLoadingRes(false); }
  }

  /* لوحة المسؤول */
  async function loadAdmin(date){
    date = date || adDate; if(!date) return;
    setLoadingRes(true);
    try {
      const r = await api(`/api/reservations?date=${date}&role=admin`);
      setReservations(r.rows || []);
    } finally { setLoadingRes(false); }
  }

  /* اعتماد/إلغاء */
  async function approve(id){ await api(`/api/reservations/${id}/approve`, { method:'POST', body: JSON.stringify({ role: session.role }) }); loadAdmin(); loadMy(); }
  async function cancelR(id){ await api(`/api/reservations/${id}/cancel`, { method:'POST', body: JSON.stringify({ role: session.role }) }); loadAdmin(); loadMy(); }

  /* واجهة */
  const isAdmin = session?.role === 'admin';
  const unread = notifications.filter(n=>!n.read).length;
  const myRes    = [...reservations].sort((a,b) => (b.created_at||'').localeCompare(a.created_at||''));
  const adminRes = [...reservations].sort((a,b) => (a.start_time||'').localeCompare(b.start_time||''));

  if(!session){
    /* شاشة الدخول */
    return (
      <div style={s.loginWrap}>
        <div style={s.loginCard}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={s.loginIcon}>🏢</div>
            <h1 style={s.loginTitle}>نظام حجز قاعة إجتماعات شركة فيصل بن سعيدان</h1>
            <p style={s.loginSub}>سجّل دخولك للمتابعة</p>
          </div>
          <div style={s.rolesRow}>
            <div style={s.roleInfo}>
              <span style={{...s.rolePill,background:"#0284c7",fontSize:12}}>👤 موظف</span>
              <span style={s.roleDesc}>احجز وتابع حجوزاتك</span>
            </div>
            <div style={s.roleInfo}>
              <span style={{...s.rolePill,background:"#7c3aed",fontSize:12}}>👑 مسؤول</span>
              <span style={s.roleDesc}>قبول وتعديل وإلغاء الحجوزات</span>
            </div>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>البريد الإلكتروني</label>
            <input id="email" style={{...s.input,textAlign:"right"}} placeholder="example@company.com" type="email" dir="ltr"/>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>الدور</label>
            <select id="role" style={s.input}>
              <option value="user">موظف</option>
              <option value="admin">مسؤول</option>
            </select>
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>كلمة المرور</label>
            <input id="password" style={s.input} placeholder="••••••••" type="password"/>
          </div>

          <button style={{...s.btnPrimary,width:"100%",marginTop:8}} onClick={login}>دخول →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logo}>🏢 حجز القاعات</span>
          {isAdmin && <span style={s.adminBadge}>مسؤول</span>}
        </div>
        <nav style={s.nav}>
          <button style={{...s.navBtn,...(view==='book'?s.navActive:{})}} onClick={()=>setView('book')}>احجز قاعة</button>
          <button style={{...s.navBtn,...(view==='my'?s.navActive:{})}} onClick={()=>{setView('my'); loadMy();}}>حجوزاتي</button>
          {isAdmin && <button style={{...s.navBtn,...(view==='admin'?s.navActive:{})}} onClick={()=>{setView('admin'); loadAdmin();}}>لوحة المسؤول</button>}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative"}}>
            <button style={s.notifBtn} onClick={()=>{ setShowNotif(!showNotif); loadNotifs(); }}>
              🔔{unread>0 && <span style={s.badge}>{unread}</span>}
            </button>
            {showNotif && (
              <div style={s.notifPanel}>
                <div style={s.notifHeader}>الإشعارات</div>
                {notifications.length===0
                  ? <div style={s.notifEmpty}>لا توجد إشعارات</div>
                  : notifications.slice(0,15).map((n,idx)=>(
                      <div key={idx} style={{...s.notifItem, background:"#fff"}}>
                        <div style={s.notifMsg}>{n.message || n.msg}</div>
                        <div style={s.notifTime}>{n.created_at ? new Date(n.created_at).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'}) : (n.time||'')}</div>
                      </div>
                    ))
                }
              </div>
            )}
          </div>
          <div style={s.userInfo}>
            <span style={{...s.rolePill, background:isAdmin?"#7c3aed":"#0284c7"}}>{isAdmin?'👑 مسؤول':'👤 موظف'}</span>
            <span style={s.emailText} dir="ltr">{session.email}</span>
          </div>
          <button style={s.logoutBtn} onClick={()=>{ setSession(null); setReservations([]); setNotifications([]); setView('book'); setShowNotif(false); }}>خروج</button>
        </div>
      </header>

      <main style={s.main}>
        {/* حجز جديد */}
        {view==='book' && (
          <div>
            {bookingSuccess && (
              <div style={s.successBanner}>
                <span>✅ تم تقديم طلب الحجز بنجاح! رقم الحجز: <b>#{bookingSuccess.id}</b> — بانتظار موافقة المسؤول.</span>
                <button style={s.closeBtn} onClick={()=>setBookingSuccess(null)}>×</button>
              </div>
            )}
            <h2 style={s.pageTitle}>حجز قاعة الاجتماعات الرئيسية</h2>
            <div style={s.roomBanner}>
              <div style={s.roomBannerIcon}>🏛️</div>
              <div>
                <div style={s.roomBannerName}>{MAIN_ROOM.name}</div>
                <div style={s.roomBannerMeta}>{MAIN_ROOM.floor} · تتسع لـ {MAIN_ROOM.capacity} شخصاً</div>
              </div>
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}><span style={s.stepNum}>١</span> حدد التاريخ والوقت</div>
              <div className="row" style={s.row}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>التاريخ</label>
                  <input type="date" style={s.input} value={booking.date} min={today()} dir="ltr" onChange={e=>setBooking(b=>({...b,date:e.target.value}))}/>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>وقت البداية</label>
                  <div style={s.timeRow} dir="ltr">
                    <select style={s.timeSelect} value={parseTime(booking.start).h} onChange={e=>setBooking(b=>({...b,start:toTime(e.target.value,parseTime(b.start).m)}))}>
                      {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                    <span style={s.timeSep}>:</span>
                    <select style={s.timeSelect} value={parseTime(booking.start).m} onChange={e=>setBooking(b=>({...b,start:toTime(parseTime(b.start).h, e.target.value)}))}>
                      {MINUTES.map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>وقت النهاية</label>
                  <div style={s.timeRow} dir="ltr">
                    <select style={s.timeSelect} value={parseTime(booking.end).h} onChange={e=>setBooking(b=>({...b,end:toTime(e.target.value,parseTime(b.end).m)}))}>
                      {HOURS.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                    <span style={s.timeSep}>:</span>
                    <select style={s.timeSelect} value={parseTime(booking.end).m} onChange={e=>setBooking(b=>({...b,end:toTime(parseTime(b.end).h, e.target.value)}))}>
                      {MINUTES.map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {booking.start >= booking.end && <div style={s.availNote}>⚠️ وقت النهاية يجب أن يكون بعد وقت البداية.</div>}
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}><span style={s.stepNum}>٢</span> تفاصيل الاجتماع</div>
              <div style={s.fieldGroup}>
                <label style={s.label}>عنوان الاجتماع *</label>
                <input style={s.input} placeholder="مثال: اجتماع الفريق الأسبوعي..." value={booking.title} onChange={e=>setBooking(b=>({...b,title:e.target.value}))}/>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>المدعوون (البريد الإلكتروني، مفصولاً بفاصلة)</label>
                <input style={s.input} placeholder="colleague@company.com, another@company.com" value={booking.attendees} dir="ltr" onChange={e=>setBooking(b=>({...b,attendees:e.target.value}))}/>
              </div>
              <button style={{...s.btnPrimary, opacity:(!booking.title || booking.start>=booking.end || loading)?0.6:1}} disabled={!booking.title || booking.start>=booking.end || loading} onClick={create}>
                {loading ? 'جارٍ الإرسال...' : 'إرسال طلب الحجز'}
              </button>
            </div>
          </div>
        )}

        {/* حجوزاتي */}
        {view==='my' && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <h2 style={s.pageTitle}>حجوزاتي</h2>
              <button style={s.refreshBtn} onClick={()=>loadMy()}>↻ تحديث</button>
            </div>
            <p style={s.subtitle}>حجوزاتك المرتبطة بـ <span dir="ltr" style={{color:"#2563eb"}}>{session.email}</span> — تتحدث تلقائياً كل 30 ثانية</p>
            {loadingRes ? <div className="spinner"></div> :
              (myRes.length===0
                ? <div style={s.empty}>لا توجد حجوزات بعد. ابدأ بحجز قاعة.</div>
                : <div style={s.resList}>{myRes.map(r=>(
                    <div key={r.id} style={{...s.adminCard, borderRight:`4px solid ${r.status==='pending'?'#f59e0b':r.status==='approved'?'#10b981':'#ef4444'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                        <span style={{...s.statusBadge, background:r.status==='pending'?'#fef3c7':r.status==='approved'?'#d1fae5':'#fee2e2', color:r.status==='pending'?'#92400e':r.status==='approved'?'#065f46':'#991b1b'}}>
                          {STATUS_AR[r.status]}
                        </span>
                        <span style={s.resId} dir="ltr">#{r.id}</span>
                      </div>
                      <div style={s.resTitle}>{r.title}</div>
                      <div style={s.resMeta}>
                        <span>📍 {MAIN_ROOM.name}</span>
                        <span>📅 {formatDate(r.date)}</span>
                        <span dir="ltr">🕒 {r.start_time} – {r.end_time}</span>
                      </div>
                      {r.attendees && <div style={s.resAttendees} dir="ltr">👥 {r.attendees}</div>}
                      {r.status==='approved' && <div style={s.approvedNote}>✅ تمت الموافقة على هذا الحجز</div>}
                      {r.status==='cancelled' && <div style={s.cancelledNote}>❌ تم إلغاء هذا الحجز</div>}
                    </div>
                  ))}</div>
              )
            }
          </div>
        )}

        {/* لوحة المسؤول */}
        {view==='admin' && isAdmin && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={s.pageTitle}>لوحة تحكم المسؤول</h2>
              <button style={s.refreshBtn} onClick={()=>loadAdmin()}>↻ تحديث</button>
            </div>

            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>تصفية حسب التاريخ</label>
                <input type="date" style={s.input} value={adDate} dir="ltr" onChange={e=>{ setAdDate(e.target.value); loadAdmin(e.target.value); }}/>
              </div>
            </div>

            <div style={s.statsRow}>
              {[
                {key:'pending',label:'قيد الانتظار',color:'#f59e0b'},
                {key:'approved',label:'مقبول',color:'#10b981'},
                {key:'cancelled',label:'ملغي',color:'#ef4444'},
              ].map(({key,label,color})=>(
                <div key={key} style={{...s.statCard, borderColor:color}}>
                  <div style={{...s.statNum, color}}>{adminRes.filter(r=>r.status===key).length}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            {loadingRes ? <div className="spinner"></div> :
              (adminRes.length===0
                ? <div style={s.empty}>لا توجد حجوزات في هذا التاريخ.</div>
                : <div style={s.resList}>
                    {adminRes.map(r=>(
                      <div key={r.id} style={s.adminCard}>
                        <div style={s.adminCardTop}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{...s.statusBadge,
                              background:r.status==='pending'?'#fef3c7':r.status==='approved'?'#d1fae5':'#fee2e2',
                              color:r.status==='pending'?'#92400e':r.status==='approved'?'#065f46':'#991b1b'
                            }}>
                              {STATUS_AR[r.status]}
                            </span>
                            <span style={s.resId} dir="ltr">#{r.id}</span>
                          </div>
                          <div style={s.adminActions}>
                            {r.status==='pending' && (
                              <button style={{...s.actionBtn,background:"#10b981",color:"#fff"}} onClick={()=>approve(r.id)}>✅ قبول</button>
                            )}
                            {r.status!=='cancelled' && (
                              <button style={{...s.actionBtn,background:"#ef4444",color:"#fff"}} onClick={()=>cancelR(r.id)}>❌ إلغاء</button>
                            )}
                          </div>
                        </div>
                        <div style={s.resTitle}>{r.title}</div>
                        <div style={s.resMeta}>
                          <span>📍 {MAIN_ROOM.name}</span>
                          <span>📅 {formatDate(r.date)}</span>
                          <span dir="ltr">🕒 {r.start_time} – {r.end_time}</span>
                          <span dir="ltr">👤 {r.creator_email}</span>
                        </div>
                        {r.attendees && <div style={s.resAttendees} dir="ltr">👥 {r.attendees}</div>}
                      </div>
                    ))}
                  </div>
              )
            }
          </div>
        )}

        {view==='admin' && !isAdmin && <div className="card">هذه الصفحة للمسؤول فقط</div>}
      </main>
    </div>
  );
}
