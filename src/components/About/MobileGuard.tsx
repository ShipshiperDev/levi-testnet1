'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Lock, Cpu, Server } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function MobileGuard() {
  const { lang, t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        top: '72px', 
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998, // Below NavBar (10001)
        background: 'rgba(7, 7, 10, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Background Industrial Elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--accent-primary) 2px, var(--accent-primary) 4px)', backgroundSize: '100% 4px' }} />
      <div style={{ position: 'absolute', top: '15%', fontSize: '12rem', color: 'rgba(59,130,246,0.03)', fontWeight: 900, fontFamily: 'serif', pointerEvents: 'none' }}>極</div>

      <div className="glass-panel" style={{ padding: '60px 40px', maxWidth: '450px', position: 'relative' }}>
        <div style={{ marginBottom: '40px', position: 'relative' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ position: 'absolute', inset: -20, background: 'var(--accent-primary)', borderRadius: '50%', filter: 'blur(30px)' }}
          />
          <Lock size={64} className="text-blue-400 relative z-10 mx-auto" strokeWidth={1} />
        </div>

        <div className="jetbrains" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', letterSpacing: '5px', marginBottom: '24px', fontWeight: 800 }}>
          SYSTEM_ACCESS_PROTOCOL // 0x403
        </div>

        <h2 className="noto" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          {t('DESKTOP VERIFICATION REQUIRED', 'デスクトップ認証が必要です')}
        </h2>

        <p className="jetbrains" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '48px' }}>
          {t('The LEVI Architecture Briefing requires a Desktop-class terminal for full cognitive verification and data integrity. Small screen scaling is disabled for this specification.', 
             'LEVIアーキテクチャ・ブリーフィングには、データの整合性と認知検証を完全に行うためのデスクトップ端末が必要です。この仕様では、小画面のスケーリングは無効化されています。')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
            <Monitor size={20} className="text-blue-400" />
            <span className="jetbrains" style={{ fontSize: '0.8rem', fontWeight: 700 }}>MIN_RESOLUTION: 1280px</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', opacity: 0.5 }}>
             <Server size={14} />
             <Cpu size={14} />
             <motion.div 
               animate={{ opacity: [0.2, 1, 0.2] }}
               transition={{ repeat: Infinity, duration: 1 }}
               style={{ fontSize: '0.6rem', letterSpacing: '2px' }}
             >
                SCANNING_RESOLUTION...
             </motion.div>
          </div>
        </div>
      </div>

      {/* Terminal Footer Info */}
      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', opacity: 0.3 }}>
        <div className="jetbrains" style={{ fontSize: '0.6rem', letterSpacing: '2px' }}>MANIFESTO_V1.4</div>
        <div className="jetbrains" style={{ fontSize: '0.6rem', letterSpacing: '2px' }}>DESKTOP_ONLY: TRUE</div>
        <div className="jetbrains" style={{ fontSize: '0.6rem', letterSpacing: '2px' }}>LOC_ID: {lang.toUpperCase()}</div>
      </div>
    </motion.div>
  );
}
