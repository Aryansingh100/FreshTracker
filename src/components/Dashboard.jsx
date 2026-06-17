import React from 'react';
import { daysUntil, urgencyInfo, formatDays } from '../data/foods';

export default function Dashboard({ items, onNav }) {
  const total    = items.length;
  const expired  = items.filter(i => daysUntil(i.expiry) < 0).length;
  const critical = items.filter(i => { const d = daysUntil(i.expiry); return d >= 0 && d <= 5; }).length;
  const fresh    = items.filter(i => daysUntil(i.expiry) > 5).length;

  const urgent = [...items]
    .filter(i => daysUntil(i.expiry) <= 5)
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry));

  const stats = [
    { label: 'Total',         val: total,    color: 'var(--muted)' },
    { label: 'Expired',       val: expired,  color: 'var(--red)'   },
    { label: 'Expiring soon', val: critical, color: 'var(--amber)' },
    { label: 'Fresh',         val: fresh,    color: 'var(--green)' },
  ];

  const actions = [
    { label: 'Add item',       sub: 'Search or scan barcode',   emoji: '➕', page: 'add',     accent: 'var(--green-border)' },
    { label: 'Expiry tracker', sub: 'View all items & dates',   emoji: '📅', page: 'expiry',  accent: 'var(--blue-border)'  },
    { label: 'Recipe ideas',   sub: 'Cook before it expires',   emoji: '👨‍🍳', page: 'recipes', accent: 'var(--amber-border)' },
    { label: 'Manage pantry',  sub: 'Edit or remove items',     emoji: '🧹', page: 'expiry',  accent: 'var(--purple-bg)'    },
  ];

  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '18px 20px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🥦</span>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>FreshTrack</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Track what's in your kitchen. Waste nothing.</p>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
          Quick actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {actions.map(a => (
            <button key={a.label} onClick={() => onNav(a.page)} style={{
              background: 'var(--surface2)', border: `1px solid var(--border)`,
              borderRadius: 'var(--radius)', padding: 16, textAlign: 'left',
              transition: 'border-color .2s, transform .1s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.accent; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
              <span style={{ fontSize: 26, display: 'block', marginBottom: 8 }}>{a.emoji}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{a.sub}</div>
            </button>
          ))}
        </div>

        {/* Needs attention */}
        {urgent.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
              ⚠ Needs attention
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {urgent.map(item => {
                const d = daysUntil(item.expiry);
                const u = urgencyInfo(d);
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 'var(--radius)',
                    background: u.bg, border: `1px solid ${u.border}`,
                  }}>
                    <span style={{ fontSize: 26 }}>{item.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.qty} {item.unit}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: u.color }}>{formatDays(d)}</div>
                      <div style={{ fontSize: 10, color: u.color, marginTop: 1 }}>{u.label}</div>
                    </div>
                    <button onClick={() => onNav('recipes', { preselect: item.id })} style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                      padding: '4px 9px', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap',
                      transition: 'border-color .15s, color .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}>
                      Recipe?
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Your pantry is empty</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Add your first item to get started</p>
            <button onClick={() => onNav('add')} style={{
              marginTop: 16, padding: '9px 24px', background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700,
            }}>Add item</button>
          </div>
        )}
      </div>
    </div>
  );
}
