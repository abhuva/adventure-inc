import assert from "node:assert/strict";
import test from "node:test";

import { createHeaderRenderAdapter } from "../src/app/headerRenderAdapter.js";

function element() {
  return {
    textContent: ""
  };
}

test("header render adapter renders header from app state and selected party", () => {
  const autoTimeBtn = element();
  const el = {
    dayLabel: element(),
    phaseLabel: element(),
    runStateLabel: element(),
    tavernStatus: element(),
    tavernResourceLine: element(),
    partyStatus: element(),
    toggleRosterViewBtn: element()
  };
  const state = {
    day: 4,
    hour: 7,
    timeRunning: true,
    lastEstimate: null,
    resources: {
      coin: 12,
      food: 8,
      wood: 3,
      ore: 2,
      hide: 1
    },
    tavern: {
      capacity: 6,
      fame: 5
    },
    roster: [
      { id: "hero_1" },
      { id: "hero_2" }
    ],
    rosterView: "compact"
  };
  const adapter = createHeaderRenderAdapter({
    state,
    el,
    documentRef: {
      getElementById(id) {
        return id === "autoTimeBtn" ? autoTimeBtn : null;
      }
    },
    selectedParty: () => ({
      name: "Alpha",
      memberIds: ["hero_1"]
    })
  });

  adapter.renderHeader();

  assert.equal(el.dayLabel.textContent, "day 4");
  assert.equal(el.phaseLabel.textContent, "phase 07:00");
  assert.equal(el.runStateLabel.textContent, "auto time");
  assert.equal(autoTimeBtn.textContent, "auto time: on");
  assert.equal(el.tavernStatus.textContent, "capacity 2/6 / fame 5");
  assert.match(el.tavernResourceLine.textContent, /coin 12/);
  assert.equal(el.partyStatus.textContent, "2 adventurers / selected Alpha (1)");
  assert.equal(el.toggleRosterViewBtn.textContent, "view: compact");
});
