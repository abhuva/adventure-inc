import assert from "node:assert/strict";
import test from "node:test";

import { createAppRuntimeContext } from "../src/app/appRuntimeContext.js";

function createWindowRef() {
  return {
    clearInterval() {},
    setInterval() {
      return "timer";
    }
  };
}

test("app runtime context creates state, element bag, data context, timers, and resources", () => {
  const context = createAppRuntimeContext({
    windowRef: createWindowRef(),
    performanceRef: { now: () => 12 },
    templeInventorySlots: 4,
    replayDefaultMs: 250
  });

  assert.equal(context.state.temple.stones.triangle.inventorySlots.length, 4);
  assert.equal(context.state.dungeonReplay.playbackMs, 250);
  assert.deepEqual(context.el, {});
  assert.equal(context.appDataContext.getPoiData(), null);
  assert.equal(context.resourceRuntime.canPay({ coin: 1 }), true);

  context.appDataContext.setPoiData({ tavern: { id: "tavern" } });
  assert.equal(context.appDataContext.getPoiData().tavern.id, "tavern");
});

test("app runtime context creates independent state objects", () => {
  const first = createAppRuntimeContext({
    windowRef: createWindowRef(),
    performanceRef: { now: () => 0 },
    templeInventorySlots: 2,
    replayDefaultMs: 100
  });
  const second = createAppRuntimeContext({
    windowRef: createWindowRef(),
    performanceRef: { now: () => 0 },
    templeInventorySlots: 2,
    replayDefaultMs: 100
  });

  first.state.resources.coin = 999;

  assert.notEqual(first.state, second.state);
  assert.notEqual(first.el, second.el);
  assert.notEqual(first.state.resources.coin, second.state.resources.coin);
});
