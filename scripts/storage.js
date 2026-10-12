const KEY = 'sft:data';

// Returns an array, or null if nothing saved yet (or data is unreadable)
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// First run only: load the starter records
export async function loadSeed() {
  const res = await fetch('seed.json');
  if (!res.ok) throw new Error('Could not load seed.json');
  return res.json();
}

const SETTINGS_KEY = 'sft:settings';
const DEFAULT_SETTINGS = { cap: null };

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}