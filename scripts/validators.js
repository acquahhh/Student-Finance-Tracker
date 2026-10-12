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
/* ---------- M6: currency and import validation ---------- */

patterns.currencyCode = /^[A-Z]{3}$/;
// Positive rate, up to 6 decimals. The negative lookahead (?!0+(\.0+)?$) rejects 0 and 0.0
patterns.rate = /^(?!0+(\.0+)?$)\d+(\.\d{1,6})?$/;
patterns.isoTimestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export function validateCurrencyCode(value) {
  if (!patterns.currencyCode.test(value)) {
    return { valid: false, message: 'Use a 3-letter code such as USD, EUR or RWF.' };
  }
  return { valid: true, message: '' };
}

export function validateRate(value) {
  if (typeof value !== 'string' || value === '') {
    return { valid: false, message: 'Rate is required.' };
  }
  if (!patterns.rate.test(value)) {
    return { valid: false, message: 'Use a number above 0 with up to 6 decimals.' };
  }
  return { valid: true, message: '' };
}

// Checks the whole parsed JSON file. Returns { valid, errors: string[] }
export function validateImport(data) {
  const errors = [];
  if (!Array.isArray(data)) {
    return { valid: false, errors: ['The file must contain a JSON array of records.'] };
  }

  const seen = new Set();
  data.forEach((r, i) => {
    const n = i + 1;
    if (r === null || typeof r !== 'object' || Array.isArray(r)) {
      errors.push(`Record ${n}: must be an object.`);
      return;
    }

    if (typeof r.id !== 'string' || r.id.trim() === '') {
      errors.push(`Record ${n}: missing id.`);
    } else if (seen.has(r.id)) {
      errors.push(`Record ${n}: duplicate id "${r.id}".`);
    } else {
      seen.add(r.id);
    }

    const desc = validateDescription(r.description);
    if (!desc.valid) errors.push(`Record ${n}: description. ${desc.message}`);

    if (typeof r.amount !== 'number' || !Number.isFinite(r.amount)) {
      errors.push(`Record ${n}: amount must be a number.`);
    } else {
      const amt = validateAmount(String(r.amount));
      if (!amt.valid) errors.push(`Record ${n}: amount. ${amt.message}`);
    }

    const cat = validateCategory(r.category);
    if (!cat.valid) errors.push(`Record ${n}: category. ${cat.message}`);

    const date = validateDate(r.date);
    if (!date.valid) errors.push(`Record ${n}: date. ${date.message}`);

    for (const field of ['createdAt', 'updatedAt']) {
      const v = r[field];
      if (typeof v !== 'string' || !patterns.isoTimestamp.test(v) || Number.isNaN(Date.parse(v))) {
        errors.push(`Record ${n}: ${field} must be an ISO timestamp.`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}