import assert from "node:assert/strict";
import test from "node:test";

import {
  activeEventDefinition,
  closeActiveEvent,
  createInitialEventState,
  ensureEventState,
  triggerEvent
} from "../src/game/events/eventRuntime.js";

const definitions = [
  {
    id: "low",
    trigger: "start",
    title: "Low",
    priority: 1,
    once: true,
    presentation: { level: "blocking" }
  },
  {
    id: "high",
    trigger: "start",
    title: "High",
    priority: 10,
    once: true,
    presentation: { level: "blocking" }
  },
  {
    id: "repeat",
    trigger: "repeat",
    title: "Repeat",
    once: false,
    presentation: { level: "notice" }
  }
];

test("triggerEvent queues matching events by priority and opens one active event", () => {
  const eventState = createInitialEventState();

  const result = triggerEvent(eventState, definitions, "start");

  assert.equal(result.openedId, "high");
  assert.equal(result.openedBlocking, true);
  assert.deepEqual(result.queuedIds, ["high", "low"]);
  assert.equal(eventState.activeId, "high");
  assert.deepEqual(eventState.queue, ["low"]);
  assert.equal(activeEventDefinition(eventState, definitions).title, "High");
});

test("closeActiveEvent marks seen and advances queued events", () => {
  const eventState = createInitialEventState();
  triggerEvent(eventState, definitions, "start");

  const result = closeActiveEvent(eventState, definitions);

  assert.equal(result.closedId, "high");
  assert.equal(result.openedId, "low");
  assert.equal(eventState.seen.high, true);
  assert.equal(eventState.activeId, "low");
});

test("triggerEvent skips already seen once-only events but allows repeatable events", () => {
  const eventState = createInitialEventState();
  triggerEvent(eventState, definitions, "start");
  closeActiveEvent(eventState, definitions);
  closeActiveEvent(eventState, definitions);

  const seenResult = triggerEvent(eventState, definitions, "start");
  assert.deepEqual(seenResult.queuedIds, []);

  const repeatResult = triggerEvent(eventState, definitions, "repeat");
  closeActiveEvent(eventState, definitions);
  const secondRepeatResult = triggerEvent(eventState, definitions, "repeat");

  assert.deepEqual(repeatResult.queuedIds, ["repeat"]);
  assert.deepEqual(secondRepeatResult.queuedIds, ["repeat"]);
});

test("ensureEventState fills compatible defaults and removes seen queued events", () => {
  const state = {
    events: {
      seen: { old: true },
      queue: ["old", "new"],
      activeId: "old"
    }
  };

  const eventState = ensureEventState(state);

  assert.equal(eventState.activeId, null);
  assert.deepEqual(eventState.queue, ["new"]);
  assert.equal(eventState.pausedTimeRunning, false);
});
