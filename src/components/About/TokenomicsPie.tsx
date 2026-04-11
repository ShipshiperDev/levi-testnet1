'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, List, Shield, Zap, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function TokenomicsPie() {
  const { lang, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const data = [
    {
      label: 'Public Presale',
      labelJp: '公開プレセール',
      value: 50,
      color: '#3b82f6',
      icon: <Zap size={18} />,
      desc: '50,000,000 $LEVI. primary distribution channel for the Tempo community. Ensuring a decentralized holder base from genesis.',
      descJp: '50,000,000 $LEVI。Tempoコミュニティ向けの主要な分配チャネル。ジェネシス時点からの分散型ホルダーベースの確保。'
    },
    {
      label: 'Liquidity (Locked)',
      labelJp: '流動性（ロック済み）',
      value: 30,
      color: '#6366f1',
      icon: <Shield size={18} />,
      desc: '30,000,000 $LEVI. Permanently locked liquidity provision to maintain deep market stability on DEX platforms.',
      descJp: '30,000,000 $LEVI。DEXプラットフォーム上での深い市場安定性を維持するための、恒久的にロックされた流動性提供。'
    },
    {
      label: 'Ecosystem Growth',
      labelJp: 'エコシステム発展',
      value: 10,
      color: '#06b6d4',
      icon: <Globe size={18} />,
      desc: '10,000,000 $LEVI. Operational capital for node expansion, engineering grants, and strategic infrastructure scaling.',
      descJp: '10,000,000 $LEVI。ノードの拡大、エンジニアリング助成金、および戦略的インフラのスケーリングのための運用資金。'
    },
    {
      label: 'Staking & Rewards',
      labelJp: 'ステーキング報酬',
      value: 10,
      color: '#94a3b8',
      icon: <List size={18} />,
      desc: '10,000,000 $LEVI. Sustaining the Credit Multiplier system and rewarding long-term "Access Commitment" holders.',
      descJp: '10,000,000 $LEVI。クレジット・マルチプライヤー・システムの維持と、長期的な「アクセス契約」保有者への報酬。'
    }
  ];

  // Calculate SVG paths for segments
  let cumulativePercent = 0;
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getPath = (startPercent: number, endPercent: number, radius: number) => {
    const startAngle = startPercent * 3.6;
    const endAngle = endPercent * 3.6;
    const start = polarToCartesian(150, 150, radius, endAngle);
    const end = polarToCartesian(150, 150, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", 150, 150,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  return (
    <div className="pie-section glass-panel" style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
      
      {/* Interactive SVG Pie */}
      <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto' }}>
        <svg viewBox="0 0 300 300" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          {data.map((item, i) => {
            const start = cumulativePercent;
            cumulativePercent += item.value;
            const isHovered = activeIndex === i;
            
            return (
              <motion.path
                key={i}
                d={getPath(start, cumulativePercent, 120)}
                fill={item.color}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHovered ? 1.05 : 1,
                  filter: isHovered ? 'brightness(1.2) drop-shadow(0 0 10px rgba(59,130,246,0.3))' : 'brightness(1)' 
                }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveIndex(i)}
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              />
            );
          })}
          {/* Inner masking for donut feel */}
          <circle cx="150" cy="150" r="60" fill="var(--bg-dark)" />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
           <div className="jetbrains" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ALLOCATION</div>
           <div className="jetbrains" style={{ fontSize: '1.2rem', fontWeight: 800 }}>100M</div>
        </div>
      </div>

      {/* Breakdown Details */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PieChart className="text-blue-500" size={20} />
          <h3 className="jetbrains" style={{ fontSize: '0.8rem', letterSpacing: '3px', fontWeight: 800 }}>
            TOKENOMIC_BREAKDOWN // 01
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.map((item, i) => (
            <motion.div 
              key={i}
              onClick={() => setActiveIndex(i)}
              animate={{
                x: activeIndex === i ? 10 : 0,
                borderColor: activeIndex === i ? item.color : 'transparent',
                backgroundColor: activeIndex === i ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)'
              }}
              style={{
                padding: '12px 16px',
                borderLeft: `4px solid ${item.color}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '0 4px 4px 0',
                border: '1px solid transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.5, repeat: 1 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      zIndex: 1
                    }}
                  />
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <span className="noto" style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 700,
                  textShadow: activeIndex === i ? `0 0 10px ${item.color}55` : 'none' 
                }}>
                  {lang === 'ja' ? item.labelJp : item.label}
                </span>
                <span className="jetbrains" style={{ fontSize: '0.9rem', fontWeight: 800, color: item.color }}>{item.value}%</span>
              </div>
              
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', position: 'relative', zIndex: 2 }}
                  >
                    <div style={{ paddingTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span className="jetbrains" style={{ color: item.color, fontSize: '0.6rem', marginRight: '8px' }}>[ANNOUNCEMENT]</span>
                      {lang === 'ja' ? item.descJp : item.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
