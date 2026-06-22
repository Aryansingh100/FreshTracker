import React, { useState, useEffect } from 'react';
import { daysUntil, urgencyInfo } from '../data/foods';
import { TopBar, Spinner, ErrorBanner } from './UI';

const ACCENT_COLORS = ['var(--green)', 'var(--blue)', 'var(--amber)'];
const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;

function googleSearchUrl(title) {
  return `https://www.google.com/search?q=${encodeURIComponent(title + ' recipe')}`;
}

export default function RecipeIdeas({ items, preselected, onBack }) {
  const [activeId, setActiveId] = useState(preselected?.id ?? null);
  const [recipes, setRecipes]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const sortedItems = [...items]
    .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
    .slice(0, 10);

  useEffect(() => {
    if (preselected) fetchRecipes(preselected);
  }, []);

  async function fetchRecipes(item) {
    setActiveId(item.id);
    setRecipes([]);
    setError('');
    setLoading(true);

    const others = items
      .filter(i => i.id !== item.id)
      .map(i => i.name)
      .join(', ');

    const prompt = `I have ${item.name} that expires in ${daysUntil(item.expiry)} days (${item.expiry}). Suggest exactly 3 recipes I can make with it. I also have these other ingredients: ${others || 'basic pantry staples (salt, pepper, oil, onion, garlic)'}.

Return ONLY a valid JSON array with no markdown fences or extra text:
[{"title":"","time":"","difficulty":"Easy","description":"Two sentence description of the dish and why it works.","ingredients":["item1","item2"],"tip":"One practical cooking tip."}]`;

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FreshTrack',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free@openrouter',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();

      console.log('OpenRouter response:', JSON.stringify(data, null, 2));

      if (data.error) {
        setError(`API error: ${data.error.message || JSON.stringify(data.error)}`);
        return;
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        setError('No response from AI. Check console for details.');
        return;
      }

      let clean = text.replace(/```json|```/g, '').trim();

      const arrayStart = clean.indexOf('[');
      const arrayEnd   = clean.lastIndexOf(']');
      if (arrayStart !== -1 && arrayEnd !== -1) {
        clean = clean.slice(arrayStart, arrayEnd + 1);
      }

      try {
        const parsed = JSON.parse(clean);
        setRecipes(parsed);
      } catch (parseErr) {
        const matches = clean.match(/\{[^{}]*\}/g);
        if (matches && matches.length > 0) {
          const salvaged = matches
            .map(m => { try { return JSON.parse(m); } catch { return null; } })
            .filter(Boolean);
          if (salvaged.length > 0) { setRecipes(salvaged); return; }
        }
        setError('AI returned malformed response. Please try again.');
      }

    } catch (err) {
      console.error('Recipe fetch error:', err);
      setError(`Error: ${err.message}. Check the browser console (F12) for details.`);
    } finally {
      setLoading(false);
    }
  }

  const activeItem = items.find(i => i.id === activeId);

  return (
    <div className="fade-up">
      <TopBar title="Recipe ideas" onBack={onBack} />

      <div style={{ padding: '16px 20px 0' }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Pick an ingredient — AI will suggest 3 recipes:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
          {sortedItems.map(item => {
            const d = daysUntil(item.expiry);
            const u = urgencyInfo(d);
            const isActive = activeId === item.id;
            return (
              <button key={item.id} onClick={() => fetchRecipes(item)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                border: `1px solid ${isActive ? u.color : 'var(--border)'}`,
                borderRadius: 20,
                background: isActive ? u.bg : 'transparent',
                cursor: 'pointer', fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? u.color : 'var(--muted)',
                transition: 'all .15s',
              }}>
                <span>{item.emoji}</span>
                <span>{item.name}</span>
                {d <= 5 && (
                  <span style={{ fontSize: 10, color: u.color, opacity: .8 }}>
                    {d < 0 ? 'exp' : `${d}d`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {loading && <Spinner label={`Finding recipes for ${activeItem?.name}…`} />}
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {!loading && recipes.length > 0 && (
          <div className="fade-up">
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--muted)',
              textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14,
            }}>
              Recipes using {activeItem?.emoji} {activeItem?.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 14, marginTop: -8 }}>
              Tap a recipe to search it on Google
            </p>
            {recipes.map((r, i) => (
              <div
                key={i}
                className="fade-up"
                onClick={() => window.open(googleSearchUrl(r.title), '_blank', 'noopener,noreferrer')}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.open(googleSearchUrl(r.title), '_blank', 'noopener,noreferrer');
                  }
                }}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: 18, marginBottom: 14,
                  position: 'relative', overflow: 'hidden',
                  cursor: 'pointer', transition: 'border-color .15s, transform .1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT_COLORS[i]; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: 3, background: ACCENT_COLORS[i],
                }} />
                <div style={{ paddingLeft: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, flex: 1 }}>
                      {r.title} <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {[r.time, r.difficulty].map(b => (
                        <span key={b} style={{
                          fontSize: 10, padding: '3px 8px',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 4, color: 'var(--muted)',
                        }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
                    {r.description}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                    Ingredients
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {r.ingredients.map((ing, j) => (
                      <span key={j} style={{
                        fontSize: 11, padding: '2px 8px',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 4, color: 'var(--muted)',
                      }}>{ing}</span>
                    ))}
                  </div>
                  {r.tip && (
                    <div style={{
                      fontSize: 11, color: 'var(--green)',
                      background: 'var(--green-bg)', padding: '8px 11px',
                      borderRadius: 6, borderLeft: '2px solid var(--green)',
                    }}>
                      💡 {r.tip}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '44px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👆</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Select an ingredient above</div>
            <p style={{ fontSize: 12, marginTop: 4 }}>AI will suggest 3 recipes you can make</p>
          </div>
        )}
      </div>
    </div>
  );
}
