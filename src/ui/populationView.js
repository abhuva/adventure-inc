import { canSpendProgressionPoint } from "../game/progression/progressionGraphRules.js";
import { hireWorkerCost, unassignedWorkers, workerProductionMultiplier } from "../game/settlement/workforceModel.js";
import { workSiteMaxWorkers } from "../game/settlement/workSiteUpgrades.js";
import { WORKSHOP_RECIPES, WOOD_WORKSHOP_GRAPH } from "../game/workshop/workshopData.js";
import { WORKSHOP_RESEARCH_REQUIRED, ensureWorkshopState, workshopProductionProfile, workshopSlotCount } from "../game/workshop/workshopRuntime.js";
import { effectiveWorkshopRecipe, recipeProgress, recipeUnlockStates } from "../game/workshop/workshopRecipeProgression.js";
import { formatCost } from "../core/format.js";
import { progressionGraphHtml } from "./progressionGraphView.js";

const JOB_LABELS = {
  wood: "woodcutters",
  ore: "ore miners",
  workshop: "production",
  research: "production research"
};

const GATHERED_RESOURCE_ROWS = [
  ["food", "food"],
  ["wood", "wood"],
  ["ore", "ore"],
  ["hide", "hide"],
  ["planks", "planks"],
  ["comfort_goods", "comfort"],
  ["training_bow", "bows"]
];

export function populationResourceRowsHtml(resources = {}) {
  return GATHERED_RESOURCE_ROWS.map(([resourceId, label]) => `
    <tr>
      <td>${label}</td>
      <td>${resources[resourceId] || 0}</td>
    </tr>
  `).join("");
}

export function populationJobRowsHtml({ state, workSites, blueprints }) {
  const fallbackSettlement = arguments[0].settlement || {
      availableWorkers: arguments[0].tavern?.population || 0,
      housingCapacity: arguments[0].tavern?.population || 0,
      happiness: 80,
      wagePerWorker: 1,
      hiredWorkers: arguments[0].tavern?.population || 3,
      productionMultiplier: 1
    };
  const normalizedState = state
    ? { ...state, settlement: state.settlement || fallbackSettlement }
    : { tavern: arguments[0].tavern, settlement: fallbackSettlement };
  const tavern = normalizedState.tavern;
  const settlement = normalizedState.settlement;
  const siteRows = workSites.map((site) => `
    <tr>
      <td>${site.name}</td>
      <td>${tavern.jobs[site.id] || 0}/${workSiteMaxWorkers(normalizedState, site.id)}</td>
      <td>${formatReward(site.output, blueprints)} / ${site.cycleHours} worker-hours</td>
      <td>${assignmentButtonsHtml(site.id)}</td>
    </tr>
  `).join("");
  const systemRows = ["workshop", "research"].map((job) => `
    <tr>
      <td>${JOB_LABELS[job]}</td>
      <td>${tavern.jobs[job] || 0}</td>
      <td>${jobOutputText(job)}</td>
      <td>${assignmentButtonsHtml(job)}</td>
    </tr>
  `).join("");
  return `
    <tr><td>unassigned</td><td>${state ? unassignedWorkers(normalizedState) : 0}</td><td>available buffer</td><td>-</td></tr>
    ${siteRows}
    ${systemRows}
    <tr><td>hired workers</td><td>${settlement.availableWorkers}</td><td>upkeep ${settlement.availableWorkers} coin/day / production x${workerProductionMultiplier(normalizedState)}</td><td>-</td></tr>
  `;
}

export function renderPopulationJobs(el, options, handlers = {}) {
  ensureWorkshopState(options.state);
  el.jobRows.innerHTML = populationJobRowsHtml(options);
  renderPopulationResources(el, options);
  bindAssignmentButtons(el, handlers);
  renderWageControls(el, options, handlers);
  if (!el.workshopStatus || !el.workshopSlots || !el.workshopResearch || !el.workshopUpgradeGraph) return;
  renderWorkshopStatus(el, options);
  if (shouldPreserveWorkshopSlots(el)) {
    updateWorkshopSlotValues(el, options);
  } else {
    renderWorkshopSlots(el, options, handlers);
  }
  renderWorkshopResearch(el, options);
  renderWorkshopGraph(el, options, handlers);
}

function renderPopulationResources(el, { state }) {
  if (!el.populationResourceRows) return;
  el.populationResourceRows.innerHTML = populationResourceRowsHtml(state.resources);
}

function renderWageControls(el, { state }, handlers) {
  if (!el.settlementWageControls) return;
  const cost = hireWorkerCost(state);
  const multiplier = workerProductionMultiplier(state);
  el.settlementWageControls.innerHTML = `
    <div class="wage-control-row">
      <span>next worker</span>
      <strong>${formatCost(cost)}</strong>
      <span>production x${multiplier}</span>
    </div>
  `;
}

function bindAssignmentButtons(el, handlers) {
  el.jobRows.querySelectorAll("[data-worker-job]").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onAdjustWorker?.(button.dataset.workerJob, Number(button.dataset.workerDelta));
    });
  });
}

function assignmentButtonsHtml(job) {
  return `
    <div class="worker-assignment-controls">
      <button data-worker-job="${job}" data-worker-delta="-1" aria-label="remove ${job} worker">-</button>
      <button data-worker-job="${job}" data-worker-delta="1" aria-label="add ${job} worker">+</button>
    </div>
  `;
}

function renderWorkshopStatus(el, { state }) {
  const researchWorkers = state.tavern.jobs.research || 0;
  const slots = workshopSlotCount(state);
  const profile = workshopProductionProfile(state);
  const totalSpeedBonus = Math.round((profile.speedMultiplier - 1) * 100);
  el.workshopStatus.textContent = `${profile.workers} craft (${profile.activeSlots} station / ${profile.assistants} assist) / ${researchWorkers} research / ${slots} slot${slots === 1 ? "" : "s"} / speed +${totalSpeedBonus}%`;
}

function renderWorkshopSlots(el, { state }, handlers) {
  const slotsHtml = state.workshop.slots.map((slot, index) => {
    const targetRecipe = WORKSHOP_RECIPES[slot.targetRecipeId || slot.recipeId];
    const activeRecipe = WORKSHOP_RECIPES[slot.activeRecipeId || slot.targetRecipeId || slot.recipeId];
    const effectiveActiveRecipe = effectiveWorkshopRecipe(activeRecipe, state.workshop);
    const progress = effectiveActiveRecipe ? Math.min(100, Math.floor((slot.progress / effectiveActiveRecipe.workRequired) * 100)) : 0;
    const manned = index < (state.tavern.jobs.workshop || 0);
    return `
      <div class="workshop-slot ${manned ? "manned" : "unmanned"}" data-workshop-slot="${index}">
        <div class="workshop-slot-head">
          <strong>slot ${index + 1}</strong>
          <span data-workshop-slot-state="${index}">${manned ? "manned" : "unmanned"}</span>
        </div>
        <div class="detail-line" data-workshop-slot-recipe-name="${index}">${workshopRecipeLine(targetRecipe, activeRecipe, state.workshop)}</div>
        <div class="meter"><span data-workshop-slot-meter="${index}" style="width:${progress}%"></span></div>
        <div class="detail-line" data-workshop-slot-detail="${index}">${workshopSlotDetail(slot, activeRecipe, state.workshop)}</div>
        <label>
          target
          <select data-workshop-recipe-slot="${index}">
            ${Object.values(WORKSHOP_RECIPES).map((candidate) => `<option value="${candidate.id}" ${candidate.id === (slot.targetRecipeId || slot.recipeId) ? "selected" : ""}>${candidate.name}</option>`).join("")}
          </select>
        </label>
        <label class="inline-toggle">
          <input type="checkbox" data-workshop-auto-inputs-slot="${index}" ${slot.autoInputs ? "checked" : ""}>
          auto inputs
        </label>
      </div>
    `;
  }).join("");
  el.workshopSlots.innerHTML = slotsHtml;
  el.workshopSlots.querySelectorAll("[data-workshop-recipe-slot]").forEach((select) => {
    select.addEventListener("change", () => handlers.onSetWorkshopRecipe?.(Number(select.dataset.workshopRecipeSlot), select.value));
  });
  el.workshopSlots.querySelectorAll("[data-workshop-auto-inputs-slot]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => handlers.onSetWorkshopAutoInputs?.(Number(checkbox.dataset.workshopAutoInputsSlot), checkbox.checked));
  });
}

function updateWorkshopSlotValues(el, { state }) {
  state.workshop.slots.forEach((slot, index) => {
    const targetRecipe = WORKSHOP_RECIPES[slot.targetRecipeId || slot.recipeId];
    const activeRecipe = WORKSHOP_RECIPES[slot.activeRecipeId || slot.targetRecipeId || slot.recipeId];
    const effectiveActiveRecipe = effectiveWorkshopRecipe(activeRecipe, state.workshop);
    const progress = effectiveActiveRecipe ? Math.min(100, Math.floor((slot.progress / effectiveActiveRecipe.workRequired) * 100)) : 0;
    const manned = index < (state.tavern.jobs.workshop || 0);
    const slotEl = el.workshopSlots.querySelector?.(`[data-workshop-slot="${index}"]`);
    const stateEl = el.workshopSlots.querySelector?.(`[data-workshop-slot-state="${index}"]`);
    const recipeNameEl = el.workshopSlots.querySelector?.(`[data-workshop-slot-recipe-name="${index}"]`);
    const meterEl = el.workshopSlots.querySelector?.(`[data-workshop-slot-meter="${index}"]`);
    const detailEl = el.workshopSlots.querySelector?.(`[data-workshop-slot-detail="${index}"]`);
    slotEl?.classList?.toggle("manned", manned);
    slotEl?.classList?.toggle("unmanned", !manned);
    if (stateEl) stateEl.textContent = manned ? "manned" : "unmanned";
    if (recipeNameEl) recipeNameEl.innerHTML = workshopRecipeLine(targetRecipe, activeRecipe, state.workshop);
    if (meterEl?.style) meterEl.style.width = `${progress}%`;
    if (detailEl) detailEl.textContent = workshopSlotDetail(slot, activeRecipe, state.workshop);
  });
}

function workshopSlotDetail(slot, recipe, workshop) {
  const effectiveRecipe = effectiveWorkshopRecipe(recipe, workshop);
  return `${Math.floor(slot.progress)}/${effectiveRecipe?.workRequired || 0} work / input ${formatCost(effectiveRecipe?.input || {})} / output ${formatCost(effectiveRecipe?.output || {})}`;
}

function workshopRecipeLine(targetRecipe, activeRecipe, workshop) {
  const text = workshopRecipeLineText(targetRecipe, activeRecipe, workshop);
  const targetPanel = recipeHoverPanelHtml(targetRecipe, workshop);
  if (!activeRecipe || activeRecipe.id === targetRecipe?.id) {
    return `<span class="recipe-hover">${text}${targetPanel}</span>`;
  }
  return `Now: <span class="recipe-hover">${recipeLabel(activeRecipe, workshop)}${recipeHoverPanelHtml(activeRecipe, workshop)}</span><span> / Target: </span><span class="recipe-hover">${recipeLabel(targetRecipe, workshop)}${targetPanel}</span>`;
}

function workshopRecipeLineText(targetRecipe, activeRecipe, workshop) {
  if (!targetRecipe && !activeRecipe) return "unknown";
  if (!activeRecipe || activeRecipe.id === targetRecipe?.id) return `Target: ${recipeLabel(targetRecipe, workshop)}`;
  return `Now: ${recipeLabel(activeRecipe, workshop)} / Target: ${recipeLabel(targetRecipe, workshop)}`;
}

function recipeLabel(recipe, workshop) {
  if (!recipe) return "unknown";
  const progress = recipeProgress(workshop, recipe.id);
  return `${recipe.name} L${progress.level}`;
}

function recipeHoverPanelHtml(recipe, workshop) {
  if (!recipe) return "";
  const progress = recipeProgress(workshop, recipe.id);
  const effectiveRecipe = effectiveWorkshopRecipe(recipe, workshop);
  const unlockRows = recipeUnlockStates(workshop, recipe.id).map((unlock) => `
    <div class="recipe-unlock-row ${unlock.unlocked ? "unlocked" : "locked"}">
      <span>Level ${unlock.level}: ${unlock.label}</span>
      <span>${unlock.detail}</span>
    </div>
  `).join("");
  const nextIn = Math.max(0, progress.nextLevelXp - progress.xp);
  const meterWidth = progress.xpForNextLevel > 0
    ? Math.min(100, Math.floor((progress.xpIntoLevel / progress.xpForNextLevel) * 100))
    : 100;
  return `
    <span class="recipe-xp-panel">
      <strong>${recipe.name}</strong>
      <span>${recipe.description}</span>
      <span>Level ${progress.level} / XP ${progress.xp}</span>
      <span class="meter small"><span style="width:${meterWidth}%"></span></span>
      <span>Next level in ${nextIn} craft XP</span>
      <span>Cost: ${formatCost(effectiveRecipe?.input || {})}</span>
      <span>Output: ${formatCost(effectiveRecipe?.output || {})}</span>
      <span>Work: ${effectiveRecipe?.workRequired || 0} worker-hours</span>
      <span>Unlocks</span>
      ${unlockRows}
    </span>
  `;
}

function renderWorkshopResearch(el, { state }) {
  const progress = Math.min(100, Math.floor(((state.workshop.researchProgress || 0) / WORKSHOP_RESEARCH_REQUIRED) * 100));
  el.workshopResearch.innerHTML = `
    <div class="detail-line">Research: ${Math.floor(state.workshop.researchProgress || 0)}/${WORKSHOP_RESEARCH_REQUIRED} worker-hours</div>
    <div class="meter"><span style="width:${progress}%"></span></div>
    <div class="detail-line">Upgrade points: ${state.workshop.progression.availablePoints || 0}</div>
  `;
}

function renderWorkshopGraph(el, { state }, handlers) {
  el.workshopUpgradeGraph.innerHTML = progressionGraphHtml({
    graph: WOOD_WORKSHOP_GRAPH,
    state: state.workshop.progression,
    canSpendNode: (nodeId) => canSpendProgressionPoint(WOOD_WORKSHOP_GRAPH, state.workshop.progression, nodeId),
    nodeLabel: (node) => node.name,
    actionAttribute: "data-workshop-upgrade-node"
  });
  el.workshopUpgradeGraph.querySelectorAll("[data-workshop-upgrade-node]").forEach((button) => {
    button.addEventListener("click", () => handlers.onSpendWorkshopUpgradePoint?.(button.dataset.workshopUpgradeNode));
  });
}

function shouldPreserveWorkshopSlots(el) {
  const activeElement = el.workshopSlots?.ownerDocument?.activeElement;
  const isWorkshopControl = activeElement?.matches?.("[data-workshop-recipe-slot]")
    || activeElement?.matches?.("[data-workshop-auto-inputs-slot]");
  return Boolean(
    isWorkshopControl
    && el.workshopSlots.contains?.(activeElement)
  );
}

function jobOutputText(job) {
  if (job === "workshop") return "selected recipe progress";
  if (job === "research") return `+1 upgrade point / ${WORKSHOP_RESEARCH_REQUIRED} worker-hours`;
  return "none";
}

function formatReward(output, blueprints) {
  return Object.entries(output || {}).map(([key, value]) => {
    if (key === "blueprint") return `${blueprints[value]?.name || value} blueprint`;
    return `${value} ${key}`;
  }).join(", ");
}
