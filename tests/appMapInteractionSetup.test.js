import assert from "node:assert/strict";
import test from "node:test";

import { setupAppMapInteractions } from "../src/app/appMapInteractionSetup.js";

test("setupAppMapInteractions maps app state and config to map interaction bindings", () => {
  const overlandMap = {};
  const mapView = { panX: 12, panY: 24, zoom: 1.5 };
  const applyMapTransform = () => {};
  const renderLocationDetail = () => {};
  let received = null;

  setupAppMapInteractions({
    el: { overlandMap },
    state: { mapView },
    mapViewConfig: { minZoom: 0.4, maxZoom: 3.5, worldSize: 1024 },
    applyMapTransform,
    renderLocationDetail,
    setupMapInteractions: (args) => {
      received = args;
    }
  });

  assert.equal(received.mapElement, overlandMap);
  assert.equal(received.mapView, mapView);
  assert.equal(received.minZoom, 0.4);
  assert.equal(received.maxZoom, 3.5);
  assert.equal(received.applyMapTransform, applyMapTransform);
  assert.equal(received.renderLocationDetail, renderLocationDetail);
});
