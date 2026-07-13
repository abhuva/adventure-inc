import assert from "node:assert/strict";
import test from "node:test";

import { applyDailyProduction } from "../src/game/time/dailyProductionRuntime.js";

test("applyDailyProduction applies income and returns repeated party ids", () => {
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
    applyDailyTavernIncome: (targetState) => {
      targetState.resources.food += 3;
      return { food: 3, coin: 0 };
    },
    repeatedPlanPartyIds: (plans) => Object.keys(plans).sort()
  });

  assert.deepEqual(state.resources, { food: 4, coin: 2 });
  assert.deepEqual(result, {
    income: { food: 3, coin: 0 },
    repeatedPartyIds: ["party_alpha", "party_beta"]
  });
});
