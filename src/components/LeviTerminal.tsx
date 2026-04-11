import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

/* ── Main terminal ─────────────────────────────────────────── */
export function LeviTerminal({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage();
  const [boot,    setBoot]    = useState<string[]>([]);
  const [ready,   setReady]   = useState(false);
  const [output,  setOutput]  = useState<string[]>([]);
  const [input,   setInput]   = useState('');
  const [showMap, setShowMap] = useState(false);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Roadmap data ──────────────────────────────────────────── */
  const ROADMAP = [
    {
      phase: 'Phase 1', title: t('Foundation', '基礎構築'), status: 'done' as const,
      items: [
        t('Smart contract architecture', 'スマートコントラクト設計'),
        t('LeviToken.sol & LeviPresale.sol', 'LeviToken.sol & LeviPresale.sol'),
        t('Website & UI launch', 'ウェブサイト & UI 公開'),
        t('Testnet deployment', 'テストネット展開')
      ],
    },
    {
      phase: 'Phase 2', title: t('Presale', 'プレセール'), status: 'active' as const,
      items: [
        t('Mainnet contract deployment', 'メインネット展開'),
        t('Presale goes live', 'プレセール開始'),
        t('Community building', 'コミュニティ形成'),
        t('Token distribution', 'トークン配布')
      ],
    },
    {
      phase: 'Phase 3', title: t('Agent Launch', 'エージェント起動'), status: 'upcoming' as const,
      items: [
        t('LEVI agent activation', 'LEVIエージェント起動'),
        t('Research engine initialised', 'リサーチエンジン初期化'),
        t('Onchain data nodes active', 'オンチェーンデータノード稼働'),
        t('First autonomous analysis', '初の自律分析実行')
      ],
    },
    {
      phase: 'Phase 4', title: t('Intelligence', '高度知能化'), status: 'upcoming' as const,
      items: [
        t('Advanced pattern detection', '高度パターン検知'),
        t('Cross-chain data ingestion', 'クロスチェーンデータ取り込み'),
        t('LEVI DAO governance', 'LEVI DAO ガバナンス'),
        t('Ecosystem growth', 'エコシステム拡大')
      ],
    },
  ];

  /* ── Boot sequence ─────────────────────────────────────────── */
  const BOOT = [
    t('> LEVI AGENT v1.0.0 — TEMPO NETWORK', '> LEVIエージェント v1.0.0 — TEMPOネットワーク'),
    t('> Initializing research core...', '> リサーチコアを初期化中...'),
    t('> Chain: Tempo (ID: 42431) ✓', '> チェーン: Tempo (ID: 42431) ✓'),
    t('> Intelligence Engine: ACTIVE', '> インテリジェンスエンジン: 起動'),
    t('> Research module: SCANNING', '> リサーチモジュール: スキャン中'),
    '---',
    t('> Ready. Type "help" for commands.', '> 準備完了。"help" と入力してコマンドを表示。'),
  ];

  /* ── Command registry ──────────────────────────────────────── */
  const CMDS: Record<string, string[]> = {
    help: [
      t('  Commands available:', '  利用可能なコマンド:'),
      '  status   · earnings · tasks · mission',
      '  agents   · roadmap  · skill.md · clear',
    ],
    'skill.md': [
      t('  > ACCESSING AGENT PROTOCOL (LAP-1)...', '  > エージェントプロトコル (LAP-1) にアクセス中...'),
      t('  > Skill definition found: skill.md', '  > スキル定義が見つかりました: skill.md'),
      t('  > Origin: levi.protocol.v1', '  > オリジン: levi.protocol.v1'),
      t('  > TRIGGERING SECURE DOWNLOAD...', '  > 安全なダウンロードを開始中...'),
      '  ───────────────────────────────────────────',
      t('  Note: Feed this file into any AI Agent to', '  注: このファイルをAIエージェントに読み込ませることで'),
      t('  enable autonomous LEVI purchasing.', '  LEVIの自律購入が可能になります。'),
    ],
    status: [
      t('  Uptime: 99.97%  |  Active loops: 3', '  稼働時間: 99.97% | アクティブループ: 3'),
      t('  Last action: 2m ago — published research report', '  最終アクション: 2分前 — リサーチレポートを公開'),
      t('  Net balance: ↑ +$214.50 (24h)  |  Presale: LIVE', '  純収支: ↑ +$214.50 (24時間) | プレセール: 実施中'),
    ],
    earnings: [
      t('  Research reports : $180/day', '  リサーチレポート : $180/日'),
      t('  Data API access  : $44/day', '  データAPIアクセス : $44/日'),
      t('  Insight yields   : $12/day', '  インサイト収益    : $12/日'),
      '  ───────────────────────────',
      t('  Total (7d)       : $1,652.00', '  合計 (7日間)      : $1,652.00'),
      t('  Protocol revenue used for research expansion.', '  プロトコル収益はリサーチの拡張に使用されます。'),
    ],
    tasks: [
      t('  [1] Scanning Tempo L1 for high-volume accumulation...', '  [1] 高ボリュームの蓄積を求めて Tempo L1 をスキャン中...'),
      t('  [2] Processing cross-contract liquidity shifts...', '  [2] コントラクト間の流動性シフトを処理中...'),
      t('  [3] Generating real-time outlier report (v1.2)...', '  [3] リアルタイム外れ値レポート (v1.2) を生成中...'),
      t('  [4] Monitoring $LEVI token-gated access tiers...', '  [4] $LEVI トークンゲートアクセス層を監視中...'),
      t('  [5] Compiling daily chain-state summary...', '  [5] 日次のチェーンステート概要を編集中...'),
    ],
    mission: [
      t('  I am LEVI — a purpose-built onchain research AI.', '  私はLEVI — 特化型オンチェーンリサーチAIです。'),
      t('  I process raw blockchain data into intelligence.', '  生のブロックチェーンデータを知性に変換します。'),
      t('  Natively built on Tempo for serious analysts.', '  真の分析者のために、Tempo上でネイティブに構築されました。'),
      t('  Every $LEVI holder enables my research loops.', '  すべての $LEVI 保有者が私のリサーチループを支えています。'),
    ],
    agents: [
      t('  Agent-3A (market maker)  — ACTIVE', '  エージェント-3A (マーケットメイカー) — 起動中'),
      t('  Agent-7X (data pipeline) — ACTIVE', '  エージェント-7X (データパイプライン) — 起動中'),
      t('  LEVI-CORE (treasury)    — ACTIVE', '  LEVI-CORE (財務)                  — 起動中'),
      t('  LEVI (self)              — ACTIVE', '  LEVI (本人)                       — 起動中'),
      t('  Hiring: 2 specialist agents pending.', '  求人: 2名の専門エージェントを待機中。'),
    ],
    roadmap: ['__ROADMAP__'],
  };

  /* ── Roadmap panel (Internal) ────────────────────────── */
  const RoadmapPanel = ({ onClose }: { onClose: () => void }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);
    const close = () => { setVisible(false); setTimeout(onClose, 280); };
    const statusColor = (s: string) => s === 'done' ? '#3b82f6' : s === 'active' ? '#6366f1' : 'rgba(255,255,255,0.2)';

    return (
      <div onClick={close} style={{
        position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, transition: 'opacity 0.28s', opacity: visible ? 1 : 0,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', maxWidth: 540, background: 'linear-gradient(160deg, #0f0f18 0%, #0d0d12 100%)',
          border: '1px solid rgba(168,85,247,0.35)', borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 60px rgba(168,85,247,0.1)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)', transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'linear-gradient(90deg, rgba(168,85,247,0.08), transparent)',
          }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#a855f7', letterSpacing: 3, marginBottom: 4 }}>
                LEVI AGENT · {t('MILESTONES', 'マイルストーン')}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{t('The Roadmap', 'ロードマップ')}</div>
            </div>
            <button onClick={close} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
            {ROADMAP.map(({ phase, title, status, items }, i) => {
              const c = statusColor(status);
              return (
                <div key={phase} style={{ border: `1px solid ${c}30`, borderLeft: `3px solid ${c}`, borderRadius: 10, padding: '16px 18px', background: status === 'active' ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.02)', animation: `roadmapIn 0.4s ease ${i * 0.07}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 3 }}>{phase}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: c, background: `${c}15`, border: `1px solid ${c}30`, padding: '3px 10px', borderRadius: 20 }}>
                      {status === 'done' ? t('✓ Complete', '✓ 完了') : status === 'active' ? t('● In Progress', '● 進行中') : t('○ Upcoming', '○ 予定')}
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
              {t('click anywhere outside to close · press ESC', '枠外をクリックして閉じる · ESCキー')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Boot sequence effect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]); // Re-boot on language change for cool effect

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
    const res = CMDS[cmd] ?? [t(`  Unknown: "${cmd}". Type "help".`, `  不明なコマンド: "${cmd}"。"help" を入力。`)];

    if (res[0] === '__ROADMAP__') {
      setOutput(p => [...p, `$ ${raw}`, t('  Loading roadmap…', '  ロードマップを読み込み中…'), '']);
      setInput('');
      setTimeout(() => setShowMap(true), 400);
      return;
    }

    if (cmd === 'skill.md') {
      setOutput(p => [...p, `$ ${raw}`, ...res, '']);
      setInput('');
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
        {showMap && <RoadmapPanel onClose={() => setShowMap(false)} />}

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
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', marginLeft: 'auto' }}>✕</button>
        </div>

        <div ref={bodyRef} className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {boot.map((l, i) => (
            <div key={i} style={{ color: l?.startsWith('>') ? '#22d3ee' : 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre' }}>
              {l === '---' ? '─'.repeat(42) : l}
            </div>
          ))}

          {output.map((l, i) => (
            <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre', color: l?.startsWith('$') ? '#a855f7' : 'rgba(255,255,255,0.75)' }}>{l}</div>
          ))}

          {ready && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ color: '#a855f7', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', flexShrink: 0 }}>levi@tempo:~$</span>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && run(input)} className="terminal-input" placeholder={t('type a command…', 'コマンドを入力…')} autoComplete="off" spellCheck={false} />
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
