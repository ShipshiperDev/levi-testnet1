'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
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

  const pathname = usePathname();
  const isAboutPage = pathname === '/about';
  const getHref = (id: string) => isAboutPage ? `/${id}` : id;

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
            <a href={getHref('#home')}>{dict.home}</a>
            <a href="/about" className={isAboutPage ? 'active' : ''}>{dict.about}</a>
            <a href={getHref('#how')}>{dict.how}</a>
            <a href={getHref('#tokenomics')}>{dict.tokenomics}</a>
            <a href={getHref('#presale')} className="active">{dict.presale}</a>
            
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
          { label: dict.home, href: getHref('#home') },
          { label: dict.about, href: '/about' },
          { label: dict.how, href: getHref('#how') },
          { label: dict.tokenomics, href: getHref('#tokenomics') },
          { label: dict.presale, href: getHref('#presale') },
        ].map((item) => (
          <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
