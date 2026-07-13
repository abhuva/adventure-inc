import {
  CHARACTER_ATLAS,
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
import { createDungeonCommandHandlers } from "./dungeonCommandHandlers.js";
import { createDungeonRenderAdapter } from "./dungeonRenderAdapter.js";
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
import { VISITORS } from "../game/roster/adventurerData.js";
import { SKILLS, SKILL_TREES } from "../game/roster/skills.js";
import { heroStats } from "../game/roster/heroStats.js";
import { SHARDS, TEMPLE_COLORS, TEMPLE_STONES } from "../game/temple/templeData.js";
import {
  advanceClock,
  advanceWorkerCycles as advanceWorkerCyclesForSites,
} from "../game/time/gameClock.js";
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
    partySelectValue: () => el.partySelect.value
  },
  replayTimerApi,
  populateStopNodes,
  render
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
  render
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
    stopNode: () => el.stopNodeSelect.value,
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
  addLog,
  render
});

const mapCommandHandlers = createMapCommandHandlers({
  state,
  controls: {
    setDungeon: (dungeonId) => {
      el.dungeonSelect.value = dungeonId;
    },
    strategy: () => el.strategySelect.value,
    stopNode: () => el.stopNodeSelect.value
  },
  selectedLocation: () => appSelection.selectedLocation(),
  selectedParty: () => appSelection.selectedParty(),
  simulateRun: (args) => dungeonCommandHandlers.simulateRun(args),
  ensureRepeatedPlanQueued: (partyId) => dungeonCommandHandlers.ensureRepeatedPlanQueued(partyId),
  populateStopNodes,
  addLog,
  render
});

const mapRenderAdapter = createMapRenderAdapter({
  state,
  el,
  documentRef: document,
  worldSize: MAP_VIEW_CONFIG.worldSize,
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
  selectLocation,
  assignSelectedPartyToSelectedDungeon
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
  addLog,
  render
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
  onLearnSkill: (heroId, skillId) => rosterProgressionHandlers.learnSkill(heroId, skillId),
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
  portraitStyle
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
  templeRenderAdapter,
  systemsRenderAdapter
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

function populateStopNodes() {
  appCallbacks.populateStopNodes();
}

function portraitStyle(spriteIndex) {
  return appCallbacks.portraitStyle(spriteIndex);
}

function render() {
  appCallbacks.render();
}

function renderDungeonReplay() {
  appCallbacks.renderDungeonReplay();
}

function replaySpeedLabel() {
  return appCallbacks.replaySpeedLabel();
}

function selectLocation(locationId) {
  appCallbacks.selectLocation(locationId);
}
}


