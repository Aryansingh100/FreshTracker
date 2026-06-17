import React, { useState, useEffect } from 'react';
import { useItems } from './hooks/useItems';
import { BottomNav, Spinner } from './components/UI';
import Login          from './components/Login';
import Dashboard       from './components/Dashboard';
import AddItem         from './components/AddItem';
import ExpiryTracker   from './components/ExpiryTracker';
import RecipeIdeas     from './components/RecipeIdeas';

export default function App() {
  const [username, setUsername]       = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage]               = useState('dashboard');
  const [preselected, setPreselected] = useState(null);

  // On first load, check if a username is already saved (auto-login)
  useEffect(() => {
    const saved = localStorage.getItem('freshtrack_username');
    if (saved) setUsername(saved);
    setCheckingAuth(false);
  }, []);

  const { items, loading, addItem, deleteItem, editItem } = useItems(username);

  function navigate(target, opts = {}) {
    setPreselected(opts.preselect ? items.find(i => i.id === opts.preselect) ?? null : null);
    setPage(target);
    window.scrollTo(0, 0);
  }

  function handleLogout() {
    localStorage.removeItem('freshtrack_username');
    setUsername(null);
    setPage('dashboard');
  }

  // Still checking localStorage for a saved session
  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <Spinner />
      </div>
    );
  }

  // Not logged in — show Login/Register page
  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  return (
    <div style={{
      maxWidth: 460,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--surface)',
      position: 'relative',
      paddingBottom: 72,
    }}>
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner label="Loading your pantry…" />
        </div>
      ) : (
        <>
          {page === 'dashboard' && (
            <Dashboard items={items} onNav={navigate} username={username} onLogout={handleLogout} />
          )}
          {page === 'add' && (
            <AddItem onAdd={addItem} onBack={() => navigate('dashboard')} />
          )}
          {page === 'expiry' && (
            <ExpiryTracker
              items={items}
              onDelete={deleteItem}
              onEdit={editItem}
              onBack={() => navigate('dashboard')}
              onRecipe={item => navigate('recipes', { preselect: item.id })}
            />
          )}
          {page === 'recipes' && (
            <RecipeIdeas
              items={items}
              preselected={preselected}
              onBack={() => navigate('dashboard')}
            />
          )}

          <BottomNav current={page} onNav={navigate} />
        </>
      )}
    </div>
  );
}
