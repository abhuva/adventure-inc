import { formatCost, formatLabel } from "../core/format.js";

export function visitorQueueHtml({ visitors, roster, portraitHtml }) {
  const recruitedIds = new Set(roster.map((hero) => hero.id));
  const rows = visitors.filter((visitor) => !recruitedIds.has(visitor.id)).slice(0, 3).map((visitor) => `
    <div class="visitor-card">
      ${portraitHtml(visitor, "card")}
      <div class="visitor-card-body">
        <div class="character-name">${visitor.name}</div>
        <div class="character-meta">${formatLabel(visitor.race)} / ${visitor.role}</div>
        <div class="character-meta">cost: ${formatCost(visitor.cost)}</div>
        <div class="character-stats">
          <span>hp ${visitor.stats.hp}</span>
          <span>atk ${visitor.stats.atk}</span>
          <span>def ${visitor.stats.def}</span>
          <span>utl ${visitor.stats.utility}</span>
        </div>
        <div class="row-actions"><button data-recruit="${visitor.id}">hire</button></div>
      </div>
    </div>
  `);
  return rows.length ? rows.join("") : `<div class="location-detail">no visitors left in prototype queue</div>`;
}

export function renderVisitorQueue(el, options, onRecruit) {
  el.visitorRows.innerHTML = visitorQueueHtml(options);
  el.visitorRows.querySelectorAll("[data-recruit]").forEach((button) => {
    button.addEventListener("click", () => onRecruit(button.dataset.recruit));
  });
}
