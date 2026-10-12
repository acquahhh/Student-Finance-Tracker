import {
  validateDescription,
  validateAmount,
  validateDate,
  validateCategory,
  findDuplicateWord,
} from './validators.js';
import { showFieldError, showFieldHint, setFormStatus } from './ui.js';

const form = document.getElementById('txn-form');

// Map each field id to its validator
const rules = {
  description: validateDescription,
  amount: validateAmount,
  date: validateDate,
  category: validateCategory,
};

function checkField(fieldId) {
  const value = document.getElementById(fieldId).value;
  const result = rules[fieldId](value);
  showFieldError(fieldId, result.message);

  // Advanced regex: duplicate word is a hint, not an error
  if (fieldId === 'description' && result.valid) {
    const dup = findDuplicateWord(value);
    if (dup) showFieldHint('description', `Possible repeated word: "${dup}"`);
  }
  return result.valid;
}

// Live feedback while typing, and when leaving a field
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

  setFormStatus('Looks good. Saving comes in M4.');
});

form.addEventListener('reset', () => {
  for (const fieldId of Object.keys(rules)) showFieldError(fieldId, '');
  setFormStatus('');
});