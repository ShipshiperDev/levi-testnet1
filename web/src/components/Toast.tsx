'use client';
import { useEffect, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'pending' | 'info';
export interface ToastItem { id: number; msg: string; type: ToastType; }

let _set: React.Dispatch<React.SetStateAction<ToastItem[]>> | null = null;
let _n = 0;

export function toast(msg: string, type: ToastType = 'info') {
  const id = ++_n;
  _set?.(p => [...p, { id, msg, type }]);
  return id;
}

export function dismiss(id: number) {
  _set?.(p => p.filter(t => t.id !== id));
}

export function clearToasts() {
  _set?.([]);
}

const CLR: Record<ToastType, string> = { success:'#22c55e', error:'#ef4444', pending:'#a855f7', info:'#06b6d4' };
const ICO: Record<ToastType, string> = { success:'✓', error:'✕', pending:'⟳', info:'ℹ' };

function Item({ t, rm }: { t: ToastItem; rm: (id: number) => void }) {
  useEffect(() => {
    if (t.type === 'pending') return;
    const id = setTimeout(() => rm(t.id), 4500);
    return () => clearTimeout(id);
  }, [t, rm]);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(7,7,10,0.96)',
      border:`1px solid ${CLR[t.type]}35`, borderLeft:`3px solid ${CLR[t.type]}`,
      borderRadius:10, padding:'14px 18px', backdropFilter:'blur(20px)',
      boxShadow:'0 8px 32px rgba(0,0,0,0.5)', maxWidth:360, animation:'toastIn 0.3s ease' }}>
      <span style={{ color:CLR[t.type], fontWeight:700,
        animation: t.type==='pending' ? 'spin 1s linear infinite' : 'none', display:'inline-block' }}>
        {ICO[t.type]}
      </span>
      <span style={{ color:'#f1f5f9', fontSize:'0.88rem', lineHeight:1.4, flexGrow:1 }}>{t.msg}</span>
      <button onClick={() => rm(t.id)}
        style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'1rem' }}>✕</button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  _set = setToasts;
  const rm = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
      {toasts.map(t => <Item key={t.id} t={t} rm={rm} />)}
    </div>
  );
}
