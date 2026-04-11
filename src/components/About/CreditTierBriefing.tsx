'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Shield, Cpu, Zap, Activity, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function CreditTierBriefing() {
  const { lang, t } = useLanguage();
  const [tier, setTier] = useState<'basic' | 'premium'>('premium');

  const content = {
    basic: {
      tokens: '100,000 $LEVI',
      credits: '300,000 Credits',
      multiplier: '3.0x',
      hanko: '正',
      hankoFull: '標準',
      perks: [
        { icon: <Activity size={18} />, label: t('Standard Priority', '通常優先度'), desc: 'Standard reasoning queue processing.' },
        { icon: <Layers size={18} />, label: t('Core Monitoring', '基本監視機能'), desc: 'Full access to the Observation Layer v1.' },
        { icon: <Shield size={18} />, label: t('Standard Security', '通常セキュリティ'), desc: 'Verified identity and node access.' }
      ]
    },
    premium: {
      tokens: '200,000 $LEVI',
      credits: '1,200,000 Credits',
      multiplier: '6.0x',
      hanko: '極',
      hankoFull: '究極',
      perks: [
        { icon: <Award size={18} />, label: t('Primary Priority', '最優先処理'), desc: 'Instant queue processing for reasoning tasks.' },
        { icon: <Cpu size={18} />, label: t('Deep Intelligence', '深層推論解析'), desc: 'Unlocked access to Hierarchical Reasoning pipelines.' },
        { icon: <Zap size={18} />, label: t('Adaptive Expansion', '適応型拡張'), desc: 'Early access to the Edge Execution Observatory.' }
      ]
    }
  };

  const active = content[tier];

  return (
    <div className="tier-briefing" style={{ padding: '40px 0' }}>
      
      {/* Tier Switcher Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          border: '1px solid var(--glass-border)', 
          borderRadius: '40px', 
          padding: '6px', 
          display: 'flex', 
          gap: '4px',
          position: 'relative' 
        }}>
          {['basic', 'premium'].map((tType) => (
            <button
              key={tType}
              onClick={() => setTier(tType as any)}
              className="jetbrains"
              style={{
                padding: '10px 24px',
                borderRadius: '30px',
                background: tier === tType ? 'var(--accent-primary)' : 'transparent',
                color: tier === tType ? 'black' : 'var(--text-secondary)',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1,
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              {tType} MODE
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* The Hanko Card */}
        <motion.div
          key={tier}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel"
          style={{ 
            padding: '40px', 
            textAlign: 'center', 
            border: tier === 'premium' ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
            boxShadow: tier === 'premium' ? '0 0 40px rgba(59,130,246,0.15)' : 'none'
          }}
        >
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 30px' }}>
             <motion.div 
               animate={{ rotate: tier === 'premium' ? 360 : 0 }}
               transition={{ duration: 1, type: 'spring' }}
               style={{ 
                 width: '100%', height: '100%', 
                 border: `3px solid ${tier === 'premium' ? '#ef4444' : '#64748b'}`, 
                 borderRadius: tier === 'premium' ? '50%' : '8px',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: tier === 'premium' ? '#ef4444' : '#64748b',
                 fontSize: '3rem', fontWeight: 900,
                 fontFamily: 'serif'
               }}
             >
                {active.hanko}
             </motion.div>
             <div style={{ position: 'absolute', bottom: '-5px', right: '-10px', background: tier === 'premium' ? '#ef4444' : '#64748b', color: 'black', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                {active.hankoFull}
             </div>
          </div>

          <div className="jetbrains" style={{ fontSize: '0.65rem', letterSpacing: '4px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            SYSTEM_ORIENTATION
          </div>
          <h2 className="jetbrains" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>
            {tier.toUpperCase()} TIER
          </h2>
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 800, marginBottom: '32px', letterSpacing: '1px' }}>
            {active.multiplier} EFFICIENCY AMPLIFICATION
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
             <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>COMMITMENT</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{active.tokens}</div>
             </div>
             <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CREDITS_ALLOCATED</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{active.credits}</div>
             </div>
          </div>
        </motion.div>

        {/* Perk Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Activity className="text-blue-500" size={18} />
            <span className="jetbrains" style={{ fontSize: '0.7rem', letterSpacing: '4px', color: 'var(--text-secondary)' }}>
              TECHNICAL_PERK_SPECIFICATIONS
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {active.perks.map((perk, i) => (
                <motion.div
                  key={perk.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel"
                  style={{ 
                    padding: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '24px',
                    borderLeft: tier === 'premium' ? '4px solid var(--accent-primary)' : '4px solid var(--text-muted)'
                  }}
                >
                  <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                    {perk.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>{perk.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{perk.desc}</div>
                  </div>
                  {tier === 'premium' && (
                    <div className="jetbrains" style={{ fontSize: '0.6rem', opacity: 0.5, letterSpacing: '2px' }}>[PLUS]</div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Non-Linear Callout */}
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            background: tier === 'premium' ? 'rgba(59,130,246,0.05)' : 'transparent',
            border: '1px dashed var(--glass-border)',
            borderRadius: '12px',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)'
          }}>
            {tier === 'premium' 
              ? t('System Alert: Premium tier utilizes Non-Linear amplification logic. Efficiency is significantly higher than linear scaling.', 'システム警告：プレミアムティアは非構造論理を採用しています。効率性は単純な比例スケーリングを大幅に上回ります。')
              : t('System Note: Basic tier provides standard access credentials for core cognitive tasks.', 'システム注記：ベーシックティアは基本的な認知タスクに必要な標準アクセス権を提供します。')}
          </div>
        </div>
      </div>
    </div>
  );
}
