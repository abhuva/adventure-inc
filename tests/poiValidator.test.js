import test from "node:test";
import assert from "node:assert/strict";

import { validatePoiData } from "../src/data/validators/poiValidator.js";

test("validatePoiData accepts minimal valid shape", () => {
  assert.doesNotThrow(() => validatePoiData({
    tavern: { coord: { x: 1, y: 2 } },
    workSites: [],
    dungeons: []
  }));
});

test("validatePoiData rejects missing tavern coordinates", () => {
  assert.throws(() => validatePoiData({
    tavern: {},
    workSites: [],
    dungeons: []
  }), /invalid tavern coordinate/);
});
