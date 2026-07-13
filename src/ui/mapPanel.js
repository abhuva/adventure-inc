import {
  locationDetailHtml,
  operationRowsHtml,
  poiRowsHtml
} from "./mapSideView.js";
import { mapWorldHtml } from "./mapWorldView.js";

export function renderMapPanel({
  documentRef,
  el,
  poi,
  selectedLocationId,
  selectedLocation,
  selectedParty,
  partyReady,
  tavernCoord,
  jobs,
  operations,
  repeatedPlans,
  resources,
  currentOperationPhase,
  distanceText,
  rewardText,
  heroName,
  applyMapTransform,
  renderMapActors,
  hourFraction,
  onSelectLocation,
  onAssignSelectedParty
}) {
  el.overlandMap.innerHTML = mapWorldHtml({
    poi,
    tavernCoord,
    selectedLocationId
  });
  el.overlandMap.querySelectorAll("[data-location-id]").forEach((button) => {
    button.addEventListener("click", () => onSelectLocation(button.dataset.locationId));
  });
  applyMapTransform();
  renderMapActors(hourFraction);
  renderLocationDetail({
    documentRef,
    el,
    location: selectedLocation,
    party: selectedParty,
    partyReady,
    tavernCoord,
    jobs,
    distanceText,
    rewardText,
    heroName,
    onAssignSelectedParty
  });
  el.operationRows.innerHTML = operationRowsHtml({
    operations,
    repeatedPlans,
    resources,
    currentOperationPhase
  });
  el.poiRows.innerHTML = poiRowsHtml({
    poi,
    tavernCoord,
    distanceText
  });
}

export function renderLocationDetail({
  documentRef,
  el,
  location,
  party,
  partyReady,
  tavernCoord,
  jobs,
  distanceText,
  rewardText,
  heroName,
  onAssignSelectedParty
}) {
  el.locationDetail.innerHTML = locationDetailHtml({
    location,
    party,
    partyReady,
    tavernCoord,
    distanceText,
    rewardText,
    heroName,
    assignedWorkers: jobs[location.id] || 0
  });
  const assignButton = documentRef.getElementById("assignSelectedPartyBtn");
  if (assignButton) {
    assignButton.addEventListener("click", onAssignSelectedParty);
  }
}
