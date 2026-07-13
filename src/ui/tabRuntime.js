export function setActiveByDataset({ buttons, panels, activeId, buttonDatasetKey, panelDatasetKey }) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[buttonDatasetKey] === activeId);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset[panelDatasetKey] === activeId);
  });
}

export function setTopTabActive(documentRef, tabId) {
  setActiveByDataset({
    buttons: documentRef.querySelectorAll("[data-tab]"),
    panels: documentRef.querySelectorAll("[data-tab-panel]"),
    activeId: tabId,
    buttonDatasetKey: "tab",
    panelDatasetKey: "tabPanel"
  });
}

export function setMapSideTabActive(documentRef, tabId) {
  setActiveByDataset({
    buttons: documentRef.querySelectorAll("[data-map-side-tab]"),
    panels: documentRef.querySelectorAll("[data-map-side-panel]"),
    activeId: tabId,
    buttonDatasetKey: "mapSideTab",
    panelDatasetKey: "mapSidePanel"
  });
}
