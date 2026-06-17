import React, { useState, useEffect } from 'react';
import { FOOD_DB, BARCODE_MAP, CATEGORIES, UNITS, addDays } from '../data/foods';
import { TopBar, PrimaryBtn, SuccessBanner, FormLabel } from './UI';

export default function AddItem({ onAdd, onBack }) {
  const [tab, setTab]             = useState('search');
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [barcode, setBarcode]     = useState('');
  const [form, setForm]           = useState({ qty: 1, unit: 'pcs', expiry: addDays(7), category: 'Other' });
  const [success, setSuccess]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(FOOD_DB.filter(f => f.name.toLowerCase().includes(q)).slice(0, 7));
  }, [query]);

  function selectFood(food) {
    setSelected(food);
    setForm(f => ({ ...f, category: food.category, expiry: addDays(food.days) }));
    setResults([]);
  }

  function lookupBarcode() {
    const found = BARCODE_MAP[barcode.trim()] || { name: `Product #${barcode}`, category: 'Other', emoji: '📦', days: 90 };
    selectFood(found);
  }

  async function handleAdd() {
    if (!selected) return;
    setSubmitting(true);
    onAdd({
      name:     selected.name,
      emoji:    selected.emoji || '📦',
      category: form.category,
      qty:      Number(form.qty) || 1,
      unit:     form.unit,
      expiry:   form.expiry,
    });
    setSuccess(true);
    await new Promise(r => setTimeout(r, 1600));
    setSelected(null); setQuery(''); setBarcode(''); setSuccess(false); setSubmitting(false);
  }

  function switchTab(t) {
    setTab(t); setSelected(null); setQuery(''); setBarcode('');
  }

  const tabStyle = (t) => ({
    flex: 1, padding: '8px', border: `1px solid ${tab === t ? 'var(--green)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)', background: tab === t ? 'var(--surface)' : 'transparent',
    cursor: 'pointer', fontSize: 12, fontWeight: tab === t ? 700 : 500,
    color: tab === t ? 'var(--green)' : 'var(--muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    transition: 'all .15s',
  });

  return (
    <div className="fade-up">
      <TopBar title="Add item" onBack={onBack} />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: '14px 20px',
        background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
      }}>
        <button style={tabStyle('search')} onClick={() => switchTab('search')}>🔍 Search food</button>
        <button style={tabStyle('barcode')} onClick={() => switchTab('barcode')}>📦 Barcode</button>
      </div>

      <div style={{ padding: 20 }}>
        {/* ── Search panel ── */}
        {tab === 'search' && (
          <>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>🔍</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search milk, chicken, apples…"
                style={{ paddingLeft: 36 }}
                autoFocus
              />
            </div>
            {results.length > 0 && !selected && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
                {results.map((food, i) => (
                  <button key={i} onClick={() => selectFood(food)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', border: 'none',
                    borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--surface2)', cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
                  >
                    <span style={{ fontSize: 22 }}>{food.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{food.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{food.category} · expires in ~{food.days}d</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Barcode panel ── */}
        {tab === 'barcode' && !selected && (
          <>
            <div style={{
              border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
              padding: '28px 20px', textAlign: 'center', marginBottom: 14,
            }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>|||</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Enter barcode number</p>
              <p style={{ fontSize: 11, color: 'var(--dim)' }}>Try: 5000347012541 or 5449000000996</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookupBarcode()}
                placeholder="e.g. 5000347012541"
                style={{ fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}
              />
              <button onClick={lookupBarcode} disabled={!barcode} style={{
                padding: '0 16px', background: 'var(--text)', color: 'var(--bg)',
                border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700,
                whiteSpace: 'nowrap', opacity: barcode ? 1 : 0.4, cursor: barcode ? 'pointer' : 'not-allowed',
              }}>
                Look up
              </button>
            </div>
          </>
        )}

        {/* ── Item form (shown after selection) ── */}
        {selected && (
          <div className="fade-up">
            {/* Selected food card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 14, background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', marginBottom: 16,
            }}>
              <span style={{ fontSize: 32 }}>{selected.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{selected.category}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                padding: '4px 9px', fontSize: 12, color: 'var(--muted)', cursor: 'pointer',
              }}>Change</button>
            </div>

            {/* Form fields */}
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

            <div style={{ marginBottom: 20 }}>
              <FormLabel>Category</FormLabel>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {success
              ? <SuccessBanner>✓ Added to pantry!</SuccessBanner>
              : <PrimaryBtn onClick={handleAdd} disabled={submitting}>
                  {submitting ? 'Adding…' : 'Add to pantry'}
                </PrimaryBtn>
            }
          </div>
        )}
      </div>
    </div>
  );
}
