import assert from "node:assert/strict";
import test from "node:test";

import { renderPartyPanel } from "../src/ui/partyPanel.js";

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

function fakeContainer(selectorMap) {
  return {
    innerHTML: "",
    querySelectorAll(selector) {
      return selectorMap[selector] || [];
    }
  };
}

test("renderPartyPanel renders party/focused panels and binds actions", () => {
  const selectCell = fakeButton({ selectParty: "party-1" });
  const cancelButton = fakeButton({ cancelParty: "party-1" });
  const memberButton = fakeButton({ partyId: "party-1", toggleMember: "ada" });
  const addButton = fakeButton();
  const skillButton = fakeButton({ learnSkill: "root" });
  const calls = [];
  const el = {
    partyRows: fakeContainer({
      "[data-select-party]": [selectCell],
      "[data-cancel-party]": [cancelButton],
      "[data-toggle-member]": [memberButton]
    }),
    focusedCharacterBox: fakeContainer({
      "[data-learn-skill]": [skillButton]
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
    onSelectParty: (partyId) => calls.push(["select", partyId]),
    onCancelParty: (partyId) => calls.push(["cancel", partyId]),
    onTogglePartyMember: (partyId, heroId) => calls.push(["toggle", partyId, heroId]),
    onAddFocusedToParty: () => calls.push(["add"]),
    onLearnSkill: (heroId, skillId) => calls.push(["learn", heroId, skillId])
  });

  assert.match(el.partyRows.innerHTML, /Alpha/);
  assert.match(el.focusedCharacterBox.innerHTML, /Ada/);
  assert.match(el.focusedCharacterBox.innerHTML, /Root/);

  selectCell.click();
  cancelButton.click();
  memberButton.click();
  addButton.click();
  skillButton.click();

  assert.deepEqual(calls, [
    ["select", "party-1"],
    ["cancel", "party-1"],
    ["toggle", "party-1", "ada"],
    ["add"],
    ["learn", "ada", "root"]
  ]);
});
