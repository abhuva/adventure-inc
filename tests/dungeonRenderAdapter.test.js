import assert from "node:assert/strict";
import test from "node:test";

import { createDungeonRenderAdapter } from "../src/app/dungeonRenderAdapter.js";

function element() {
  return {
    disabled: false,
    innerHTML: "",
    max: "",
    textContent: "",
    value: ""
  };
}

function createHarness() {
  const controls = {
    replayFirstBtn: element(),
    replayPrevBtn: element(),
    replayPlayBtn: element(),
    replayNextBtn: element(),
    replayLastBtn: element(),
    replaySpeedBtn: element()
  };
  return {
    controls,
    documentRef: {
      getElementById(id) {
        return controls[id];
      }
    },
    el: {
      nodeMap: element(),
      estimateBox: element(),
      replayTimelineSlider: element(),
      replayStatus: element(),
      replayPartyActors: element(),
      replayEnemyActors: element(),
      replayActionIcon: element(),
      replayEventText: element(),
      replayEventRows: element()
    }
  };
}

function createState() {
  return {
    lastEstimate: {
      dungeonId: "rat_cellar",
      dungeonName: "Rat Cellar",
      strategy: "safe",
      partyId: "party_alpha",
      partyName: "Alpha",
      totalNodes: 1,
      reached: 1,
      success: true,
      hours: 3,
      foodCost: 1,
      hpStart: 12,
      hpEnd: 8,
      rewards: { coin: 2 },
      transcript: []
    },
    repeatedPlans: {
      party_alpha: { dungeonId: "rat_cellar" }
    },
    dungeonReplay: {
      cursor: 0,
      playing: false,
      playbackMs: 650,
      events: [
        {
          icon: "ATK",
          text: "Dani hits Rat",
          partyActors: [
            { id: "hero_dani", name: "Dani", hp: 8, maxHp: 12, initiative: 4, speed: 3, spriteIndex: 0 }
          ],
          enemyActors: [
            { id: "rat", name: "Rat", hp: 0, maxHp: 5, initiative: 1, speed: 2, spriteIndex: null }
          ]
        }
      ]
    }
  };
}

test("dungeon render adapter renders selected dungeon with app state and controls", () => {
  const { documentRef, el } = createHarness();
  const adapter = createDungeonRenderAdapter({
    state: createState(),
    el,
    documentRef,
    selectedDungeon: () => ({
      id: "rat_cellar",
      nodes: [
        { name: "Entry", type: "combat", reward: { coin: 2 } }
      ]
    }),
    repeatMode: () => "repeated",
    formatReward: (reward) => Object.entries(reward).map(([key, value]) => `${value} ${key}`).join(", ") || "none",
    replaySpeedLabel: () => "1x",
    portraitStyle: () => "background-position:0% 0%"
  });

  adapter.renderDungeon();

  assert.match(el.nodeMap.innerHTML, /Entry/);
  assert.match(el.estimateBox.textContent, /Rat Cellar \/ safe/);
  assert.match(el.estimateBox.textContent, /repeat: repeated/);
  assert.match(el.replayStatus.textContent, /event 1\/1/);
  assert.match(el.replayPartyActors.innerHTML, /Dani/);
});

test("dungeon render adapter can refresh only the replay panel", () => {
  const { controls, documentRef, el } = createHarness();
  const state = createState();
  state.dungeonReplay.playing = true;
  const adapter = createDungeonRenderAdapter({
    state,
    el,
    documentRef,
    selectedDungeon: () => ({ id: "rat_cellar", nodes: [] }),
    repeatMode: () => "manual",
    formatReward: () => "none",
    replaySpeedLabel: () => "2x",
    portraitStyle: () => ""
  });

  adapter.renderDungeonReplay();

  assert.equal(el.nodeMap.innerHTML, "");
  assert.equal(el.estimateBox.textContent, "");
  assert.equal(el.replayStatus.textContent, "event 1/1 / playing");
  assert.equal(controls.replayPlayBtn.textContent, "pause");
  assert.equal(controls.replaySpeedBtn.textContent, "speed 2x");
});
