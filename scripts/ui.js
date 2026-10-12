import { highlight, escapeHtml } from './search.js';

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

// Switches the form heading and submit button between add and edit modes
export function setFormMode(editing) {
  document.getElementById('form-h').textContent = editing
    ? 'Edit Transaction'
    : 'Add / Edit Transaction';
  document.querySelector('#txn-form button[type="submit"]').textContent = editing
    ? 'Update'
    : 'Save';
}

export function fillForm(record) {
  document.getElementById('description').value = record.description;
  document.getElementById('amount').value = record.amount.toFixed(2);
  document.getElementById('category').value = record.category;
  document.getElementById('date').value = record.date;
}

export function renderTable(list, re) {
  const body = document.getElementById('records-body');
  if (list.length === 0) {
    body.innerHTML = '<tr><td colspan="5">No records to show.</td></tr>';
    return;
  }
  body.innerHTML = list
    .map((r) => {
      const id = escapeHtml(r.id);
      const name = escapeHtml(r.description);
      return `
    <tr>
      <td>${highlight(r.date, re)}</td>
      <td>${highlight(r.description, re)}</td>
      <td>${highlight(r.category, re)}</td>
      <td class="num">${highlight(r.amount.toFixed(2), re)}</td>
      <td>
        <button type="button" data-action="edit" data-id="${id}" aria-label="Edit ${name}">Edit</button>
        <button type="button" class="danger" data-action="delete" data-id="${id}" aria-label="Delete ${name}">Delete</button>
      </td>
    </tr>`;
    })
    .join('');
}