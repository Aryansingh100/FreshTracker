import React from 'react';

// ── TopBar ────────────────────────────────────────────────────────────────────
export function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--muted)',
          fontSize: 22, lineHeight: 1, display: 'flex', alignItems: 'center',
          marginRight: 4, padding: 0,
        }}>←</button>
      )}
      <span style={{ fontSize: 17, fontWeight: 800, flex: 1 }}>{title}</span>
      {right}
    </div>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { page: 'dashboard', label: 'Home',    icon: <GridIcon /> },
  { page: 'add',       label: 'Add',     icon: <PlusIcon /> },
  { page: 'expiry',    label: 'Track',   icon: <CalIcon />  },
  { page: 'recipes',   label: 'Recipes', icon: <ChefIcon /> },
];

export function BottomNav({ current, onNav }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 460,
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ page, label, icon }) => {
        const active = current === page;
        return (
          <button key={page} onClick={() => onNav(page)} style={{
            flex: 1, border: 'none', background: 'transparent',
            padding: '10px 0 8px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            color: active ? 'var(--green)' : 'var(--muted)',
            fontSize: 10, fontWeight: active ? 700 : 500,
            transition: 'color .15s',
          }}>
            <span style={{ display: 'flex' }}>{icon}</span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function CalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function ChefIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3C9 3 7 5 7 7.5c0 1.5.7 2.8 1.8 3.7V15h6.4v-3.8C16.3 10.3 17 9 17 7.5 17 5 15 3 12 3z"/>
      <line x1="9" y1="15" x2="9" y2="21"/><line x1="15" y1="15" x2="15" y2="21"/>
      <line x1="9" y1="21" x2="15" y2="21"/>
    </svg>
  );
}

// ── Shared Btn ────────────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '13px', background: 'var(--green)', color: '#fff',
      border: 'none', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      transition: 'opacity .15s', ...style,
    }}>
      {children}
    </button>
  );
}

export function SuccessBanner({ children }) {
  return (
    <div style={{
      background: 'var(--green-bg)', border: '1px solid var(--green-border)',
      borderRadius: 'var(--radius)', padding: '13px', textAlign: 'center',
      color: 'var(--green)', fontSize: 14, fontWeight: 700,
    }}>
      {children}
    </div>
  );
}

export function ErrorBanner({ children }) {
  return (
    <div style={{
      background: 'var(--red-bg)', border: '1px solid var(--red-border)',
      borderRadius: 'var(--radius-sm)', padding: '12px',
      color: 'var(--red)', fontSize: 13, marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

export function Spinner({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '44px 0' }}>
      <div style={{
        width: 28, height: 28, border: '2px solid var(--border)',
        borderTopColor: 'var(--green)', borderRadius: '50%',
        animation: 'spin .7s linear infinite', margin: '0 auto 12px',
      }} />
      {label && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</p>}
    </div>
  );
}

export function FormLabel({ children }) {
  return (
    <label style={{
      fontSize: 10, fontWeight: 700, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6,
    }}>
      {children}
    </label>
  );
}
