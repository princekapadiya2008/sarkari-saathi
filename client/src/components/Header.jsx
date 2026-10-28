import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, LogOut, UserRound, Shield, PlusCircle } from 'lucide-react';

export default function Header({ page, navigate, startNewJourney, session, onSignOut, isBackendLive }) {
  const [open, setOpen] = useState(false);
  const nav = (p) => {
    setOpen(false);
    navigate(p);
  };

  const handleCreateJourney = () => {
    setOpen(false);
    startNewJourney();
  };

  return (
    <header className="topbar">
      <div className="navInner">
        <button
          type="button"
          className="brand"
          onClick={() => nav('home')}
          aria-label="Sarkari Saathi Home"
        >
          <img src="/logo-icon.png" alt="Sarkari Saathi logo" className="brandLogoImg" />
          <span className="brandTextGroup">
            <span className="brandText">
              Sarkari <span className="brandAccent">Saathi</span>
            </span>
            <span className="brandSub">Your Guide for Every Government Process</span>
          </span>
        </button>

        {isBackendLive !== undefined && (
          <span
            className={`apiStatusBadge ${isBackendLive ? '' : 'offline'}`}
            title={isBackendLive ? 'Securely connected to Express + SQLite backend' : 'Backend offline'}
          >
            <span className={`pulseDot ${isBackendLive ? '' : 'offline'}`} />
            {isBackendLive ? 'API Connected' : 'Offline'}
          </span>
        )}

        <nav className={open ? 'nav open' : 'nav'} aria-label="Main Navigation">
          <button
            type="button"
            className={page === 'home' ? 'navItem active' : 'navItem'}
            onClick={() => nav('home')}
            aria-current={page === 'home' ? 'page' : undefined}
          >
            Home
          </button>

          <button
            type="button"
            className={page === 'explore' ? 'navItem active' : 'navItem'}
            onClick={() => nav('explore')}
            aria-current={page === 'explore' ? 'page' : undefined}
          >
            Explore
          </button>

          <button
            type="button"
            className={page === 'my' ? 'navItem active' : 'navItem'}
            onClick={() => nav('my')}
            aria-current={page === 'my' ? 'page' : undefined}
          >
            My Journeys
          </button>

          <button
            type="button"
            className={page === 'builder' ? 'navItem active' : 'navItem'}
            onClick={handleCreateJourney}
            aria-current={page === 'builder' ? 'page' : undefined}
          >
            <PlusCircle size={14} /> Create Journey
          </button>

          <button
            type="button"
            className={page === 'about' ? 'navItem active' : 'navItem'}
            onClick={() => nav('about')}
            aria-current={page === 'about' ? 'page' : undefined}
          >
            About
          </button>

          {/* Admin button ONLY visible to authenticated users with authoritative admin role */}
          {session?.role === 'admin' && (
            <button
              type="button"
              className={page === 'admin' ? 'navItem admin active' : 'navItem admin'}
              onClick={() => nav('admin')}
              title="Administrator Dashboard"
              aria-current={page === 'admin' ? 'page' : undefined}
            >
              <LayoutDashboard size={15} /> Admin <Shield size={12} color="#00a2f9" />
            </button>
          )}

          {session ? (
            <button
              type="button"
              className="navItem signoutBtn"
              onClick={onSignOut}
              title={`Signed in as ${session.name} (${session.email})`}
            >
              <LogOut size={15} /> Sign Out ({session.role === 'admin' ? 'Admin' : session.name?.split(' ')[0] || 'Citizen'})
            </button>
          ) : (
            <button
              type="button"
              className={page === 'signin' ? 'navItem active' : 'navItem'}
              onClick={() => nav('signin')}
              aria-current={page === 'signin' ? 'page' : undefined}
            >
              <UserRound size={15} /> Sign In
            </button>
          )}
        </nav>

        <button
          type="button"
          className="mobileMenu"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
