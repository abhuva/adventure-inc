import assert from "node:assert/strict";
import test from "node:test";

import { createSelectControlAdapter } from "../src/app/selectControlAdapter.js";

function selectElement(value = "") {
  return {
    innerHTML: "",
    value
  };
}

function createHarness() {
  const dungeon = {
    id: "rat_cellar",
    name: "Rat Cellar",
    nodes: [{ name: "Gate" }]
  };
  const state = {
    selectedPartyId: "party_beta",
    parties: [
      { id: "party_alpha", name: "Alpha" },
      { id: "party_beta", name: "Beta" }
    ]
  };
  const el = {
    dungeonSelect: selectElement("rat_cellar"),
    partySelect: selectElement(),
    stopNodeSelect: selectElement()
  };
  const adapter = createSelectControlAdapter({
    state,
    el,
    dungeons: () => [dungeon],
    selectedDungeon: () => dungeon
  });
  return { adapter, el };
}

test("select control adapter populates dungeon and stop-node selects", () => {
  const { adapter, el } = createHarness();

  adapter.populateDungeonSelect();

  assert.match(el.dungeonSelect.innerHTML, /Rat Cellar/);
  assert.match(el.stopNodeSelect.innerHTML, /full run/);
  assert.match(el.stopNodeSelect.innerHTML, /1: Gate/);
});

test("select control adapter populates stop-node select only", () => {
  const { adapter, el } = createHarness();

  adapter.populateStopNodes();

  assert.equal(el.dungeonSelect.innerHTML, "");
  assert.match(el.stopNodeSelect.innerHTML, /1: Gate/);
});

test("select control adapter populates selected party", () => {
  const { adapter, el } = createHarness();

  adapter.populatePartySelect();

  assert.match(el.partySelect.innerHTML, /Alpha/);
  assert.match(el.partySelect.innerHTML, /Beta/);
  assert.equal(el.partySelect.value, "party_beta");
});
