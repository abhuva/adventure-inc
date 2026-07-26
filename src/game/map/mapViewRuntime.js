import { clamp } from "../../core/math.js";

export function beginMapDrag(mapView, { clientX, clientY }) {
  mapView.dragging = true;
  mapView.dragStartX = clientX;
  mapView.dragStartY = clientY;
  mapView.dragPanX = mapView.panX;
  mapView.dragPanY = mapView.panY;
}

export function updateMapDrag(mapView, { clientX, clientY }) {
  if (!mapView.dragging) return false;
  mapView.panX = mapView.dragPanX + clientX - mapView.dragStartX;
  mapView.panY = mapView.dragPanY + clientY - mapView.dragStartY;
  return true;
}

export function endMapDrag(mapView) {
  if (!mapView.dragging) return false;
  mapView.dragging = false;
  return true;
}

export function screenToWorld(mapView, screenX, screenY) {
  return {
    x: (screenX - mapView.panX) / mapView.zoom,
    y: (screenY - mapView.panY) / mapView.zoom
  };
}

export function zoomMapAt(mapView, { clientX, clientY, rect, factor, minZoom, maxZoom }) {
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const before = screenToWorld(mapView, localX, localY);
  const nextZoom = clamp(mapView.zoom * factor, minZoom, maxZoom);
  mapView.zoom = nextZoom;
  mapView.panX = localX - before.x * nextZoom;
  mapView.panY = localY - before.y * nextZoom;
}

export function mapTransformStyle(mapView) {
  return `translate(${mapView.panX}px, ${mapView.panY}px) scale(${mapView.zoom})`;
}

export function mapStatusText({ operationCount, zoom, worldSize, worldWidth, worldHeight }) {
  const width = worldWidth ?? worldSize;
  const height = worldHeight ?? worldSize ?? width;
  return `${operationCount} party op${operationCount === 1 ? "" : "s"} / zoom ${zoom.toFixed(2)}x / world ${width}x${height}`;
}
