import assert from "node:assert/strict";
import test from "node:test";

import {
  adjustSettlementWage,
  adjustWorkerAssignment,
  assignWorkerToJob,
  ensureSettlementState,
  hireWorker,
  hireWorkerCost,
  unassignedWorkers,
  wageAttractionFactor,
  workforceTarget
} from "../src/game/settlement/workforceModel.js";

import {
  upgradeWorkSite,
  workSiteMaxWorkers,
  workSiteUpgradeCost,
  workSiteUpgradeLevel,
  workSiteWorkerCaps
} from "../src/game/settlement/workSiteUpgrades.js";

test("workforce target starts at three hired workers", () => {
  assert.equal(workforceTarget({}, { fame: 0 }), 3);
  assert.equal(workforceTarget({ hiredWorkers: 5, happiness: 10 }, { fame: 20 }), 5);
});

test("wage attraction is fixed while wages are replaced by direct hiring", () => {
  assert.equal(wageAttractionFactor(0), 1);
  assert.equal(wageAttractionFactor(1000), 1);
  assert.equal(workforceTarget({ availableWorkers: 1 }, { fame: 0 }), 3);
});

test("worker assignment uses unassigned workers before rebalancing other jobs", () => {
  const state = {
    tavern: { fame: 0, jobs: { wood: 1, ore: 0, workshop: 0, research: 0 } },
    settlement: { wagePerWorker: 2, happiness: 80, availableWorkers: 3, hiredWorkers: 3 }
  };
  ensureSettlementState(state);
  assert.equal(unassignedWorkers(state), 2);
  assert.deepEqual(assignWorkerToJob(state, "ore"), { ok: true, job: "ore", source: "unassigned", workers: 1 });
  assert.equal(unassignedWorkers(state), 1);
  assert.equal(assignWorkerToJob(state, "workshop").source, "unassigned");
  assert.deepEqual(state.tavern.jobs, { wood: 1, ore: 1, workshop: 1, research: 0 });
});

test("direct worker adjustment only uses or releases unassigned workers", () => {
  const state = {
    tavern: { fame: 0, jobs: { wood: 2, ore: 0, workshop: 0, research: 0 } },
    settlement: { wagePerWorker: 2, happiness: 80, availableWorkers: 3, hiredWorkers: 3 }
  };
  ensureSettlementState(state);

  assert.deepEqual(adjustWorkerAssignment(state, "ore", 1), { ok: true, job: "ore", delta: 1, workers: 1, unassigned: 0 });
  assert.deepEqual(adjustWorkerAssignment(state, "workshop", 1), { ok: false, reason: "no unassigned worker", job: "workshop", delta: 1 });
  assert.deepEqual(adjustWorkerAssignment(state, "wood", -1), { ok: true, job: "wood", delta: -1, workers: 1, unassigned: 1 });
  assert.deepEqual(state.tavern.jobs, { wood: 1, ore: 1, workshop: 0, research: 0 });
});

test("work-site upgrades double cost and increase worker capacity", () => {
  const state = {
    tavern: { jobs: { wood: 0, ore: 0, workshop: 0, research: 0 } },
    settlement: { availableWorkers: 5, hiredWorkers: 5 },
    resources: { wood: 600, coin: 200 }
  };

  assert.equal(workSiteUpgradeLevel(state, "wood"), 0);
  assert.equal(workSiteMaxWorkers(state, "wood"), 2);
  assert.deepEqual(workSiteUpgradeCost(state, "wood"), { wood: 200, coin: 50 });

  const result = upgradeWorkSite(state, "wood", {
    canPay: (cost) => state.resources.wood >= cost.wood && state.resources.coin >= cost.coin,
    pay: (cost) => {
      state.resources.wood -= cost.wood;
      state.resources.coin -= cost.coin;
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.level, 1);
  assert.equal(result.maxWorkers, 4);
  assert.deepEqual(result.nextCost, { wood: 400, coin: 100 });
  assert.deepEqual(workSiteWorkerCaps(state, [{ id: "wood" }, { id: "ore" }]), { wood: 4, ore: 2 });
  assert.deepEqual(state.resources, { wood: 400, coin: 150 });
});

test("worker assignment respects work-site capacity caps", () => {
  const state = {
    tavern: { jobs: { wood: 2, ore: 0, workshop: 0, research: 0 } },
    settlement: { availableWorkers: 5, hiredWorkers: 5 }
  };

  assert.deepEqual(adjustWorkerAssignment(state, "wood", 1, { maxWorkersByJob: { wood: 2 } }), {
    ok: false,
    reason: "no workplace capacity",
    job: "wood",
    delta: 1,
    maxWorkers: 2
  });
  assert.deepEqual(adjustWorkerAssignment(state, "wood", 1, { maxWorkersByJob: { wood: 4 } }), {
    ok: true,
    job: "wood",
    delta: 1,
    workers: 3,
    unassigned: 2,
    maxWorkers: 4
  });
});

test("wage adjustment is blocked by fixed upkeep", () => {
  const state = {
    tavern: { fame: 20, jobs: { wood: 3, ore: 2, workshop: 0, research: 0 } },
    settlement: { wagePerWorker: 1, happiness: 100, availableWorkers: 5, hiredWorkers: 5 }
  };
  assert.deepEqual(adjustSettlementWage(state, -1), {
    ok: false,
    reason: "fixed upkeep",
    delta: 0,
    wagePerWorker: 1,
    availableWorkers: 5,
    unassigned: 0
  });
  assert.equal(state.tavern.jobs.wood + state.tavern.jobs.ore, 5);
});

test("hiring workers pays rising coin cost and increases workforce", () => {
  const state = {
    tavern: { fame: 0, jobs: { wood: 1, ore: 1 } },
    settlement: { wagePerWorker: 1, happiness: 80, availableWorkers: 3, hiredWorkers: 3 },
    resources: { coin: 40 }
  };
  assert.deepEqual(hireWorkerCost(state), { coin: 10 });
  const result = hireWorker(state, {
    canPay: (cost) => state.resources.coin >= cost.coin,
    pay: (cost) => {
      state.resources.coin -= cost.coin;
    }
  });
  assert.equal(result.ok, true);
  assert.equal(state.settlement.availableWorkers, 4);
  assert.equal(state.resources.coin, 30);
  assert.deepEqual(result.nextCost, { coin: 15 });
});
