export function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function highlight(text, re) {
  const str = String(text);
  if (!re) return escapeHtml(str);

  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let out = '';
  let last = 0;
  let m;
  while ((m = g.exec(str)) !== null) {
    if (m[0] === '') {   // empty match: step forward to avoid an infinite loop
      g.lastIndex++;
      continue;
    }
    out += escapeHtml(str.slice(last, m.index)) + '<mark>' + escapeHtml(m[0]) + '</mark>';
    last = m.index + m[0].length;
  }
  return out + escapeHtml(str.slice(last));
}

// The text a record is searched against (amount formatted as shown in the table)
export function searchableCells(r) {
  return [r.date, r.description, r.category, r.amount.toFixed(2)];
}