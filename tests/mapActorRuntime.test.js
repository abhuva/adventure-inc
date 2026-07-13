import assert from "node:assert/strict";
import test from "node:test";

import { workerCoord } from "../src/game/map/mapActorRuntime.js";

function assertNear(actual, expected, epsilon = 0.000001) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} should be close to ${expected}`);
}

const site = {
  id: "wood",
  cycleHours: 10,
  coord: { x: 100, y: 0 }
};
const tavernCoord = { x: 0, y: 0 };

function coordFor(progress, hourFraction = 0) {
  return workerCoord({
    job: "wood",
    site,
    workerProgress: { wood: progress },
    jobCounts: { wood: 1 },
    tavernCoord,
    hourFraction
  });
}

test("workerCoord interpolates outbound from tavern to work site", () => {
  assert.deepEqual(coordFor(0), { x: 0, y: 0 });
  assert.equal(coordFor(1.75).x, 50);
});

test("workerCoord stays at the work site during the work phase", () => {
  assert.deepEqual(coordFor(4), site.coord);
  assert.deepEqual(coordFor(6), site.coord);
});

test("workerCoord interpolates back to tavern during return phase", () => {
  assertNear(coordFor(8.25).x, 50);
  assertNear(coordFor(9.999).x, 0.028571428571424917);
  assert.equal(coordFor(9.999).y, 0);
});

test("workerCoord includes visual hour fraction scaled by assigned workers", () => {
  const coord = workerCoord({
    job: "wood",
    site,
    workerProgress: { wood: 0 },
    jobCounts: { wood: 2 },
    tavernCoord,
    hourFraction: 0.875
  });

  assert.equal(coord.x, 50);
});

test("workerCoord handles zero cycle sites as tavern position", () => {
  assert.deepEqual(workerCoord({
    job: "wood",
    site: { ...site, cycleHours: 0 },
    workerProgress: { wood: 5 },
    jobCounts: { wood: 1 },
    tavernCoord,
    hourFraction: 0
  }), tavernCoord);
});
