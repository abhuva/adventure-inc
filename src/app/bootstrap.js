export function registerAppBootstrap({
  documentRef,
  windowRef,
  state,
  bindElements,
  setupControls,
  loadPoiData,
  setPoiData,
  populateDungeonSelect,
  populatePartySelect,
  addLog,
  renderSystems,
  render,
  renderMapActors,
  currentVisualHourFraction,
  startMapLoop = startMapAnimationLoop
}) {
  documentRef.addEventListener("DOMContentLoaded", async () => {
    bindElements();
    setupControls();
    try {
      setPoiData(await loadPoiData());
    } catch (error) {
      addLog(`POI data load failed: ${error.message}`, "bad");
      renderSystems();
      throw error;
    }
    populateDungeonSelect();
    populatePartySelect();
    addLog("system ready: deterministic prototype loaded", "ok");
    render();
    startMapLoop({
      windowRef,
      state,
      renderMapActors,
      currentVisualHourFraction
    });
  });
}

export function startMapAnimationLoop({
  windowRef,
  state,
  renderMapActors,
  currentVisualHourFraction
}) {
  const frame = () => {
    if (state.activeTab === "map" && state.timeRunning) {
      renderMapActors(currentVisualHourFraction());
    }
    windowRef.requestAnimationFrame(frame);
  };
  windowRef.requestAnimationFrame(frame);
}
