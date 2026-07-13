export function setupControls({ documentRef, on, el, handlers }) {
  documentRef.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setTab(button.dataset.tab));
  });
  documentRef.querySelectorAll("[data-map-side-tab]").forEach((button) => {
    button.addEventListener("click", () => handlers.setMapSideTab(button.dataset.mapSideTab));
  });
  on("advanceHourBtn", "click", () => handlers.advanceTime(1, true));
  on("advanceDayBtn", "click", () => handlers.advanceTime(24, true));
  on("advanceTavernDayBtn", "click", () => handlers.advanceTime(24, true));
  on("autoTimeBtn", "click", handlers.toggleAutoTime);
  on("upgradeTavernBtn", "click", handlers.upgradeTavern);
  on("assignWoodBtn", "click", () => handlers.assignWorker("wood"));
  on("assignOreBtn", "click", () => handlers.assignWorker("ore"));
  on("addPartyBtn", "click", handlers.addParty);
  on("craftBladeBtn", "click", () => handlers.craft("ironBlade"));
  on("craftWardBtn", "click", () => handlers.craft("wardCharm"));
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
  el.replayTimelineSlider.addEventListener("input", () => {
    handlers.setReplayCursor(Number(el.replayTimelineSlider.value), true);
  });
  on("clearLogBtn", "click", handlers.clearLog);
  handlers.setupMapInteractions();
  el.dungeonSelect.addEventListener("change", handlers.onDungeonSelectChange);
  el.partySelect.addEventListener("change", handlers.onPartySelectChange);
}
