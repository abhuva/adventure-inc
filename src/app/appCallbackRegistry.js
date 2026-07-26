export function createAppCallbackRegistry({
  appRenderHandlers,
  mapCommandHandlers,
  mapRenderAdapter,
  replayCommandHandlers,
  rosterRenderAdapter,
  selectControlAdapter,
  timeCommandHandlers
}) {
  return {
    applyMapTransform() {
      mapRenderAdapter.applyMapTransform();
    },
    assignSelectedPartyToSelectedDungeon() {
      mapCommandHandlers.assignSelectedPartyToSelectedDungeon();
    },
    currentVisualHourFraction() {
      return timeCommandHandlers.currentVisualHourFraction();
    },
    populateDungeonSelect() {
      selectControlAdapter.populateDungeonSelect();
    },
    populatePartySelect() {
      selectControlAdapter.populatePartySelect();
    },
    populateStopNodes() {
      selectControlAdapter.populateStopNodes();
    },
    portraitStyle(spriteIndex) {
      return rosterRenderAdapter.portraitStyle(spriteIndex);
    },
    render() {
      appRenderHandlers.render();
    },
    renderDungeonReplay() {
      appRenderHandlers.renderDungeonReplay();
    },
    renderLocationDetail() {
      appRenderHandlers.renderLocationDetail();
    },
    renderMapActors(hourFraction = 0) {
      appRenderHandlers.renderMapActors(hourFraction);
    },
    renderSystems() {
      appRenderHandlers.renderSystems();
    },
    renderTimeTick(activeTab, hourFraction = 0, options = {}) {
      appRenderHandlers.renderTimeTick(activeTab, hourFraction, options);
    },
    replaySpeedLabel() {
      return replayCommandHandlers.replaySpeedLabel();
    },
    selectLocation(locationId) {
      mapCommandHandlers.selectLocation(locationId);
    }
  };
}
