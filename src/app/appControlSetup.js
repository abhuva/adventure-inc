import { setupControls as setupControlBindings } from "./controlBindings.js";

export function setupAppControls({
  documentRef,
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
}) {
  setupControlBindings({
    documentRef,
    on,
    el,
    handlers: {
      addParty: () => partyCommandHandlers.addParty(),
      advanceTime: (hours, report) => timeCommandHandlers.advanceTime(hours, report),
      assignWorker: (job) => rosterTavernCommandHandlers.assignWorker(job),
      automateLastEstimate: () => dungeonCommandHandlers.automateLastEstimate(),
      clearLog: () => appShellCommandHandlers.clearLog(),
      commitLastEstimate: () => dungeonCommandHandlers.commitLastEstimate(),
      craft: (id) => rosterTavernCommandHandlers.craft(id),
      cycleReplaySpeed: () => replayCommandHandlers.cycleReplaySpeed(),
      onDungeonSelectChange: () => appShellCommandHandlers.onDungeonSelectChange(),
      onPartySelectChange: () => appShellCommandHandlers.onPartySelectChange(),
      replayCursor: () => state.dungeonReplay.cursor,
      replayLastCursor: () => state.dungeonReplay.events.length - 1,
      setMapSideTab: (tabId) => appShellCommandHandlers.setMapSideTab(tabId),
      setReplayCursor: (cursor, renderReplayOnly) => replayCommandHandlers.setReplayCursor(cursor, renderReplayOnly),
      setTab: (tabId) => appShellCommandHandlers.setTab(tabId),
      setupMapInteractions,
      simulateSelectedRun: () => dungeonCommandHandlers.simulateSelectedRun(),
      toggleAutoTime: () => timeCommandHandlers.toggleAutoTime(),
      toggleReplayPlayback: () => replayCommandHandlers.toggleReplayPlayback(),
      toggleRosterView: () => rosterTavernCommandHandlers.toggleRosterView(),
      upgradeTavern: () => rosterTavernCommandHandlers.upgradeTavern()
    }
  });
}
