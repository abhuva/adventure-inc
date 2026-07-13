import assert from "node:assert/strict";
import test from "node:test";
import { repeatedPlanPartyIds, repeatedPlanQueueStatus, toggleRepeatedPlan } from "../src/game/dungeon/repeatedPlanAutomation.js";

const estimate = {
  partyId: "party-1",
  partyName: "Alpha",
  dungeonName: "Rat Cellar",
  foodCost: 2,
  rewards: {},
  transcript: [],
  timeline: []
};
const party = { id: "party-1", memberIds: ["ada"] };

test("toggleRepeatedPlan enables with cloned estimate and disables existing plans", () => {
  const repeatedPlans = {};
  const enabled = toggleRepeatedPlan(repeatedPlans, estimate);

  assert.equal(enabled.enabled, true);
  assert.notEqual(repeatedPlans["party-1"], estimate);
  repeatedPlans["party-1"].partyName = "Changed";
  assert.equal(estimate.partyName, "Alpha");

  const disabled = toggleRepeatedPlan(repeatedPlans, estimate);
  assert.equal(disabled.enabled, false);
  assert.equal(repeatedPlans["party-1"], undefined);
});

test("repeatedPlanQueueStatus returns none when no plan or operation already active", () => {
  assert.equal(repeatedPlanQueueStatus({ repeatedPlans: {}, operations: [], parties: [party], resources: {}, partyId: "party-1", readinessForParty: () => ({ canQueue: true }) }).action, "none");

  const status = repeatedPlanQueueStatus({
    repeatedPlans: { "party-1": estimate },
    operations: [{ partyId: "party-1" }],
    parties: [party],
    resources: { food: 99 },
    partyId: "party-1",
    readinessForParty: () => ({ canQueue: true })
  });
  assert.deepEqual({ action: status.action, reason: status.reason }, { action: "none", reason: "operation already active" });
});

test("repeatedPlanQueueStatus pauses on readiness and food, otherwise queues", () => {
  const base = {
    repeatedPlans: { "party-1": estimate },
    operations: [],
    parties: [party],
    partyId: "party-1"
  };

  const notReady = repeatedPlanQueueStatus({ ...base, resources: { food: 99 }, readinessForParty: () => ({ canQueue: false, message: "blocked" }) });
  assert.deepEqual({ action: notReady.action, reason: notReady.reason }, { action: "pause", reason: "blocked" });

  const noFood = repeatedPlanQueueStatus({ ...base, resources: { food: 1 }, readinessForParty: () => ({ canQueue: true }) });
  assert.deepEqual({ action: noFood.action, reason: noFood.reason }, { action: "pause", reason: "waiting for food 1/2" });

  const ready = repeatedPlanQueueStatus({ ...base, resources: { food: 2 }, readinessForParty: () => ({ canQueue: true }) });
  assert.equal(ready.action, "queue");
  assert.equal(ready.estimate, estimate);
});

test("repeatedPlanPartyIds returns current repeated plan ids", () => {
  assert.deepEqual(repeatedPlanPartyIds({ b: {}, a: {} }), ["b", "a"]);
});
