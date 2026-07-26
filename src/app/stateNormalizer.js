import { ensureSettlementState } from "../game/settlement/workforceModel.js";
import { ensureWorkSiteUpgradeState } from "../game/settlement/workSiteUpgrades.js";
import { ensureEventState } from "../game/events/eventRuntime.js";
import { ensureWorldProgressionState } from "../game/progression/worldProgression.js";
import { ensureTavernVisitorState } from "../game/roster/visitorQueue.js";
import { ensureWorkshopState } from "../game/workshop/workshopRuntime.js";

export function normalizeAppState(state) {
  ensureEventState(state);
  ensureWorldProgressionState(state);
  ensureTavernVisitorState(state);
  state.resources = {
    coin: 0,
    food: 0,
    wood: 0,
    ore: 0,
    hide: 0,
    planks: 0,
    comfort_goods: 0,
    training_bow: 0,
    ...(state.resources || {})
  };
  ensureSettlementState(state);
  ensureWorkSiteUpgradeState(state);
  ensureWorkshopState(state);
  state.activeRosterDetailTab = ["info", "skill1", "skill2"].includes(state.activeRosterDetailTab)
    ? state.activeRosterDetailTab
    : "info";
  state.activeTavernDetailTab = ["info", "skill1", "skill2"].includes(state.activeTavernDetailTab)
    ? state.activeTavernDetailTab
    : "info";
  state.selectedTavernVisitorId = state.selectedTavernVisitorId || null;
  state.workerProgress = {
    wood: 0,
    ore: 0,
    ...(state.workerProgress || {})
  };
  state.mapWorld = {
    width: 1024,
    height: 1024,
    backgroundImage: "assets/map-bg.png",
    ...(state.mapWorld || {})
  };
  state.mapContextMenu = state.mapContextMenu || null;
  state.roster = (state.roster || []).map((hero) => ({
    ...hero,
    base: {
      resolve: 10,
      ...(hero.base || {})
    }
  }));
  return state;
}
