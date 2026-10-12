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