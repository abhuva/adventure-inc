import assert from "node:assert/strict";
import test from "node:test";

import { createMapRenderAdapter } from "../src/app/mapRenderAdapter.js";

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
    textContent: "",
    style: {},
    querySelectorAll(selector) {
      return selector === "[data-location-id]" ? buttons : [];
    }
  };
}

function createHarness() {
  const calls = [];
  const cellarButton = fakeButton({ locationId: "cellar" });
  const assignButton = fakeButton();
  const mapWorld = fakeElement();
  const mapActors = fakeElement();
  const el = {
    overlandMap: fakeElement([cellarButton]),
    locationDetail: fakeElement(),
    operationRows: fakeElement(),
    poiRows: fakeElement(),
    mapStatus: fakeElement()
  };
  const state = {
    selectedLocationId: "cellar",
    mapView: { panX: 10, panY: 20, zoom: 2 },
    tavern: { jobs: { wood: 1 } },
    workerProgress: { wood: 0 },
    operations: [],
    repeatedPlans: {},
    resources: { food: 4 }
  };
  const poi = [
    { id: "tavern", name: "Tavern", type: "tavern", coord: { x: 100, y: 100 }, description: "base" },
    {
      id: "cellar",
      name: "Rat Cellar",
      type: "dungeon",
      coord: { x: 130, y: 140 },
      description: "rats",
      dungeon: { id: "cellar" }
    }
  ];
  const workSites = [{ id: "wood", name: "North Woodlot", coord: { x: 200, y: 100 }, cycleHours: 4 }];
  const documentRef = {
    getElementById(id) {
      if (id === "mapWorld") return mapWorld;
      if (id === "mapActors") return mapActors;
      if (id === "assignSelectedPartyBtn") return assignButton;
      return null;
    }
  };
  const adapter = createMapRenderAdapter({
    state,
    el,
    documentRef,
    worldSize: 1024,
    workSites: () => workSites,
    tavernCoord: () => poi[0].coord,
    mapLocations: () => poi,
    selectedLocation: () => poi.find((item) => item.id === state.selectedLocationId),
    selectedParty: () => ({ id: "party-1", name: "Alpha", memberIds: ["ada"] }),
    partyAssignmentReadiness: () => ({ canQueue: true, message: "ready" }),
    currentOperationPhase: () => ({ phase: { name: "queued", from: { x: 0, y: 0 }, to: { x: 0, y: 0 } }, progress: 0, remaining: 1 }),
    currentVisualHourFraction: () => 0.5,
    formatReward: () => "none",
    heroName: (id) => id,
    selectLocation: (locationId) => calls.push(["select", locationId]),
    assignSelectedPartyToSelectedDungeon: () => calls.push("assign")
  });
  return { adapter, calls, el, mapWorld, mapActors, cellarButton, assignButton };
}

test("map render adapter applies transform and status text", () => {
  const { adapter, el, mapWorld } = createHarness();

  adapter.applyMapTransform();

  assert.match(mapWorld.style.transform, /translate\(10px, 20px\) scale\(2\)/);
  assert.match(el.mapStatus.textContent, /zoom 2.00x/);
});

test("map render adapter renders actor layer from workers", () => {
  const { adapter, mapActors } = createHarness();

  adapter.renderMapActors(0.25);

  assert.match(mapActors.innerHTML, /North Woodlot workers: 1/);
});

test("map render adapter renders selected location detail and binds assignment", () => {
  const { adapter, calls, el, assignButton } = createHarness();

  adapter.renderLocationDetail();
  assignButton.click();

  assert.match(el.locationDetail.innerHTML, /Rat Cellar/);
  assert.match(el.locationDetail.innerHTML, /selected party: Alpha/);
  assert.deepEqual(calls, ["assign"]);
});

test("map render adapter renders full map panel and binds POI clicks", () => {
  const { adapter, calls, el, cellarButton, assignButton } = createHarness();

  adapter.renderMap();
  cellarButton.click();
  assignButton.click();

  assert.match(el.overlandMap.innerHTML, /map-world/);
  assert.match(el.poiRows.innerHTML, /Rat Cellar/);
  assert.deepEqual(calls, [["select", "cellar"], "assign"]);
});
