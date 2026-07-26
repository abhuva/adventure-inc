import assert from "node:assert/strict";
import test from "node:test";

import {
  applyMapBackgroundDimensions,
  applyMapBackgroundSet,
  loadMapBackgroundDimensions,
  loadMapBackgroundSet,
  mapWorldForContinent,
  normalizeMapBackgroundDimensions
} from "../src/app/mapBackgroundRuntime.js";

test("normalizeMapBackgroundDimensions uses image dimensions and fallback values", () => {
  assert.deepEqual(normalizeMapBackgroundDimensions({
    src: "assets/map-bg.png",
    width: 2048,
    height: 1536
  }), {
    src: "assets/map-bg.png",
    width: 2048,
    height: 1536,
    backgroundImage: "assets/map-bg.png"
  });

  assert.deepEqual(normalizeMapBackgroundDimensions({
    src: "assets/map-bg.png",
    width: 0,
    height: Number.NaN,
    fallbackWidth: 100,
    fallbackHeight: 200
  }), {
    src: "assets/map-bg.png",
    width: 100,
    height: 200,
    backgroundImage: "assets/map-bg.png"
  });
});

test("loadMapBackgroundDimensions reads natural image dimensions", async () => {
  class FakeImage {
    constructor() {
      this.naturalWidth = 3000;
      this.naturalHeight = 1800;
    }

    set src(value) {
      this._src = value;
      queueMicrotask(() => this.onload());
    }
  }

  const dimensions = await loadMapBackgroundDimensions({
    src: "assets/map-bg.png",
    ImageCtor: FakeImage
  });

  assert.deepEqual(dimensions, {
    src: "assets/map-bg.png",
    width: 3000,
    height: 1800,
    backgroundImage: "assets/map-bg.png"
  });
});

test("loadMapBackgroundSet reads continent image dimensions", async () => {
  class FakeImage {
    constructor() {
      this.naturalWidth = 2048;
      this.naturalHeight = 1024;
    }

    set src(value) {
      this._src = value;
      queueMicrotask(() => this.onload());
    }
  }

  const dimensions = await loadMapBackgroundSet({
    backgrounds: {
      old_marches: { src: "assets/map-bg.png" },
      ash_coast: { src: "assets/map-ash-coast.png" }
    },
    ImageCtor: FakeImage
  });

  assert.equal(dimensions.old_marches.backgroundImage, "assets/map-bg.png");
  assert.equal(dimensions.ash_coast.backgroundImage, "assets/map-ash-coast.png");
  assert.equal(dimensions.ash_coast.width, 2048);
});

test("applyMapBackgroundDimensions writes runtime map world state", () => {
  const state = {};

  applyMapBackgroundDimensions(state, {
    src: "assets/map-bg.png",
    width: 1600,
    height: 900
  });

  assert.deepEqual(state.mapWorld, {
    src: "assets/map-bg.png",
    width: 1600,
    height: 900,
    backgroundImage: "assets/map-bg.png"
  });
});

test("applyMapBackgroundSet switches map world by focused continent", () => {
  const state = { world: { focusedContinentId: "ash_coast" } };

  applyMapBackgroundSet(state, {
    old_marches: { src: "assets/map-bg.png", width: 1600, height: 900 },
    ash_coast: { src: "assets/map-ash-coast.png", width: 1200, height: 800 }
  });

  assert.equal(mapWorldForContinent(state).backgroundImage, "assets/map-ash-coast.png");
  assert.equal(mapWorldForContinent(state, "old_marches").width, 1600);
});
