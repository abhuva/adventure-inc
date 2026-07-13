import assert from "node:assert/strict";
import test from "node:test";

import {
  populateDungeonSelect,
  populatePartySelect,
  populateStopNodes
} from "../src/app/selectControls.js";

function selectElement(value = "") {
  return {
    innerHTML: "",
    value
  };
}

test("populateDungeonSelect renders dungeons and refreshes stop nodes from selected dungeon", () => {
  const el = {
    dungeonSelect: selectElement("rat_cellar"),
    stopNodeSelect: selectElement()
  };

  populateDungeonSelect({
    el,
    dungeons: [
      { id: "rat_cellar", name: "Rat Cellar", nodes: [{ name: "Gate" }] }
    ],
    selectedDungeon: () => ({ nodes: [{ name: "Gate" }] })
  });

  assert.match(el.dungeonSelect.innerHTML, /Rat Cellar/);
  assert.match(el.stopNodeSelect.innerHTML, /full run/);
  assert.match(el.stopNodeSelect.innerHTML, /1: Gate/);
});

test("populateStopNodes renders the supplied dungeon node list", () => {
  const el = {
    stopNodeSelect: selectElement()
  };

  populateStopNodes({
    el,
    dungeon: {
      nodes: [{ name: "Tunnel" }]
    }
  });

  assert.match(el.stopNodeSelect.innerHTML, /1: Tunnel/);
});

test("populatePartySelect renders parties and selected party id", () => {
  const el = {
    partySelect: selectElement()
  };

  populatePartySelect({
    el,
    parties: [
      { id: "party_alpha", name: "Alpha" },
      { id: "party_beta", name: "Beta" }
    ],
    selectedPartyId: "party_beta"
  });

  assert.match(el.partySelect.innerHTML, /Alpha/);
  assert.match(el.partySelect.innerHTML, /Beta/);
  assert.equal(el.partySelect.value, "party_beta");
});
