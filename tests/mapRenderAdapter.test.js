import assert from "node:assert/strict";
import test from "node:test";

import { createMapRenderAdapter } from "../src/app/mapRenderAdapter.js";

function fakeButton(dataset = {}) {
  return {
    dataset,
    id: dataset.id || "",
    closest(selector) {
      if (selector === "[data-location-id]" && this.dataset.locationId) return this;
      if (selector === "[data-map-context-action]" && this.dataset.mapContextAction) return this;
      if (selector === "#assignSelectedPartyBtn" && this.id === "assignSelectedPartyBtn") return this;
      return null;
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
    },
    contains(element) {
      return buttons.includes(element);
    }
  };
}

function createHarness() {
  const calls = [];
  const cellarButton = fakeButton({ locationId: "cellar" });
  const contextRunButton = fakeButton({ mapContextAction: "run" });
  const contextCancelButton = fakeButton({ mapContextAction: "cancel" });
  const assignButton = fakeButton({ id: "assignSelectedPartyBtn" });
  const mapWorld = fakeElement();
  const mapActors = fakeElement();
  const el = {
    overlandMap: fakeElement([cellarButton, contextRunButton, contextCancelButton]),
    locationDetail: fakeElement([assignButton]),
    operationRows: fakeElement(),
    poiRows: fakeElement(),
    logRows: fakeElement(),
    mapStatus: fakeElement()
  };
  const state = {
    selectedLocationId: "cellar",
    mapView: { panX: 10, panY: 20, zoom: 2 },
    tavern: { jobs: { wood: 1 } },
    workerProgress: { wood: 0 },
    operations: [],
    repeatedPlans: {},
    mapContextMenu: { locationId: "cellar", x: 12, y: 24 },
    resources: { food: 4 },
    log: [{ type: "ok", stamp: "d1 00:00", text: "ready" }]
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
    mapWorld: () => ({ width: 2048, height: 1024, backgroundImage: "assets/map-bg.png" }),
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
    selectLocationFromMap: (locationId, point) => calls.push(["mapSelect", locationId, point.x, point.y]),
    closeMapContextMenu: () => calls.push("cancelContext"),
    assignSelectedPartyToSelectedDungeon: () => calls.push("assign")
  });
  return { adapter, calls, el, mapWorld, mapActors, cellarButton, contextRunButton, contextCancelButton, assignButton };
}

test("map render adapter applies transform and status text", () => {
  const { adapter, el, mapWorld } = createHarness();

  adapter.applyMapTransform();

  assert.match(mapWorld.style.transform, /translate\(10px, 20px\) scale\(2\)/);
  assert.match(el.mapStatus.textContent, /zoom 2.00x/);
  assert.match(el.mapStatus.textContent, /world 2048x1024/);
});

test("map render adapter omits worker markers from actor layer", () => {
  const { adapter, mapActors } = createHarness();

  adapter.renderMapActors(0.25);

  assert.equal(mapActors.innerHTML, "");
});

test("map render adapter renders selected location detail and binds assignment", () => {
  const { adapter, calls, el, assignButton } = createHarness();

  adapter.renderLocationDetail();
  el.locationDetail.onclick({ target: assignButton });

  assert.match(el.locationDetail.innerHTML, /Rat Cellar/);
  assert.match(el.locationDetail.innerHTML, /selected party: Alpha/);
  assert.deepEqual(calls, ["assign"]);
});

test("map render adapter renders full map panel and binds POI clicks", () => {
  const { adapter, calls, el, cellarButton, contextRunButton, contextCancelButton } = createHarness();

  adapter.renderMap();
  el.overlandMap.onclick({ target: cellarButton, clientX: 30, clientY: 40 });
  el.overlandMap.onclick({ target: contextRunButton });
  el.overlandMap.onclick({ target: contextCancelButton });

  assert.match(el.overlandMap.innerHTML, /map-world/);
  assert.match(el.overlandMap.innerHTML, /map-context-menu/);
  assert.match(el.poiRows.innerHTML, /Rat Cellar/);
  assert.match(el.logRows.innerHTML, /ready/);
  assert.deepEqual(calls, [["mapSelect", "cellar", 30, 40], "assign", "cancelContext"]);
});
