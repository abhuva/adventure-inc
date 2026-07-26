import {
  CHARACTER_ATLAS,
  MAP_BACKGROUND,
  MAP_BACKGROUNDS,
  MAP_VIEW_CONFIG,
  REPLAY_DEFAULT_MS,
  TEMPLE_INVENTORY_SLOTS
} from "./appConfig.js";
import { setupAppBootstrap } from "./appBootstrapSetup.js";
import { createAppCallbackRegistry } from "./appCallbackRegistry.js";
import { registerAppBootstrap } from "./bootstrap.js";
import { setupAppControls } from "./appControlSetup.js";
import { setupAppMapInteractions } from "./appMapInteractionSetup.js";
import { createAppQuerySetup } from "./appQuerySetup.js";
import { createAppRuntimeContext } from "./appRuntimeContext.js";
import { createLocalSaveRuntime } from "./localSaveRuntime.js";
import {
  applyMapBackgroundDimensions,
  applyMapBackgroundSet,
  loadMapBackgroundDimensions,
  loadMapBackgroundSet,
  mapWorldForContinent
} from "./mapBackgroundRuntime.js";
import { createDungeonCommandHandlers } from "./dungeonCommandHandlers.js";
import { createDungeonRenderAdapter } from "./dungeonRenderAdapter.js";
import { createEventCommandHandlers } from "./eventCommandHandlers.js";
import { createEventRenderAdapter } from "./eventRenderAdapter.js";
import { createExpeditionCommandHandlers } from "./expeditionCommandHandlers.js";
import { createExpeditionRenderAdapter } from "./expeditionRenderAdapter.js";
import { createHeaderRenderAdapter } from "./headerRenderAdapter.js";
import { createMapCommandHandlers } from "./mapCommandHandlers.js";
import { createMapRenderAdapter } from "./mapRenderAdapter.js";
import { createPartyCommandHandlers } from "./partyCommandHandlers.js";
import { createReplayCommandHandlers } from "./replayCommandHandlers.js";
import { createRosterProgressionHandlers } from "./rosterProgressionHandlers.js";
import { createRosterRenderAdapter } from "./rosterRenderAdapter.js";
import { createRosterTavernCommandHandlers } from "./rosterTavernCommandHandlers.js";
import { createAppShellCommandHandlers } from "./appShellCommandHandlers.js";
import { createAppRenderHandlers } from "./appRenderHandlers.js";
import { createSystemsRenderAdapter } from "./systemsRenderAdapter.js";
import { createTempleCommandHandlers } from "./templeCommandHandlers.js";
import { createTempleProgressionHandlers } from "./templeProgressionHandlers.js";
import { createTempleRenderAdapter } from "./templeRenderAdapter.js";
import { createTimeCommandHandlers } from "./timeCommandHandlers.js";
import { createSelectControlAdapter } from "./selectControlAdapter.js";
import { createAppUtilityCallbacks } from "./appUtilityCallbacks.js";
import { loadPoiData } from "../data/dataLoader.js";
import { BLUEPRINTS } from "../game/blueprints/blueprints.js";
import {
  EVENT_TRIGGERS,
  FIRST_STEP_EVENTS
} from "../game/events/eventDefinitions.js";
import { VISITORS } from "../game/roster/adventurerData.js";
import { refreshTavernVisitors } from "../game/roster/visitorQueue.js";
import { advanceExpeditionTransfers } from "../game/continent/continentState.js";
import { SKILLS, SKILL_TREES } from "../game/roster/skills.js";
import { heroStats } from "../game/roster/heroStats.js";
import { SHARDS, TEMPLE_COLORS, TEMPLE_STONES } from "../game/temple/templeData.js";
import { applyDailySettlementUpkeep } from "../game/settlement/happinessRuntime.js";
import {
  workSiteMaxWorkers,
  workSiteUpgradeCost,
  workSiteUpgradeLevel,
  workSiteWorkerCaps
} from "../game/settlement/workSiteUpgrades.js";
import {
  advanceWorkshopProduction,
  advanceWorkshopResearch
} from "../game/workshop/workshopRuntime.js";
import {
  advanceClock,
  advanceWorkerCycles as advanceWorkerCyclesForSites,
} from "../game/time/gameClock.js";
import { plannedPathAfterNodeClick } from "../game/dungeon/dungeonGraphModel.js";
import { ensureDungeonConquestState } from "../game/progression/worldProgression.js";
import { onElement as on } from "../ui/dom.js";

export function startAdventureIncApp({ windowRef = globalThis.window, documentRef = globalThis.document, performanceRef = globalThis.performance } = {}) {
  const window = windowRef;
  const document = documentRef;
  const performance = performanceRef;

let appCallbacks = null;

const {
  appDataContext,
  autoTimeRuntime,
  el,
  resourceRuntime,
  state
} = createAppRuntimeContext({
  windowRef: window,
  performanceRef: performance,
  templeInventorySlots: TEMPLE_INVENTORY_SLOTS,
  replayDefaultMs: REPLAY_DEFAULT_MS
});

const localSaveRuntime = createLocalSaveRuntime({
  state,
  storage: window.localStorage,
  setTimeoutFn: window.setTimeout.bind(window),
  clearTimeoutFn: window.clearTimeout.bind(window)
});

const {
  addLog,
  formatReward,
  recordShardProgress,
  replayTimerApi,
  templeLootBonus
} = createAppUtilityCallbacks({
  state,
  blueprints: BLUEPRINTS,
  windowRef: window,
  templeQueries: () => templeQueries,
  templeProgressionHandlers: () => templeProgressionHandlers,
  renderDungeonReplay: () => appRenderHandlers.renderDungeonReplay()
});

const selectControlAdapter = createSelectControlAdapter({
  state,
  el,
  dungeons: () => appSelection.dungeons(),
  selectedDungeon: () => appSelection.selectedDungeon()
});

const appShellCommandHandlers = createAppShellCommandHandlers({
  state,
  documentRef: document,
  controls: {
    partySelectValue: () => el.partySelect.value,
    mapPartySelectValue: () => el.mapPartySelect.value,
    setPartySelectValue: (partyId) => {
      el.partySelect.value = partyId;
    },
    setMapPartySelectValue: (partyId) => {
      el.mapPartySelect.value = partyId;
    }
  },
  replayTimerApi,
  populateStopNodes,
  render,
  triggerEvent: (...args) => eventCommandHandlers.triggerEvent(...args),
  saveNow: () => {
    const result = localSaveRuntime.saveNow();
    if (result.ok) addLog(`saved locally: ${result.savedAt}`, "ok");
    else addLog(`save failed: ${result.reason}`, "bad");
    return result;
  },
  resetSave: () => {
    const result = localSaveRuntime.reset();
    if (result.ok) {
      window.location.reload();
    } else {
      addLog(`reset save failed: ${result.reason}`, "bad");
      render();
    }
    return result;
  }
});

const partyCommandHandlers = createPartyCommandHandlers({
  state,
  addLog,
  render,
  populatePartySelect,
  selectedParty: () => appSelection.selectedParty(),
  characterState: (heroId) => appSelection.characterState(heroId),
  heroName: (heroId) => appSelection.heroName(heroId)
});

const rosterTavernCommandHandlers = createRosterTavernCommandHandlers({
  state,
  visitors: VISITORS,
  blueprints: BLUEPRINTS,
  focusedHero: () => appSelection.focusedHero(),
  canPay: (cost) => resourceRuntime.canPay(cost),
  pay: (cost) => resourceRuntime.pay(cost),
  addLog,
  render,
  triggerEvent: (...args) => eventCommandHandlers.triggerEvent(...args)
});

const templeCommandHandlers = createTempleCommandHandlers({
  state,
  stones: TEMPLE_STONES,
  shards: SHARDS,
  inventorySlots: TEMPLE_INVENTORY_SLOTS,
  activeStoneDefinition: () => templeQueries.activeStoneDefinition(),
  colorName: (colorId) => templeQueries.colorName(colorId),
  addLog,
  render
});
const templeProgressionHandlers = createTempleProgressionHandlers({
  templeState: state.temple,
  shards: SHARDS,
  addShardXp: (shardId, amount) => templeCommandHandlers.addShardXp(shardId, amount)
});

const dungeonCommandHandlers = createDungeonCommandHandlers({
  state,
  controls: {
    strategy: () => el.strategySelect.value,
    stopNode: () => selectedDungeonStopNodeValue(),
    setStopNode: (stopNodeId) => {
      el.stopNodeSelect.value = stopNodeId;
      if (stopNodeId === "all" || stopNodeId.startsWith?.("route:") || stopNodeId.startsWith?.("node:")) {
        const dungeon = appSelection.selectedDungeon();
        if (dungeon) {
          const conquest = ensureDungeonConquestState(state, dungeon.id);
          conquest.plannedNodeIds = [];
          conquest.selectedNodeId = null;
        }
      }
    },
    planNodeClick: (dungeon, nodeId, conquest) => plannedPathAfterNodeClick(dungeon, conquest.plannedNodeIds, nodeId, conquest),
    repeatMode: () => el.repeatSelect.value
  },
  selectedDungeon: () => appSelection.selectedDungeon(),
  selectedParty: () => appSelection.selectedParty(),
  partyStats: (party) => appSelection.partyStats(party),
  partyMembers: (party) => appSelection.partyMembers(party),
  isPartyFullyHealed: (party) => appSelection.isPartyFullyHealed(party),
  partyAssignmentReadiness: (party) => appSelection.partyAssignmentReadiness(party),
  currentOperationPhase: (operation, hourFraction) => appSelection.currentOperationPhase(operation, hourFraction),
  dungeons: () => appSelection.dungeons(),
  tavernCoord: () => appSelection.tavernCoord(),
  applyRewards: (rewards) => resourceRuntime.applyRewards(rewards),
  gainXp: (hero, xp) => rosterProgressionHandlers.gainXp(hero, xp),
  templeLootBonus,
  recordShardProgress,
  formatReward,
  replayTimerApi,
  populateDungeonSelect: () => appCallbacks.populateDungeonSelect(),
  addLog,
  render,
  triggerEvent: (...args) => eventCommandHandlers.triggerEvent(...args)
});

const expeditionCommandHandlers = createExpeditionCommandHandlers({
  state,
  controls: {
    partyId: () => el.expeditionPartySelect.value || state.selectedPartyId,
    setParty: (partyId) => {
      state.selectedPartyId = partyId;
      el.partySelect.value = partyId;
      el.mapPartySelect.value = partyId;
      el.expeditionPartySelect.value = partyId;
    }
  },
  canPay: (cost) => resourceRuntime.canPay(cost),
  pay: (cost) => resourceRuntime.pay(cost),
  addLog,
  render,
  renderMapActors: (hourFraction) => appCallbacks.renderMapActors(hourFraction),
  currentVisualHourFraction,
  setTab: (tabId) => appShellCommandHandlers.setTab(tabId)
});

const mapCommandHandlers = createMapCommandHandlers({
  state,
  controls: {
    setDungeon: (dungeonId) => {
      el.dungeonSelect.value = dungeonId;
    },
    setParty: (partyId) => {
      state.selectedPartyId = partyId;
      el.partySelect.value = partyId;
      el.mapPartySelect.value = partyId;
    },
    setStopNode: (stopNodeId) => {
      el.stopNodeSelect.value = stopNodeId;
      if (stopNodeId === "all") {
        const dungeon = appSelection.selectedDungeon();
        if (dungeon) {
          const conquest = ensureDungeonConquestState(state, dungeon.id);
          conquest.plannedNodeIds = [];
          conquest.selectedNodeId = null;
        }
      }
    },
    setRepeatMode: (repeatMode) => {
      el.repeatSelect.value = repeatMode;
    },
    strategy: () => el.strategySelect.value,
    stopNode: () => el.stopNodeSelect.value
  },
  selectedLocation: () => appSelection.selectedLocation(),
  workSites: () => appSelection.workSites(),
  selectedParty: () => appSelection.selectedParty(),
  simulateRun: (args) => dungeonCommandHandlers.simulateRun(args),
  ensureRepeatedPlanQueued: (partyId) => dungeonCommandHandlers.ensureRepeatedPlanQueued(partyId),
  replayTimerApi,
  populateDungeonSelect,
  populateStopNodes,
  setTab: (tabId) => appShellCommandHandlers.setTab(tabId),
  setMapSideTab: (tabId) => appShellCommandHandlers.setMapSideTab(tabId),
  selectExpeditionRoute: (routeId) => expeditionCommandHandlers.selectRoute(routeId),
  addLog,
  canPay: (cost) => resourceRuntime.canPay(cost),
  pay: (cost) => resourceRuntime.pay(cost),
  render
});

const mapRenderAdapter = createMapRenderAdapter({
  state,
  el,
  documentRef: document,
  mapWorld: () => mapWorldForContinent(state),
  workSites: () => appSelection.workSites(),
  tavernCoord: () => appSelection.tavernCoord(),
  mapLocations: () => appSelection.mapLocations(),
  selectedLocation: () => appSelection.selectedLocation(),
  selectedParty: () => appSelection.selectedParty(),
  partyAssignmentReadiness: (party) => appSelection.partyAssignmentReadiness(party),
  currentOperationPhase: (operation, hourFraction) => appSelection.currentOperationPhase(operation, hourFraction),
  currentVisualHourFraction,
  formatReward,
  heroName: (heroId) => appSelection.heroName(heroId),
  workSiteUpgrade: (location) => location?.type === "work" ? {
    level: workSiteUpgradeLevel(state, location.id),
    maxWorkers: workSiteMaxWorkers(state, location.id),
    cost: workSiteUpgradeCost(state, location.id),
    costText: formatReward(workSiteUpgradeCost(state, location.id))
  } : null,
  selectLocation,
  selectLocationFromMap,
  assignSelectedPartyToSelectedDungeon,
  runSelectedExpedition: () => mapCommandHandlers.runSelectedExpedition(),
  renderExpeditionPlan: () => expeditionRenderAdapter.renderExpedition(),
  upgradeSelectedWorkSite: (siteId) => mapCommandHandlers.upgradeSelectedWorkSite(siteId),
  closeMapContextMenu
});

const timeCommandHandlers = createTimeCommandHandlers({
  state,
  autoTimeRuntime,
  workSites: () => appSelection.workSites(),
  operationTotalHours: (operation) => appSelection.operationTotalHours(operation),
  completeEstimate: (operation) => dungeonCommandHandlers.completeEstimate(operation),
  ensureRepeatedPlanQueued: (partyId) => dungeonCommandHandlers.ensureRepeatedPlanQueued(partyId),
  applyRewards: (rewards) => resourceRuntime.applyRewards(rewards),
  formatReward,
  advanceClock,
  advanceWorkerCyclesForSites,
  advanceWorkshopProduction,
  advanceWorkshopResearch,
  applyDailySettlementUpkeep,
  advanceExpeditionTransfers: (hours) => advanceExpeditionTransfers(state, hours),
  refreshTavernVisitors: () => refreshTavernVisitors(state, VISITORS),
  addLog,
  render,
  renderTimeTick
});

const eventCommandHandlers = createEventCommandHandlers({
  state,
  eventDefinitions: FIRST_STEP_EVENTS,
  addLog,
  render,
  setTab: (tabId) => appShellCommandHandlers.setTab(tabId),
  stopAutoTime: () => timeCommandHandlers.stopAutoTime(),
  resumeAutoTime: () => timeCommandHandlers.enableAutoTime()
});

const replayCommandHandlers = createReplayCommandHandlers({
  state,
  timerApi: replayTimerApi,
  render,
  renderReplayOnly: renderDungeonReplay
});

const rosterProgressionHandlers = createRosterProgressionHandlers({
  state,
  skills: SKILLS,
  skillTrees: SKILL_TREES,
  characterState: (heroId) => appSelection.characterState(heroId),
  partyForHero: (heroId) => appSelection.partyForHero(heroId),
  heroStats,
  addLog,
  render
});

const rosterRenderAdapter = createRosterRenderAdapter({
  state,
  el,
  documentRef: document,
  atlas: CHARACTER_ATLAS,
  visitors: VISITORS,
  blueprints: BLUEPRINTS,
  workSites: () => appSelection.workSites(),
  focusedHero: () => appSelection.focusedHero(),
  selectedParty: () => appSelection.selectedParty(),
  heroStats,
  partyStats: (party) => appSelection.partyStats(party),
  currentOperationPhase: (operation, hourFraction) => appSelection.currentOperationPhase(operation, hourFraction),
  characterState: (heroId) => appSelection.characterState(heroId),
  heroName: (heroId) => appSelection.heroName(heroId),
  availableSkillTreeIds: (hero) => appSelection.availableSkillTreeIds(hero),
  skillTrees: SKILL_TREES,
  skills: SKILLS,
  skillRank: (hero, skillId) => appSelection.skillRank(hero, skillId),
  canLearnSkill: (hero, skillId) => appSelection.canLearnSkill(hero, skillId),
  populatePartySelect,
  onRecruit: (visitorId) => rosterTavernCommandHandlers.recruit(visitorId),
  onSelectParty: (partyId) => partyCommandHandlers.selectParty(partyId),
  onCancelParty: (partyId) => partyCommandHandlers.cancelPartyAction(partyId),
  onTogglePartyMember: (partyId, heroId) => partyCommandHandlers.togglePartyMember(partyId, heroId),
  onAddFocusedToParty: (heroId = state.focusedHeroId) => partyCommandHandlers.addFocusedHeroToCurrentParty(heroId),
  onCraft: (id) => rosterTavernCommandHandlers.craft(id),
  onLearnSkill: (heroId, skillId) => rosterProgressionHandlers.learnSkill(heroId, skillId),
  onAdjustWorker: (job, delta) => rosterTavernCommandHandlers.adjustWorker(job, delta, {
    maxWorkersByJob: workSiteWorkerCaps(state, appSelection.workSites())
  }),
  onAdjustWage: (delta) => rosterTavernCommandHandlers.adjustWage(delta),
  onSetWorkshopRecipe: (slotIndex, recipeId) => rosterTavernCommandHandlers.setWorkshopRecipe(slotIndex, recipeId),
  onSetWorkshopAutoInputs: (slotIndex, enabled) => rosterTavernCommandHandlers.setWorkshopAutoInputs(slotIndex, enabled),
  onSpendWorkshopUpgradePoint: (nodeId) => rosterTavernCommandHandlers.spendWorkshopUpgradePoint(nodeId),
  onSelectTavernVisitor: (visitorId) => rosterTavernCommandHandlers.selectTavernVisitor(visitorId),
  onFocusHero: (heroId) => rosterTavernCommandHandlers.setFocusedHero(heroId)
});

const dungeonRenderAdapter = createDungeonRenderAdapter({
  state,
  el,
  documentRef: document,
  selectedDungeon: () => appSelection.selectedDungeon(),
  repeatMode: () => el.repeatSelect.value,
  formatReward,
  replaySpeedLabel,
  portraitStyle,
  selectedTargetNodeId: () => selectedDungeonTargetNodeId(),
  plannedNodeIds: () => selectedDungeonPlannedNodeIds(),
  conquestState: () => selectedDungeonConquestState(),
  onSelectTargetNode: (nodeId) => dungeonCommandHandlers.selectTargetNode(nodeId)
});

const headerRenderAdapter = createHeaderRenderAdapter({
  state,
  el,
  documentRef: document,
  selectedParty: () => appSelection.selectedParty()
});

const systemsRenderAdapter = createSystemsRenderAdapter({
  state,
  el,
  blueprints: BLUEPRINTS
});

const eventRenderAdapter = createEventRenderAdapter({
  state,
  el,
  eventDefinitions: FIRST_STEP_EVENTS,
  onAction: (actionId) => eventCommandHandlers.closeEncounter(actionId)
});

const { appSelection, templeQueries } = createAppQuerySetup({
  state,
  el,
  dataContext: appDataContext,
  colors: TEMPLE_COLORS,
  stones: TEMPLE_STONES,
  shards: SHARDS,
  inventorySlots: TEMPLE_INVENTORY_SLOTS,
  skills: SKILLS,
  skillTrees: SKILL_TREES
});

const expeditionRenderAdapter = createExpeditionRenderAdapter({
  state,
  el,
  formatReward,
  heroStats,
  characterState: (heroId) => appSelection.characterState(heroId),
  partyMembers: (party) => appSelection.partyMembers(party),
  canPay: (cost) => resourceRuntime.canPay(cost),
  onSelectParty: (partyId) => expeditionCommandHandlers.selectParty(partyId),
  onStartExpedition: () => expeditionCommandHandlers.startSelectedExpedition(),
  onResolveArrival: (arrivalId, switchFocus) => expeditionCommandHandlers.resolveArrival(arrivalId, switchFocus),
  onSelectContinent: (continentId, point) => expeditionCommandHandlers.selectContinentFromMap(continentId, point),
  onCancelContinentContext: () => expeditionCommandHandlers.closeContinentContextMenu(),
  onFocusContinent: (continentId) => expeditionCommandHandlers.focusSelectedContinent(continentId),
  heroName: (heroId) => appSelection.heroName(heroId)
});

const templeRenderAdapter = createTempleRenderAdapter({
  state,
  el,
  colors: TEMPLE_COLORS,
  stones: TEMPLE_STONES,
  shards: SHARDS,
  inventorySlots: TEMPLE_INVENTORY_SLOTS,
  hasShard: (shardId) => templeQueries.hasShard(shardId),
  templeColor: (colorId) => templeQueries.colorById(colorId),
  colorName: (colorId) => templeQueries.colorName(colorId),
  onSelectStone: (stoneId) => templeCommandHandlers.selectTempleStone(stoneId),
  onToggleLine: (a, b) => templeCommandHandlers.toggleTempleLine(a, b),
  onEquipShard: (socketId, shardId) => templeCommandHandlers.equipShard(socketId, shardId),
  onSelectShard: (shardId) => templeCommandHandlers.selectShard(shardId),
  onMoveShardToInventorySlot: (shardId, targetIndex) => templeCommandHandlers.moveShardToInventorySlot(shardId, targetIndex)
});

const appRenderHandlers = createAppRenderHandlers({
  headerRenderAdapter,
  mapRenderAdapter,
  rosterRenderAdapter,
  dungeonRenderAdapter,
  expeditionRenderAdapter,
  templeRenderAdapter,
  systemsRenderAdapter,
  eventRenderAdapter
});

appCallbacks = createAppCallbackRegistry({
  appRenderHandlers,
  mapCommandHandlers,
  mapRenderAdapter,
  replayCommandHandlers,
  rosterRenderAdapter,
  selectControlAdapter,
  timeCommandHandlers
});

setupAppBootstrap({
  documentRef: document,
  windowRef: window,
  state,
  el,
  registerAppBootstrap,
  setupControls,
  loadPoiData,
  setPoiData: (loadedPoiData) => appDataContext.setPoiData(loadedPoiData),
  loadAutosave: () => localSaveRuntime.load(),
  loadMapBackground: () => loadMapBackgroundSet({
    backgrounds: MAP_BACKGROUNDS,
    ImageCtor: window.Image
  }).catch(() => loadMapBackgroundDimensions({
    src: MAP_BACKGROUND.src,
    ImageCtor: window.Image,
    fallbackWidth: MAP_BACKGROUND.fallbackWidth,
    fallbackHeight: MAP_BACKGROUND.fallbackHeight
  })),
  applyMapBackground: (dimensions) => {
    if (dimensions.old_marches || dimensions.ash_coast) {
      return applyMapBackgroundSet(state, dimensions);
    }
    return applyMapBackgroundDimensions(state, dimensions);
  },
  startAutoTime: () => timeCommandHandlers.enableAutoTime(),
  onStartupComplete: () => eventCommandHandlers.triggerEvent(EVENT_TRIGGERS.GAME_STARTED),
  populateDungeonSelect: appCallbacks.populateDungeonSelect,
  populatePartySelect: appCallbacks.populatePartySelect,
  addLog,
  renderSystems: appCallbacks.renderSystems,
  render: appCallbacks.render,
  renderMapActors: appCallbacks.renderMapActors,
  currentVisualHourFraction: appCallbacks.currentVisualHourFraction
});

function setupControls() {
  setupAppControls({
    documentRef: document,
    on,
    el,
    state,
    appShellCommandHandlers,
    dungeonCommandHandlers,
    partyCommandHandlers,
    replayCommandHandlers,
    rosterTavernCommandHandlers,
    expeditionCommandHandlers,
    timeCommandHandlers,
    setupMapInteractions
  });
}

function setupMapInteractions() {
  setupAppMapInteractions({
    el,
    state,
    mapViewConfig: MAP_VIEW_CONFIG,
    applyMapTransform: appCallbacks.applyMapTransform,
    renderLocationDetail: appCallbacks.renderLocationDetail
  });
}

function assignSelectedPartyToSelectedDungeon() {
  appCallbacks.assignSelectedPartyToSelectedDungeon();
}

function currentVisualHourFraction() {
  return appCallbacks.currentVisualHourFraction();
}

function populatePartySelect() {
  appCallbacks.populatePartySelect();
}

function populateDungeonSelect() {
  appCallbacks.populateDungeonSelect();
}

function populateStopNodes() {
  appCallbacks.populateStopNodes();
}

function portraitStyle(spriteIndex) {
  return appCallbacks.portraitStyle(spriteIndex);
}

function render() {
  appCallbacks.render();
  localSaveRuntime.scheduleSave();
}

function renderTimeTick(activeTab, hourFraction, options = {}) {
  appCallbacks.renderTimeTick(activeTab, hourFraction, options);
  localSaveRuntime.scheduleSave();
}

function renderDungeonReplay() {
  appCallbacks.renderDungeonReplay();
}

function replaySpeedLabel() {
  return appCallbacks.replaySpeedLabel();
}

function selectedDungeonTargetNodeId() {
  const conquest = selectedDungeonConquestState();
  if (conquest.selectedNodeId) return conquest.selectedNodeId;
  const value = el.stopNodeSelect.value || "";
  if (value.startsWith("path:")) return value.slice("path:".length).split(",").filter(Boolean).at(-1) || "";
  if (value.startsWith("node:")) return value.slice("node:".length);
  const dungeon = appSelection.selectedDungeon();
  if (!dungeon) return "";
  const route = dungeon?.routes?.find((item) => `route:${item.id}` === value)
    || dungeon?.routes?.find((item) => item.default)
    || dungeon?.routes?.[0];
  if (route?.nodeIds?.length) return route.nodeIds.at(-1);
  if (value !== "all" && Number.isFinite(Number(value))) return dungeon?.nodes?.[Number(value)]?.id || "";
  return dungeon?.nodes?.at(-1)?.id || "";
}

function selectedDungeonPlannedNodeIds() {
  const conquest = selectedDungeonConquestState();
  if (Array.isArray(conquest.plannedNodeIds) && conquest.plannedNodeIds.length) return conquest.plannedNodeIds;
  const value = el.stopNodeSelect.value || "";
  if (value.startsWith("path:")) return value.slice("path:".length).split(",").filter(Boolean);
  return [];
}

function selectedDungeonStopNodeValue() {
  const planned = selectedDungeonPlannedNodeIds();
  if (planned.length) return `path:${planned.join(",")}`;
  return el.stopNodeSelect.value;
}

function selectedDungeonConquestState() {
  const dungeon = appSelection.selectedDungeon();
  return dungeon ? ensureDungeonConquestState(state, dungeon.id) : { selectedNodeId: null, plannedNodeIds: [] };
}

function selectLocation(locationId) {
  appCallbacks.selectLocation(locationId);
}

function selectLocationFromMap(locationId, point) {
  mapCommandHandlers.selectLocationFromMap(locationId, point);
}

function closeMapContextMenu() {
  mapCommandHandlers.closeMapContextMenu();
}
}


