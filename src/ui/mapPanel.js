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
  onRunExpedition,
  renderExpeditionPlan,
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
    onRunExpedition,
    onUpgradeWorkSite,
    workSiteUpgrade: workSiteUpgrade?.(selectedLocation)
  });
  renderMapPlanTab({ documentRef, el, selectedLocation });
  if (selectedLocation?.type === "expedition") {
    renderExpeditionPlan?.();
  }
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

function renderMapPlanTab({ documentRef, el, selectedLocation }) {
  if (!el.mapPlanTabBtn) return;
  const available = selectedLocation?.type === "expedition";
  el.mapPlanTabBtn.hidden = !available;
  el.mapPlanTabBtn.classList?.toggle("hidden", !available);
  if (available) return;
  const planPanel = documentRef.querySelector?.('[data-map-side-panel="plan"]');
  if (!planPanel?.classList?.contains("active")) return;
  const infoButton = documentRef.querySelector?.('[data-map-side-tab="info"]');
  const infoPanel = documentRef.querySelector?.('[data-map-side-panel="info"]');
  el.mapPlanTabBtn.classList?.remove("active");
  planPanel.classList.remove("active");
  infoButton?.classList?.add("active");
  infoPanel?.classList?.add("active");
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
  onRunExpedition,
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
    if (assignButton && el.locationDetail.contains?.(assignButton)) {
      onAssignSelectedParty();
      return;
    }
    const expeditionButton = event.target.closest?.("[data-run-expedition]");
    if (expeditionButton && el.locationDetail.contains?.(expeditionButton)) {
      onRunExpedition?.();
    }
  };
}
