// validators.js: pure functions, no DOM access

export const patterns = {
  // (?!.*\s\s) is a negative lookahead: fails if two whitespace chars appear in a row
  description: /^(?!.*\s\s)\S(?:.*\S)?$/,
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  // back-reference: \1 must repeat whatever (\w+) captured
  duplicateWord: /\b(\w+)\s+\1\b/i,
};

const ok = () => ({ valid: true, message: '' });
const fail = (message) => ({ valid: false, message });

export function validateDescription(value) {
  if (typeof value !== 'string' || value === '') {
    return fail('Description is required.');
  }
  if (value !== value.trim()) {
    return fail('Remove spaces at the start or end.');
  }
  if (/\s\s/.test(value)) {
    return fail('Use single spaces only, no double spaces.');
  }
  if (!patterns.description.test(value)) {
    return fail('Description is not in a valid format.');
  }
  return ok();
}

export function validateAmount(value) {
  if (typeof value !== 'string' || value === '') {
    return fail('Amount is required.');
  }
  if (!patterns.amount.test(value)) {
    return fail('Use a number like 12 or 12.50 (max 2 decimals, no leading zeros).');
  }
  return ok();
}

export function validateDate(value) {
  if (typeof value !== 'string' || value === '') {
    return fail('Date is required.');
  }
  if (!patterns.date.test(value)) {
    return fail('Use the format YYYY-MM-DD, for example 2025-09-29.');
  }
  // The regex  checks the shape, 
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return fail('That date does not exist on the calendar.');
  }
  return ok();
}

export function validateCategory(value) {
  if (typeof value !== 'string' || value === '') {
    return fail('Category is required.');
  }
  if (!patterns.category.test(value)) {
    return fail('Use letters only, with single spaces or hyphens between words.');
  }
  return ok();
}

// Returns the repeated word (e.g. "the") or null
export function findDuplicateWord(value) {
  if (typeof value !== 'string') return null;
  const match = patterns.duplicateWord.exec(value);
  return match ? match[1] : null;
}