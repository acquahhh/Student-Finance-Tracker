import { highlight, escapeHtml } from './search.js';

/* ---------- Form feedback ---------- */
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

export function setSettingsStatus(message) {
  document.getElementById('settings-status').textContent = message;
}

/* ---------- Add / edit mode ---------- */
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

/* ---------- Table ---------- */
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

/* ---------- Dashboard ---------- */
export function renderStats(stats, settings) {
  const others = (settings.others || [])
    .map((o) => `${(stats.sum * o.rate).toFixed(2)} ${o.code}`)
    .join(' · ');
  document.getElementById('stat-count').textContent = `Total records: ${stats.count}`;
  document.getElementById('stat-sum').textContent =
    `Total spent: ${stats.sum.toFixed(2)} ${settings.base}` + (others ? ` (≈ ${others})` : '');
  document.getElementById('stat-top').textContent = stats.topCategory
    ? `Top category: ${stats.topCategory} (${stats.topAmount.toFixed(2)} ${settings.base})`
    : 'Top category: none';
}

export function renderTrend(days) {
  const max = Math.max(...days.map((d) => d.total));
  document.getElementById('trend').innerHTML = days
    .map((d) => {
      const [y, m, day] = d.date.split('-').map(Number);
      const label = new Date(y, m - 1, day).toLocaleDateString('en', {
        weekday: 'short',
        day: 'numeric',
      });
      const pct = max > 0 ? (d.total / max) * 100 : 0;
      return `
      <li>
        <span class="day">${label}</span>
        <span class="amt">${d.total.toFixed(2)}</span>
        <div class="bar-area" aria-hidden="true"><div class="bar" style="height:${pct}%"></div></div>
      </li>`;
    })
    .join('');
}

// Polite message when under the cap, assertive alert when over
export function renderCap(spent, cap, base) {
  const polite = document.getElementById('cap-message');
  const alertBox = document.getElementById('cap-alert');

  if (cap === null || cap === undefined) {
    polite.textContent = 'No monthly cap set. You can set one in Settings.';
    alertBox.textContent = '';
  } else if (spent > cap) {
    polite.textContent = '';
    alertBox.textContent = `Over your monthly cap by ${(spent - cap).toFixed(2)} ${base}. Spent ${spent.toFixed(2)} of ${cap.toFixed(2)}.`;
  } else {
    alertBox.textContent = '';
    polite.textContent = `Under your monthly cap: ${(cap - spent).toFixed(2)} ${base} remaining. Spent ${spent.toFixed(2)} of ${cap.toFixed(2)}.`;
  }
}

/* ---------- Import errors ---------- */
export function renderImportErrors(errors) {
  const list = document.getElementById('import-errors');
  const shown = errors.slice(0, 5);
  list.innerHTML = shown.map((e) => `<li>${escapeHtml(e)}</li>`).join('');
  if (errors.length > shown.length) {
    list.innerHTML += `<li>...and ${errors.length - shown.length} more.</li>`;
  }
}