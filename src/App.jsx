import React, { useState } from 'react';
import { useItems } from './hooks/useItems';
import { BottomNav } from './components/UI';
import Dashboard     from './components/Dashboard';
import AddItem       from './components/AddItem';
import ExpiryTracker from './components/ExpiryTracker';
import RecipeIdeas   from './components/RecipeIdeas';

export default function App() {
  const [page, setPage]               = useState('dashboard');
  const [preselected, setPreselected] = useState(null);
  const { items, addItem, deleteItem, editItem } = useItems();

  function navigate(target, opts = {}) {
    setPreselected(opts.preselect ? items.find(i => i.id === opts.preselect) ?? null : null);
    setPage(target);
    window.scrollTo(0, 0);
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
      {page === 'dashboard' && (
        <Dashboard items={items} onNav={navigate} />
      )}
      {page === 'add' && (
        <AddItem onAdd={addItem} onBack={() => navigate('dashboard')} />
      )}
      {page === 'expiry' && (
        <ExpiryTracker
          items={items}
          onDelete={deleteItem}
          onEdit={(id, updates) => editItem(id, updates)}
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
    </div>
  );
}
