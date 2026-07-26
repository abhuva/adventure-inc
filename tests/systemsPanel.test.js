import assert from "node:assert/strict";
import test from "node:test";

import { renderSystemsPanel } from "../src/ui/systemsPanel.js";

function createElement() {
  return {
    innerHTML: ""
  };
}

test("renderSystemsPanel renders blueprints", () => {
  const el = {
    blueprintRows: createElement()
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
    }
  });

  assert.match(el.blueprintRows.innerHTML, /Iron Blade/);
  assert.match(el.blueprintRows.innerHTML, /state: unlocked/);
});
