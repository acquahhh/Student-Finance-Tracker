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
  renderTable,
} from './ui.js';
import * as state from './state.js';
import { load, loadSeed } from './storage.js';
import { compileRegex, searchableCells } from './search.js';

const form = document.getElementById('txn-form');
const searchInput = document.getElementById('search');
const caseBox = document.getElementById('search-case');
const sortSelect = document.getElementById('sort');

const rules = {
  description: validateDescription,
  amount: validateAmount,
  date: validateDate,
  category: validateCategory,
};

/* ---------- Form validation (from M3) ---------- */
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

  state.add({
    description: form.description.value,
    amount: form.amount.value,
    category: form.category.value,
    date: form.date.value,
  });
  form.reset();
  setFormStatus('Transaction added.');
  refresh();
});

form.addEventListener('reset', () => {
  for (const fieldId of Object.keys(rules)) showFieldError(fieldId, '');
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