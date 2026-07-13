import assert from "node:assert/strict";
import test from "node:test";

import {
  renderLocationDetail,
  renderMapPanel
} from "../src/ui/mapPanel.js";

function fakeButton(dataset = {}) {
  const listeners = {};
  return {
    dataset,
    addEventListener(type, callback) {
      listeners[type] = callback;
    },
    click() {
      listeners.click?.();
    }
  };
}

function fakeElement(buttons = []) {
  return {
    innerHTML: "",
    querySelectorAll(selector) {
      return selector === "[data-location-id]" ? buttons : [];
    }
  };
}

function basePoi() {
  return [
    { id: "tavern", name: "Tavern", type: "tavern", coord: { x: 100, y: 100 }, description: "base" },
    {
      id: "cellar",
      name: "Rat Cellar",
      type: "dungeon",
      coord: { x: 200, y: 200 },
      description: "rats",
      dungeon: { id: "cellar" }
    }
  ];
}

test("renderLocationDetail writes details and binds assignment action", () => {
  const assignButton = fakeButton();
  const calls = [];
  const el = { locationDetail: fakeElement() };

  renderLocationDetail({
    documentRef: {
      getElementById(id) {
        return id === "assignSelectedPartyBtn" ? assignButton : null;
      }
    },
    el,
    location: basePoi()[1],
    party: { id: "party-1", name: "Alpha", memberIds: ["ada"] },
    partyReady: { canQueue: true, message: "ready" },
    tavernCoord: { x: 100, y: 100 },
    jobs: {},
    distanceText: () => "141.4",
    rewardText: () => "none",
    heroName: () => "Ada",
    onAssignSelectedParty: () => calls.push("assign")
  });

  assert.match(el.locationDetail.innerHTML, /Rat Cellar/);
  assert.match(el.locationDetail.innerHTML, /selected party: Alpha/);
  assignButton.click();
  assert.deepEqual(calls, ["assign"]);
});

test("renderMapPanel renders map sections and binds POI clicks", () => {
  const cellarButton = fakeButton({ locationId: "cellar" });
  const assignButton = fakeButton();
  const calls = [];
  const el = {
    overlandMap: fakeElement([cellarButton]),
    locationDetail: fakeElement(),
    operationRows: fakeElement(),
    poiRows: fakeElement()
  };

  renderMapPanel({
    documentRef: {
      getElementById(id) {
        return id === "assignSelectedPartyBtn" ? assignButton : null;
      }
    },
    el,
    poi: basePoi(),
    selectedLocationId: "cellar",
    selectedLocation: basePoi()[1],
    selectedParty: { id: "party-1", name: "Alpha", memberIds: [] },
    partyReady: { canQueue: false, message: "not ready" },
    tavernCoord: { x: 100, y: 100 },
    jobs: {},
    operations: [],
    repeatedPlans: {},
    resources: { food: 1 },
    currentOperationPhase: () => ({ phase: { name: "queued" }, remaining: 1 }),
    distanceText: () => "141.4",
    rewardText: () => "none",
    heroName: (id) => id,
    applyMapTransform: () => calls.push("transform"),
    renderMapActors: (hourFraction) => calls.push(["actors", hourFraction]),
    hourFraction: 0.5,
    onSelectLocation: (locationId) => calls.push(["select", locationId]),
    onAssignSelectedParty: () => calls.push("assign")
  });

  assert.match(el.overlandMap.innerHTML, /map-world/);
  assert.match(el.locationDetail.innerHTML, /Rat Cellar/);
  assert.match(el.operationRows.innerHTML, /no party operations queued/);
  assert.match(el.poiRows.innerHTML, /Rat Cellar/);

  cellarButton.click();
  assignButton.click();

  assert.deepEqual(calls, [
    "transform",
    ["actors", 0.5],
    ["select", "cellar"],
    "assign"
  ]);
});
