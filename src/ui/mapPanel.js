import {
  locationDetailHtml,
  operationRowsHtml,
  poiRowsHtml
} from "./mapSideView.js";
import { renderLogRows } from "./logView.js";
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
  mapWorld,
  mapContextMenu,
  jobs,
  operations,
  repeatedPlans,
  logEntries,
  resources,
  currentOperationPhase,
  distanceText,
  rewardText,
  heroName,
  workSiteUpgrade,
  applyMapTransform,
  renderMapActors,
  hourFraction,
  onSelectLocation,
  onAssignSelectedParty,
  onUpgradeWorkSite,
  onRunContext,
  onCancelContext
}) {
  el.overlandMap.innerHTML = mapWorldHtml({
    poi,
    tavernCoord,
    selectedLocationId,
    mapWorld,
    contextMenu: mapContextMenu
  });
  el.overlandMap.onclick = (event) => {
    const actionButton = event.target.closest?.("[data-map-context-action]");
    if (actionButton && el.overlandMap.contains?.(actionButton)) {
      if (actionButton.dataset.mapContextAction === "run") onRunContext?.();
      else onCancelContext?.();
      return;
    }
    const button = event.target.closest?.("[data-location-id]");
    if (!button || !el.overlandMap.contains?.(button)) return;
    const rect = el.overlandMap.getBoundingClientRect?.() || { left: 0, top: 0 };
    onSelectLocation?.(button.dataset.locationId, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };
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
    onAssignSelectedParty,
    onUpgradeWorkSite,
    workSiteUpgrade: workSiteUpgrade?.(selectedLocation)
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
  renderLogRows(el, logEntries);
}

export function renderLocationDetail({
  el,
  location,
  party,
  partyReady,
  tavernCoord,
  jobs,
  distanceText,
  rewardText,
  heroName,
  onAssignSelectedParty,
  onUpgradeWorkSite,
  workSiteUpgrade
}) {
  el.locationDetail.innerHTML = locationDetailHtml({
    location,
    party,
    partyReady,
    tavernCoord,
    distanceText,
    rewardText,
    heroName,
    assignedWorkers: jobs[location.id] || 0,
    workSiteUpgrade
  });
  el.locationDetail.onclick = (event) => {
    const upgradeButton = event.target.closest?.("[data-upgrade-work-site]");
    if (upgradeButton && el.locationDetail.contains?.(upgradeButton)) {
      onUpgradeWorkSite?.(upgradeButton.dataset.upgradeWorkSite);
      return;
    }
    const assignButton = event.target.closest?.("#assignSelectedPartyBtn");
    if (!assignButton || !el.locationDetail.contains?.(assignButton)) return;
    onAssignSelectedParty();
  };
}
