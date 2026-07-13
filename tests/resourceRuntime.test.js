import assert from "node:assert/strict";
import test from "node:test";

import { createResourceRuntime } from "../src/app/resourceRuntime.js";

test("resource runtime applies app-state affordability, payment, and rewards", () => {
  const state = {
    resources: {
      coin: 5,
      wood: 2
    },
    tavern: {
      fame: 1
    }
  };
  const runtime = createResourceRuntime({ state });

  assert.equal(runtime.canPay({ coin: 4, wood: 2 }), true);
  assert.equal(runtime.canPay({ coin: 6 }), false);

  runtime.pay({ coin: 3, ore: 1 });
  assert.deepEqual(state.resources, { coin: 2, wood: 2, ore: -1 });

  runtime.applyRewards({ coin: 4, fame: 3, xp: 99, blueprint: "ironBlade" });
  assert.deepEqual(state.resources, { coin: 6, wood: 2, ore: -1 });
  assert.equal(state.tavern.fame, 4);
});
