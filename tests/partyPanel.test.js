import assert from "node:assert/strict";
import test from "node:test";

import { renderPartyPanel } from "../src/ui/partyPanel.js";

function fakeButton(dataset = {}) {
  return {
    dataset,
    id: dataset.id || "",
    closest(selector) {
      if (selector === "[data-select-party]" && this.dataset.selectParty) return this;
      if (selector === "[data-cancel-party]" && this.dataset.cancelParty) return this;
      if (selector === "[data-toggle-member]" && this.dataset.toggleMember) return this;
      if (selector === "[data-learn-skill]" && this.dataset.learnSkill) return this;
      if (selector === "[data-craft-focused]" && this.dataset.craftFocused) return this;
      if (selector === "#addFocusedToPartyBtn" && this.id === "addFocusedToPartyBtn") return this;
      return null;
    }
  };
}

function fakeContainer(selectorMap) {
  const allElements = Object.values(selectorMap).flat();
  return {
    innerHTML: "",
    querySelectorAll(selector) {
      return selectorMap[selector] || [];
    },
    contains(element) {
      return allElements.includes(element);
    }
  };
}

test("renderPartyPanel renders party/focused panels and binds actions", () => {
  const selectCell = fakeButton({ selectParty: "party-1" });
  const cancelButton = fakeButton({ cancelParty: "party-1" });
  const memberButton = fakeButton({ partyId: "party-1", toggleMember: "ada" });
  const addButton = fakeButton({ id: "addFocusedToPartyBtn" });
  const craftButton = fakeButton({ craftFocused: "ironBlade" });
  const skillButton = fakeButton({ learnSkill: "root" });
  const calls = [];
  const el = {
    partyRows: fakeContainer({
      "[data-select-party]": [selectCell],
      "[data-cancel-party]": [cancelButton],
      "[data-toggle-member]": [memberButton]
    }),
    focusedCharacterBox: fakeContainer({
      "[data-learn-skill]": [skillButton],
      "[data-craft-focused]": [craftButton],
      "#addFocusedToPartyBtn": [addButton]
    })
  };

  renderPartyPanel({
    documentRef: {
      getElementById(id) {
        return id === "addFocusedToPartyBtn" ? addButton : null;
      }
    },
    el,
    state: {
      selectedPartyId: "party-1",
      activeRosterDetailTab: "skill1",
      parties: [{ id: "party-1", name: "Alpha", memberIds: ["ada"] }],
      operations: []
    },
    atlas: { columns: 7, rows: 7 },
    blueprints: {},
    focusedHero: () => ({
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
    }),
    selectedParty: () => ({ id: "party-1", name: "Alpha", memberIds: ["ada"] }),
    heroStats: () => ({ hpMax: 10, hpCurrent: 10, atk: 3, def: 2, utility: 1, resolve: 10, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 }),
    partyStats: () => ({ hpMax: 10, hpCurrent: 10, atk: 3, def: 2, utility: 1, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 }),
    currentOperationPhase: () => ({ phase: { name: "queued" } }),
    characterState: () => ({ state: "Idle", party: "Alpha" }),
    heroName: () => "Ada",
    availableSkillTreeIds: () => ["tree"],
    skillTrees: { tree: { name: "Tree", skillIds: ["root"] } },
    skills: { root: { name: "Root", category: "fight", maxRank: 1, requires: [] } },
    skillRank: () => 0,
    canLearnSkill: () => ({ ok: true, reason: "ok" }),
    onSelectParty: (partyId) => calls.push(["select", partyId]),
    onCancelParty: (partyId) => calls.push(["cancel", partyId]),
    onTogglePartyMember: (partyId, heroId) => calls.push(["toggle", partyId, heroId]),
    onAddFocusedToParty: () => calls.push(["add"]),
    onCraft: (blueprintId) => calls.push(["craft", blueprintId]),
    onLearnSkill: (heroId, skillId) => calls.push(["learn", heroId, skillId])
  });

  assert.match(el.partyRows.innerHTML, /Alpha/);
  assert.match(el.focusedCharacterBox.innerHTML, /Ada/);
  assert.match(el.focusedCharacterBox.innerHTML, /Root/);
  assert.match(el.focusedCharacterBox.innerHTML, /data-roster-detail-panel="info"/);
  assert.match(el.focusedCharacterBox.innerHTML, /data-roster-detail-panel="skill1"/);
  assert.match(el.focusedCharacterBox.innerHTML, /craft iron blade/);

  el.partyRows.onclick({ target: selectCell });
  el.partyRows.onclick({ target: cancelButton });
  el.partyRows.onclick({ target: memberButton });
  el.focusedCharacterBox.onclick({ target: addButton });
  el.focusedCharacterBox.onclick({ target: craftButton });
  el.focusedCharacterBox.onclick({ target: skillButton });

  assert.deepEqual(calls, [
    ["select", "party-1"],
    ["cancel", "party-1"],
    ["toggle", "party-1", "ada"],
    ["add"],
    ["craft", "ironBlade"],
    ["learn", "ada", "root"]
  ]);
});
