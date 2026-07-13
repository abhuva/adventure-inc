import assert from "node:assert/strict";
import test from "node:test";

import {
  setActiveByDataset,
  setMapSideTabActive,
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
