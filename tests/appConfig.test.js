import assert from "node:assert/strict";
import test from "node:test";

import {
  CHARACTER_ATLAS,
  MAP_BACKGROUND,
  MAP_BACKGROUNDS,
  MAP_VIEW_CONFIG,
  REPLAY_DEFAULT_MS,
  TEMPLE_INVENTORY_SLOTS
} from "../src/app/appConfig.js";

test("app config exposes stable prototype defaults", () => {
  assert.deepEqual(CHARACTER_ATLAS, { columns: 7, rows: 7 });
  assert.deepEqual(MAP_VIEW_CONFIG, { minZoom: 0.35, maxZoom: 3 });
  assert.deepEqual(MAP_BACKGROUND, { src: "assets/map-bg.png", fallbackWidth: 1024, fallbackHeight: 1024 });
  assert.equal(MAP_BACKGROUNDS.ash_coast.src, "assets/map-ash-coast.png");
  assert.equal(TEMPLE_INVENTORY_SLOTS, 20);
  assert.equal(REPLAY_DEFAULT_MS, 650);
});
