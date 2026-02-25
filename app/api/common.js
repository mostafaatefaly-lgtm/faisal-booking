
import { kv } from '@vercel/kv';

export function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').toLowerCase());
}
export function pad2(n){ return String(n).padStart(2,'0'); }
export function time(h,m){ return `${pad2(h)}:${pad2(m)}`; }
export function overlap(aStart,aEnd,bStart,bEnd){ return aStart < bEnd && bStart < aEnd; }

export async function listByDate(date){
  const ids = (await kv.smembers(`reservations:${date}`))||[];
  if(!ids.length) return [];
  const keys = ids.map(id=>`reservation:${id}`);
  const rows = await kv.mget(...keys);
  return rows.filter(Boolean).sort((a,b)=> (a.start_time.localeCompare(b.start_time)) );
}

export async function nextId(){
  return await kv.incr('reservation:seq');
}
