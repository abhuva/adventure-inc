import { formatLabel } from "../core/format.js";

export const CONTINENT_MAP_SIZE = { width: 1536, height: 1024 };

export function expeditionRouteDetailHtml({ route, origin, destination, costText, readiness }) {
  if (!route) return `<div class="empty-state">no expedition route selected</div>`;
  return `
    <div class="detail-title">${route.name}</div>
    <div class="detail-line">origin: ${origin?.name || route.originContinentId}</div>
    <div class="detail-line">destination: ${destination?.name || route.destinationContinentId}</div>
    <div class="detail-line">travel time: ${Math.ceil(route.durationHours / 24)} days (${route.durationHours}h)</div>
    <div class="detail-line">cost: ${costText}</div>
    <div class="detail-line">capacity: ${formatLabel(route.capacity)}</div>
    <div class="detail-line">known hazards: ${route.hazards}</div>
    <div class="detail-line">${route.description}</div>
    <div class="detail-line">readiness: ${readiness.message}</div>
  `;
}

export function expeditionPartyDetailHtml({ party, members, memberStatus }) {
  if (!party) return `<div class="empty-state">no party available on this continent</div>`;
  if (!members.length) {
    return `
      <div class="detail-title">${party.name}</div>
      <div class="detail-line">members: none</div>
    `;
  }
  return `
    <div class="detail-title">${party.name}</div>
    <table>
      <thead><tr><th>Hero</th><th>State</th><th>HP</th></tr></thead>
      <tbody>
        ${members.map((hero) => {
          const status = memberStatus(hero);
          return `<tr><td>${hero.name}</td><td>${status.state}</td><td>${hero.hp}/${status.hpMax}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
}

export function continentMapHtml({
  continents = [],
  unlockedById = {},
  focusedContinentId,
  selectedContinentId,
  contextMenu = null,
  mapSize = CONTINENT_MAP_SIZE
}) {
  const markers = continents.map((continent) => continentMarkerHtml({
    continent,
    unlocked: Boolean(unlockedById[continent.id]),
    focused: continent.id === focusedContinentId,
    selected: continent.id === selectedContinentId,
    mapSize
  })).join("");
  return `
    <div class="continent-world">
      ${markers}
      ${continentContextMenuHtml(contextMenu)}
    </div>
  `;
}

export function continentMarkerHtml({
  continent,
  unlocked,
  focused,
  selected,
  mapSize = CONTINENT_MAP_SIZE
}) {
  const left = ((continent.coord?.x || 0) / mapSize.width * 100).toFixed(3);
  const top = ((continent.coord?.y || 0) / mapSize.height * 100).toFixed(3);
  const stateClass = unlocked ? "unlocked" : "locked";
  return `
    <button class="continent-marker ${stateClass} ${focused ? "focused" : ""} ${selected ? "selected" : ""}" data-continent-id="${continent.id}" style="left:${left}%;top:${top}%">
      ${continent.name}
      <span class="map-label">${unlocked ? "known" : "locked"}</span>
    </button>
  `;
}

export function continentContextMenuHtml(contextMenu = null) {
  if (!contextMenu?.continentId) return "";
  return `
    <div class="continent-context-menu" style="left:${contextMenu.x}px;top:${contextMenu.y}px">
      <button type="button" data-continent-context-action="switch">switch</button>
      <button type="button" data-continent-context-action="cancel">cancel</button>
    </div>
  `;
}

export function continentDetailHtml({ continent, focused, unlocked = false, heroCount, partyCount, catchUpReport = null }) {
  if (!continent) return `<div class="empty-state">no continent selected</div>`;
  const catchUpLine = catchUpReport?.continentId === continent.id
    ? `<div class="detail-line">last catch-up: ${catchUpReport.summary}</div>`
    : "";
  return `
    <div class="detail-title">${continent.name}${focused ? " / focused" : ""}</div>
    <div class="detail-line">status: ${unlocked ? "known" : "locked"}</div>
    <div class="detail-line">${continent.description}</div>
    <div class="detail-line">local adventurers: ${heroCount}</div>
    <div class="detail-line">local parties: ${partyCount}</div>
    ${catchUpLine}
    <div class="detail-line">rule modifiers:</div>
    <ul class="notes">
      ${(continent.rules || []).map((rule) => `<li>${rule}</li>`).join("")}
    </ul>
  `;
}

export function transferRowsHtml({ transfers, pendingArrivals, routeName, heroName }) {
  const rows = [];
  pendingArrivals.forEach((arrival) => {
    rows.push(`
      <div class="detail-line">arrived: ${arrival.routeName} / ${arrival.partyName} / ${arrival.memberIds.map(heroName).join(", ")}</div>
    `);
  });
  transfers.forEach((transfer) => {
    rows.push(`
      <div class="detail-line">traveling: ${routeName(transfer.routeId)} / ${transfer.partyName} / ${Math.max(0, transfer.durationHours - transfer.elapsedHours)}h left</div>
    `);
  });
  return rows.join("") || `<div class="detail-line">no active transfers</div>`;
}

export function arrivalPromptHtml({ arrival, heroName }) {
  if (!arrival) return "";
  return `
    <div class="encounter-panel">
      <div class="panel-head encounter-head">
        <div>
          <div class="encounter-kicker">expedition arrived</div>
          <h2>${arrival.destinationName} reached</h2>
        </div>
      </div>
      <div class="encounter-body">
        <p>${arrival.partyName} has made landfall after ${arrival.routeName}.</p>
        <p>Arrived adventurers: ${arrival.memberIds.map(heroName).join(", ")}</p>
      </div>
      <div class="encounter-actions">
        <button data-expedition-arrival-action="switch">switch to ${arrival.destinationName}</button>
        <button data-expedition-arrival-action="stay">stay here</button>
      </div>
    </div>
  `;
}
