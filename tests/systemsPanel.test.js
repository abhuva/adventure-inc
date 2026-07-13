import assert from "node:assert/strict";
import test from "node:test";

import { renderSystemsPanel } from "../src/ui/systemsPanel.js";

function createElement() {
  return {
    innerHTML: ""
  };
}

test("renderSystemsPanel renders blueprints and log entries", () => {
  const el = {
    blueprintRows: createElement(),
    logRows: createElement()
  };

  renderSystemsPanel({
    el,
    blueprints: {
      iron_blade: {
        name: "Iron Blade",
        source: "Rat Cellar",
        cost: { ore: 2 },
        effect: "+2 atk"
      }
    },
    unlockedBlueprints: {
      iron_blade: true
    },
    logEntries: [
      {
        type: "ok",
        stamp: "d1 00:00",
        text: "ready"
      }
    ]
  });

  assert.match(el.blueprintRows.innerHTML, /Iron Blade/);
  assert.match(el.blueprintRows.innerHTML, /state: unlocked/);
  assert.match(el.logRows.innerHTML, /d1 00:00/);
  assert.match(el.logRows.innerHTML, /ready/);
});
