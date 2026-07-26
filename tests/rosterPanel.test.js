import assert from "node:assert/strict";
import test from "node:test";

import { renderRosterPanel } from "../src/ui/rosterPanel.js";

function fakeButton(heroId) {
  return {
    dataset: { focus: heroId },
    closest(selector) {
      return selector === "[data-focus]" ? this : null;
    }
  };
}

function fakeRosterRows(buttons) {
  const classes = new Set();
  return {
    innerHTML: "",
    classList: {
      contains(name) {
        return classes.has(name);
      },
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      }
    },
    querySelectorAll(selector) {
      return selector === "[data-focus]" ? buttons : [];
    },
    contains(element) {
      return buttons.includes(element);
    }
  };
}

test("renderRosterPanel renders cards and binds focus buttons", () => {
  const adaButton = fakeButton("ada");
  const benButton = fakeButton("ben");
  const el = { rosterRows: fakeRosterRows([adaButton, benButton]) };
  const focused = [];

  renderRosterPanel({
    el,
    state: {
      rosterView: "minimized",
      focusedHeroId: "ada",
      roster: [
        { id: "ada", name: "Ada", race: "human", role: "Founder", level: 1, hp: 10, spriteIndex: 0 },
        { id: "ben", name: "Ben", race: "elf", role: "Scout", level: 1, hp: 8, spriteIndex: 1 }
      ]
    },
    atlas: { columns: 7, rows: 7 },
    heroStats: (hero) => ({ hpMax: hero.hp, atk: 1, def: 1, utility: 1 }),
    characterState: () => ({ state: "Idle", party: "Alpha" }),
    onFocusHero: (heroId) => focused.push(heroId)
  });

  assert.equal(el.rosterRows.classList.contains("minimized"), true);
  assert.match(el.rosterRows.innerHTML, /Ada/);
  assert.match(el.rosterRows.innerHTML, /Ben/);

  el.rosterRows.onclick({ target: benButton });
  assert.deepEqual(focused, ["ben"]);
});
