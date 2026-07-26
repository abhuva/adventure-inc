import { clearLogEntries } from "./logRuntime.js";
import { clearDungeonEstimate } from "./planInvalidation.js";
import { EVENT_TRIGGERS } from "../game/events/eventDefinitions.js";
import { unlockPopulationLocations } from "../game/progression/worldProgression.js";
import {
  setDungeonLocalTabActive,
  setMapSideTabActive,
  setPopulationLocalTabActive,
  setRosterDetailTabActive,
  setTavernDetailTabActive,
  setTopTabActive
} from "../ui/tabRuntime.js";

export function createAppShellCommandHandlers({
  state,
  documentRef,
  controls,
  replayTimerApi,
  populateStopNodes,
  render,
  triggerEvent,
  saveNow: saveNowCallback,
  resetSave: resetSaveCallback
}) {
  return {
    clearLog() {
      clearLogEntries(state);
      render();
    },

    saveNow() {
      const result = saveNowCallback?.();
      if (!result || result.ok) {
        render();
      }
      return result;
    },

    resetSave() {
      return resetSaveCallback?.();
    },

    onDungeonSelectChange() {
      populateStopNodes();
      clearDungeonEstimate(state, replayTimerApi());
      render();
    },

    onPartySelectChange() {
      state.selectedPartyId = controls.partySelectValue();
      controls.setMapPartySelectValue?.(state.selectedPartyId);
      clearDungeonEstimate(state, replayTimerApi());
      render();
    },

    onMapPartySelectChange() {
      state.selectedPartyId = controls.mapPartySelectValue();
      controls.setPartySelectValue?.(state.selectedPartyId);
      clearDungeonEstimate(state, replayTimerApi());
      render();
    },

    setTab(tabId) {
      state.activeTab = tabId;
      if (tabId === "population") {
        unlockPopulationLocations(state);
      }
      setTopTabActive(documentRef, tabId);
      const trigger = {
        tavern: EVENT_TRIGGERS.TAB_TAVERN,
        population: EVENT_TRIGGERS.TAB_POPULATION,
        roster: EVENT_TRIGGERS.TAB_ROSTER,
        dungeon: EVENT_TRIGGERS.TAB_DUNGEON
      }[tabId];
      if (trigger) triggerEvent?.(trigger);
      saveNowCallback?.();
    },

    setMapSideTab(tabId) {
      setMapSideTabActive(documentRef, tabId);
    },

    setDungeonLocalTab(tabId) {
      setDungeonLocalTabActive(documentRef, tabId);
    },

    setPopulationLocalTab(tabId) {
      setPopulationLocalTabActive(documentRef, tabId);
    },

    setRosterDetailTab(tabId) {
      state.activeRosterDetailTab = tabId;
      setRosterDetailTabActive(documentRef, tabId);
    },

    setTavernDetailTab(tabId) {
      state.activeTavernDetailTab = tabId;
      setTavernDetailTabActive(documentRef, tabId);
    }
  };
}
