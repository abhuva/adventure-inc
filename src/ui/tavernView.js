import { formatCost, formatLabel } from "../core/format.js";
import { portraitStyle, skillTreeHtml } from "./rosterView.js";
import { setTavernDetailTabActive } from "./tabRuntime.js";

export function tavernUpgradeButtonHtml({ state, blueprints }) {
  const hasBunkRoom = Boolean(state.blueprints?.bunkRoom);
  const cost = hasBunkRoom ? blueprints.bunkRoom?.cost : { wood: 10, ore: 4 };
  const capacityGain = hasBunkRoom ? 2 : 1;
  const currentLevel = Math.max(1, (state.tavern?.capacity || 3) - 2);
  return `
    upgrade tavern
    <span class="tavern-upgrade-panel">
      <strong>Tavern Level ${currentLevel}</strong>
      <span>Current effect: adventurer capacity ${state.tavern?.capacity || 0}, worker population ${state.tavern?.population || 0}, visitor seats ${state.tavern?.visitorSeats || 0}</span>
      <span>Next effect: +${capacityGain} adventurer capacity, +1 worker population</span>
      <span>Upgrade cost: ${formatCost(cost)}</span>
      <span>${hasBunkRoom ? "Bunk plans turn storage rooms into reliable beds for longer-staying crews." : "Fresh timber, patched stone, and another dry corner make the common room easier to recruit from."}</span>
    </span>
  `;
}

export function availableVisitorCards(visitors, roster) {
  const recruitedIds = new Set(roster.map((hero) => hero.id));
  return visitors.filter((visitor) => !recruitedIds.has(visitor.id)).slice(0, 3);
}

export function visitorQueueHtml({ state, visitors, roster, selectedVisitorId = null, portraitHtml }) {
  const rows = availableVisitorCards(visitors, roster).map((visitor) => `
    <div class="visitor-card">
      ${portraitHtml(visitor, "card")}
      <div class="visitor-card-body">
        <div class="character-name">${visitor.name}</div>
        <div class="character-meta">${formatLabel(visitor.race)} / ${visitor.role}</div>
        <div class="character-meta">tier ${visitor.availabilityTier || 0} / fame ${visitor.fameThreshold || 0} / ${visitorStayText(state, visitor)}</div>
        <div class="character-meta">cost: ${formatCost(visitor.cost)}</div>
        <div class="character-stats">
          <span>hp ${visitor.stats.hp}</span>
          <span>atk ${visitor.stats.atk}</span>
          <span>def ${visitor.stats.def}</span>
          <span>utl ${visitor.stats.utility}</span>
        </div>
        <div class="row-actions">
          <button data-recruit="${visitor.id}">hire</button>
          <button data-visitor-info="${visitor.id}" ${selectedVisitorId === visitor.id ? "disabled" : ""}>info</button>
        </div>
      </div>
    </div>
  `);
  return rows.length ? rows.join("") : `<div class="location-detail">no visitors waiting today</div>`;
}

export function visitorStayText(state, visitor) {
  const status = state?.tavernVisitors?.visitors?.[visitor.id];
  if (status?.state === "present") {
    const daysLeft = Math.max(0, status.nextChangeDay - Math.max(1, state.day || 1));
    return `${daysLeft}d left`;
  }
  return `minimum ${Math.max(5, visitor.stayDays || 5)}d stay`;
}

export function visitorDetailHtml({
  state,
  visitor,
  hero,
  stats,
  atlas,
  activeTab = "info",
  availableSkillTreeIds,
  skillTrees,
  skills,
  skillRank,
  canLearnSkill
}) {
  if (!visitor || !hero) {
    return `
      <div class="local-tab-panel active" data-tavern-detail-panel="info">
        <div class="empty-state">select a visitor</div>
      </div>
      <div class="local-tab-panel" data-tavern-detail-panel="skill1"><div class="empty-state">no first skill tree</div></div>
      <div class="local-tab-panel" data-tavern-detail-panel="skill2"><div class="empty-state">no second skill tree</div></div>
    `;
  }
  const selectedTab = ["info", "skill1", "skill2"].includes(activeTab) ? activeTab : "info";
  const treeIds = availableSkillTreeIds(hero).slice(0, 2);
  const skillTreePanelsHtml = ["skill1", "skill2"].map((panelId, index) => {
    const treeId = treeIds[index];
    const content = treeId
      ? skillTreeHtml({
        hero,
        treeId,
        skillTrees,
        skills,
        skillRank,
        canLearnSkill
      })
      : `<div class="empty-state">no ${index === 0 ? "first" : "second"} skill tree</div>`;
    return `
      <div class="local-tab-panel ${selectedTab === panelId ? "active" : ""}" data-tavern-detail-panel="${panelId}">
        <div class="skill-tree-panel">${content}</div>
      </div>
    `;
  }).join("");
  const hpPct = stats.hpMax ? Math.max(0, Math.min(100, (hero.hp / stats.hpMax) * 100)) : 0;
  return `
    <div class="local-tab-panel ${selectedTab === "info" ? "active" : ""}" data-tavern-detail-panel="info">
      <div class="detail-hero-head">
        <span class="char-portrait large" style="${portraitStyle(hero.spriteIndex ?? 0, atlas)}"></span>
        <div>
          <div class="detail-title">${visitor.name}</div>
          <div class="detail-line">${formatLabel(visitor.race)} ${visitor.role} / visitor</div>
          <div class="detail-line">hire cost: ${formatCost(visitor.cost)}</div>
        </div>
      </div>
      <div class="detail-line">level: ${hero.level} (${hero.xp}/${hero.level * 8} xp), skill points: ${hero.skillPoints}</div>
      <div class="detail-line">race: ${formatLabel(hero.race)} / primary job: ${formatLabel(hero.primaryJob)} / secondary: ${hero.secondaryJob ? formatLabel(hero.secondaryJob) : "locked"}</div>
      <div class="detail-line">hp: ${hero.hp}/${stats.hpMax}</div>
      <div class="bar"><span style="width:${hpPct}%"></span></div>
      <div class="detail-line">atk ${stats.atk} / def ${stats.def} / utility ${stats.utility} / resolve ${stats.resolve}</div>
      <div class="detail-line">travel +${stats.travelSpeed} / recovery -${stats.recoveryReduce} / food ${stats.foodCostReduce >= 0 ? "-" : "+"}${Math.abs(stats.foodCostReduce)}</div>
      <div class="detail-line">tier ${visitor.availabilityTier || 0} / fame ${visitor.fameThreshold || 0} / ${visitorStayText(state, visitor)}</div>
      <div class="detail-line">atlas slot: ${hero.spriteIndex ?? 0}</div>
    </div>
    ${skillTreePanelsHtml}
  `;
}

export function renderVisitorQueue(el, options, handlers) {
  const callbacks = typeof handlers === "function" ? { onRecruit: handlers } : handlers;
  if (el.upgradeTavernBtn) {
    el.upgradeTavernBtn.innerHTML = tavernUpgradeButtonHtml(options);
  }
  el.visitorRows.innerHTML = visitorQueueHtml(options);
  el.visitorRows.querySelectorAll("[data-recruit]").forEach((button) => {
    button.addEventListener("click", () => callbacks.onRecruit(button.dataset.recruit));
  });
  el.visitorRows.querySelectorAll("[data-visitor-info]").forEach((button) => {
    button.addEventListener("click", () => callbacks.onSelectVisitorInfo?.(button.dataset.visitorInfo));
  });
  if (el.tavernVisitorDetailBox) {
    el.tavernVisitorDetailBox.innerHTML = visitorDetailHtml(options);
    const documentRef = options.documentRef || el.tavernVisitorDetailBox.ownerDocument;
    if (documentRef?.querySelectorAll) {
      setTavernDetailTabActive(documentRef, options.activeTab || "info");
    }
  }
}
