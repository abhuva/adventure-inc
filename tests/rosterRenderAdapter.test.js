import assert from "node:assert/strict";
import test from "node:test";

import { createRosterRenderAdapter } from "../src/app/rosterRenderAdapter.js";

function fakeButton(dataset = {}) {
  const listeners = {};
  return {
    dataset,
    id: dataset.id || "",
    addEventListener(type, callback) {
      listeners[type] = callback;
    },
    click() {
      listeners.click?.();
    },
    closest(selector) {
      if (selector === "[data-select-party]" && this.dataset.selectParty) return this;
      if (selector === "[data-cancel-party]" && this.dataset.cancelParty) return this;
      if (selector === "[data-toggle-member]" && this.dataset.toggleMember) return this;
      if (selector === "[data-visitor-info]" && this.dataset.visitorInfo) return this;
      if (selector === "[data-learn-skill]" && this.dataset.learnSkill) return this;
      if (selector === "[data-craft-focused]" && this.dataset.craftFocused) return this;
      if (selector === "[data-focus]" && this.dataset.focus) return this;
      if (selector === "#addFocusedToPartyBtn" && this.id === "addFocusedToPartyBtn") return this;
      return null;
    }
  };
}

function fakeContainer(selectorMap = {}) {
  const classes = new Set();
  const allElements = Object.values(selectorMap).flat();
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
    },
    contains(element) {
      return allElements.includes(element);
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
  const visitorInfoButton = fakeButton({ visitorInfo: "visitor-1" });
  const selectCell = fakeButton({ selectParty: "party-1" });
  const cancelButton = fakeButton({ cancelParty: "party-1" });
  const memberButton = fakeButton({ partyId: "party-1", toggleMember: "ada" });
  const focusButton = fakeButton({ focus: "ada" });
  const skillButton = fakeButton({ learnSkill: "root" });
  const craftButton = fakeButton({ craftFocused: "ironBlade" });
  const workerButton = fakeButton({ workerJob: "wood", workerDelta: "1" });
  const addButton = fakeButton({ id: "addFocusedToPartyBtn" });
  const el = {
    upgradeTavernBtn: fakeContainer(),
    visitorRows: fakeContainer({ "[data-recruit]": [recruitButton], "[data-visitor-info]": [visitorInfoButton] }),
    tavernVisitorDetailBox: fakeContainer(),
    jobRows: fakeContainer({ "[data-worker-job]": [workerButton] }),
    settlementWageControls: fakeContainer(),
    partyRows: fakeContainer({
      "[data-select-party]": [selectCell],
      "[data-cancel-party]": [cancelButton],
      "[data-toggle-member]": [memberButton]
    }),
    focusedCharacterBox: fakeContainer({ "[data-learn-skill]": [skillButton], "[data-craft-focused]": [craftButton], "#addFocusedToPartyBtn": [addButton] }),
    rosterRows: fakeContainer({ "[data-focus]": [focusButton] })
  };
  const state = {
    rosterView: "minimized",
    focusedHeroId: "ada",
    roster: [hero()],
    selectedPartyId: "party-1",
    activeRosterDetailTab: "info",
    activeTavernDetailTab: "info",
    selectedTavernVisitorId: null,
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
      },
      querySelectorAll() {
        return [];
      }
    },
    atlas: { columns: 7, rows: 7 },
    visitors: [{ ...hero(), id: "visitor-1", name: "Mira", role: "Scout", cost: { coin: 1 }, stats: { hp: 8, atk: 2, def: 1, utility: 3 } }],
    blueprints: { bunkRoom: { cost: { wood: 20, ore: 8 } } },
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
    onSelectTavernVisitor: (visitorId) => calls.push(["visitorInfo", visitorId]),
    onSelectParty: (partyId) => calls.push(["select", partyId]),
    onCancelParty: (partyId) => calls.push(["cancel", partyId]),
    onTogglePartyMember: (partyId, heroId) => calls.push(["toggle", partyId, heroId]),
    onAddFocusedToParty: () => calls.push("add"),
    onCraft: (blueprintId) => calls.push(["craft", blueprintId]),
    onLearnSkill: (heroId, skillId) => calls.push(["learn", heroId, skillId]),
    onAdjustWorker: (job, delta) => calls.push(["adjustWorker", job, delta]),
    onAdjustWage: (delta) => calls.push(["adjustWage", delta]),
    onFocusHero: (heroId) => calls.push(["focus", heroId])
  });
  return { adapter, calls, el, recruitButton, visitorInfoButton, selectCell, cancelButton, memberButton, focusButton, skillButton, craftButton, workerButton, addButton };
}

test("roster render adapter renders visitors and jobs", () => {
  const { adapter, calls, el, recruitButton, visitorInfoButton, workerButton } = createHarness();

  adapter.renderVisitors();
  visitorInfoButton.click();
  recruitButton.click();
  adapter.renderJobs();
  workerButton.click();

  assert.match(el.visitorRows.innerHTML, /Mira/);
  assert.match(el.upgradeTavernBtn.innerHTML, /tavern-upgrade-panel/);
  assert.match(el.upgradeTavernBtn.innerHTML, /Upgrade cost: 10 wood, 4 ore/);
  assert.match(el.tavernVisitorDetailBox.innerHTML, /data-tavern-detail-panel="info"/);
  assert.match(el.jobRows.innerHTML, /North Woodlot/);
  assert.match(el.settlementWageControls.innerHTML, /next worker/);
  assert.deepEqual(calls, [["visitorInfo", "visitor-1"], ["recruit", "visitor-1"], ["adjustWorker", "wood", 1]]);
});

test("roster render adapter renders party and focused character panels", () => {
  const { adapter, calls, el, selectCell, cancelButton, memberButton, addButton, craftButton, skillButton } = createHarness();

  adapter.renderParties();
  el.partyRows.onclick({ target: selectCell });
  el.partyRows.onclick({ target: cancelButton });
  el.partyRows.onclick({ target: memberButton });
  el.focusedCharacterBox.onclick({ target: addButton });
  el.focusedCharacterBox.onclick({ target: craftButton });
  el.focusedCharacterBox.onclick({ target: skillButton });

  assert.match(el.partyRows.innerHTML, /Alpha/);
  assert.match(el.focusedCharacterBox.innerHTML, /Ada/);
  assert.match(el.focusedCharacterBox.innerHTML, /data-roster-detail-panel="skill1"/);
  assert.deepEqual(calls, ["populatePartySelect", ["select", "party-1"], ["cancel", "party-1"], ["toggle", "party-1", "ada"], "add", ["craft", "ironBlade"], ["learn", "ada", "root"]]);
});

test("roster render adapter renders roster cards and exposes portrait helpers", () => {
  const { adapter, calls, el, focusButton } = createHarness();

  adapter.renderRoster();
  el.rosterRows.onclick({ target: focusButton });

  assert.equal(el.rosterRows.classList.contains("minimized"), true);
  assert.match(el.rosterRows.innerHTML, /Ada/);
  assert.match(adapter.renderPortrait(hero(), "card"), /portrait/);
  assert.equal(adapter.portraitStyle(0), "background-position:0% 0%");
  assert.deepEqual(adapter.atlasConfig(), { columns: 7, rows: 7 });
  assert.deepEqual(calls, [["focus", "ada"]]);
});
