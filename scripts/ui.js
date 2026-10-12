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
export function renderImportErrors(errors) {
  const list = document.getElementById('import-errors');
  const shown = errors.slice(0, 5);
  list.innerHTML = shown.map((e) => `<li>${escapeHtml(e)}</li>`).join('');
  if (errors.length > shown.length) {
    list.innerHTML += `<li>...and ${errors.length - shown.length} more.</li>`;
  }
}