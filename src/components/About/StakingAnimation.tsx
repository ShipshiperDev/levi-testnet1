'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Zap, ShieldCheck, Database, ArrowRight } from 'lucide-react';

export function StakingAnimation() {
  const [stage, setStage] = useState(0); // 0: Start, 1: Committed, 2: Amplified, 3: Access Granted
  const [isPremium, setIsPremium] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage(s => (s + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="staking-animation glass-panel" style={{ padding: '60px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Scanline Effect */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }} />

      {/* Progress Indicator */}
      <div style={{ position: 'absolute', top: '30px', left: '40px', display: 'flex', gap: '8px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ width: '20px', height: '3px', background: stage >= i ? 'var(--accent-primary)' : 'var(--glass-border)', transition: 'background 0.5s' }} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '60px', zIndex: 10 }}>
        
        {/* Input Tokens */}
        <motion.div
          animate={{ 
            scale: stage === 0 ? 1.1 : 1,
            opacity: stage >= 0 ? 1 : 0.4
          }}
          style={{ width: '120px', height: '120px', border: '1px dashed var(--glass-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <Database size={24} className={stage === 0 ? 'text-blue-400' : 'text-slate-600'} />
          <div className="jetbrains mt-2" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>COMMITMENT</div>
          <div className="jetbrains" style={{ fontSize: '0.8rem', fontWeight: 800 }}>{isPremium ? '200K' : '100K'}</div>
        </motion.div>

        <ArrowRight className="text-slate-700" size={20} />

        {/* The Core Lock */}
        <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ 
              rotate: 360,
              scale: stage >= 1 ? 1.1 : 1,
              borderColor: stage >= 2 ? 'var(--accent-primary)' : 'var(--glass-border)'
            }}
            transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' } }}
            style={{ position: 'absolute', inset: 0, border: '2px solid', borderRadius: '50%', opacity: 0.2 }}
          />
          
          <AnimatePresence mode="wait">
            {stage < 3 ? (
              <motion.div
                key="lock"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <Lock size={48} className={stage >= 1 ? 'text-blue-400' : 'text-slate-600'} />
                <div className="jetbrains mt-2" style={{ fontSize: '0.6rem', letterSpacing: '2px' }}>
                  {stage === 0 ? 'WAITING' : stage === 1 ? 'LOCKED' : 'AMPLIFYING'}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grant"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ position: 'relative' }}>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', inset: -20, background: 'var(--accent-primary)', borderRadius: '50%', filter: 'blur(30px)' }}
                  />
                  <ShieldCheck size={64} className="text-blue-400 relative z-10" />
                </div>
                <div className="jetbrains mt-4" style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '4px' }}>
                  ACCESS GRANTED
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ArrowRight className="text-slate-700" size={20} />

        {/* Output Efficiency */}
        <motion.div
          animate={{ 
            scale: stage === 3 ? 1.1 : 1,
            opacity: stage === 3 ? 1 : 0.4,
            borderColor: stage === 3 ? 'var(--accent-primary)' : 'var(--glass-border)'
          }}
          style={{ width: '120px', height: '120px', border: '1px solid', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: stage === 3 ? 'rgba(59,130,246,0.1)' : 'transparent' }}
        >
          <Zap size={24} className={stage === 3 ? 'text-blue-400' : 'text-slate-600'} />
          <div className="jetbrains mt-2" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>EFFICIENCY</div>
          <motion.div 
            animate={{ 
              scale: stage === 3 ? [1, 1.2, 1] : 1,
              color: stage === 3 ? '#3b82f6' : '#64748b'
            }}
            className="jetbrains" 
            style={{ fontSize: '1.2rem', fontWeight: 900 }}
          >
            {isPremium ? '6.0x' : '3.0x'}
          </motion.div>
        </motion.div>

      </div>

      <div className="mt-12 text-center" style={{ maxWidth: '500px' }}>
        <p className="noto" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {stage === 0 && 'System ID verified. Initializing commitment sequence.'}
          {stage === 1 && 'Tokens locked in the Tempo Protocol. 30-day Access Commitment started.'}
          {stage === 2 && 'Non-linear compute logic detected. Amplifying credit efficiency.'}
          {stage === 3 && 'Access credentials established. Current throughput: Maximum Capacity.'}
        </p>
      </div>

      {/* Switch Control */}
      <div style={{ position: 'absolute', bottom: '20px', right: '30px' }}>
         <button 
          onClick={() => setIsPremium(!isPremium)}
          className="jetbrains" 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.6rem', color: 'var(--text-muted)', cursor: 'pointer' }}
         >
          SW_MODE: {isPremium ? 'PREMIUM' : 'BASIC'}
         </button>
      </div>

    </div>
  );
}
