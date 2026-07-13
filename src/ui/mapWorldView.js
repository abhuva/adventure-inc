export function mapRouteHtml(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return `<div class="map-route" style="left:${from.x}px;top:${from.y}px;width:${length}px;transform:rotate(${angle}deg)"></div>`;
}

export function mapPoiButtonHtml(item, selectedLocationId) {
  return `
    <button class="map-poi ${item.type === "tavern" ? "tavern" : ""} ${item.id === selectedLocationId ? "selected" : ""}" data-location-id="${item.id}" style="left:${item.coord.x}px;top:${item.coord.y}px">
      ${item.name}
      <span class="map-label">${item.coord.x},${item.coord.y}</span>
    </button>
  `;
}

export function mapWorldHtml({ poi, tavernCoord, selectedLocationId }) {
  const routeHtml = poi
    .filter((item) => item.id !== "tavern")
    .map((item) => mapRouteHtml(tavernCoord, item.coord))
    .join("");
  const poiHtml = poi.map((item) => mapPoiButtonHtml(item, selectedLocationId)).join("");
  return `<div id="mapWorld" class="map-world">${routeHtml}${poiHtml}<div id="mapActors" class="map-actors"></div></div>`;
}

export function workerActorHtml({ site, count, coord }) {
  if (count <= 0) return "";
  return `
    <div class="map-actor worker" title="${site.name} workers: ${count}" style="left:${coord.x}px;top:${coord.y}px"></div>
  `;
}

export function partyActorHtml({ operation, phaseState, coord }) {
  const busy = phaseState.phase.from.x === phaseState.phase.to.x && phaseState.phase.from.y === phaseState.phase.to.y;
  return `
    <div class="map-actor party ${busy ? "busy" : ""}" title="${operation.label}: ${phaseState.phase.name}" style="left:${coord.x}px;top:${coord.y}px"></div>
  `;
}

export function mapActorsHtml({ workSites, jobs, workerCoord, operations, currentOperationPhase, interpolateCoord }) {
  const workerHtml = workSites.map((site) => workerActorHtml({
    site,
    count: jobs[site.id] || 0,
    coord: workerCoord(site)
  })).join("");
  const operationHtml = operations.map((operation) => {
    const phaseState = currentOperationPhase(operation);
    return partyActorHtml({
      operation,
      phaseState,
      coord: interpolateCoord(phaseState.phase.from, phaseState.phase.to, phaseState.progress)
    });
  }).join("");
  return workerHtml + operationHtml;
}
