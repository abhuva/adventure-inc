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

test("resolveNode treats miniboss nodes with enemies as combat encounters", () => {
  const actors = createPartyCombatActors([hero({
    base: { hp: 58, atk: 10, def: 3, utility: 2 },
    hp: 58
  })]);
  const timeline = [];
  const result = resolveNode({
    id: "scent_warden",
    name: "Scent Warden",
    type: "miniboss",
    enemy: {
      hp: 46,
      atk: 7,
      def: 1,
      initiative: 42,
      speed: 24,
      script: ["bite", "shriek", "guard", "heavy"]
    }
  }, {
    hpMax: 58,
    hpCurrent: 58,
    atk: 10,
    def: 3,
    utility: 2,
    travelSpeed: 0,
    recoveryReduce: 0,
    foodCostReduce: 0
  }, actors, "balanced", timeline);

  assert.equal(timeline[0].type, "combat_start");
  assert.equal(timeline.some((event) => event.type === "enemy"), true);
  assert.notEqual(result.summary, "objective secured");
});
