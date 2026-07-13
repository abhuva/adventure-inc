import assert from "node:assert/strict";
import test from "node:test";

import {
  dungeonOptionsHtml,
  partyOptionsHtml,
  renderDungeonSelect,
  renderPartySelect,
  renderStopNodeSelect,
  stopNodeOptionsHtml
} from "../src/ui/selectView.js";

test("dungeonOptionsHtml renders dungeon options", () => {
  assert.equal(
    dungeonOptionsHtml([
      { id: "rat_cellar", name: "Rat Cellar" },
      { id: "old_mine", name: "Old Mine" }
    ]),
    `<option value="rat_cellar">Rat Cellar</option><option value="old_mine">Old Mine</option>`
  );
});

test("stopNodeOptionsHtml renders full-run and node options", () => {
  const html = stopNodeOptionsHtml({
    nodes: [
      { name: "Gate" },
      { name: "Boss" }
    ]
  });

  assert.match(html, /value="all">full run/);
  assert.match(html, /value="0">1: Gate/);
  assert.match(html, /value="1">2: Boss/);
});

test("partyOptionsHtml renders party options", () => {
  assert.equal(
    partyOptionsHtml([
      { id: "party_alpha", name: "Alpha" }
    ]),
    `<option value="party_alpha">Alpha</option>`
  );
});

test("render select helpers write innerHTML and selected value", () => {
  const dungeonSelect = { innerHTML: "" };
  renderDungeonSelect(dungeonSelect, [{ id: "rat_cellar", name: "Rat Cellar" }]);
  assert.match(dungeonSelect.innerHTML, /Rat Cellar/);

  const stopSelect = { innerHTML: "" };
  renderStopNodeSelect(stopSelect, { nodes: [{ name: "Gate" }] });
  assert.match(stopSelect.innerHTML, /full run/);
  assert.match(stopSelect.innerHTML, /Gate/);

  const partySelect = { innerHTML: "", value: "" };
  renderPartySelect(partySelect, [{ id: "party_alpha", name: "Alpha" }], "party_alpha");
  assert.match(partySelect.innerHTML, /Alpha/);
  assert.equal(partySelect.value, "party_alpha");
});
