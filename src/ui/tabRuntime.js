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

export function setDungeonLocalTabActive(documentRef, tabId) {
  setActiveByDataset({
    buttons: documentRef.querySelectorAll("[data-dungeon-local-tab]"),
    panels: documentRef.querySelectorAll("[data-dungeon-local-panel]"),
    activeId: tabId,
    buttonDatasetKey: "dungeonLocalTab",
    panelDatasetKey: "dungeonLocalPanel"
  });
}

export function setPopulationLocalTabActive(documentRef, tabId) {
  setActiveByDataset({
    buttons: documentRef.querySelectorAll("[data-population-local-tab]"),
    panels: documentRef.querySelectorAll("[data-population-local-panel]"),
    activeId: tabId,
    buttonDatasetKey: "populationLocalTab",
    panelDatasetKey: "populationLocalPanel"
  });
}

export function setRosterDetailTabActive(documentRef, tabId) {
  setActiveByDataset({
    buttons: documentRef.querySelectorAll("[data-roster-detail-tab]"),
    panels: documentRef.querySelectorAll("[data-roster-detail-panel]"),
    activeId: tabId,
    buttonDatasetKey: "rosterDetailTab",
    panelDatasetKey: "rosterDetailPanel"
  });
}

export function setTavernDetailTabActive(documentRef, tabId) {
  setActiveByDataset({
    buttons: documentRef.querySelectorAll("[data-tavern-detail-tab]"),
    panels: documentRef.querySelectorAll("[data-tavern-detail-panel]"),
    activeId: tabId,
    buttonDatasetKey: "tavernDetailTab",
    panelDatasetKey: "tavernDetailPanel"
  });
}
