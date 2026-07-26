import assert from "node:assert/strict";
import test from "node:test";

import { setupMapInteractions } from "../src/app/mapInteractions.js";

function createMapElement() {
  const listeners = {};
  const captured = new Set();
  const classes = new Set();
  return {
    listeners,
    classList: {
      add(name) {
        classes.add(name);
      },
      contains(name) {
        return classes.has(name);
      },
      remove(name) {
        classes.delete(name);
      }
    },
    addEventListener(type, callback, options) {
      listeners[type] = { callback, options };
    },
    getBoundingClientRect() {
      return { left: 10, top: 20, width: 400, height: 300 };
    },
    hasPointerCapture(pointerId) {
      return captured.has(pointerId);
    },
    releasePointerCapture(pointerId) {
      captured.delete(pointerId);
    },
    setPointerCapture(pointerId) {
      captured.add(pointerId);
    }
  };
}

function createTarget(isPoi = false, isContextAction = false) {
  return {
    closest(selector) {
      if (selector === "[data-location-id], [data-map-context-action]") {
        return isPoi || isContextAction ? {} : null;
      }
      return isPoi && selector === "[data-location-id]" ? {} : null;
    }
  };
}

test("setupMapInteractions drags the map and releases pointer capture", () => {
  const mapElement = createMapElement();
  const mapView = { panX: 4, panY: 6, zoom: 1 };
  let transformCalls = 0;

  setupMapInteractions({
    mapElement,
    mapView,
    minZoom: 0.5,
    maxZoom: 4,
    applyMapTransform: () => {
      transformCalls += 1;
    },
    renderLocationDetail: () => {}
  });

  mapElement.listeners.pointerdown.callback({ clientX: 20, clientY: 30, pointerId: 7, target: createTarget(false) });
  assert.equal(mapView.dragging, true);
  assert.equal(mapElement.classList.contains("dragging"), true);
  assert.equal(mapElement.hasPointerCapture(7), true);

  mapElement.listeners.pointermove.callback({ clientX: 35, clientY: 50 });
  assert.equal(mapView.panX, 19);
  assert.equal(mapView.panY, 26);
  assert.equal(transformCalls, 1);

  mapElement.listeners.pointerup.callback({ pointerId: 7 });
  assert.equal(mapView.dragging, false);
  assert.equal(mapElement.classList.contains("dragging"), false);
  assert.equal(mapElement.hasPointerCapture(7), false);
});

test("setupMapInteractions ignores pointerdown on POI labels", () => {
  const mapElement = createMapElement();
  const mapView = { panX: 0, panY: 0, zoom: 1 };

  setupMapInteractions({
    mapElement,
    mapView,
    minZoom: 0.5,
    maxZoom: 4,
    applyMapTransform: () => {},
    renderLocationDetail: () => {}
  });

  mapElement.listeners.pointerdown.callback({ clientX: 20, clientY: 30, pointerId: 7, target: createTarget(true) });
  assert.equal(mapView.dragging, undefined);
  assert.equal(mapElement.hasPointerCapture(7), false);
});

test("setupMapInteractions ignores pointerdown on map context actions", () => {
  const mapElement = createMapElement();
  const mapView = { panX: 0, panY: 0, zoom: 1 };

  setupMapInteractions({
    mapElement,
    mapView,
    minZoom: 0.5,
    maxZoom: 3,
    applyMapTransform: () => {},
    renderLocationDetail: () => {}
  });

  mapElement.listeners.pointerdown.callback({ clientX: 20, clientY: 30, pointerId: 7, target: createTarget(false, true) });
  assert.equal(mapView.dragging, undefined);
  assert.equal(mapElement.hasPointerCapture(7), false);
});

test("setupMapInteractions zooms around cursor and refreshes side detail", () => {
  const mapElement = createMapElement();
  const mapView = { panX: 0, panY: 0, zoom: 1 };
  let prevented = false;
  let transformCalls = 0;
  let detailCalls = 0;

  setupMapInteractions({
    mapElement,
    mapView,
    minZoom: 0.5,
    maxZoom: 4,
    applyMapTransform: () => {
      transformCalls += 1;
    },
    renderLocationDetail: () => {
      detailCalls += 1;
    }
  });

  assert.equal(mapElement.listeners.wheel.options.passive, false);
  mapElement.listeners.wheel.callback({
    clientX: 110,
    clientY: 120,
    deltaY: -1,
    preventDefault: () => {
      prevented = true;
    }
  });

  assert.equal(prevented, true);
  assert.equal(mapView.zoom, 1.12);
  assert.equal(mapView.panX.toFixed(1), "-12.0");
  assert.equal(mapView.panY.toFixed(1), "-12.0");
  assert.equal(transformCalls, 1);
  assert.equal(detailCalls, 1);
});

test("setupMapInteractions reads replaced map view through getter", () => {
  const mapElement = createMapElement();
  const state = {
    mapView: { panX: 0, panY: 0, zoom: 1 }
  };
  let transformCalls = 0;

  setupMapInteractions({
    mapElement,
    mapView: () => state.mapView,
    minZoom: 0.5,
    maxZoom: 4,
    applyMapTransform: () => {
      transformCalls += 1;
    },
    renderLocationDetail: () => {}
  });

  state.mapView = { panX: 10, panY: 20, zoom: 1 };
  mapElement.listeners.pointerdown.callback({ clientX: 20, clientY: 30, pointerId: 7, target: createTarget(false) });
  mapElement.listeners.pointermove.callback({ clientX: 25, clientY: 40 });

  assert.equal(state.mapView.panX, 15);
  assert.equal(state.mapView.panY, 30);
  assert.equal(transformCalls, 1);
});
