export function locationDetailHtml({
  location,
  party,
  partyReady,
  tavernCoord,
  distanceText,
  rewardText,
  heroName,
  assignedWorkers = 0
}) {
  const lines = [
    `<div class="detail-title">${location.name}</div>`,
    location.titleImage ? `<img class="poi-title-image" src="${location.titleImage}" alt="${location.name}">` : "",
    `<div class="detail-line">type: ${location.type}</div>`,
    `<div class="detail-line">coord: ${location.coord.x},${location.coord.y}</div>`,
    `<div class="detail-line">distance from tavern: ${distanceText(tavernCoord, location.coord)}</div>`,
    `<div class="detail-line">${location.description}</div>`
  ];

  if (location.type === "work") {
    lines.push(`<div class="detail-line">output: ${rewardText(location.output)}</div>`);
    lines.push(`<div class="detail-line">assigned workers: ${assignedWorkers}</div>`);
  }

  if (location.type === "dungeon") {
    const members = party.memberIds.map(heroName).join(", ") || "empty";
    lines.push(`<div class="detail-line">selected party: ${party.name} (${members})</div>`);
    lines.push(`<div class="detail-line">party readiness: ${partyReady.message}</div>`);
    lines.push(`<button id="assignSelectedPartyBtn" ${partyReady.canQueue ? "" : "disabled"}>assign repeated route</button>`);
  }

  return lines.join("");
}

export function operationRowsHtml({
  operations,
  repeatedPlans,
  resources,
  currentOperationPhase
}) {
  const repeatedOnlyRows = Object.values(repeatedPlans)
    .filter((estimate) => !operations.some((operation) => operation.partyId === estimate.partyId))
    .map((estimate) => `
      <tr>
        <td>${estimate.partyName}: ${estimate.dungeonName}</td>
        <td>repeated paused</td>
        <td>food ${resources.food}/${estimate.foodCost}</td>
      </tr>
    `);
  if (!operations.length && !repeatedOnlyRows.length) {
    return `<tr><td colspan="3">no party operations queued</td></tr>`;
  }
  const operationRows = operations.map((operation) => {
    const phaseState = currentOperationPhase(operation);
    const repeatTag = repeatedPlans[operation.partyId] ? " / repeated" : "";
    return `
      <tr>
        <td>${operation.label}</td>
        <td>${phaseState.phase.name}${repeatTag}</td>
        <td>${Math.ceil(phaseState.remaining)}h</td>
      </tr>
    `;
  });
  return operationRows.concat(repeatedOnlyRows).join("");
}

export function poiRowsHtml({ poi, tavernCoord, distanceText }) {
  return poi.filter((item) => item.id !== "tavern").map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.coord.x}</td>
      <td>${item.coord.y}</td>
      <td>${distanceText(tavernCoord, item.coord)}</td>
    </tr>
  `).join("");
}
