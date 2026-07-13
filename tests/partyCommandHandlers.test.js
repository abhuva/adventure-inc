import assert from "node:assert/strict";
import test from "node:test";

import { createPartyCommandHandlers } from "../src/app/partyCommandHandlers.js";

function createHarness(overrides = {}) {
  const logs = [];
  const calls = [];
  const state = {
    focusedHeroId: "hero_1",
    operations: [],
    repeatedPlans: {},
    selectedPartyId: "party_alpha",
    parties: [
      { id: "party_alpha", name: "Alpha", memberIds: [] }
    ],
    roster: [
      { id: "hero_1", name: "Dani", hp: 10, base: { hp: 10 } },
      { id: "hero_2", name: "Rook", hp: 10, base: { hp: 10 } }
    ],
    ...overrides.state
  };
  const handlers = createPartyCommandHandlers({
    state,
    addLog: (text, type) => logs.push({ text, type }),
    render: () => calls.push("render"),
    populatePartySelect: () => calls.push("populate"),
    selectedParty: () => state.parties.find((party) => party.id === state.selectedPartyId),
    characterState: overrides.characterState || (() => ({ state: "Idle" })),
    heroName: (heroId) => state.roster.find((hero) => hero.id === heroId)?.name || heroId
  });
  return { state, logs, calls, handlers };
}

test("party handlers add and select parties with select refresh", () => {
  const { state, logs, calls, handlers } = createHarness();

  handlers.addParty();
  assert.equal(state.parties.length, 2);
  assert.deepEqual(calls, ["populate", "render"]);
  assert.match(logs[0].text, /Party 2 formed/);

  handlers.selectParty("party_alpha");
  assert.equal(state.selectedPartyId, "party_alpha");
  assert.deepEqual(calls.slice(2), ["populate", "render"]);
});

test("party handlers block busy member removal and add focused hero", () => {
  const busy = createHarness({
    state: {
      parties: [
        { id: "party_alpha", name: "Alpha", memberIds: ["hero_1"] }
      ]
    },
    characterState: () => ({ state: "Fighting" })
  });

  busy.handlers.togglePartyMember("party_alpha", "hero_1");
  assert.deepEqual(busy.state.parties[0].memberIds, ["hero_1"]);
  assert.match(busy.logs[0].text, /party edit blocked: Dani is Fighting/);

  const idle = createHarness();
  idle.handlers.addFocusedHeroToCurrentParty();
  assert.deepEqual(idle.state.parties[0].memberIds, ["hero_1"]);
  assert.match(idle.logs[0].text, /Dani assigned to Alpha/);
});

test("party handlers cancel actions and clear repeated plans", () => {
  const { state, logs, calls, handlers } = createHarness({
    state: {
      repeatedPlans: {
        party_alpha: { partyId: "party_alpha" }
      },
      operations: [
        { partyId: "party_alpha" }
      ]
    }
  });

  handlers.cancelPartyAction("party_alpha");
  assert.deepEqual(state.operations, []);
  assert.equal(state.repeatedPlans.party_alpha, undefined);
  assert.match(logs[0].text, /Alpha canceled: returned to town idle/);
  assert.deepEqual(calls, ["render"]);
});
