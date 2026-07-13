import assert from "node:assert/strict";
import test from "node:test";
import {
  canScheduleEstimate,
  cloneEstimate,
  createPartyOperation,
  currentOperationPhase,
  operationTotalHours,
  partyAssignmentReadiness,
  queuedPartyHours
} from "../src/game/dungeon/dungeonOperationModel.js";

function sampleOperation(elapsed = 0) {
  return {
    partyId: "party-1",
    elapsed,
    phases: [
      { name: "outbound", hours: 2, from: { x: 0, y: 0 }, to: { x: 10, y: 0 } },
      { name: "dungeon", hours: 3, from: { x: 10, y: 0 }, to: { x: 10, y: 0 } },
      { name: "return", hours: 2, from: { x: 10, y: 0 }, to: { x: 0, y: 0 } }
    ]
  };
}

test("cloneEstimate deep-copies nested rewards, transcript, and replay actor snapshots", () => {
  const original = {
    rewards: { ore: 1 },
    transcript: ["a"],
    timeline: [{ type: "start", partyActors: [{ id: "ada", hp: 10 }], enemyActors: [] }]
  };

  const clone = cloneEstimate(original);
  clone.rewards.ore = 99;
  clone.transcript.push("b");
  clone.timeline[0].partyActors[0].hp = 1;

  assert.equal(original.rewards.ore, 1);
  assert.deepEqual(original.transcript, ["a"]);
  assert.equal(original.timeline[0].partyActors[0].hp, 10);
});

test("operationTotalHours sums all operation phases", () => {
  assert.equal(operationTotalHours(sampleOperation()), 7);
});

test("currentOperationPhase reports queued, active, and completed phases", () => {
  const queued = currentOperationPhase(sampleOperation(-2), { queuedCoord: { x: 5, y: 6 } });
  assert.equal(queued.phase.name, "queued");
  assert.deepEqual(queued.phase.from, { x: 5, y: 6 });

  const active = currentOperationPhase(sampleOperation(1));
  assert.equal(active.phase.name, "outbound");
  assert.equal(active.progress, 0.5);

  const complete = currentOperationPhase(sampleOperation(99));
  assert.equal(complete.phase.name, "return");
  assert.equal(complete.progress, 1);
  assert.equal(complete.remaining, 0);
});

test("queuedPartyHours sums remaining operation time for one party", () => {
  const operations = [sampleOperation(1), { ...sampleOperation(2), partyId: "party-2" }, sampleOperation(-1)];

  assert.equal(queuedPartyHours(operations, "party-1"), 14);
});

test("partyAssignmentReadiness blocks invalid parties and allows queued follow-up operations", () => {
  assert.equal(partyAssignmentReadiness({ party: null }).message, "blocked: party no longer exists");
  assert.equal(partyAssignmentReadiness({ party: { id: "p", memberIds: [] } }).message, "blocked: empty party");
  assert.equal(partyAssignmentReadiness({ party: { id: "p", memberIds: ["a"] }, fullyHealed: false }).message, "blocked: party must be in town and fully healed");

  const ready = partyAssignmentReadiness({
    party: { id: "party-1", memberIds: ["a"] },
    operations: [sampleOperation(1)],
    fullyHealed: false,
    phaseForOperation: () => ({ phase: { name: "outbound" } })
  });
  assert.deepEqual(ready, { canQueue: true, message: "will queue after outbound" });
});

test("canScheduleEstimate validates members, readiness, and food", () => {
  const estimate = { memberIds: ["ada"], foodCost: 2 };
  const party = { id: "party-1", memberIds: ["ada"] };

  assert.deepEqual(canScheduleEstimate({ estimate: { ...estimate, memberIds: [] }, party, fullyHealed: true, resources: { food: 2 } }), { ok: false, reason: "selected party is empty" });
  assert.deepEqual(canScheduleEstimate({ estimate, party, fullyHealed: false, resources: { food: 2 } }), { ok: false, reason: "blocked: party must be in town and fully healed" });
  assert.deepEqual(canScheduleEstimate({ estimate, party, fullyHealed: true, resources: { food: 1 } }), { ok: false, reason: "insufficient food" });
  assert.deepEqual(canScheduleEstimate({ estimate, party, fullyHealed: true, resources: { food: 2 } }), { ok: true, reason: "ready in town" });
});

test("createPartyOperation builds deterministic operation phases and queued offset", () => {
  const estimate = {
    partyId: "party-1",
    partyName: "Alpha",
    dungeonId: "test",
    dungeonName: "Test Cave",
    memberIds: ["ada"],
    travelHours: 2,
    dungeonHours: 3,
    recoveryHours: 1,
    hours: 8,
    rewards: {},
    transcript: [],
    timeline: []
  };
  const operation = createPartyOperation({
    estimate,
    party: { id: "party-1" },
    dungeon: { travelHours: 9, coord: { x: 10, y: 20 } },
    operations: [sampleOperation(1)],
    tavernCoord: { x: 1, y: 2 },
    id: "op-test"
  });

  assert.equal(operation.id, "op-test");
  assert.equal(operation.elapsed, -6);
  assert.deepEqual(operation.phases.map((phase) => [phase.name, phase.hours]), [["outbound", 2], ["dungeon", 3], ["return", 2], ["regenerate", 1]]);
  assert.notEqual(operation.estimate, estimate);
});
