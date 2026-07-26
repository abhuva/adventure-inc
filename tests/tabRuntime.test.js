import assert from "node:assert/strict";
import test from "node:test";

import {
  setActiveByDataset,
  setPopulationLocalTabActive,
  setMapSideTabActive,
  setRosterDetailTabActive,
  setTavernDetailTabActive,
  setTopTabActive
} from "../src/ui/tabRuntime.js";

function fakeElement(dataset = {}) {
  const classes = new Set();
  return {
    dataset,
    classList: {
      toggle(name, active) {
        if (active) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
      },
      contains(name) {
        return classes.has(name);
      }
    }
  };
}

function fakeDocument(selectors) {
  return {
    querySelectorAll(selector) {
      return selectors[selector] || [];
    }
  };
}

test("setActiveByDataset toggles active class on matching buttons and panels", () => {
  const mapButton = fakeElement({ tab: "map" });
  const rosterButton = fakeElement({ tab: "roster" });
  const mapPanel = fakeElement({ tabPanel: "map" });
  const rosterPanel = fakeElement({ tabPanel: "roster" });

  setActiveByDataset({
    buttons: [mapButton, rosterButton],
    panels: [mapPanel, rosterPanel],
    activeId: "roster",
    buttonDatasetKey: "tab",
    panelDatasetKey: "tabPanel"
  });

  assert.equal(mapButton.classList.contains("active"), false);
  assert.equal(rosterButton.classList.contains("active"), true);
  assert.equal(mapPanel.classList.contains("active"), false);
  assert.equal(rosterPanel.classList.contains("active"), true);
});

test("setTopTabActive queries top tab selectors", () => {
  const mapButton = fakeElement({ tab: "map" });
  const mapPanel = fakeElement({ tabPanel: "map" });
  const documentRef = fakeDocument({
    "[data-tab]": [mapButton],
    "[data-tab-panel]": [mapPanel]
  });

  setTopTabActive(documentRef, "map");

  assert.equal(mapButton.classList.contains("active"), true);
  assert.equal(mapPanel.classList.contains("active"), true);
});

test("setMapSideTabActive queries map side tab selectors", () => {
  const infoButton = fakeElement({ mapSideTab: "info" });
  const operationButton = fakeElement({ mapSideTab: "operations" });
  const infoPanel = fakeElement({ mapSidePanel: "info" });
  const operationPanel = fakeElement({ mapSidePanel: "operations" });
  const documentRef = fakeDocument({
    "[data-map-side-tab]": [infoButton, operationButton],
    "[data-map-side-panel]": [infoPanel, operationPanel]
  });

  setMapSideTabActive(documentRef, "operations");

  assert.equal(infoButton.classList.contains("active"), false);
  assert.equal(operationButton.classList.contains("active"), true);
  assert.equal(infoPanel.classList.contains("active"), false);
  assert.equal(operationPanel.classList.contains("active"), true);
});

test("setPopulationLocalTabActive queries population local tab selectors", () => {
  const populationButton = fakeElement({ populationLocalTab: "population" });
  const workshopButton = fakeElement({ populationLocalTab: "workshop" });
  const populationPanel = fakeElement({ populationLocalPanel: "population" });
  const workshopPanel = fakeElement({ populationLocalPanel: "workshop" });
  const documentRef = fakeDocument({
    "[data-population-local-tab]": [populationButton, workshopButton],
    "[data-population-local-panel]": [populationPanel, workshopPanel]
  });

  setPopulationLocalTabActive(documentRef, "workshop");

  assert.equal(populationButton.classList.contains("active"), false);
  assert.equal(workshopButton.classList.contains("active"), true);
  assert.equal(populationPanel.classList.contains("active"), false);
  assert.equal(workshopPanel.classList.contains("active"), true);
});

test("setRosterDetailTabActive queries roster detail tab selectors", () => {
  const infoButton = fakeElement({ rosterDetailTab: "info" });
  const skillButton = fakeElement({ rosterDetailTab: "skill1" });
  const infoPanel = fakeElement({ rosterDetailPanel: "info" });
  const skillPanel = fakeElement({ rosterDetailPanel: "skill1" });
  const documentRef = fakeDocument({
    "[data-roster-detail-tab]": [infoButton, skillButton],
    "[data-roster-detail-panel]": [infoPanel, skillPanel]
  });

  setRosterDetailTabActive(documentRef, "skill1");

  assert.equal(infoButton.classList.contains("active"), false);
  assert.equal(skillButton.classList.contains("active"), true);
  assert.equal(infoPanel.classList.contains("active"), false);
  assert.equal(skillPanel.classList.contains("active"), true);
});

test("setTavernDetailTabActive queries tavern detail tab selectors", () => {
  const infoButton = fakeElement({ tavernDetailTab: "info" });
  const skillButton = fakeElement({ tavernDetailTab: "skill1" });
  const infoPanel = fakeElement({ tavernDetailPanel: "info" });
  const skillPanel = fakeElement({ tavernDetailPanel: "skill1" });
  const documentRef = fakeDocument({
    "[data-tavern-detail-tab]": [infoButton, skillButton],
    "[data-tavern-detail-panel]": [infoPanel, skillPanel]
  });

  setTavernDetailTabActive(documentRef, "skill1");

  assert.equal(infoButton.classList.contains("active"), false);
  assert.equal(skillButton.classList.contains("active"), true);
  assert.equal(infoPanel.classList.contains("active"), false);
  assert.equal(skillPanel.classList.contains("active"), true);
});
