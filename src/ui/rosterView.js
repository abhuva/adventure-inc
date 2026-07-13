import { formatLabel } from "../core/format.js";

export function portraitStyle(spriteIndex, { columns, rows }) {
  const safeIndex = Math.max(0, Math.min(columns * rows - 1, spriteIndex));
  const col = safeIndex % columns;
  const row = Math.floor(safeIndex / columns);
  const x = columns === 1 ? 0 : (col / (columns - 1)) * 100;
  const y = rows === 1 ? 0 : (row / (rows - 1)) * 100;
  return `background-position:${x}% ${y}%`;
}

export function portraitHtml(hero, sizeClass, atlas) {
  return `<span class="char-portrait ${sizeClass}" style="${portraitStyle(hero.spriteIndex ?? 0, atlas)}"></span>`;
}

export function compactStateLabel(stateLabel) {
  const labels = {
    "Idle": "ID",
    "Queued": "QU",
    "Walking to dungeon": "WD",
    "Fighting": "FG",
    "Walking home": "WH",
    "Recovering": "RC"
  };
  return labels[stateLabel] || stateLabel.slice(0, 2).toUpperCase();
}

export function hpPercent(hero, stats) {
  return Math.max(0, Math.min(100, (hero.hp / stats.hpMax) * 100));
}

export function partyMemberButtonsHtml({ party, characterState, heroName }) {
  if (!party.memberIds.length) {
    return `<span class="character-meta">no members</span>`;
  }
  return party.memberIds.map((heroId) => {
    const status = characterState(heroId);
    const disabled = status.state !== "Idle";
    return `<button data-party-id="${party.id}" data-toggle-member="${heroId}" ${disabled ? "disabled" : ""}>-${heroName(heroId)}</button>`;
  }).join(" ");
}

export function partyRowsHtml({ parties, selectedPartyId, operations, partyStats, currentOperationPhase, characterState, heroName }) {
  return parties.map((party) => {
    const stats = partyStats(party);
    const busy = operations.find((operation) => operation.partyId === party.id);
    const isSelected = party.id === selectedPartyId;
    return `
      <tr class="${isSelected ? "selected-party-row" : ""}">
        <td><button data-cancel-party="${party.id}">cancel</button></td>
        <td class="party-select-cell" data-select-party="${party.id}">${party.name}</td>
        <td>${partyMemberButtonsHtml({ party, characterState, heroName })}</td>
        <td class="party-select-cell" data-select-party="${party.id}">${busy ? currentOperationPhase(busy).phase.name : "Idle"}<br>HP ${stats.hpCurrent}/${stats.hpMax} ATK ${stats.atk}</td>
      </tr>
    `;
  }).join("");
}

export function skillButtonHtml({ hero, skillId, skills, skillRank, canLearnSkill }) {
  const definition = skills[skillId];
  const rank = skillRank(hero, skillId);
  const state = canLearnSkill(hero, skillId);
  const requires = definition.requires.length ? `req: ${definition.requires.map((id) => skills[id]?.name || id).join(" OR ")}` : "root";
  return `
    <button class="skill-node ${rank > 0 ? "learned" : ""}" data-learn-skill="${skillId}" ${state.ok ? "" : "disabled"} title="${requires}; ${state.reason}">
      <span>${definition.name}</span>
      <span>${definition.category} ${rank}/${definition.maxRank}</span>
    </button>
  `;
}

export function skillTreesHtml({ hero, availableSkillTreeIds, skillTrees, skills, skillRank, canLearnSkill }) {
  return availableSkillTreeIds(hero).map((treeId) => {
    const tree = skillTrees[treeId];
    return `
      <div class="skill-tree">
        <div class="skill-tree-title">${tree.name}</div>
        ${tree.skillIds.map((skillId) => skillButtonHtml({ hero, skillId, skills, skillRank, canLearnSkill })).join("")}
      </div>
    `;
  }).join("");
}

export function characterCardHtml({ hero, stats, status, focusedHeroId, minimized, atlas }) {
  const hpPct = hpPercent(hero, stats);
  if (minimized) {
    return `
      <button class="character-card compact ${hero.id === focusedHeroId ? "selected" : ""}" data-focus="${hero.id}" title="${hero.name} / ${status.state} / HP ${hero.hp}/${stats.hpMax}">
        ${portraitHtml(hero, "card", atlas)}
        <span class="compact-name">${hero.name}</span>
        <span class="compact-state">${compactStateLabel(status.state)}</span>
      </button>
    `;
  }
  return `
    <button class="character-card ${hero.id === focusedHeroId ? "selected" : ""}" data-focus="${hero.id}">
      ${portraitHtml(hero, "card", atlas)}
      <div class="character-card-body">
        <div class="character-name">${hero.name}</div>
        <div class="character-meta">${formatLabel(hero.race)} / ${hero.role} / ${status.state}</div>
        <div class="character-meta">party: ${status.party}</div>
        <div class="bar"><span style="width:${hpPct}%"></span></div>
        <div class="character-stats">
          <span>lv ${hero.level}</span>
          <span>hp ${hero.hp}/${stats.hpMax}</span>
          <span>atk ${stats.atk}</span>
          <span>def ${stats.def}</span>
          <span>utl ${stats.utility}</span>
        </div>
      </div>
    </button>
  `;
}

export function rosterCardsHtml({ roster, focusedHeroId, minimized, heroStats, characterState, atlas }) {
  return roster.map((hero) => characterCardHtml({
    hero,
    stats: heroStats(hero),
    status: characterState(hero.id),
    focusedHeroId,
    minimized,
    atlas
  })).join("");
}

export function focusedCharacterHtml({
  hero,
  stats,
  status,
  currentParty,
  blueprints,
  atlas,
  skillTreeHtml
}) {
  const canAddToCurrentParty = status.state === "Idle" && !currentParty.memberIds.includes(hero.id);
  return `
    <div class="detail-hero-head">
      ${portraitHtml(hero, "large", atlas)}
      <div>
        <div class="detail-title">${hero.name}</div>
        <div class="detail-line">${formatLabel(hero.race)} ${hero.role} / ${status.state}</div>
        <div class="detail-line">party: ${status.party}</div>
      </div>
    </div>
    <div class="detail-line">level: ${hero.level} (${hero.xp}/${hero.level * 8} xp), skill points: ${hero.skillPoints}</div>
    <div class="detail-line">race: ${formatLabel(hero.race)} / primary job: ${formatLabel(hero.primaryJob)} / secondary: ${hero.secondaryJob ? formatLabel(hero.secondaryJob) : "locked"}</div>
    <div class="detail-line">hp: ${hero.hp}/${stats.hpMax}</div>
    <div class="bar"><span style="width:${hpPercent(hero, stats)}%"></span></div>
    <div class="detail-line">atk ${stats.atk} / def ${stats.def} / utility ${stats.utility}</div>
    <div class="detail-line">travel +${stats.travelSpeed} / recovery -${stats.recoveryReduce} / food ${stats.foodCostReduce >= 0 ? "-" : "+"}${Math.abs(stats.foodCostReduce)}</div>
    <div class="detail-line">gear: ${hero.gear.length ? hero.gear.map((id) => blueprints[id].name).join(", ") : "none"}</div>
    <div class="detail-line">atlas slot: ${hero.spriteIndex ?? 0}</div>
    <div class="row-actions">
      <button id="addFocusedToPartyBtn" ${canAddToCurrentParty ? "" : "disabled"}>add to current party</button>
    </div>
    <div class="skill-tree-panel">${skillTreeHtml}</div>
  `;
}
