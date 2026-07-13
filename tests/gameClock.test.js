import assert from "node:assert/strict";
import test from "node:test";
import { advanceClock, advanceWorkerCycles, applyDailyTavernIncome, dailyTavernIncome, normalizeClock } from "../src/game/time/gameClock.js";

test("dailyTavernIncome derives food from fame and coin from population", () => {
  assert.deepEqual(dailyTavernIncome({ fame: 0, population: 1 }), { food: 2, coin: 1 });
  assert.deepEqual(dailyTavernIncome({ fame: 7, population: 6 }), { food: 4, coin: 3 });
});

test("applyDailyTavernIncome mutates explicit state resources", () => {
  const state = { tavern: { fame: 3, population: 4 }, resources: { food: 1, coin: 2 } };
  const income = applyDailyTavernIncome(state);

  assert.deepEqual(income, { food: 3, coin: 2 });
  assert.deepEqual(state.resources, { food: 4, coin: 4 });
});

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
