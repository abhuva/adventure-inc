import assert from "node:assert/strict";
import test from "node:test";

import { createSystemsRenderAdapter } from "../src/app/systemsRenderAdapter.js";

function element() {
  return {
    innerHTML: ""
  };
}

test("systems render adapter renders blueprints and log from app state", () => {
  const el = {
    blueprintRows: element(),
    logRows: element()
  };
  const adapter = createSystemsRenderAdapter({
    state: {
      blueprints: {
        iron_blade: true
      },
      log: [
        {
          type: "bad",
          stamp: "d3 04:00",
          text: "POI data load failed"
        }
      ]
    },
    el,
    blueprints: {
      iron_blade: {
        name: "Iron Blade",
        source: "Rat Cellar",
        cost: { ore: 2 },
        effect: "+2 atk"
      }
    }
  });

  adapter.renderSystems();

  assert.match(el.blueprintRows.innerHTML, /Iron Blade/);
  assert.match(el.blueprintRows.innerHTML, /state: unlocked/);
  assert.match(el.logRows.innerHTML, /d3 04:00/);
  assert.match(el.logRows.innerHTML, /POI data load failed/);
});
