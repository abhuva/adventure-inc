import assert from "node:assert/strict";
import test from "node:test";

import {
  renderDungeonPanel,
  renderDungeonReplayOnly
} from "../src/ui/dungeonPanel.js";

function createElement() {
  return {
    innerHTML: "",
    textContent: "",
    max: "",
    value: "",
    disabled: false
  };
}

function createDocumentRef() {
  const controls = {};
  [
    "replayFirstBtn",
    "replayPrevBtn",
    "replayPlayBtn",
    "replayNextBtn",
    "replayLastBtn",
    "replaySpeedBtn"
  ].forEach((id) => {
    controls[id] = createElement();
  });
  return {
    controls,
    getElementById(id) {
      return controls[id];
    }
  };
}

function createDungeonElements() {
  return {
    nodeMap: createElement(),
    dungeonNodeInfo: createElement(),
    estimateBox: createElement(),
    replayTimelineSlider: createElement(),
    replayStatus: createElement(),
    replayPartyActors: createElement(),
    replayEnemyActors: createElement(),
    replayActionIcon: createElement(),
    replayEventText: createElement(),
    replayEventRows: createElement()
  };
}

test("renderDungeonPanel renders nodes, estimate, and replay", () => {
  const el = createDungeonElements();
  const documentRef = createDocumentRef();
  const calls = [];
  const targetButton = {
    dataset: { dungeonTargetNode: "den" },
    closest(selector) {
      return selector === "[data-dungeon-target-node]" ? this : null;
    }
  };
  el.nodeMap.contains = (element) => element === targetButton;

  renderDungeonPanel({
    el,
    documentRef,
    dungeon: {
      id: "rat_cellar",
      routes: [{ id: "main", name: "Main", default: true, nodeIds: ["gate", "den"] }],
      nodes: [
        { id: "gate", name: "Gate", type: "combat", reward: { coin: 1 } },
        { id: "den", name: "Den", type: "combat", reward: { hide: 1 } }
      ]
    },
    estimate: {
      dungeonId: "rat_cellar",
      dungeonName: "Rat Cellar",
      strategy: "balanced",
      partyId: "party_alpha",
      partyName: "Alpha",
      routeNodeIds: ["gate", "den"],
      totalNodes: 2,
      reached: 1,
      success: false,
      hours: 4,
      foodCost: 2,
      hpStart: 10,
      hpEnd: 3,
      rewards: { coin: 1 },
      transcript: ["Dani hit Rat"]
    },
    repeatedPlans: {
      party_alpha: {}
    },
    repeatMode: "manual",
    rewardText: (reward) => Object.entries(reward).map(([key, value]) => `${value} ${key}`).join(", ") || "none",
    replay: {
      cursor: 0,
      playing: false,
      playbackMs: 650,
      events: [
        {
          icon: "ATK",
          text: "Dani hit Rat",
          actorId: "hero_1",
          targetId: "rat_1",
          partyActors: [
            { id: "hero_1", name: "Dani", hp: 3, maxHp: 10, initiative: 4, speed: 3, spriteIndex: 1 }
          ],
          enemyActors: [
            { id: "rat_1", name: "Rat", hp: 0, maxHp: 4, initiative: 2, speed: 2, spriteIndex: null }
          ]
        }
      ]
    },
    replaySpeedLabel: () => "1x",
    portraitStyle: () => "background-position:0% 0%",
    selectedTargetNodeId: "den",
    onSelectTargetNode: (nodeId) => calls.push(nodeId)
  });

  assert.match(el.nodeMap.innerHTML, /Gate/);
  assert.match(el.nodeMap.innerHTML, /data-dungeon-target-node="den"/);
  assert.match(el.nodeMap.innerHTML, /selected/);
  assert.match(el.nodeMap.innerHTML, /failed/);
  assert.match(el.dungeonNodeInfo.innerHTML, /Den/);
  el.nodeMap.onclick({ target: targetButton });
  assert.deepEqual(calls, ["den"]);
  assert.match(el.estimateBox.innerHTML, /Rat Cellar/);
  assert.match(el.estimateBox.innerHTML, /balanced/);
  assert.match(el.estimateBox.innerHTML, /repeated route/);
  assert.match(el.estimateBox.innerHTML, /time \/ combat log/);
  assert.match(el.replayStatus.textContent, /event 1\/1/);
  assert.match(el.replayPartyActors.innerHTML, /Dani/);
  assert.match(el.replayEnemyActors.innerHTML, /RA/);
});

test("renderDungeonReplayOnly renders empty replay state", () => {
  const el = createDungeonElements();
  const documentRef = createDocumentRef();

  renderDungeonReplayOnly({
    el,
    documentRef,
    replay: {
      cursor: 0,
      playing: false,
      playbackMs: 650,
      events: []
    },
    replaySpeedLabel: () => "1x",
    portraitStyle: () => ""
  });

  assert.equal(el.replayTimelineSlider.disabled, true);
  assert.match(el.replayEventText.textContent, /simulate a run/);
});
