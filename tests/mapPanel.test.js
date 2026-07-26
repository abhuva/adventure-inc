import assert from "node:assert/strict";
import test from "node:test";

import {
  renderLocationDetail,
  renderMapPanel
} from "../src/ui/mapPanel.js";

function fakeButton(dataset = {}) {
  return {
    dataset,
    id: dataset.id || "",
    closest(selector) {
      if (selector === "[data-location-id]" && this.dataset.locationId) return this;
      if (selector === "#assignSelectedPartyBtn" && this.id === "assignSelectedPartyBtn") return this;
      return null;
    }
  };
}

function fakeElement(buttons = []) {
  return {
    innerHTML: "",
    querySelectorAll(selector) {
      return selector === "[data-location-id]" ? buttons : [];
    },
    contains(element) {
      return buttons.includes(element);
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
  const assignButton = fakeButton({ id: "assignSelectedPartyBtn" });
  const calls = [];
  const el = { locationDetail: fakeElement([assignButton]) };

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
  el.locationDetail.onclick({ target: assignButton });
  assert.deepEqual(calls, ["assign"]);
});

test("renderMapPanel renders map sections and binds POI clicks", () => {
  const cellarButton = fakeButton({ locationId: "cellar" });
  const assignButton = fakeButton({ id: "assignSelectedPartyBtn" });
  const calls = [];
  const el = {
    overlandMap: fakeElement([cellarButton]),
    locationDetail: fakeElement([assignButton]),
    operationRows: fakeElement(),
    poiRows: fakeElement(),
    logRows: fakeElement()
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
    mapWorld: { width: 2048, height: 1536, backgroundImage: "assets/map-bg.png" },
    jobs: {},
    operations: [],
    repeatedPlans: {},
    logEntries: [{ type: "ok", stamp: "d1 00:00", text: "ready" }],
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
  assert.match(el.overlandMap.innerHTML, /--map-world-width:2048px/);
  assert.match(el.locationDetail.innerHTML, /Rat Cellar/);
  assert.match(el.operationRows.innerHTML, /no party operations queued/);
  assert.match(el.poiRows.innerHTML, /Rat Cellar/);
  assert.match(el.logRows.innerHTML, /ready/);

  el.overlandMap.onclick({ target: cellarButton });
  el.locationDetail.onclick({ target: assignButton });

  assert.deepEqual(calls, [
    "transform",
    ["actors", 0.5],
    ["select", "cellar"],
    "assign"
  ]);
});
