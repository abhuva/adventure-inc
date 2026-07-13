import { bindAppElements } from "./domElements.js";

export function setupAppBootstrap({
  documentRef,
  windowRef,
  state,
  el,
  loadPoiData,
  setPoiData,
  setupControls,
  populateDungeonSelect,
  populatePartySelect,
  addLog,
  renderSystems,
  render,
  renderMapActors,
  currentVisualHourFraction,
  registerAppBootstrap,
  bindElements = bindAppElements
}) {
  registerAppBootstrap({
    documentRef,
    windowRef,
    state,
    bindElements: () => {
      Object.assign(el, bindElements());
    },
    setupControls,
    loadPoiData,
    setPoiData,
    populateDungeonSelect,
    populatePartySelect,
    addLog,
    renderSystems,
    render,
    renderMapActors,
    currentVisualHourFraction
  });
}
