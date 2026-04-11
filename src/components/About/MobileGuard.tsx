'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, AlertTriangle, ChevronRight } from 'lucide-react';
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
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        textAlign: 'center'
      }}
    >
      {/* Background Industrial Elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }} />
      <div style={{ position: 'absolute', top: '10%', fontSize: '10rem', color: 'rgba(255,255,255,0.02)', fontWeight: 900, fontFamily: 'serif', pointerEvents: 'none' }}>警告</div>

      <div className="glass-panel" style={{ padding: '40px 20px', maxWidth: '400px', border: '1px solid #ef4444' }}>
        <div style={{ marginBottom: '30px', position: 'relative' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}
          />
          <AlertTriangle size={60} className="text-red-500 relative z-10 mx-auto" />
        </div>

        <div className="jetbrains" style={{ fontSize: '0.65rem', color: '#ef4444', letterSpacing: '4px', marginBottom: '16px', fontWeight: 800 }}>
          SYSTEM_ACCESS_RESTRICTED // 0x403
        </div>

        <h2 className="noto" style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '20px' }}>
          {t('DESKTOP VERIFICATION REQUIRED', 'デスクトップ認証が必要です')}
        </h2>

        <p className="jetbrains" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '40px' }}>
          {t('The LEVI Architecture Briefing contains high-density technical specifications optimized for Desktop-class resolution (1280px+). Please switch to a workstation for full cognitive verification.', 
             'LEVIアーキテクチャ・ブリーフィングには、デスクトップ級の解像度（1280px以上）に最適化された高密度の技術仕様が含まれています。完全な認知検証を行うために、ワークステーションへの切り替えを推奨します。')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid #ef444455', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <Monitor size={18} className="text-red-400" />
            <span className="jetbrains" style={{ fontSize: '0.75rem', fontWeight: 800 }}>RESOLUTION_ERROR: 1280px+ REQ</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'flex', gap: '30px', opacity: 0.3 }}>
        <div className="jetbrains" style={{ fontSize: '0.6rem' }}>UI_V1.3</div>
        <div className="jetbrains" style={{ fontSize: '0.6rem' }}>SECURITY: HIGH</div>
        <div className="jetbrains" style={{ fontSize: '0.6rem' }}>AUTH_REQ: POSITIVE</div>
      </div>
    </motion.div>
  );
}
