import assert from "node:assert/strict";
import test from "node:test";

import {
  dungeonsFromPoi,
  mapLocationsFromPoi,
  selectedLocationFromPoi,
  tavernCoordFromPoi,
  workSiteById,
  workSitesFromPoi
} from "../src/data/poiSelectors.js";

const poi = {
  tavern: { id: "tavern", name: "Tavern", coord: { x: 5, y: 6 } },
  workSites: [
    { id: "wood", name: "Woodlot", coord: { x: 1, y: 2 }, cycleHours: 6, output: { wood: 3 } }
  ],
  dungeons: [
    { id: "cellar", name: "Rat Cellar", coord: { x: 8, y: 9 }, travelHours: 2, foodCost: 1, nodes: [] }
  ]
};

test("POI collection selectors tolerate missing data", () => {
  assert.deepEqual(dungeonsFromPoi(null), []);
  assert.deepEqual(workSitesFromPoi(null), []);
  assert.deepEqual(tavernCoordFromPoi(null), { x: 0, y: 0 });
  assert.equal(selectedLocationFromPoi(null, "anything"), null);
});

test("workSiteById returns the matching work site", () => {
  assert.equal(workSiteById(poi, "wood"), poi.workSites[0]);
  assert.equal(workSiteById(poi, "ore"), undefined);
});

test("mapLocationsFromPoi composes tavern, work sites, and dungeons", () => {
  const locations = mapLocationsFromPoi(poi);

  assert.equal(locations.length, 3);
  assert.deepEqual(locations.map((location) => location.type), ["tavern", "work", "dungeon"]);
  assert.equal(locations[1].description, "Worker route. Completes a deterministic delivery every 6 worker-hours.");
  assert.equal(locations[2].description, "Dungeon POI. Travel 2h each way, food cost 1.");
  assert.equal(locations[2].dungeon, poi.dungeons[0]);
});

test("selectedLocationFromPoi resolves selected id or falls back to tavern", () => {
  assert.equal(selectedLocationFromPoi(poi, "cellar").id, "cellar");
  assert.equal(selectedLocationFromPoi(poi, "missing").id, "tavern");
});
