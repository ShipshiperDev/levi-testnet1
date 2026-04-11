'use client';

import { motion } from 'framer-motion';
import { NavBar } from '@/components/NavBar';
import { TokenomicsPie } from '@/components/About/TokenomicsPie';
import { CreditTierBriefing } from '@/components/About/CreditTierBriefing';
import { StakingAnimation } from '@/components/About/StakingAnimation';
import { CognitionLoop } from '@/components/About/CognitionLoop';
import { SystemSchematic } from '@/components/About/SystemSchematic';
import { MobileGuard } from '@/components/About/MobileGuard';
import { useLanguage } from '@/context/LanguageContext';
import { Terminal, BookOpen, Settings, Info, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AboutPage() {
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

  const manifestos = {
    title: t('SYSTEM ARCHITECTURE & MANIFESTO', 'システム構成および宣言書'),
    subtitle: t('The Technical Rationality of the LEVI Infrastructure', 'LEVIインフラストラクチャにおける技術的合理性'),
    intro: t(
      'LEVI serves as the intelligence foundation for the Tempo Network. It is designed to form systemic order through advanced reasoning pipelines.',
      'LEVIはTempoネットワークの知能基盤として機能します。高度な推論パイプラインを通じて、体系的な秩序を形成するために設計されています。'
    ),
    economics_h: t('ECONOMIC RATIONALITY', '経済的合理性'),
    economics_body: t(
        'Passive token inflation (Passive APY) is fundamentally excluded as it compromises long-term utility. LEVI utilizes a reward system based on Usage-Based Rebates and loyalty milestones. A "Fee Burn" mechanism directly tied to compute consumption ensures the systemic scarcity of $LEVI.',
        '受動的なトークンインフレ（受動的利回り）は、長期的な有用性を損なうため、根本的に排除されています。LEVIは、利用ベースのリベートとロイヤルティマイルストーンに基づく報酬システムを採用しています。計算消費に直接結びついた「Fee Burn」メカニズムが、$LEVIの体系的な希少性を担保します。'
    ),
    security_h: t('SECURITY & INTEGRITY COMMITMENT', 'セキュリティと完全性へのコミットメント'),
    security_body: t(
        'System stability is maintained through the 30-Day Access Commitment. This ensures that only committed participants interact with the deeper cognitive layers, preventing high-frequency noise and farming.',
        'システム安定性は、30日間のアクセス契約を通じて維持されます。これにより、確約された参加者のみが深層認知レイヤーと相互作用することを保証し、高周波のノイズや不正行為を防止します。'
    )
  };

  return (
    <main className={lang === 'ja' ? 'lang-ja' : ''} style={{ background: 'var(--bg-deep)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MobileGuard />
      <NavBar />
      
      {!isMobile && (
        <>
          {/* High-Impact Technical Background */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59,130,246,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div style={{ position: 'absolute', right: '-10%', top: '10%', fontSize: '25rem', color: 'rgba(255,255,255,0.015)', fontWeight: 900, fontFamily: 'serif' }}>体系</div>
            <div style={{ position: 'absolute', left: '-5%', bottom: '10%', fontSize: '18rem', color: 'rgba(255,255,255,0.015)', fontWeight: 900, fontFamily: 'serif' }}>推論</div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(10,10,12,0) 0%, rgba(10,10,12,1) 100%)' }} />
          </div>

          <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '160px', paddingBottom: '120px' }}>
            
            {/* HEADER SECTION */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '100px' }}
            >
              <div className="section-label">SYSTEM_DOCUMENTATION_v1.3_STABLE</div>
              <h1 className="noto" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                {manifestos.title}
              </h1>
              <p className="jetbrains" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', letterSpacing: '4px', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
                {manifestos.subtitle}
              </p>
            </motion.section>

            {/* COGNITION LOOP */}
            <section style={{ marginBottom: '140px' }}>
              <div className="flex-center mb-12">
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--glass-border))' }} />
                <div className="px-6 jetbrains" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '5px' }}>01_COGNITIVE_PIPELINE</div>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }} />
              </div>
              <CognitionLoop />
            </section>

            {/* SECURITY & INTEGRITY (GAP RESOLUTION) */}
            <section style={{ marginBottom: '140px' }}>
                <div className="flex-center mb-12">
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--glass-border))' }} />
                    <div className="px-6 jetbrains" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '5px' }}>02_INTEGRITY_SCHEMATIC</div>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }} />
                </div>
                
                <div className="grid-2" style={{ gap: '60px', alignItems: 'center' }}>
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div className="section-label mb-6">{t('SECURITY_COMMITMENT', 'セキュリティへの確約')}</div>
                        <h2 className="noto mb-6" style={{ fontSize: '2.2rem', fontWeight: 800 }}>{manifestos.security_h}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '32px' }}>
                            {manifestos.security_body}
                        </p>
                        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
                            <div className="flex items-center gap-2 mb-2">
                               <ShieldCheck size={18} className="text-red-400" />
                               <span className="jetbrains" style={{ fontSize: '0.7rem', letterSpacing: '2px', fontWeight: 800 }}>V0_SHIELD_PROTO</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {t('Anti-noise filtering active. Core reasoning weights protected by the Privacy Shield layer.', 'ノイズフィルタリング有効。コア推論ウェイトはプライバシーシールドレイヤーによって保護されています。')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Filling the void with the System Schematic */}
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                       <SystemSchematic />
                    </motion.div>
                </div>
            </section>

            {/* TOKENOMICS PIE (INTERACTIVE) */}
            <section style={{ marginBottom: '140px' }}>
               <div className="flex-center mb-12">
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--glass-border))' }} />
                <div className="px-6 jetbrains" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '5px' }}>03_DISTRIBUTION_LOGIC</div>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }} />
              </div>
              <TokenomicsPie />
            </section>

            {/* STAKING & TIER Briefing */}
            <section style={{ marginBottom: '140px' }}>
                <div className="flex-center mb-12">
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--glass-border))' }} />
                    <div className="px-6 jetbrains" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '5px' }}>04_TIER_OPTIMIZATION</div>
                    <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }} />
                </div>
                
                <div className="grid-2" style={{ gap: '80px', marginBottom: '80px', alignItems: 'center' }}>
                    <StakingAnimation />
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <h2 className="noto text-gradient mb-6" style={{ fontSize: '2.5rem', fontWeight: 900 }}>{t('NON-LINEAR CREDIT ARCHITECTURE', '非構造型クレジット構造')}</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            {t('Credits in LEVI are not linear. Higher commitment tiers unlock disproportionately higher compute efficiency. Move from Basic to Premium to unlock a 100% amplification in logical processing power per unit committed.', 
                               'LEVIのクレジットは単純な比例関係ではありません。コミットメントティアが高いほど、不釣り合いに高い計算効率が解除されます。ベーシックからプレミアムに移行することで、コミットされた単位あたりの論理処理能力が100%増幅されます。')}
                        </p>
                    </motion.div>
                </div>

                <CreditTierBriefing />
            </section>

            {/* FINAL MANIFESTO SECTION */}
            <section style={{ marginBottom: '100px' }}>
               <div className="glass-panel" style={{ padding: '60px', border: '1px dashed var(--glass-border)' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                        <h3 className="noto" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>{manifestos.economics_h}</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            {manifestos.economics_body}
                        </p>
                    </div>
                    <div style={{ background: 'rgba(59,130,246,0.05)', padding: '30px', borderRadius: '12px', border: '1px solid var(--accent-primary)' }}>
                        <div className="jetbrains mb-4" style={{ fontSize: '0.65rem', letterSpacing: '2px', fontWeight: 800 }}>SYSTEM_DIAGNOSTICS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="flex-between">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Network:</span>
                                <span className="jetbrains text-azure" style={{ fontSize: '0.75rem' }}>TEMPO_MAIN</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Stability:</span>
                                <span className="jetbrains text-azure" style={{ fontSize: '0.75rem' }}>100.0%</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Scarcity:</span>
                                <span className="jetbrains text-red-400" style={{ fontSize: '0.75rem' }}>DEFLATIONARY</span>
                            </div>
                        </div>
                    </div>
                 </div>
               </div>
            </section>
          </div>

          <footer style={{ padding: '80px 0', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', position: 'relative', zIndex: 10 }}>
            <div className="container flex-between">
                <div>
                  <div className="text-gradient jetbrains mb-2" style={{ fontSize: '1.5rem', fontWeight: 900 }}>LEVI</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>© 2026 LEVI SYSTEMS // THE INTELLIGENCE LAYER OF TEMPO</div>
                </div>
                <div className="flex gap-8">
                   <div className="jetbrains text-muted" style={{ fontSize: '0.7rem' }}>DEPL_MODE: PRODUCTION</div>
                   <div className="jetbrains text-muted" style={{ fontSize: '0.7rem' }}>VER: 1.3.5</div>
                </div>
            </div>
          </footer>
        </>
      )}

      <style jsx>{`
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(59,130,246,0.1);
          color: #3b82f6;
          padding: 6px 16px;
          font-size: 0.7rem;
          letter-spacing: 5px;
          display: inline-block;
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
}
