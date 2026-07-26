import assert from "node:assert/strict";
import test from "node:test";
import { advanceClock, advanceWorkerCycles, normalizeClock } from "../src/game/time/gameClock.js";

test("advanceClock advances hours and emits day rollovers", () => {
  const state = { day: 1, hour: 22 };
  const seen = [];
  const rollovers = advanceClock(state, 5, (rollover) => seen.push(rollover.day));

  assert.deepEqual(state, { day: 2, hour: 3 });
  assert.deepEqual(rollovers, [{ day: 2, hour: 0 }]);
  assert.deepEqual(seen, [2]);
});

test("normalizeClock folds oversized hour values", () => {
  const state = { day: 1, hour: 50 };
  const rollovers = normalizeClock(state);

  assert.deepEqual(state, { day: 3, hour: 2 });
  assert.deepEqual(rollovers, [{ day: 2, hour: 0 }, { day: 3, hour: 0 }]);
});

test("advanceWorkerCycles accumulates progress and returns deterministic deliveries", () => {
  const outputs = [];
  const workerProgress = { wood: 1 };
  const deliveries = advanceWorkerCycles({
    workerProgress,
    jobs: { wood: 2 },
    workSites: [{ id: "wood", name: "Woodlot", cycleHours: 3, output: { wood: 1 } }],
    hours: 3,
    applyOutput: (output) => outputs.push(output)
  });

  assert.equal(workerProgress.wood, 1);
  assert.deepEqual(deliveries.map((delivery) => delivery.output), [{ wood: 1 }, { wood: 1 }]);
  assert.deepEqual(outputs, [{ wood: 1 }, { wood: 1 }]);
});
