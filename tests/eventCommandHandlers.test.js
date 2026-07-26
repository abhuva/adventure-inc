import assert from "node:assert/strict";
import test from "node:test";

import { createInitialEventState } from "../src/game/events/eventRuntime.js";
import { createEventCommandHandlers } from "../src/app/eventCommandHandlers.js";

const eventDefinitions = [
  {
    id: "intro",
    trigger: "start",
    title: "Intro",
    priority: 1,
    once: true,
    presentation: { level: "blocking" },
    actions: [
      { id: "open-tavern", label: "open tavern", kind: "tab", tabId: "tavern" }
    ]
  },
  {
    id: "tavern",
    trigger: "tab.tavern",
    title: "Tavern",
    priority: 1,
    once: true,
    presentation: { level: "blocking" },
    actions: [
      { id: "close", label: "continue", kind: "close" }
    ]
  }
];

test("event command handlers pause for blocking encounters and resume after close", () => {
  const calls = [];
  const state = {
    timeRunning: true,
    events: createInitialEventState()
  };
  const handlers = createEventCommandHandlers({
    state,
    eventDefinitions,
    addLog: (text, type) => calls.push(["log", text, type]),
    render: () => calls.push("render"),
    setTab: (tabId) => {
      calls.push(["tab", tabId]);
      handlers.triggerEvent(`tab.${tabId}`, { renderAfter: false });
    },
    stopAutoTime: () => {
      state.timeRunning = false;
      calls.push("stop");
    },
    resumeAutoTime: () => {
      state.timeRunning = true;
      calls.push("resume");
    }
  });

  handlers.triggerEvent("start");
  assert.equal(state.events.activeId, "intro");
  assert.equal(state.events.pausedTimeRunning, true);
  assert.equal(state.timeRunning, false);

  handlers.closeEncounter("open-tavern");
  assert.equal(state.events.activeId, "tavern");
  assert.equal(state.timeRunning, false);

  handlers.closeEncounter("close");
  assert.equal(state.events.activeId, null);
  assert.equal(state.events.pausedTimeRunning, false);
  assert.equal(state.timeRunning, true);
  assert.deepEqual(calls.filter((call) => call === "stop"), ["stop"]);
  assert.deepEqual(calls.filter((call) => call === "resume"), ["resume"]);
  assert.deepEqual(calls.filter((call) => Array.isArray(call) && call[0] === "tab"), [["tab", "tavern"]]);
});
