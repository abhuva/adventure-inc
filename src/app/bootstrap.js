export function registerAppBootstrap({
  documentRef,
  windowRef,
  state,
  bindElements,
  setupControls,
  loadPoiData,
  setPoiData,
  loadMapBackground,
  applyMapBackground,
  populateDungeonSelect,
  populatePartySelect,
  addLog,
  renderSystems,
  render,
  loadAutosave,
  startAutoTime,
  onStartupComplete,
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
    if (loadAutosave) {
      try {
        const result = loadAutosave();
        if (result.ok) {
          addLog(`autosave loaded${result.savedAt ? `: ${result.savedAt}` : ""}`, "ok");
        }
      } catch (error) {
        addLog(`autosave load failed: ${error.message}`, "bad");
      }
    }
    if (loadMapBackground && applyMapBackground) {
      try {
        applyMapBackground(await loadMapBackground());
      } catch (error) {
        addLog(error.message, "bad");
      }
    }
    populateDungeonSelect();
    populatePartySelect();
    addLog("system ready: deterministic prototype loaded", "ok");
    render();
    startAutoTime?.();
    startMapLoop({
      windowRef,
      state,
      renderMapActors,
      currentVisualHourFraction
    });
    onStartupComplete?.();
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
