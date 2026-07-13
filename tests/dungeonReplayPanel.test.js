import assert from "node:assert/strict";
import test from "node:test";

import { renderDungeonReplayPanel } from "../src/ui/dungeonReplayPanel.js";

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

test("renderDungeonReplayPanel renders empty disabled state", () => {
  const { controls, documentRef, el } = createHarness();

  renderDungeonReplayPanel({
    el,
    documentRef,
    replay: { events: [], cursor: 0, playing: false },
    replaySpeedLabel: () => "1x",
    renderActors: () => ""
  });

  assert.equal(el.replayTimelineSlider.max, "0");
  assert.equal(el.replayTimelineSlider.value, "0");
  assert.equal(el.replayTimelineSlider.disabled, true);
  assert.equal(el.replayStatus.textContent, "no replay");
  assert.equal(controls.replayFirstBtn.disabled, true);
  assert.equal(controls.replayPlayBtn.textContent, "play");
  assert.equal(controls.replaySpeedBtn.textContent, "speed 1x");
  assert.match(el.replayPartyActors.innerHTML, /no party snapshot/);
  assert.match(el.replayEnemyActors.innerHTML, /no enemy snapshot/);
  assert.equal(el.replayActionIcon.textContent, "--");
});

test("renderDungeonReplayPanel renders active event state", () => {
  const { controls, documentRef, el } = createHarness();
  const replay = {
    cursor: 1,
    playing: true,
    events: [
      { icon: ">", text: "start", partyActors: [], enemyActors: [] },
      {
        icon: "!",
        text: "Ada hits Rat",
        partyActors: [{ id: "ada" }],
        enemyActors: [{ id: "rat" }]
      }
    ]
  };

  renderDungeonReplayPanel({
    el,
    documentRef,
    replay,
    replaySpeedLabel: () => "2x",
    renderActors: (actors) => actors.map((actor) => actor.id).join(",")
  });

  assert.equal(el.replayTimelineSlider.max, "1");
  assert.equal(el.replayTimelineSlider.value, "1");
  assert.equal(el.replayTimelineSlider.disabled, false);
  assert.equal(el.replayStatus.textContent, "event 2/2 / playing");
  assert.equal(controls.replayFirstBtn.disabled, false);
  assert.equal(controls.replayPlayBtn.textContent, "pause");
  assert.equal(controls.replaySpeedBtn.textContent, "speed 2x");
  assert.equal(el.replayPartyActors.innerHTML, "ada");
  assert.equal(el.replayEnemyActors.innerHTML, "rat");
  assert.equal(el.replayActionIcon.textContent, "!");
  assert.equal(el.replayEventText.textContent, "Ada hits Rat");
  assert.match(el.replayEventRows.innerHTML, /Ada hits Rat/);
  assert.match(el.replayEventRows.innerHTML, /current/);
});
