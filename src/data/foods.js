// ── Food database ────────────────────────────────────────────────────────────
export const FOOD_DB = [
  { name: 'Whole Milk',       category: 'Dairy',      emoji: '🥛', days: 7   },
  { name: 'Cheddar Cheese',   category: 'Dairy',      emoji: '🧀', days: 21  },
  { name: 'Greek Yogurt',     category: 'Dairy',      emoji: '🫙', days: 14  },
  { name: 'Eggs',             category: 'Dairy',      emoji: '🥚', days: 35  },
  { name: 'Butter',           category: 'Dairy',      emoji: '🧈', days: 30  },
  { name: 'Heavy Cream',      category: 'Dairy',      emoji: '🥛', days: 10  },
  { name: 'Chicken Breast',   category: 'Meat',       emoji: '🍗', days: 3   },
  { name: 'Ground Beef',      category: 'Meat',       emoji: '🥩', days: 3   },
  { name: 'Salmon Fillet',    category: 'Seafood',    emoji: '🐟', days: 2   },
  { name: 'Shrimp',           category: 'Seafood',    emoji: '🦐', days: 2   },
  { name: 'Broccoli',         category: 'Vegetables', emoji: '🥦', days: 7   },
  { name: 'Spinach',          category: 'Vegetables', emoji: '🥬', days: 5   },
  { name: 'Tomatoes',         category: 'Vegetables', emoji: '🍅', days: 7   },
  { name: 'Carrots',          category: 'Vegetables', emoji: '🥕', days: 21  },
  { name: 'Bell Peppers',     category: 'Vegetables', emoji: '🫑', days: 10  },
  { name: 'Cucumber',         category: 'Vegetables', emoji: '🥒', days: 10  },
  { name: 'Lettuce',          category: 'Vegetables', emoji: '🥬', days: 7   },
  { name: 'Mushrooms',        category: 'Vegetables', emoji: '🍄', days: 7   },
  { name: 'Onion',            category: 'Vegetables', emoji: '🧅', days: 30  },
  { name: 'Garlic',           category: 'Vegetables', emoji: '🧄', days: 60  },
  { name: 'Potatoes',         category: 'Vegetables', emoji: '🥔', days: 14  },
  { name: 'Apples',           category: 'Fruits',     emoji: '🍎', days: 30  },
  { name: 'Bananas',          category: 'Fruits',     emoji: '🍌', days: 5   },
  { name: 'Strawberries',     category: 'Fruits',     emoji: '🍓', days: 5   },
  { name: 'Blueberries',      category: 'Fruits',     emoji: '🫐', days: 7   },
  { name: 'Avocado',          category: 'Fruits',     emoji: '🥑', days: 3   },
  { name: 'Lemon',            category: 'Fruits',     emoji: '🍋', days: 21  },
  { name: 'Orange Juice',     category: 'Beverages',  emoji: '🧃', days: 7   },
  { name: 'Sourdough Bread',  category: 'Bakery',     emoji: '🍞', days: 5   },
  { name: 'Pasta',            category: 'Grains',     emoji: '🍝', days: 730 },
  { name: 'Rice',             category: 'Grains',     emoji: '🍚', days: 730 },
  { name: 'Canned Tomatoes',  category: 'Pantry',     emoji: '🥫', days: 730 },
  { name: 'Ice Cream',        category: 'Frozen',     emoji: '🍦', days: 180 },
  { name: 'Frozen Peas',      category: 'Frozen',     emoji: '🫛', days: 365 },
  { name: 'Potato Chips',     category: 'Snacks',     emoji: '🥔', days: 90  },
  { name: 'Hummus',           category: 'Snacks',     emoji: '🫙', days: 7   },
];

export const BARCODE_MAP = {
  '5000347012541': { name: 'Heinz Baked Beans',      category: 'Pantry',    emoji: '🫘', days: 730 },
  '5449000000996': { name: 'Coca-Cola 330ml',         category: 'Beverages', emoji: '🥤', days: 270 },
  '5010477348859': { name: 'Tropicana Orange Juice',  category: 'Beverages', emoji: '🧃', days: 21  },
  '7622210449283': { name: 'Oreo Cookies',            category: 'Snacks',    emoji: '🍪', days: 270 },
};

export const CATEGORIES = [
  'Dairy','Meat','Seafood','Vegetables','Fruits',
  'Grains','Beverages','Bakery','Frozen','Snacks','Pantry','Other'
];

export const UNITS = ['pcs','kg','g','L','ml','pack','bunch'];

// ── Date helpers ─────────────────────────────────────────────────────────────
export function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

export function formatDays(d) {
  if (d < 0)  return `${Math.abs(d)}d ago`;
  if (d === 0) return 'Today!';
  if (d === 1) return 'Tomorrow';
  return `${d}d left`;
}

// ── Urgency ───────────────────────────────────────────────────────────────────
export function urgencyInfo(days) {
  if (days < 0)   return { label: 'Expired',  color: 'var(--red)',   bg: 'var(--red-bg)',   border: 'var(--red-border)'   };
  if (days <= 2)  return { label: 'Critical', color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' };
  if (days <= 10) return { label: 'Use soon', color: '#BA7517',      bg: 'rgba(186,117,23,0.09)', border: 'rgba(186,117,23,0.3)' };
  return               { label: 'Fresh',    color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' };
}

// ── Default sample items ──────────────────────────────────────────────────────
export const SAMPLE_ITEMS = [
  { id: 1, name: 'Whole Milk',     category: 'Dairy',      emoji: '🥛', qty: 1, unit: 'L',     expiry: addDays(3)  },
  { id: 2, name: 'Spinach',        category: 'Vegetables', emoji: '🥬', qty: 1, unit: 'bunch',  expiry: addDays(1)  },
  { id: 3, name: 'Chicken Breast', category: 'Meat',       emoji: '🍗', qty: 2, unit: 'pcs',    expiry: addDays(2)  },
  { id: 4, name: 'Apples',         category: 'Fruits',     emoji: '🍎', qty: 4, unit: 'pcs',    expiry: addDays(14) },
  { id: 5, name: 'Greek Yogurt',   category: 'Dairy',      emoji: '🫙', qty: 2, unit: 'pcs',    expiry: addDays(7)  },
  { id: 6, name: 'Broccoli',       category: 'Vegetables', emoji: '🥦', qty: 1, unit: 'pcs',    expiry: addDays(5)  },
  { id: 7, name: 'Salmon Fillet',  category: 'Seafood',    emoji: '🐟', qty: 1, unit: 'pcs',    expiry: addDays(1)  },
];
