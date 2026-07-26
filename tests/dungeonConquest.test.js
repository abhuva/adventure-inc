import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDungeonConquestProgress,
  conquestChangeMessages
} from "../src/game/dungeon/dungeonConquest.js";

test("applyDungeonConquestProgress applies node clear effects to persistent dungeon state", () => {
  const state = {
    progression: {
      unlockedLocations: {},
      dungeonClears: {},
      dungeonMastery: {},
      uniqueBosses: {},
      dungeonConquest: {},
      unlockedFeatures: {}
    }
  };
  const dungeon = {
    id: "cellar",
    name: "Rat Cellar",
    nodes: [
      {
        id: "warden",
        name: "Scent Warden",
        effectsOnClear: [
          { type: "disable_modifier", modifierId: "matron_frenzy" },
          { type: "unlock_node", nodeId: "queen_tunnel" },
          { type: "unlock_feature", featureId: "dungeon_node_modifiers" },
          { type: "node_resolve_cost_add", targetNodeId: "queen_tunnel", value: -1, minimum: -2 }
        ]
      },
      { id: "queen_tunnel", name: "Queen Tunnel" }
    ]
  };

  const changes = applyDungeonConquestProgress(state, {
    routeNodeIds: ["warden"],
    reached: 1
  }, dungeon);

  assert.equal(state.progression.dungeonConquest.cellar.clearedNodes.warden, true);
  assert.equal(state.progression.dungeonConquest.cellar.disabledModifiers.matron_frenzy, true);
  assert.equal(state.progression.dungeonConquest.cellar.unlockedNodes.queen_tunnel, true);
  assert.equal(state.progression.dungeonConquest.cellar.nodeCostAdjustments.queen_tunnel, -1);
  assert.equal(state.progression.unlockedFeatures.dungeon_node_modifiers, true);
  assert.deepEqual(changes.disabledModifiers, ["matron_frenzy"]);
  assert.match(conquestChangeMessages(changes, dungeon).map((message) => message.text).join("\n"), /route node unlocked Queen Tunnel/);
});

test("applyDungeonConquestProgress unlocks locations after all required bosses are clear", () => {
  const state = {
    progression: {
      unlockedLocations: {},
      dungeonClears: {},
      dungeonMastery: {},
      uniqueBosses: {},
      dungeonConquest: {
        mine: {
          clearedNodes: { boss_foreman: true, boss_sump: true },
          unlockedNodes: {},
          disabledModifiers: {},
          nodeCostAdjustments: {}
        }
      },
      unlockedFeatures: {}
    }
  };
  const dungeon = {
    id: "mine",
    name: "Old Copper Mine",
    nodes: [
      { id: "boss_foreman", name: "Copper Foreman" },
      { id: "boss_sump", name: "Sump King" },
      {
        id: "boss_ward",
        name: "Mine Ward",
        effectsOnClear: [
          { type: "unlock_location_when_cleared", locationId: "barracks", requiredNodeIds: ["boss_foreman", "boss_sump", "boss_ward"] }
        ]
      }
    ]
  };

  const changes = applyDungeonConquestProgress(state, {
    routeNodeIds: ["boss_ward"],
    reached: 1
  }, dungeon, {
    unlockLocation(targetState, locationId) {
      targetState.progression.unlockedLocations[locationId] = true;
      return { unlocked: true, locationId };
    }
  });

  assert.equal(state.progression.unlockedLocations.barracks, true);
  assert.deepEqual(changes.unlockedLocations, ["barracks"]);
});
