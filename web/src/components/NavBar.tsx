'use client';

import { useState } from 'react';

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#how">How It Works</a>
            <a href="#tokenomics">Tokenomics</a>
            <a href="#presale" className="active">Presale</a>
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
        {(['Home', 'About', 'How It Works', 'Tokenomics', 'Presale'] as const).map((label, i) => {
          const hrefs = ['#home', '#about', '#how', '#tokenomics', '#presale'];
          return (
            <a key={label} href={hrefs[i]} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          );
        })}
      </div>
    </>
  );
}
