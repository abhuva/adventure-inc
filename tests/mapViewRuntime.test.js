import assert from "node:assert/strict";
import test from "node:test";

import {
  beginMapDrag,
  endMapDrag,
  mapStatusText,
  mapTransformStyle,
  screenToWorld,
  updateMapDrag,
  zoomMapAt
} from "../src/game/map/mapViewRuntime.js";

function mapView(overrides = {}) {
  return {
    panX: 24,
    panY: 12,
    zoom: 2,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragPanX: 0,
    dragPanY: 0,
    ...overrides
  };
}

test("beginMapDrag stores drag start and pan origin", () => {
  const state = mapView();

  beginMapDrag(state, { clientX: 100, clientY: 120 });

  assert.equal(state.dragging, true);
  assert.equal(state.dragStartX, 100);
  assert.equal(state.dragStartY, 120);
  assert.equal(state.dragPanX, 24);
  assert.equal(state.dragPanY, 12);
});

test("updateMapDrag mutates pan only while dragging", () => {
  const idle = mapView();
  assert.equal(updateMapDrag(idle, { clientX: 10, clientY: 10 }), false);
  assert.equal(idle.panX, 24);

  const state = mapView();
  beginMapDrag(state, { clientX: 100, clientY: 100 });

  assert.equal(updateMapDrag(state, { clientX: 140, clientY: 80 }), true);
  assert.equal(state.panX, 64);
  assert.equal(state.panY, -8);
});

test("endMapDrag clears dragging state", () => {
  const state = mapView({ dragging: true });

  assert.equal(endMapDrag(state), true);
  assert.equal(state.dragging, false);
  assert.equal(endMapDrag(state), false);
});

test("screenToWorld converts screen coordinates using pan and zoom", () => {
  assert.deepEqual(screenToWorld(mapView(), 44, 32), {
    x: 10,
    y: 10
  });
});

test("zoomMapAt preserves cursor world point and clamps zoom", () => {
  const state = mapView({ panX: 0, panY: 0, zoom: 1 });

  zoomMapAt(state, {
    clientX: 100,
    clientY: 100,
    rect: { left: 0, top: 0 },
    factor: 2,
    minZoom: 0.5,
    maxZoom: 3
  });

  assert.equal(state.zoom, 2);
  assert.equal(state.panX, -100);
  assert.equal(state.panY, -100);

  zoomMapAt(state, {
    clientX: 100,
    clientY: 100,
    rect: { left: 0, top: 0 },
    factor: 99,
    minZoom: 0.5,
    maxZoom: 3
  });

  assert.equal(state.zoom, 3);
});

test("mapTransformStyle and mapStatusText format map UI state", () => {
  assert.equal(mapTransformStyle(mapView()), "translate(24px, 12px) scale(2)");
  assert.equal(
    mapStatusText({ operationCount: 1, zoom: 0.65, worldWidth: 2048, worldHeight: 1024 }),
    "1 party op / zoom 0.65x / world 2048x1024"
  );
  assert.equal(
    mapStatusText({ operationCount: 2, zoom: 1, worldSize: 1024 }),
    "2 party ops / zoom 1.00x / world 1024x1024"
  );
});
