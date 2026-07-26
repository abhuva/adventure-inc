export function setupControls({ documentRef, on, el, handlers }) {
  documentRef.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setTab(button.dataset.tab));
  });
  documentRef.querySelectorAll("[data-map-side-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setMapSideTab(button.dataset.mapSideTab));
  });
  documentRef.querySelectorAll("[data-dungeon-local-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setDungeonLocalTab(button.dataset.dungeonLocalTab));
  });
  documentRef.querySelectorAll("[data-population-local-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setPopulationLocalTab(button.dataset.populationLocalTab));
  });
  documentRef.querySelectorAll("[data-roster-detail-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setRosterDetailTab(button.dataset.rosterDetailTab));
  });
  documentRef.querySelectorAll("[data-tavern-detail-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setTavernDetailTab(button.dataset.tavernDetailTab));
  });
  on("advanceDayBtn", "click", () => handlers.advanceTime(24, true));
  on("autoTimeBtn", "click", handlers.toggleAutoTime);
  on("upgradeTavernBtn", "click", handlers.upgradeTavern);
  on("buildHousesBtn", "click", handlers.buildHouses);
  on("addPartyBtn", "click", handlers.addParty);
  on("toggleRosterViewBtn", "click", handlers.toggleRosterView);
  on("simulateBtn", "click", handlers.simulateSelectedRun);
  on("commitBtn", "click", handlers.commitLastEstimate);
  on("autoBtn", "click", handlers.automateLastEstimate);
  on("replayFirstBtn", "click", () => handlers.setReplayCursor(0));
  on("replayPrevBtn", "click", () => handlers.setReplayCursor(handlers.replayCursor() - 1));
  on("replayPlayBtn", "click", handlers.toggleReplayPlayback);
  on("replayNextBtn", "click", () => handlers.setReplayCursor(handlers.replayCursor() + 1));
  on("replayLastBtn", "click", () => handlers.setReplayCursor(handlers.replayLastCursor()));
  on("replaySpeedBtn", "click", handlers.cycleReplaySpeed);
  on("saveNowBtn", "click", handlers.saveNow);
  on("resetSaveBtn", "click", handlers.resetSave);
  el.replayTimelineSlider.addEventListener("input", () => {
    handlers.setReplayCursor(Number(el.replayTimelineSlider.value), true);
  });
  on("clearLogBtn", "click", handlers.clearLog);
  handlers.setupMapInteractions();
  el.mapPartySelect.addEventListener("change", handlers.onMapPartySelectChange);
  el.dungeonSelect.addEventListener("change", handlers.onDungeonSelectChange);
  el.partySelect.addEventListener("change", handlers.onPartySelectChange);
  el.strategySelect.addEventListener("change", handlers.onStrategySelectChange);
}
