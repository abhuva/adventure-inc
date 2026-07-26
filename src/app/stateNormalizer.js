import { ensureSettlementState } from "../game/settlement/workforceModel.js";
import { ensureWorkSiteUpgradeState } from "../game/settlement/workSiteUpgrades.js";
import { ensureEventState } from "../game/events/eventRuntime.js";
import {
  activateFocusedContinentResources,
  ensureContinentState,
  unlockExpeditionRoutesForDay
} from "../game/continent/continentState.js";
import { ensureWorldProgressionState } from "../game/progression/worldProgression.js";
import { ensureTavernVisitorState } from "../game/roster/visitorQueue.js";
import { createResourceState } from "../game/resources/resourceState.js";
import { ensureWorkshopState } from "../game/workshop/workshopRuntime.js";

export function normalizeAppState(state) {
  ensureEventState(state);
  ensureWorldProgressionState(state);
  state.resources = createResourceState(state.resources || {});
  ensureContinentState(state);
  unlockExpeditionRoutesForDay(state);
  activateFocusedContinentResources(state);
  ensureTavernVisitorState(state);
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
  state.mapWorldByContinent = state.mapWorldByContinent || {};
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
