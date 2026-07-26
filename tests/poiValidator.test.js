import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { validatePoiData } from "../src/data/validators/poiValidator.js";
import { nodeResolveCost } from "../src/game/dungeon/dungeonGraphModel.js";

test("validatePoiData accepts minimal valid shape", () => {
  assert.doesNotThrow(() => validatePoiData({
    tavern: { coord: { x: 1, y: 2 } },
    workSites: [],
    dungeons: []
  }));
});

test("validatePoiData rejects missing tavern coordinates", () => {
  assert.throws(() => validatePoiData({
    tavern: {},
    workSites: [],
    dungeons: []
  }), /invalid tavern coordinate/);
});

test("Old Copper Mine is authored as three deep boss branches", () => {
  const poi = JSON.parse(readFileSync(new URL("../assets/data/poi.json", import.meta.url), "utf8"));
  const mine = poi.dungeons.find((dungeon) => dungeon.id === "mine");
  const bossIds = ["boss_foreman", "boss_sump", "boss_ward"];
  const totalResolve = mine.nodes.reduce((sum, node) => sum + nodeResolveCost(node), 0);

  assert.equal(mine.routes.length, 3);
  assert.deepEqual(mine.routes.map((route) => route.nodeIds.length), [7, 7, 7]);
  assert.deepEqual(mine.nodes.filter((node) => node.type === "boss").map((node) => node.id), bossIds);
  assert.deepEqual(mine.nodes.filter((node) => node.type === "check").map((node) => node.id), ["mine_mouth"]);
  assert.deepEqual(mine.nodes.filter((node) => node.type === "hazard").map((node) => node.id), ["drowned_gallery"]);
  assert.equal(mine.nodes.filter((node) => node.type === "relief").length, 1);
  mine.nodes.filter((node) => node.type === "combat" || node.type === "boss").forEach((node) => {
    assert.ok(node.enemy, `${node.id} should define an enemy encounter`);
  });
  assert.equal(totalResolve, 79);
  bossIds.forEach((bossId) => {
    const boss = mine.nodes.find((node) => node.id === bossId);
    assert.equal(boss.uniqueBoss, true);
    assert.deepEqual(boss.effectsOnClear[0].requiredNodeIds, bossIds);
    assert.equal(boss.effectsOnClear[0].locationId, "barracks");
  });
});
