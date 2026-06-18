// Making some changes
import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export function useItems(username) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`${API_URL}/users/${username}/items`)
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [username]);

  const addItem = useCallback(async (item) => {
    const res = await fetch(`${API_URL}/users/${username}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const saved = await res.json();
    setItems(prev => [...prev, saved]);
  }, [username]);

  const deleteItem = useCallback(async (id) => {
    await fetch(`${API_URL}/users/${username}/items/${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  }, [username]);

  const editItem = useCallback(async (id, updates) => {
    const res = await fetch(`${API_URL}/users/${username}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const saved = await res.json();
    setItems(prev => prev.map(i => i.id === id ? saved : i));
  }, [username]);

  return { items, loading, addItem, deleteItem, editItem };
}
