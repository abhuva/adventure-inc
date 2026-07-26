import assert from "node:assert/strict";
import test from "node:test";

import { applyDailyProduction } from "../src/game/time/dailyProductionRuntime.js";

test("applyDailyProduction returns repeated party ids without passive resources", () => {
  const state = {
    resources: {
      food: 1,
      coin: 2
    },
    repeatedPlans: {
      party_alpha: {},
      party_beta: {}
    }
  };

  const result = applyDailyProduction({
    state,
    repeatedPlanPartyIds: (plans) => Object.keys(plans).sort()
  });

  assert.deepEqual(state.resources, { food: 1, coin: 2 });
  assert.deepEqual(result, {
    repeatedPartyIds: ["party_alpha", "party_beta"]
  });
});
