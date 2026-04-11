'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Share2, Layers, Cpu } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function SystemSchematic() {
  const { lang, t } = useLanguage();

  return (
    <div className="system-schematic glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Grid for the Schematic */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(var(--accent-primary) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <Layers className="text-blue-500" size={18} />
          <h3 className="jetbrains" style={{ fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            PRIVACY_ARCH_SCHEMATIC // 002
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '20px', alignItems: 'center' }}>
          
          {/* Left: Public Layer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div className="jetbrains" style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', letterSpacing: '2px' }}>[PUBLIC_EDGE_ACCOUNTABILITY]</div>
             <motion.div 
              whileHover={{ x: 5 }}
              style={{ padding: '16px', background: 'rgba(59,130,246,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Share2 size={16} className="text-blue-400" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Execution Logs</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time transparency on Tempo</p>
             </motion.div>
             <motion.div 
               whileHover={{ x: 5 }}
               style={{ padding: '16px', background: 'rgba(59,130,246,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Eye size={16} className="text-blue-400" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>System Specs</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open architecture verification</p>
             </motion.div>
          </div>

          {/* Center: The Shield */}
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
             <div style={{ height: '100%', width: '1px', background: 'var(--glass-border)', position: 'absolute' }} />
             <motion.div 
              animate={{ 
                boxShadow: ['0 0 10px rgba(59,130,246,0.2)', '0 0 30px rgba(59,130,246,0.4)', '0 0 10px rgba(59,130,246,0.2)'] 
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ zIndex: 10, background: 'var(--bg-dark)', padding: '12px', borderRadius: '50%', border: '1px solid var(--accent-primary)' }}
             >
               <Shield className="text-blue-400" size={24} />
             </motion.div>
             <div className="jetbrains" style={{ fontSize: '0.55rem', color: 'var(--accent-primary)', transform: 'rotate(-90deg)', marginTop: '60px', whiteSpace: 'nowrap' }}>
                PRIVACY_SHIELD_V1
             </div>
          </div>

          {/* Right: Private Core */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div className="jetbrains text-right" style={{ fontSize: '0.6rem', color: '#ef4444', letterSpacing: '2px' }}>[PROTECTED_CORE_INTELLIGENCE]</div>
             <motion.div 
               whileHover={{ x: -5 }}
               style={{ padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Reasoning Weights</span>
                  <Cpu size={16} className="text-red-400" />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Proprietary cognitive logic</p>
             </motion.div>
             <motion.div 
               whileHover={{ x: -5 }}
               style={{ padding: '16px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Intelligence Hub</span>
                  <Lock size={16} className="text-red-400" />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>Encrypted data-flow core</p>
             </motion.div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-glass-border">
           <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
             {t('Information Flow Isolation: LEVI segments public accountability from private cognition to prevent system destabilization through adversarial prompt engineering.', 
                '情報フローの隔離：LEVIは、公開されたアカウンタビリティとプライベートな認知機能を分離し、敵対的なプロンプトエンジニアリングによるシステムの不安定化を防止します。')}
           </p>
        </div>
      </div>

    </div>
  );
}
