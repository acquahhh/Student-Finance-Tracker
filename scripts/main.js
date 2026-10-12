import {
  validateDescription,
  validateAmount,
  validateDate,
  validateCategory,
  findDuplicateWord,
} from './validators.js';
import {
  showFieldError,
  showFieldHint,
  setFormStatus,
  setSearchStatus,
  setFormMode,
  fillForm,
  renderTable,
} from './ui.js';
import * as state from './state.js';
import { load, loadSeed } from './storage.js';
import { compileRegex, searchableCells } from './search.js';

const form = document.getElementById('txn-form');
const searchInput = document.getElementById('search');
const caseBox = document.getElementById('search-case');
const sortSelect = document.getElementById('sort');
const tbody = document.getElementById('records-body');

let editingId = null; // null = adding, otherwise the id being edited

const rules = {
  description: validateDescription,
  amount: validateAmount,
  date: validateDate,
  category: validateCategory,
};

/* ---------- Form validation ---------- */
function checkField(fieldId) {
  const value = document.getElementById(fieldId).value;
  const result = rules[fieldId](value);
  showFieldError(fieldId, result.message);

  if (fieldId === 'description' && result.valid) {
    const dup = findDuplicateWord(value);
    if (dup) showFieldHint('description', `Possible repeated word: "${dup}"`);
  }
  return result.valid;
}

for (const fieldId of Object.keys(rules)) {
  const input = document.getElementById(fieldId);
  input.addEventListener('input', () => checkField(fieldId));
  input.addEventListener('blur', () => checkField(fieldId));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  let firstInvalid = null;
  for (const fieldId of Object.keys(rules)) {
    if (!checkField(fieldId) && !firstInvalid) firstInvalid = fieldId;
  }
  if (firstInvalid) {
    setFormStatus('Please fix the errors and try again.');
    document.getElementById(firstInvalid).focus();
    return;
  }

  const data = {
    description: form.description.value,
    amount: form.amount.value,
    category: form.category.value,
    date: form.date.value,
  };

  const wasEditing = editingId !== null;
  if (wasEditing) {
    state.update(editingId, data);
  } else {
    state.add(data);
  }

  form.reset(); // the reset handler below also leaves edit mode
  setFormStatus(wasEditing ? 'Transaction updated.' : 'Transaction added.');
  refresh();
});

form.addEventListener('reset', () => {
  editingId = null;
  setFormMode(false);
  for (const fieldId of Object.keys(rules)) showFieldError(fieldId, '');
});

/* ---------- Edit and delete (one listener for all rows) ---------- */
tbody.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const record = state.getById(btn.dataset.id);
  if (!record) return;

  if (btn.dataset.action === 'edit') {
    editingId = record.id;
    fillForm(record);
    for (const fieldId of Object.keys(rules)) showFieldError(fieldId, '');
    setFormMode(true);
    setFormStatus(`Editing "${record.description}".`);
    document.getElementById('description').focus();
  } else if (btn.dataset.action === 'delete') {
    if (!confirm(`Delete "${record.description}"? This cannot be undone.`)) return;

    state.remove(record.id);
    if (editingId === record.id) form.reset();
    refresh();
    setFormStatus(`Deleted "${record.description}".`);

    // The clicked button no longer exists, so move focus somewhere sensible
    const heading = document.getElementById('rec-h');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
});

/* ---------- Render, sort, search ---------- */
function refresh() {
  const pattern = searchInput.value;
  const re = compileRegex(pattern, caseBox.checked ? 'i' : '');

  let list = state.sortRecords(state.getAll(), sortSelect.value);
  const total = list.length;

  if (pattern && !re) {
    searchInput.setAttribute('aria-invalid', 'true');
    setSearchStatus('Invalid regular expression. Showing all records.');
  } else {
    searchInput.setAttribute('aria-invalid', 'false');
    if (re) {
      list = list.filter((r) => searchableCells(r).some((cell) => re.test(cell)));
      setSearchStatus(`${list.length} of ${total} records match.`);
    } else {
      setSearchStatus('');
    }
  }
  renderTable(list, re);
}

searchInput.addEventListener('input', refresh);
caseBox.addEventListener('change', refresh);
sortSelect.addEventListener('change', refresh);

/* ---------- Start up ---------- */
async function init() {
  let data = load();
  if (!data) {
    try {
      data = await loadSeed();
    } catch {
      data = [];
    }
  }
  state.init(data);
  refresh();
}
init();