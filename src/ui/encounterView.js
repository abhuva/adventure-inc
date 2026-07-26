function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

export function encounterPanelHtml(event) {
  if (!event) return "";
  const actions = event.actions?.length
    ? event.actions
    : [{ id: "close", label: "continue", kind: "close" }];

  return `
    <div class="encounter-panel" role="dialog" aria-modal="true" aria-labelledby="encounterTitle">
      <div class="panel-head encounter-head">
        <div>
          <div class="encounter-kicker">${escapeHtml(event.category || "Encounter")}</div>
          <h2 id="encounterTitle">${escapeHtml(event.title)}</h2>
        </div>
        <span>${escapeHtml(event.id)}</span>
      </div>
      <div class="encounter-body">
        ${(event.body || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
      </div>
      <div class="encounter-actions">
        ${actions.map((action) => `
          <button type="button" data-encounter-action="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>
        `).join("")}
      </div>
    </div>
  `;
}
