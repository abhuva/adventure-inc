import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { BLUEPRINTS } from "../src/game/blueprints/blueprints.js";
import { craftBlueprint } from "../src/game/roster/craftingCommands.js";

function hero() {
  return { id: "ada", name: "Ada", gear: [] };
}

test("craftBlueprint blocks undiscovered, unaffordable, and duplicate crafts", () => {
  const state = createInitialState();
  const target = hero();

  assert.equal(craftBlueprint(state, "ironBlade", BLUEPRINTS, target).reason, "not discovered");
  state.blueprints.ironBlade = true;
  assert.equal(craftBlueprint(state, "ironBlade", BLUEPRINTS, target, { canPay: () => false }).reason, "cost");
  target.gear.push("ironBlade");
  assert.equal(craftBlueprint(state, "ironBlade", BLUEPRINTS, target, { canPay: () => true }).reason, "already equipped");
});

test("craftBlueprint pays cost, equips gear, tracks crafted count, and invalidates estimate", () => {
  const state = createInitialState();
  const target = hero();
  state.blueprints.ironBlade = true;
  state.lastEstimate = { id: "cached" };
  let paid = null;

  const result = craftBlueprint(state, "ironBlade", BLUEPRINTS, target, { canPay: () => true, pay: (cost) => { paid = cost; } });

  assert.equal(result.ok, true);
  assert.deepEqual(target.gear, ["ironBlade"]);
  assert.equal(state.crafted.ironBlade, 1);
  assert.equal(state.lastEstimate, null);
  assert.deepEqual(paid, BLUEPRINTS.ironBlade.cost);
});
