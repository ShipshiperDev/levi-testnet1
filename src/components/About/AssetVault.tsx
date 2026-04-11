'use client';

import { motion } from 'framer-motion';
import { FileText, Download, ShieldCheck, HardDrive } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function AssetVault() {
  const { lang, t } = useLanguage();

  const assets = [
    {
      title: 'Technical Whitepaper (Bilingual)',
      label: '仕様書 v1.2',
      file: 'levi_whitepaper.md',
      size: '12.4 KB'
    },
    {
      title: 'Economic Manifesto (EN)',
      label: '経済論理',
      file: 'levi_whitepaper_en.md',
      size: '8.2 KB'
    },
    {
      title: 'System Specifications',
      label: '構造スペック',
      file: 'levi_system_specs.txt',
      size: '5.1 KB'
    }
  ];

  return (
    <div className="asset-vault" style={{ padding: '60px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <HardDrive className="text-blue-500" size={20} />
        <h2 className="jetbrains" style={{ fontSize: '0.8rem', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          SECURE_ASSET_VAULT // 資産保管庫
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {assets.map((asset, i) => (
          <motion.div
            key={asset.file}
            whileHover={{ y: -4, borderColor: 'var(--accent-primary)' }}
            className="glass-panel"
            style={{ 
              padding: '24px', 
              border: '1px solid var(--glass-border)', 
              display: 'flex', 
              flexDirection: 'column',
              gap: '16px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '10px', borderRadius: '8px' }}>
                <FileText className="text-blue-400" size={24} />
              </div>
              <div className="jetbrains" style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                {asset.label}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{asset.title}</div>
              <div className="jetbrains" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{asset.file} | {asset.size}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button 
                className="btn-secondary" 
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  fontSize: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  borderRadius: '6px'
                }}
              >
                <Download size={14} /> {t('Download', 'ダウンロード')}
              </button>
              <div style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', opacity: 0.5 }}>
                <ShieldCheck size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
