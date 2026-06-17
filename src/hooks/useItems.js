import { useState } from 'react';
import { SAMPLE_ITEMS } from '../data/foods';

export function useItems() {
  const [items, setItems] = useState(SAMPLE_ITEMS);

  const addItem    = (item) => setItems(prev => [...prev, { ...item, id: Date.now() }]);
  const deleteItem = (id)   => setItems(prev => prev.filter(i => i.id !== id));
  const editItem   = (id, updates) => setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

  return { items, addItem, deleteItem, editItem };
}