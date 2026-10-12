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