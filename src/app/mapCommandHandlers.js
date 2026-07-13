import { mapRepeatedAssignmentMessage } from "./commandMessages.js";
import {
  clearDungeonEstimateOnly,
  setDungeonEstimateOnly
} from "./planInvalidation.js";
import { cloneEstimate } from "../game/dungeon/dungeonOperationModel.js";

export function createMapCommandHandlers({
  state,
  controls,
  selectedLocation,
  selectedParty,
  simulateRun,
  ensureRepeatedPlanQueued,
  populateStopNodes,
  addLog,
  render
}) {
  function logMessage(message) {
    if (!message) return;
    addLog(message.text, message.type);
  }

  return {
    selectLocation(locationId) {
      state.selectedLocationId = locationId;
      const location = selectedLocation();
      if (location.type === "dungeon") {
        controls.setDungeon(location.id);
        populateStopNodes();
        clearDungeonEstimateOnly(state);
      }
      render();
    },

    assignSelectedPartyToSelectedDungeon() {
      const location = selectedLocation();
      if (location.type !== "dungeon") return;
      const party = selectedParty();
      const estimate = simulateRun({
        dungeon: location.dungeon,
        strategy: controls.strategy(),
        stopNode: controls.stopNode(),
        party
      });
      setDungeonEstimateOnly(state, estimate);
      state.repeatedPlans[party.id] = cloneEstimate(estimate);
      logMessage(mapRepeatedAssignmentMessage(party.name, estimate.dungeonName));
      ensureRepeatedPlanQueued(party.id);
      render();
    }
  };
}
