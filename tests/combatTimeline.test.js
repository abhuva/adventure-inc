import test from "node:test";
import assert from "node:assert/strict";

import { createPartyCombatActors, partyHpCurrent, resolveNode } from "../src/game/combat/combatTimeline.js";

function hero(overrides = {}) {
  return {
    id: "ada",
    name: "Ada",
    role: "Founder",
    level: 1,
    base: { hp: 42, atk: 7, def: 2, utility: 1 },
    hp: 42,
    spriteIndex: 0,
    gear: [],
    learnedSkills: {},
    ...overrides
  };
}

test("createPartyCombatActors derives deterministic initiative and speed", () => {
  const actors = createPartyCombatActors([hero()]);

  assert.equal(actors.length, 1);
  assert.equal(actors[0].initiative, 40);
  assert.equal(actors[0].speed, 23);
  assert.equal(actors[0].nextActionAt, 60);
});

test("resolveNode combat emits replay events and resolves deterministic victory", () => {
  const actors = createPartyCombatActors([hero()]);
  const timeline = [];
  const result = resolveNode({
    id: "rats",
    name: "Rat Pack",
    type: "combat",
    enemy: { hp: 18, atk: 3, script: ["bite", "bite", "scratch"] }
  }, {
    hpMax: 42,
    hpCurrent: 42,
    atk: 8,
    def: 2,
    utility: 1,
    travelSpeed: 0,
    recoveryReduce: 0,
    foodCostReduce: 0
  }, actors, "balanced", timeline);

  assert.equal(result.success, true);
  assert.equal(partyHpCurrent(actors) > 0, true);
  assert.equal(timeline.length > 1, true);
  assert.equal(timeline[0].type, "combat_start");
  assert.equal(timeline.some((event) => event.type === "attack"), true);
});
