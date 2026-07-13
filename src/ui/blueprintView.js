import { formatCost } from "../core/format.js";

export function blueprintRowsHtml(blueprints, unlockedBlueprints = {}) {
  return Object.entries(blueprints).map(([id, blueprint]) => {
    const unlocked = Boolean(unlockedBlueprints[id]);
    return `
      <div class="blueprint ${unlocked ? "" : "locked"}">
        <div class="node-title">${blueprint.name}</div>
        <div>state: ${unlocked ? "unlocked" : "locked"}</div>
        <div>source: ${blueprint.source}</div>
        <div>cost: ${formatCost(blueprint.cost)}</div>
        <div>${blueprint.effect}</div>
      </div>
    `;
  }).join("");
}

export function renderBlueprintRows(el, blueprints, unlockedBlueprints = {}) {
  el.blueprintRows.innerHTML = blueprintRowsHtml(blueprints, unlockedBlueprints);
}
