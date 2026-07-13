export function dungeonOptionsHtml(dungeons = []) {
  return dungeons.map((dungeon) => `<option value="${dungeon.id}">${dungeon.name}</option>`).join("");
}

export function stopNodeOptionsHtml(dungeon) {
  return [
    `<option value="all">full run</option>`,
    ...(dungeon?.nodes || []).map((node, index) => `<option value="${index}">${index + 1}: ${node.name}</option>`)
  ].join("");
}

export function partyOptionsHtml(parties = []) {
  return parties.map((party) => `<option value="${party.id}">${party.name}</option>`).join("");
}

export function renderDungeonSelect(selectEl, dungeons = []) {
  selectEl.innerHTML = dungeonOptionsHtml(dungeons);
}

export function renderStopNodeSelect(selectEl, dungeon) {
  selectEl.innerHTML = stopNodeOptionsHtml(dungeon);
}

export function renderPartySelect(selectEl, parties = [], selectedPartyId = "") {
  selectEl.innerHTML = partyOptionsHtml(parties);
  selectEl.value = selectedPartyId;
}
