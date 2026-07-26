import { setupMapInteractions as setupMapInteractionBindings } from "./mapInteractions.js";

export function setupAppMapInteractions({
  el,
  state,
  mapViewConfig,
  applyMapTransform,
  renderLocationDetail,
  setupMapInteractions = setupMapInteractionBindings
}) {
  setupMapInteractions({
    mapElement: el.overlandMap,
    mapView: () => state.mapView,
    minZoom: mapViewConfig.minZoom,
    maxZoom: mapViewConfig.maxZoom,
    applyMapTransform,
    renderLocationDetail
  });
}
