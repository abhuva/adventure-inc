import assert from "node:assert/strict";
import test from "node:test";

import { createAppQuerySetup } from "../src/app/appQuerySetup.js";

test("app query setup composes data, Temple, and selection facades", () => {
  const poiData = {
    tavern: { coord: { x: 10, y: 20 } },
    dungeons: [{ id: "rat_cellar", name: "Rat Cellar" }],
    workSites: []
  };
  const state = {
    selectedLocationId: "rat_cellar",
    selectedPartyId: "party_alpha",
    parties: [{ id: "party_alpha", memberIds: [] }],
    roster: [],
    operations: [],
    temple: {
      activeStoneId: "triangle",
      stones: { triangle: { slots: {}, activeLines: [] } },
      shards: {}
    }
  };
  const { appSelection, templeQueries } = createAppQuerySetup({
    state,
    el: {},
    dataContext: { getPoiData: () => poiData },
    colors: [{ id: "red", name: "Red" }],
    stones: [{ id: "triangle", sockets: [], lines: [] }],
    shards: [],
    inventorySlots: 4,
    skills: {},
    skillTrees: {}
  });

  assert.equal(appSelection.dungeons()[0].id, "rat_cellar");
  assert.equal(appSelection.selectedLocation().id, "rat_cellar");
  assert.equal(appSelection.selectedParty().id, "party_alpha");
  assert.equal(templeQueries.colorName("red"), "Red");
});
