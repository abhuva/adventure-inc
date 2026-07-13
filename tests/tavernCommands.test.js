import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { BLUEPRINTS } from "../src/game/blueprints/blueprints.js";
import { assignWorker, tavernUpgradeCost, upgradeTavern } from "../src/game/tavern/tavernCommands.js";

test("tavernUpgradeCost uses bunk room blueprint when discovered", () => {
  const state = createInitialState();
  assert.deepEqual(tavernUpgradeCost(state, BLUEPRINTS), { wood: 10, ore: 4 });
  state.blueprints.bunkRoom = true;
  assert.deepEqual(tavernUpgradeCost(state, BLUEPRINTS), BLUEPRINTS.bunkRoom.cost);
});

test("upgradeTavern pays cost and increases capacity/population", () => {
  const state = createInitialState();
  let paid = null;

  const result = upgradeTavern(state, BLUEPRINTS, { canPay: () => true, pay: (cost) => { paid = cost; } });

  assert.equal(result.ok, true);
  assert.equal(state.tavern.capacity, 4);
  assert.equal(state.tavern.population, 3);
  assert.deepEqual(paid, { wood: 10, ore: 4 });
});

test("upgradeTavern blocks unaffordable upgrades", () => {
  const state = createInitialState();
  const result = upgradeTavern(state, BLUEPRINTS, { canPay: () => false });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "cost");
  assert.equal(state.tavern.capacity, 3);
});

test("assignWorker moves one worker between known job buckets", () => {
  const state = createInitialState();

  const result = assignWorker(state, "wood");

  assert.equal(result.ok, true);
  assert.deepEqual(state.tavern.jobs, { wood: 2, ore: 0 });
  assert.equal(assignWorker(state, "wood").reason, "no worker");
});
