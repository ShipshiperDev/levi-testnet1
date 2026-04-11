'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const dict = {
    home: t('Home', 'トップ'),
    about: t('About', 'LEVIについて'),
    how: t('How To Buy', '購入方法'),
    tokenomics: t('Tokenomics', 'トケノミクス'),
    presale: t('Presale', 'プレセール'),
  };

  return (
    <>
      <nav className="navbar">
        <div className="container flex-between" style={{ height: '100%' }}>
          <a href="#home" style={{ textDecoration: 'none' }}>
            <span className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-1px' }}>
              LEVI
            </span>
          </a>

          {/* Desktop links */}
          <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <a href="#home">{dict.home}</a>
            <a href="#about">{dict.about}</a>
            <a href="#how">{dict.how}</a>
            <a href="#tokenomics">{dict.tokenomics}</a>
            <a href="#presale" className="active">{dict.presale}</a>
            
            {/* Lang Toggle */}
            <button 
              onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
              className="jetbrains"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.65rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginLeft: '8px'
              }}
            >
              {lang === 'ja' ? 'EN' : '日本語'}
            </button>
          </div>

          {/* Hamburger (CSS shows this on mobile) */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
            className="jetbrains"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
            }}
          >
            {lang === 'ja' ? 'Switch to English' : '日本語に切り替え'}
          </button>
        </div>
        {[
          { label: dict.home, href: '#home' },
          { label: dict.about, href: '#about' },
          { label: dict.how, href: '#how' },
          { label: dict.tokenomics, href: '#tokenomics' },
          { label: dict.presale, href: '#presale' },
        ].map((item) => (
          <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
