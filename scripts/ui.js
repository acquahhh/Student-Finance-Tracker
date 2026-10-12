// ui.js: all DOM updates live here

export function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const err = document.getElementById(`${fieldId}-err`);
  err.textContent = message;
  err.classList.remove('hint');
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

// does not block saving
export function showFieldHint(fieldId, message) {
  const err = document.getElementById(`${fieldId}-err`);
  err.textContent = message;
  err.classList.add('hint');
}

export function setFormStatus(message) {
  document.getElementById('form-status').textContent = message;
}

import { highlight } from './search.js';

export function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const err = document.getElementById(`${fieldId}-err`);
  err.textContent = message;
  err.classList.remove('hint');
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

export function showFieldHint(fieldId, message) {
  const err = document.getElementById(`${fieldId}-err`);
  err.textContent = message;
  err.classList.add('hint');
}

export function setFormStatus(message) {
  document.getElementById('form-status').textContent = message;
}

export function setSearchStatus(message) {
  document.getElementById('search-status').textContent = message;
}

export function renderTable(list, re) {
  const body = document.getElementById('records-body');
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="5">No records to show.</td></tr>';
    return;
  }
  body.innerHTML = list
    .map(
      (r) => `
    <tr>
      <td>${highlight(r.date, re)}</td>
      <td>${highlight(r.description, re)}</td>
      <td>${highlight(r.category, re)}</td>
      <td class="num">${highlight(r.amount.toFixed(2), re)}</td>
      <td></td>
    </tr>`
    )
    .join('');
}