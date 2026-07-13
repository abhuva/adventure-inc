import assert from "node:assert/strict";
import test from "node:test";

import { advancePartyOperations } from "../src/game/dungeon/operationRuntime.js";

test("advancePartyOperations advances elapsed time and separates completed operations", () => {
  const active = {
    id: "op-active",
    partyId: "party_alpha",
    elapsed: 1,
    total: 5
  };
  const done = {
    id: "op-done",
    partyId: "party_beta",
    elapsed: 3,
    total: 4
  };

  const result = advancePartyOperations({
    operations: [active, done],
    hours: 2,
    operationTotalHours: (operation) => operation.total
  });

  assert.equal(active.elapsed, 3);
  assert.equal(done.elapsed, 5);
  assert.deepEqual(result.remaining, [active]);
  assert.deepEqual(result.completed, [done]);
  assert.deepEqual(result.completedPartyIds, ["party_beta"]);
});

test("advancePartyOperations treats exact total as completed", () => {
  const operation = {
    id: "op-exact",
    partyId: "party_alpha",
    elapsed: 2,
    total: 3
  };

  const result = advancePartyOperations({
    operations: [operation],
    hours: 1,
    operationTotalHours: (item) => item.total
  });

  assert.deepEqual(result.remaining, []);
  assert.deepEqual(result.completed, [operation]);
});
