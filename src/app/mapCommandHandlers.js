import {
  mapRepeatedAssignmentMessage,
  workSiteUpgradeResultMessage
} from "./commandMessages.js";
import {
  clearDungeonEstimateOnly,
  setDungeonEstimate
} from "./planInvalidation.js";
import { cloneEstimate } from "../game/dungeon/dungeonOperationModel.js";
import { upgradeWorkSite } from "../game/settlement/workSiteUpgrades.js";

export function createMapCommandHandlers({
  state,
  controls,
  selectedLocation,
  selectedParty,
  simulateRun,
  ensureRepeatedPlanQueued,
  replayTimerApi,
  populateDungeonSelect,
  populateStopNodes,
  setTab,
  setMapSideTab,
  selectExpeditionRoute,
  addLog,
  canPay,
  pay,
  render
}) {
  function logMessage(message) {
    if (!message) return;
    addLog(message.text, message.type);
  }

  function selectDungeonControls(dungeonId) {
    populateDungeonSelect?.();
    controls.setDungeon(dungeonId);
    populateStopNodes();
  }

  return {
    selectLocation(locationId) {
      state.selectedLocationId = locationId;
      state.mapContextMenu = null;
      const location = selectedLocation();
      if (!location) {
        setMapSideTab?.("info");
      } else if (location.type === "dungeon") {
        setMapSideTab?.("info");
        selectDungeonControls(location.id);
        clearDungeonEstimateOnly(state);
      } else if (location.type === "expedition") {
        selectExpeditionRoute?.(location.route.id);
        setMapSideTab?.("plan");
      } else {
        setMapSideTab?.("info");
      }
      render();
    },

    selectLocationFromMap(locationId, point = null) {
      state.selectedLocationId = locationId;
      const location = selectedLocation();
      state.mapContextMenu = location && ["dungeon", "expedition"].includes(location.type) && point
        ? { locationId, x: Math.max(0, point.x), y: Math.max(0, point.y) }
        : null;
      if (!location) {
        setMapSideTab?.("info");
      } else if (location.type === "dungeon") {
        setMapSideTab?.("info");
        selectDungeonControls(location.id);
        controls.setStopNode?.("all");
        controls.setRepeatMode?.("repeat");
        clearDungeonEstimateOnly(state);
      } else if (location.type === "expedition") {
        selectExpeditionRoute?.(location.route.id);
        setMapSideTab?.("plan");
      } else {
        setMapSideTab?.("info");
      }
      render();
    },

    closeMapContextMenu() {
      state.mapContextMenu = null;
      render();
    },

    upgradeSelectedWorkSite(siteId = selectedLocation()?.id) {
      const location = selectedLocation();
      if (location?.type !== "work" || location.id !== siteId) return;
      const result = upgradeWorkSite(state, siteId, { canPay, pay });
      logMessage(workSiteUpgradeResultMessage(result, location.name));
      render();
    },

    assignSelectedPartyToSelectedDungeon() {
      const location = selectedLocation();
      if (location?.type !== "dungeon") return;
      const party = selectedParty();
      selectDungeonControls(location.id);
      controls.setParty?.(party.id);
      controls.setStopNode?.("all");
      controls.setRepeatMode?.("repeat");
      const estimate = simulateRun({
        dungeon: location.dungeon,
        strategy: controls.strategy(),
        stopNode: "all",
        party
      });
      setDungeonEstimate(state, estimate, replayTimerApi?.());
      state.repeatedPlans[party.id] = cloneEstimate(estimate);
      state.mapContextMenu = null;
      logMessage(mapRepeatedAssignmentMessage(party.name, estimate.dungeonName));
      ensureRepeatedPlanQueued(party.id);
      setTab?.("dungeon");
      render();
    },

    runSelectedExpedition() {
      const location = selectedLocation();
      if (location?.type !== "expedition") return;
      selectExpeditionRoute?.(location.route.id);
      state.mapContextMenu = null;
      setTab?.("map");
      setMapSideTab?.("plan");
      render();
    }
  };
}
