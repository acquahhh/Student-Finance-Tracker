import { save } from './storage.js';

let records = [];

export function init(initial) {
  records = initial;
  save(records);
}

export function getAll() {
  return records;
}

function nextId() {
  const max = records.reduce((m, r) => {
    const n = parseInt(String(r.id).replace('txn_', ''), 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return 'txn_' + String(max + 1).padStart(4, '0');
}

export function add({ description, amount, category, date }) {
  const now = new Date().toISOString();
  const record = {
    id: nextId(),
    description,
    amount: parseFloat(amount),
    category,
    date,
    createdAt: now,
    updatedAt: now,
  };
  records.push(record);
  save(records);
  return record;
}

// Returns a sorted COPY, so the stored order never changes
export function sortRecords(list, mode) {
  const sorted = [...list];
  const by = {
    'date-desc': (a, b) => b.date.localeCompare(a.date),
    'date-asc': (a, b) => a.date.localeCompare(b.date),
    'desc-asc': (a, b) => a.description.localeCompare(b.description),
    'desc-desc': (a, b) => b.description.localeCompare(a.description),
    'amount-asc': (a, b) => a.amount - b.amount,
    'amount-desc': (a, b) => b.amount - a.amount,
  };
  return sorted.sort(by[mode] || by['date-desc']);
}

export function getById(id) {
  return records.find((r) => r.id === id);
}

export function update(id, { description, amount, category, date }) {
  const record = getById(id);
  if (!record) return null;
  record.description = description;
  record.amount = parseFloat(amount);
  record.category = category;
  record.date = date;
  record.updatedAt = new Date().toISOString(); // createdAt stays unchanged
  save(records);
  return record;
}

export function remove(id) {
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return false;
  records.splice(index, 1);
  save(records);
  return true;
}

function localISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getStats(list = records, today = new Date()) {
  const cents = (r) => Math.round(r.amount * 100);

  const sumCents = list.reduce((s, r) => s + cents(r), 0);

  // Top category by total amount
  const byCategory = {};
  for (const r of list) byCategory[r.category] = (byCategory[r.category] || 0) + cents(r);
  let topCategory = null;
  let topCents = 0;
  for (const [cat, c] of Object.entries(byCategory)) {
    if (topCategory === null || c > topCents) {
      topCategory = cat;
      topCents = c;
    }
  }

  // Last 7 days, oldest first, ending today
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = localISO(d);
    const total = list.filter((r) => r.date === key).reduce((s, r) => s + cents(r), 0);
    last7.push({ date: key, total: total / 100 });
  }

  // Spending in the current calendar month (for the cap)
  const monthPrefix = localISO(today).slice(0, 7);
  const monthCents = list
    .filter((r) => r.date.startsWith(monthPrefix))
    .reduce((s, r) => s + cents(r), 0);

  return {
    count: list.length,
    sum: sumCents / 100,
    topCategory,
    topAmount: topCents / 100,
    last7,
    monthSpent: monthCents / 100,
  };
}