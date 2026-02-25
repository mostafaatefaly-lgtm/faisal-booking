export async function POST(req){
  const { email, role, password } = await req.json();
  if (!email || !role || !password) return new Response(JSON.stringify({ error:'بيانات ناقصة' }), { status:400 });
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').toLowerCase());
  if(!isValidEmail) return new Response(JSON.stringify({ error:'بريد غير صالح' }), { status:400 });
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'F@isal@2030';
  const USER_PASSWORD  = process.env.USER_PASSWORD  || 'Faisal@2026';
  if (role==='admin' && password===ADMIN_PASSWORD) return Response.json({ ok:true, role, email });
  if (role==='user'  && password===USER_PASSWORD)  return Response.json({ ok:true, role, email });
  return new Response(JSON.stringify({ error:'بيانات الدخول غير صحيحة' }), { status:401 });
}