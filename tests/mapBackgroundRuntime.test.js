import assert from "node:assert/strict";
import test from "node:test";

import {
  applyMapBackgroundDimensions,
  loadMapBackgroundDimensions,
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
