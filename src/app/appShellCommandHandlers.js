import { clearLogEntries } from "./logRuntime.js";
import { clearDungeonEstimate } from "./planInvalidation.js";
import { setMapSideTabActive, setTopTabActive } from "../ui/tabRuntime.js";

export function createAppShellCommandHandlers({
  state,
  documentRef,
  controls,
  replayTimerApi,
  populateStopNodes,
  render
}) {
  return {
    clearLog() {
      clearLogEntries(state);
      render();
    },

    onDungeonSelectChange() {
      populateStopNodes();
      clearDungeonEstimate(state, replayTimerApi());
      render();
    },

    onPartySelectChange() {
      state.selectedPartyId = controls.partySelectValue();
      clearDungeonEstimate(state, replayTimerApi());
      render();
    },

    setTab(tabId) {
      state.activeTab = tabId;
      setTopTabActive(documentRef, tabId);
    },

    setMapSideTab(tabId) {
      setMapSideTabActive(documentRef, tabId);
    }
  };
}
