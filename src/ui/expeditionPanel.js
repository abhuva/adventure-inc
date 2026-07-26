import {
  arrivalPromptHtml,
  continentDetailHtml,
  continentMapHtml,
  expeditionPartyDetailHtml,
  expeditionRouteDetailHtml,
  transferRowsHtml
} from "./expeditionView.js";

export function renderExpeditionPanel(el, {
  route,
  origin,
  destination,
  costText,
  readiness,
  parties,
  selectedParty,
  members,
  memberStatus
}, { onSelectParty, onStart }) {
  el.expeditionStatus.textContent = route ? `${origin.name} -> ${destination.name}` : "no route";
  el.expeditionRouteDetail.innerHTML = expeditionRouteDetailHtml({
    route,
    origin,
    destination,
    costText,
    readiness
  });
  el.expeditionPartySelect.innerHTML = parties.map((party) => `<option value="${party.id}">${party.name}</option>`).join("");
  el.expeditionPartySelect.value = selectedParty?.id || "";
  el.expeditionPartySelect.onchange = () => onSelectParty?.(el.expeditionPartySelect.value);
  el.expeditionPartyDetail.innerHTML = expeditionPartyDetailHtml({
    party: selectedParty,
    members,
    memberStatus
  });
  el.startExpeditionBtn.disabled = !readiness.ok;
  el.startExpeditionBtn.onclick = () => onStart?.();
}

export function renderContinentPanel(el, {
  focusedContinent,
  selectedContinent,
  continents,
  unlockedById,
  heroCount,
  partyCount,
  transfers,
  pendingArrivals,
  catchUpReport,
  contextMenu,
  routeName,
  heroName
}, { onSelectContinent, onFocusContinent, onCancelContext }) {
  el.continentStatus.textContent = `focused: ${focusedContinent.name}`;
  el.continentMap.innerHTML = continentMapHtml({
    continents,
    unlockedById,
    focusedContinentId: focusedContinent.id,
    selectedContinentId: selectedContinent?.id || focusedContinent.id,
    contextMenu
  });
  el.continentMap.onclick = (event) => {
    const contextButton = event.target.closest?.("[data-continent-context-action]");
    if (contextButton && el.continentMap.contains?.(contextButton)) {
      if (contextButton.dataset.continentContextAction === "switch") {
        onFocusContinent?.(contextMenu?.continentId);
      } else {
        onCancelContext?.();
      }
      return;
    }
    const marker = event.target.closest?.("[data-continent-id]");
    if (!marker || !el.continentMap.contains?.(marker)) return;
    const rect = el.continentMap.getBoundingClientRect?.() || { left: 0, top: 0 };
    onSelectContinent?.(marker.dataset.continentId, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };
  el.continentDetail.innerHTML = continentDetailHtml({
    continent: selectedContinent,
    focused: selectedContinent?.id === focusedContinent.id,
    unlocked: Boolean(unlockedById[selectedContinent?.id]),
    heroCount,
    partyCount,
    catchUpReport
  });
  el.continentTransferRows.innerHTML = transferRowsHtml({
    transfers,
    pendingArrivals,
    routeName,
    heroName
  });
}

export function renderArrivalPrompt(el, { arrival, heroName }, { onResolve }) {
  el.expeditionArrivalOverlay.classList.toggle("hidden", !arrival);
  el.expeditionArrivalOverlay.innerHTML = arrivalPromptHtml({ arrival, heroName });
  el.expeditionArrivalOverlay.onclick = (event) => {
    const button = event.target.closest?.("[data-expedition-arrival-action]");
    if (!button || !el.expeditionArrivalOverlay.contains?.(button)) return;
    onResolve?.(arrival.id, button.dataset.expeditionArrivalAction === "switch");
  };
}
