import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Something went wrong');
        return;
      }

      // Success — persist username locally and notify parent
      localStorage.setItem('freshtrack_username', data.username);
      onLogin(data.username);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'var(--surface)',
    }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🥦</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>FreshTrack</div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Track what's in your kitchen. Waste nothing.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 20,
          background: 'var(--surface2)', padding: 4, borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
        }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: 6,
              background: mode === m ? 'var(--surface)' : 'transparent',
              fontSize: 13, fontWeight: mode === m ? 700 : 500,
              color: mode === m ? 'var(--text)' : 'var(--muted)',
              cursor: 'pointer', transition: 'all .15s',
              boxShadow: mode === m ? '0 0 0 1px var(--border)' : 'none',
            }}>
              {m === 'login' ? 'Log in' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{
            fontSize: 10, fontWeight: 700, color: 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6,
          }}>
            Username
          </label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. aryan123"
            autoFocus
            style={{ marginBottom: 14 }}
          />

          {error && (
            <div style={{
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 12px',
              color: 'var(--red)', fontSize: 12, marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !username.trim()} style={{
            width: '100%', padding: '13px', background: 'var(--green)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', opacity: (loading || !username.trim()) ? 0.4 : 1,
            transition: 'opacity .15s',
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: 'var(--dim)', textAlign: 'center', marginTop: 16 }}>
          {mode === 'login'
            ? "Don't have an account? Switch to Register above."
            : 'Already have an account? Switch to Log in above.'}
        </p>
      </div>
    </div>
  );
}
