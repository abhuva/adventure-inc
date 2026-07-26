import assert from "node:assert/strict";
import test from "node:test";

import { applyDailySettlementUpkeep } from "../src/game/settlement/happinessRuntime.js";

test("daily settlement upkeep pays one coin per hired worker", () => {
  const state = {
    tavern: { fame: 0, jobs: { wood: 1, ore: 1, workshop: 0, research: 0 } },
    settlement: { happiness: 80, availableWorkers: 3, hiredWorkers: 3, productionMultiplier: 0.5 },
    resources: { coin: 5, comfort_goods: 2 }
  };
  const result = applyDailySettlementUpkeep(state);
  assert.equal(result.comfortConsumed, 0);
  assert.equal(result.wagePaid, 3);
  assert.equal(result.wageMissing, 0);
  assert.equal(state.resources.comfort_goods, 2);
  assert.equal(state.resources.coin, 2);
  assert.equal(state.settlement.happiness, 80);
  assert.equal(state.settlement.productionMultiplier, 1);
});

test("missing upkeep halves production without shrinking workforce", () => {
  const state = {
    tavern: { fame: 20, jobs: { wood: 5, ore: 0, workshop: 0, research: 0 } },
    settlement: { happiness: 30, availableWorkers: 5, hiredWorkers: 5 },
    resources: { coin: 2, comfort_goods: 0 }
  };
  const result = applyDailySettlementUpkeep(state);
  assert.equal(result.comfortMissing, 0);
  assert.equal(result.wageRequired, 5);
  assert.equal(result.wagePaid, 2);
  assert.equal(result.wageMissing, 3);
  assert.equal(state.settlement.happiness, 30);
  assert.equal(state.settlement.availableWorkers, 5);
  assert.equal(state.settlement.productionMultiplier, 0.5);
  assert.equal(state.tavern.jobs.wood, 5);
});
