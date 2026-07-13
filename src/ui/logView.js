export function logRowsHtml(logEntries = []) {
  return logEntries.map((entry) => `
    <li class="${entry.type}"><span class="tag">${entry.stamp}</span> ${entry.text}</li>
  `).join("");
}

export function renderLogRows(el, logEntries = []) {
  el.logRows.innerHTML = logRowsHtml(logEntries);
}
