import React, { useState, useCallback } from 'react';
import { daysUntil, urgencyInfo, CATEGORIES, UNITS } from '../data/foods';
import { TopBar, FormLabel } from './UI';

const FILTERS = [
  { key: 'all',      label: 'All'      },
  { key: 'expired',  label: 'Expired'  },
  { key: 'critical', label: '≤ 2 days' },
  { key: 'soon',     label: '≤ 10 days'},
  { key: 'fresh',    label: 'Fresh'    },
];

function matchFilter(item, filter) {
  const d = daysUntil(item.expiry);
  if (filter === 'all')      return true;
  if (filter === 'expired')  return d < 0;
  if (filter === 'critical') return d >= 0 && d <= 2;
  if (filter === 'soon')     return d >= 0 && d <= 10;
  if (filter === 'fresh')    return d > 10;
  return true;
}

function expiryLabel(d) {
  if (d < 0)   return `${Math.abs(d)} days ago`;
  if (d === 0) return 'Today!';
  if (d === 1) return 'Tomorrow';
  return `In ${d} days`;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    name:     item.name,
    qty:      item.qty,
    unit:     item.unit,
    expiry:   item.expiry,
    category: item.category,
  });

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        zIndex: 200, backdropFilter: 'blur(2px)',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 460, background: 'var(--surface)',
        borderRadius: '16px 16px 0 0', border: '1px solid var(--border)',
        borderBottom: 'none', padding: '20px 20px 36px', zIndex: 201,
        animation: 'slideUp .22s ease',
      }}>
        <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(40px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>

        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{item.emoji}</span>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Edit item</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <FormLabel>Item name</FormLabel>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <FormLabel>Quantity</FormLabel>
            <input type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
          </div>
          <div>
            <FormLabel>Unit</FormLabel>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <FormLabel>Expiry date</FormLabel>
          <input type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <FormLabel>Category</FormLabel>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 700, color: 'var(--muted)', cursor: 'pointer',
          }}>Cancel</button>
          <button
            onClick={() => onSave({ ...form, qty: Number(form.qty) })}
            style={{
              flex: 2, padding: '12px', background: 'var(--green)',
              border: 'none', borderRadius: 'var(--radius)',
              fontSize: 14, fontWeight: 800, color: '#fff', cursor: 'pointer',
            }}>Save changes</button>
        </div>
      </div>
    </>
  );
}

// ── ExpiryTracker ─────────────────────────────────────────────────────────────
export default function ExpiryTracker({ items, onDelete, onEdit, onBack, onRecipe }) {
  const [filter, setFilter]   = useState('all');
  const [editing, setEditing] = useState(null);

  const handleSave = useCallback((updates) => {
    if (editing && typeof onEdit === 'function') {
      onEdit(editing.id, updates);
    }
    setEditing(null);
  }, [editing, onEdit]);

  const sorted  = [...items].sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry));
  const visible = sorted.filter(i => matchFilter(i, filter));

  return (
    <div className="fade-up">
      <TopBar
        title="Expiry tracker"
        onBack={onBack}
        right={<span style={{ fontSize: 12, color: 'var(--muted)' }}>{items.length} items</span>}
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 7, padding: '12px 20px', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            whiteSpace: 'nowrap', padding: '5px 13px',
            border: `1px solid ${filter === key ? 'var(--green)' : 'var(--border)'}`,
            borderRadius: 20, background: filter === key ? 'var(--green-bg)' : 'transparent',
            fontSize: 12, fontWeight: filter === key ? 700 : 500,
            color: filter === key ? 'var(--green)' : 'var(--muted)',
            cursor: 'pointer', transition: 'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✨</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>No items here</div>
          <p style={{ fontSize: 12, marginTop: 4 }}>Try a different filter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '16px 20px' }}>
          {visible.map(item => {
            const d = daysUntil(item.expiry);
            const u = urgencyInfo(d);
            return (
              <div key={item.id} className="fade-up" style={{
                background: 'var(--surface2)', borderRadius: 'var(--radius)',
                border: `1px solid ${u.border}`, padding: 14,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: u.color }} />

                <span style={{ fontSize: 34, display: 'block', marginBottom: 8 }}>{item.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                  {item.qty} {item.unit} · {item.category}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3 }}>Expires</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: u.color, marginBottom: 3 }}>{expiryLabel(d)}</div>
                <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: "'DM Mono',monospace", marginBottom: 10 }}>
                  {item.expiry}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button onClick={() => onRecipe(item)} style={{
                      flex: 1, padding: '6px 4px', border: '1px solid var(--border)',
                      borderRadius: 6, fontSize: 11, cursor: 'pointer',
                      background: 'transparent', color: 'var(--muted)', transition: 'all .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                    >👨‍🍳 Recipe</button>

                    <button onClick={() => onDelete(item.id)} style={{
                      padding: '6px 8px', border: '1px solid var(--border)',
                      borderRadius: 6, fontSize: 12, cursor: 'pointer',
                      background: 'transparent', color: 'var(--muted)', transition: 'all .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                    >🗑</button>
                  </div>

                  <button onClick={() => setEditing(item)} style={{
                    width: '100%', padding: '6px', border: '1px solid var(--border)',
                    borderRadius: 6, fontSize: 11, cursor: 'pointer',
                    background: 'transparent', color: 'var(--muted)', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
                  >✏️ Edit item</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <EditModal
          item={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
