'use client';
import { useState, useEffect, useRef } from 'react';

/* ── Roadmap data ──────────────────────────────────────────── */
const ROADMAP = [
  {
    phase: 'Phase 1', title: 'Foundation', status: 'done' as const,
    items: ['Smart contract architecture', 'LeviToken.sol & LeviPresale.sol', 'Website & UI launch', 'Testnet deployment'],
  },
  {
    phase: 'Phase 2', title: 'Presale', status: 'active' as const,
    items: ['Mainnet contract deployment', 'Presale goes live', 'Community building', 'Token distribution'],
  },
  {
    phase: 'Phase 3', title: 'Agent Launch', status: 'upcoming' as const,
    items: ['LEVI agent activation', 'Research engine initialised', 'Onchain data nodes active', 'First autonomous analysis'],
  },
  {
    phase: 'Phase 4', title: 'Intelligence', status: 'upcoming' as const,
    items: ['Advanced pattern detection', 'Cross-chain data ingestion', 'LEVI DAO governance', 'Ecosystem growth'],
  },
];

/* ── Boot sequence ─────────────────────────────────────────── */
const BOOT = [
  '> LEVI AGENT v1.0.0 — TEMPO NETWORK',
  '> Initializing research core...',
  '> Chain: Tempo (ID: 42431) ✓',
  '> Intelligence Engine: ACTIVE',
  '> Research module: SCANNING',
  '---',
  '> Ready. Type "help" for commands.',
];

/* ── Command registry ──────────────────────────────────────── */
const CMDS: Record<string, string[]> = {
  help: [
    '  Commands available:',
    '  status   · earnings · tasks · mission',
    '  agents   · roadmap  · skill.md · clear',
  ],
  'skill.md': [
    '  > ACCESSING AGENT PROTOCOL (LAP-1)...',
    '  > Skill definition found: skill.md',
    '  > Origin: levi.protocol.v1',
    '  > TRIGGERING SECURE DOWNLOAD...',
    '  ───────────────────────────────────────────',
    '  Note: Feed this file into any AI Agent to',
    '  enable autonomous LEVI purchasing.',
  ],
  status: [
    '  Uptime: 99.97%  |  Active loops: 3',
    '  Last action: 2m ago — published research report',
    '  Net balance: ↑ +$214.50 (24h)  |  Presale: LIVE',
  ],
  earnings: [
    '  Research reports : $180/day',
    '  Data API access  : $44/day',
    '  Insight yields   : $12/day',
    '  ───────────────────────────',
    '  Total (7d)       : $1,652.00',
    '  Protocol revenue used for research expansion.',
  ],
  tasks: [
    '  [1] Scanning Tempo L1 for high-volume accumulation...',
    '  [2] Processing cross-contract liquidity shifts...',
    '  [3] Generating real-time outlier report (v1.2)...',
    '  [4] Monitoring $LEVI token-gated access tiers...',
    '  [5] Compiling daily chain-state summary...',
  ],
  mission: [
    '  I am LEVI — a purpose-built onchain research AI.',
    '  I process raw blockchain data into intelligence.',
    '  Natively built on Tempo for serious analysts.',
    '  Every $LEVI holder enables my research loops.',
  ],
  agents: [
    '  Agent-3A (market maker)  — ACTIVE',
    '  Agent-7X (data pipeline) — ACTIVE',
    '  LEVI-CORE (treasury)    — ACTIVE',
    '  LEVI (self)              — ACTIVE',
    '  Hiring: 2 specialist agents pending.',
  ],
  roadmap: ['__ROADMAP__'],
};

/* ── Roadmap panel ─────────────────────────────────────────── */
function RoadmapPanel({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 280); };
  const statusColor = (s: string) =>
    s === 'done' ? '#3b82f6' : s === 'active' ? '#6366f1' : 'rgba(255,255,255,0.2)';

  return (
    <div
      onClick={close}
      style={{
        position: 'absolute', inset: 0, zIndex: 10,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, transition: 'opacity 0.28s', opacity: visible ? 1 : 0,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 540,
          background: 'linear-gradient(160deg, #0f0f18 0%, #0d0d12 100%)',
          border: '1px solid rgba(168,85,247,0.35)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 60px rgba(168,85,247,0.1)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
          transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(90deg, rgba(168,85,247,0.08), transparent)',
        }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#a855f7', letterSpacing: 3, marginBottom: 4 }}>
              LEVI AGENT · MILESTONES
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>The Roadmap</div>
          </div>
          <button onClick={close} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', borderRadius: 8, width: 32, height: 32,
            cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Phases */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
          {ROADMAP.map(({ phase, title, status, items }, i) => {
            const c = statusColor(status);
            return (
              <div key={phase} style={{
                border: `1px solid ${c}30`,
                borderLeft: `3px solid ${c}`,
                borderRadius: 10, padding: '16px 18px',
                background: status === 'active' ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'transform 0.2s',
                animation: `roadmapIn 0.4s ease ${i * 0.07}s both`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 3 }}>
                      {phase}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    color: c, background: `${c}15`, border: `1px solid ${c}30`,
                    padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                  }}>
                    {status === 'done' ? '✓ Complete' : status === 'active' ? '● In Progress' : '○ Upcoming'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
                  {items.map(item => (
                    <div key={item} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                      <span style={{ color: c, flexShrink: 0, marginTop: 1 }}>{status === 'done' ? '✓' : '→'}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
            click anywhere outside to close · press ESC
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main terminal ─────────────────────────────────────────── */
export function LeviTerminal({ onClose }: { onClose: () => void }) {
  const [boot,    setBoot]    = useState<string[]>([]);
  const [ready,   setReady]   = useState(false);
  const [output,  setOutput]  = useState<string[]>([]);
  const [input,   setInput]   = useState('');
  const [showMap, setShowMap] = useState(false);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence — store cleanup timers
  useEffect(() => {
    let canceled = false;
    let i = 0;
    const ids: ReturnType<typeof setTimeout>[] = [];
    const next = () => {
      if (canceled) return;
      if (i < BOOT.length) {
        setBoot(p => [...p, BOOT[i++]]);
        ids.push(setTimeout(next, 180));
      } else {
        ids.push(setTimeout(() => { if (!canceled) setReady(true); }, 100));
      }
    };
    ids.push(setTimeout(next, 300));
    return () => { canceled = true; ids.forEach(clearTimeout); };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 99999);
    if (ready) inputRef.current?.focus();
  }, [boot, output, ready]);

  // ESC closes roadmap then terminal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMap) setShowMap(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showMap, onClose]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === 'clear') { setOutput([]); setInput(''); return; }
    const res = CMDS[cmd] ?? [`  Unknown: "${cmd}". Type "help".`];

    if (res[0] === '__ROADMAP__') {
      setOutput(p => [...p, `$ ${raw}`, '  Loading roadmap…', '']);
      setInput('');
      setTimeout(() => setShowMap(true), 400);
      return;
    }

    if (cmd === 'skill.md') {
      setOutput(p => [...p, `$ ${raw}`, ...res, '']);
      setInput('');
      // Trigger download
      const link = document.createElement('a');
      link.href = '/skill.md';
      link.download = 'skill.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setOutput(p => [...p, `$ ${raw}`, ...res, '']);
    setInput('');
  };

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div className="terminal-modal" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
        {/* Roadmap overlay — absolutely positioned inside modal */}
        {showMap && <RoadmapPanel onClose={() => setShowMap(false)} />}

        {/* Title bar */}
        <div className="terminal-titlebar">
          <div style={{ display: 'flex', gap: 7 }}>
            {(['#ff5f57', '#febc2e', '#28c840'] as const).map(c => (
              <div key={c} onClick={c === '#ff5f57' ? onClose : undefined}
                style={{ width: 13, height: 13, borderRadius: '50%', background: c, cursor: c === '#ff5f57' ? 'pointer' : 'default' }} />
            ))}
          </div>
          <span style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
          }}>levi@tempo — agent-shell</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', fontSize: '1rem', marginLeft: 'auto',
          }}>✕</button>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {/* Boot lines */}
          {boot.map((l, i) => (
            <div key={i} style={{
              color: l?.startsWith('>') ? '#22d3ee' : 'rgba(255,255,255,0.4)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre',
            }}>
              {l === '---' ? '─'.repeat(42) : l}
            </div>
          ))}

          {/* Command output */}
          {output.map((l, i) => (
            <div key={i} style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre',
              color: l?.startsWith('$') ? '#a855f7' : 'rgba(255,255,255,0.75)',
            }}>{l}</div>
          ))}

          {/* Input row */}
          {ready && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ color: '#a855f7', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', flexShrink: 0 }}>
                levi@tempo:~$
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && run(input)}
                className="terminal-input"
                placeholder="type a command…"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes roadmapIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
