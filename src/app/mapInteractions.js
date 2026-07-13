import {
  beginMapDrag,
  endMapDrag,
  updateMapDrag,
  zoomMapAt
} from "../game/map/mapViewRuntime.js";

export function setupMapInteractions({
  mapElement,
  mapView,
  minZoom,
  maxZoom,
  applyMapTransform,
  renderLocationDetail
}) {
  mapElement.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-location-id]")) return;
    beginMapDrag(mapView, event);
    mapElement.setPointerCapture(event.pointerId);
    mapElement.classList.add("dragging");
  });

  mapElement.addEventListener("pointermove", (event) => {
    if (!updateMapDrag(mapView, event)) return;
    applyMapTransform();
  });

  const finishDrag = (event) => {
    if (!endMapDrag(mapView)) return;
    mapElement.classList.remove("dragging");
    if (event.pointerId !== undefined && mapElement.hasPointerCapture(event.pointerId)) {
      mapElement.releasePointerCapture(event.pointerId);
    }
  };

  mapElement.addEventListener("pointerup", finishDrag);
  mapElement.addEventListener("pointercancel", finishDrag);
  mapElement.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomMapAt(mapView, {
      clientX: event.clientX,
      clientY: event.clientY,
      rect: mapElement.getBoundingClientRect(),
      factor: event.deltaY < 0 ? 1.12 : 0.88,
      minZoom,
      maxZoom
    });
    applyMapTransform();
    renderLocationDetail();
  }, { passive: false });
}
