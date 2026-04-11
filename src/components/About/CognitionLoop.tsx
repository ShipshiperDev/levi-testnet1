'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Cpu, Zap, Activity, ShieldCheck, Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function CognitionLoop() {
  const { lang, t } = useLanguage();
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  const layers = [
    {
      id: 0,
      nameen: 'OBSERVATION',
      namejp: '監視レイヤー',
      kanji: '監視',
      icon: <Radar className="text-blue-400" size={32} />,
      descen: 'Millisecond-level monitoring of the Tempo Network transactions, liquidity migrations, and contract alters.',
      descjp: 'Tempoネットワークのトランザクション、流動性の推移、およびコントラクト変更をミリ秒単位で常時監視。',
      specs: [
        { label: 'Latency', val: '< 50ms' },
        { label: 'Throughput', val: 'Unlimited' },
        { label: 'Scope', val: 'On-chain Bytes' }
      ]
    },
    {
      id: 1,
      nameen: 'INTELLIGENCE',
      namejp: '知能レイヤー',
      kanji: '知能',
      icon: <Cpu className="text-indigo-400" size={32} />,
      descen: 'The hierarchical reasoning core. Processing unstructured data through three distinct compute depths.',
      descjp: '階層型推論コア。非構造化データを要求される計算深度に応じて3つのモードで論理処理。',
      specs: [
        { label: 'Engine', val: 'ACI-v1.2' },
        { label: 'Nodes', val: 'Distributed' },
        { label: 'Depth', val: 'Core / Analytical / Deep' }
      ]
    },
    {
      id: 2,
      nameen: 'EXECUTION',
      namejp: '実行レイヤー',
      kanji: '実行',
      icon: <Zap className="text-cyan-400" size={32} />,
      descen: 'Autonomous output generation. Establishing systemic order through signals, reports, and triggers.',
      descjp: '自律的な出力生成。シグナル、レポート、および実行トリガーを通じて体系的な秩序を形成。',
      specs: [
        { label: 'Protocol', val: 'Logic-Trigger' },
        { label: 'Integrity', val: 'Verified' },
        { label: 'Mode', val: 'Autonomous / Signal' }
      ]
    }
  ];

  return (
    <div className="cognition-container" style={{ position: 'relative', width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
      
      {/* Visual Orbitals */}
      <div style={{ position: 'relative', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px' }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div style={{ width: '480px', height: '480px', border: '1px dashed var(--accent-primary)', borderRadius: '50%', animation: 'spin 60s linear infinite' }} />
          <div style={{ position: 'absolute', width: '400px', height: '400px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        </div>

        <div style={{ display: 'flex', gap: '60px', zIndex: 10 }}>
          {layers.map((layer) => (
            <motion.div
              key={layer.id}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
              style={{
                width: '180px',
                height: '240px',
                background: activeLayer === layer.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                border: activeLayer === layer.id ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeLayer === layer.id ? '0 0 30px rgba(59,130,246,0.2)' : 'none'
              }}
            >
              <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>
                0{layer.id + 1}
              </div>
              <div className="mb-4">{layer.icon}</div>
              <div className="noto" style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {layer.kanji}
              </div>
              <div className="jetbrains" style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                {layer.nameen}
              </div>
              
              {activeLayer === layer.id && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ position: 'absolute', bottom: '-15px', padding: '4px 12px', background: 'var(--accent-primary)', color: 'black', fontSize: '0.65rem', fontWeight: 800, borderRadius: '4px' }}
                >
                  ACTIVE
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Expanded Technical Specification Panel */}
      <div style={{ minHeight: '300px' }}>
        <AnimatePresence mode="wait">
          {activeLayer !== null ? (
            <motion.div
              key={activeLayer}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="glass-panel"
              style={{ padding: '40px', border: '1px solid rgba(59,130,246,0.2)', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)', backgroundSize: '100% 4px' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Activity size={16} className="text-blue-500" />
                    <span className="jetbrains" style={{ fontSize: '0.7rem', letterSpacing: '4px', color: 'var(--accent-primary)' }}>
                      SYSTEM_STATUS: NOMINAL
                    </span>
                  </div>
                  <h3 className="noto" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                    {lang === 'ja' ? layers[activeLayer].namejp : layers[activeLayer].nameen}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '30px' }}>
                    {lang === 'ja' ? layers[activeLayer].descjp : layers[activeLayer].descen}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <ShieldCheck size={16} /> <span>Integrity Verified</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <Database size={16} /> <span>Live Data Flow</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div className="jetbrains mb-4" style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>TECHNICAL_SPECS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {layers[activeLayer].specs.map((spec) => (
                      <div key={spec.label}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{spec.label}</div>
                        <div className="jetbrains" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{spec.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 border-t border-glass-border pt-4">
                     <div className="hanko-border" style={{ width: '40px', height: '40px', opacity: 0.6, transform: 'rotate(-15deg)' }}>
                        <span style={{ fontSize: '0.7rem' }}>証</span>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}
            >
              <div className="mb-4">
                <span className="shimmer-text">SELECT A LAYER TO VIEW SYSTEM SPECIFICATIONS</span>
              </div>
              <div className="jetbrains" style={{ fontSize: '0.6rem', letterSpacing: '5px' }}>
                待機中 / STANDBY_MODE
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hanko-border {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ef4444;
          color: #ef4444;
          border-radius: 4px;
          font-family: serif;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
