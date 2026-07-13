import assert from "node:assert/strict";
import test from "node:test";

import { createRosterTavernCommandHandlers } from "../src/app/rosterTavernCommandHandlers.js";

function createHarness(overrides = {}) {
  const logs = [];
  const calls = [];
  const state = {
    focusedHeroId: "hero_1",
    lastEstimate: { cached: true },
    resources: {
      coin: 20,
      food: 20,
      wood: 20,
      ore: 20
    },
    tavern: {
      capacity: 3,
      population: 2,
      jobs: {
        wood: 1,
        ore: 1
      }
    },
    roster: [
      {
        id: "hero_1",
        name: "Dani",
        gear: []
      }
    ],
    blueprints: {
      ironBlade: true
    },
    crafted: {},
    rosterView: "detailed",
    ...overrides.state
  };
  const visitors = overrides.visitors || [
    {
      id: "visitor_1",
      name: "Mira",
      role: "scout",
      race: "human",
      primaryJob: "scout",
      secondaryJob: null,
      cost: { coin: 1 },
      stats: { hp: 8, atk: 2, def: 1, utility: 3 },
      spriteIndex: 2
    }
  ];
  const blueprints = overrides.blueprints || {
    ironBlade: {
      name: "Iron Blade",
      cost: { ore: 2 }
    },
    bunkRoom: {
      name: "Bunk Room",
      cost: { wood: 3 }
    }
  };
  const handlers = createRosterTavernCommandHandlers({
    state,
    visitors,
    blueprints,
    focusedHero: () => state.roster.find((hero) => hero.id === state.focusedHeroId),
    canPay: (cost) => Object.entries(cost).every(([key, value]) => (state.resources[key] || 0) >= value),
    pay: (cost) => {
      Object.entries(cost).forEach(([key, value]) => {
        state.resources[key] -= value;
      });
    },
    addLog: (text, type) => logs.push({ text, type }),
    render: () => calls.push("render")
  });
  return { state, logs, calls, handlers };
}

test("roster/tavern handlers recruit and focus heroes", () => {
  const { state, logs, calls, handlers } = createHarness();

  handlers.recruit("visitor_1");
  assert.equal(state.roster.length, 2);
  assert.equal(state.resources.coin, 19);
  assert.match(logs[0].text, /recruited Mira/);

  handlers.setFocusedHero("visitor_1");
  assert.equal(state.focusedHeroId, "visitor_1");
  assert.match(logs[1].text, /focused character set to Mira/);
  assert.deepEqual(calls, ["render", "render"]);
});

test("roster/tavern handlers toggle view and craft gear", () => {
  const { state, logs, calls, handlers } = createHarness();

  handlers.toggleRosterView();
  assert.equal(state.rosterView, "minimized");

  handlers.craft("ironBlade");
  assert.deepEqual(state.roster[0].gear, ["ironBlade"]);
  assert.equal(state.resources.ore, 18);
  assert.match(logs[0].text, /crafted Iron Blade/);
  assert.deepEqual(calls, ["render", "render"]);
});

test("roster/tavern handlers upgrade tavern and assign workers", () => {
  const { state, logs, handlers } = createHarness({
    state: {
      blueprints: {
        ironBlade: true,
        bunkRoom: true
      }
    }
  });

  handlers.upgradeTavern();
  assert.equal(state.tavern.capacity, 5);
  assert.equal(state.tavern.population, 3);
  assert.match(logs[0].text, /tavern upgraded/);

  handlers.assignWorker("wood");
  assert.equal(state.tavern.jobs.wood, 2);
  assert.equal(state.tavern.jobs.ore, 0);
  assert.match(logs[1].text, /worker moved from ore to wood/);
});
