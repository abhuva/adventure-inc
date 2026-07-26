import { setupControls as setupControlBindings } from "./controlBindings.js";

export function setupAppControls({
  documentRef,
  on,
  el,
  state,
  appShellCommandHandlers,
  dungeonCommandHandlers,
  expeditionCommandHandlers,
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
      buildHouses: () => rosterTavernCommandHandlers.buildHouses(),
      clearLog: () => appShellCommandHandlers.clearLog(),
      commitLastEstimate: () => dungeonCommandHandlers.commitLastEstimate(),
      craft: (id) => rosterTavernCommandHandlers.craft(id),
      cycleReplaySpeed: () => replayCommandHandlers.cycleReplaySpeed(),
      focusSelectedContinent: () => expeditionCommandHandlers.focusSelectedContinent(),
      onDungeonSelectChange: () => appShellCommandHandlers.onDungeonSelectChange(),
      onExpeditionPartySelectChange: () => expeditionCommandHandlers.selectParty(el.expeditionPartySelect.value),
      onMapPartySelectChange: () => appShellCommandHandlers.onMapPartySelectChange(),
      onPartySelectChange: () => appShellCommandHandlers.onPartySelectChange(),
      onStrategySelectChange: () => dungeonCommandHandlers.resimulateSelectedRun(),
      replayCursor: () => state.dungeonReplay.cursor,
      replayLastCursor: () => state.dungeonReplay.events.length - 1,
      resetSave: () => appShellCommandHandlers.resetSave(),
      saveNow: () => appShellCommandHandlers.saveNow(),
      setDungeonLocalTab: (tabId) => appShellCommandHandlers.setDungeonLocalTab(tabId),
      setMapSideTab: (tabId) => appShellCommandHandlers.setMapSideTab(tabId),
      setPopulationLocalTab: (tabId) => appShellCommandHandlers.setPopulationLocalTab(tabId),
      setReplayCursor: (cursor, renderReplayOnly) => replayCommandHandlers.setReplayCursor(cursor, renderReplayOnly),
      setRosterDetailTab: (tabId) => appShellCommandHandlers.setRosterDetailTab(tabId),
      setTab: (tabId) => appShellCommandHandlers.setTab(tabId),
      setTavernDetailTab: (tabId) => appShellCommandHandlers.setTavernDetailTab(tabId),
      setupMapInteractions,
      simulateSelectedRun: () => dungeonCommandHandlers.simulateSelectedRun(),
      startSelectedExpedition: () => expeditionCommandHandlers.startSelectedExpedition(),
      toggleAutoTime: () => timeCommandHandlers.toggleAutoTime(),
      toggleReplayPlayback: () => replayCommandHandlers.toggleReplayPlayback(),
      toggleRosterView: () => rosterTavernCommandHandlers.toggleRosterView(),
      upgradeTavern: () => rosterTavernCommandHandlers.upgradeTavern()
    }
  });
}
