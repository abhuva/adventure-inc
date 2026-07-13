import assert from "node:assert/strict";
import test from "node:test";

import { createRosterRenderAdapter } from "../src/app/rosterRenderAdapter.js";

function fakeButton(dataset = {}) {
  const listeners = {};
  return {
    dataset,
    addEventListener(type, callback) {
      listeners[type] = callback;
    },
    click() {
      listeners.click?.();
    }
  };
}

function fakeContainer(selectorMap = {}) {
  const classes = new Set();
  return {
    innerHTML: "",
    classList: {
      contains(name) {
        return classes.has(name);
      },
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      }
    },
    querySelectorAll(selector) {
      return selectorMap[selector] || [];
    }
  };
}

function hero() {
  return {
    id: "ada",
    name: "Ada",
    race: "human",
    role: "Founder",
    primaryJob: "guard",
    secondaryJob: null,
    level: 1,
    xp: 0,
    skillPoints: 1,
    hp: 10,
    gear: [],
    spriteIndex: 0
  };
}

function createHarness() {
  const calls = [];
  const recruitButton = fakeButton({ recruit: "visitor-1" });
  const selectCell = fakeButton({ selectParty: "party-1" });
  const cancelButton = fakeButton({ cancelParty: "party-1" });
  const memberButton = fakeButton({ partyId: "party-1", toggleMember: "ada" });
  const focusButton = fakeButton({ focus: "ada" });
  const skillButton = fakeButton({ learnSkill: "root" });
  const addButton = fakeButton();
  const el = {
    visitorRows: fakeContainer({ "[data-recruit]": [recruitButton] }),
    jobRows: fakeContainer(),
    partyRows: fakeContainer({
      "[data-select-party]": [selectCell],
      "[data-cancel-party]": [cancelButton],
      "[data-toggle-member]": [memberButton]
    }),
    focusedCharacterBox: fakeContainer({ "[data-learn-skill]": [skillButton] }),
    rosterRows: fakeContainer({ "[data-focus]": [focusButton] })
  };
  const state = {
    rosterView: "minimized",
    focusedHeroId: "ada",
    roster: [hero()],
    selectedPartyId: "party-1",
    parties: [{ id: "party-1", name: "Alpha", memberIds: ["ada"] }],
    operations: [],
    tavern: { fame: 0, jobs: { wood: 1 } }
  };
  const adapter = createRosterRenderAdapter({
    state,
    el,
    documentRef: {
      getElementById(id) {
        return id === "addFocusedToPartyBtn" ? addButton : null;
      }
    },
    atlas: { columns: 7, rows: 7 },
    visitors: [{ ...hero(), id: "visitor-1", name: "Mira", role: "Scout", cost: { coin: 1 }, stats: { hp: 8, atk: 2, def: 1, utility: 3 } }],
    blueprints: {},
    workSites: () => [{ id: "wood", name: "North Woodlot", cycleHours: 4, output: { wood: 3 } }],
    focusedHero: () => state.roster[0],
    selectedParty: () => state.parties[0],
    heroStats: () => ({ hpMax: 10, hpCurrent: 10, atk: 3, def: 2, utility: 1, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 }),
    partyStats: () => ({ hpMax: 10, hpCurrent: 10, atk: 3, def: 2, utility: 1, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 }),
    currentOperationPhase: () => ({ phase: { name: "queued" } }),
    characterState: () => ({ state: "Idle", party: "Alpha" }),
    heroName: () => "Ada",
    availableSkillTreeIds: () => ["tree"],
    skillTrees: { tree: { name: "Tree", skillIds: ["root"] } },
    skills: { root: { name: "Root", category: "fight", maxRank: 1, requires: [] } },
    skillRank: () => 0,
    canLearnSkill: () => ({ ok: true, reason: "ok" }),
    populatePartySelect: () => calls.push("populatePartySelect"),
    onRecruit: (visitorId) => calls.push(["recruit", visitorId]),
    onSelectParty: (partyId) => calls.push(["select", partyId]),
    onCancelParty: (partyId) => calls.push(["cancel", partyId]),
    onTogglePartyMember: (partyId, heroId) => calls.push(["toggle", partyId, heroId]),
    onAddFocusedToParty: () => calls.push("add"),
    onLearnSkill: (heroId, skillId) => calls.push(["learn", heroId, skillId]),
    onFocusHero: (heroId) => calls.push(["focus", heroId])
  });
  return { adapter, calls, el, recruitButton, selectCell, cancelButton, memberButton, focusButton, skillButton, addButton };
}

test("roster render adapter renders visitors and jobs", () => {
  const { adapter, calls, el, recruitButton } = createHarness();

  adapter.renderVisitors();
  recruitButton.click();
  adapter.renderJobs();

  assert.match(el.visitorRows.innerHTML, /Mira/);
  assert.match(el.jobRows.innerHTML, /North Woodlot/);
  assert.deepEqual(calls, [["recruit", "visitor-1"]]);
});

test("roster render adapter renders party and focused character panels", () => {
  const { adapter, calls, el, selectCell, cancelButton, memberButton, addButton, skillButton } = createHarness();

  adapter.renderParties();
  selectCell.click();
  cancelButton.click();
  memberButton.click();
  addButton.click();
  skillButton.click();

  assert.match(el.partyRows.innerHTML, /Alpha/);
  assert.match(el.focusedCharacterBox.innerHTML, /Ada/);
  assert.deepEqual(calls, ["populatePartySelect", ["select", "party-1"], ["cancel", "party-1"], ["toggle", "party-1", "ada"], "add", ["learn", "ada", "root"]]);
});

test("roster render adapter renders roster cards and exposes portrait helpers", () => {
  const { adapter, calls, el, focusButton } = createHarness();

  adapter.renderRoster();
  focusButton.click();

  assert.equal(el.rosterRows.classList.contains("minimized"), true);
  assert.match(el.rosterRows.innerHTML, /Ada/);
  assert.match(adapter.renderPortrait(hero(), "card"), /portrait/);
  assert.equal(adapter.portraitStyle(0), "background-position:0% 0%");
  assert.deepEqual(adapter.atlasConfig(), { columns: 7, rows: 7 });
  assert.deepEqual(calls, [["focus", "ada"]]);
});
