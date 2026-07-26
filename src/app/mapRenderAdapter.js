import { distance, interpolateCoord } from "../core/math.js";
import {
  mapStatusText as buildMapStatusText,
  mapTransformStyle
} from "../game/map/mapViewRuntime.js";
import {
  renderLocationDetail as renderMapLocationDetail,
  renderMapPanel
} from "../ui/mapPanel.js";
import { mapActorsHtml } from "../ui/mapWorldView.js";

export function createMapRenderAdapter({
  state,
  el,
  documentRef,
  mapWorld,
  tavernCoord,
  mapLocations,
  selectedLocation,
  selectedParty,
  partyAssignmentReadiness,
  currentOperationPhase,
  currentVisualHourFraction,
  formatReward,
  heroName,
  workSiteUpgrade,
  selectLocation,
  selectLocationFromMap,
  assignSelectedPartyToSelectedDungeon,
  runSelectedExpedition,
  renderExpeditionPlan,
  upgradeSelectedWorkSite,
  closeMapContextMenu
}) {
  function mapStatusText() {
    return buildMapStatusText({
      operationCount: state.operations.length,
      zoom: state.mapView.zoom,
      worldWidth: mapWorld().width,
      worldHeight: mapWorld().height
    });
  }

  function applyMapTransform() {
    const world = documentRef.getElementById("mapWorld");
    if (!world) return;
    world.style.transform = mapTransformStyle(state.mapView);
    if (el.mapStatus) el.mapStatus.textContent = mapStatusText();
  }

  function formatMapDistance(from, to) {
    return distance(from, to).toFixed(1);
  }

  function renderMapActors(hourFraction = 0) {
    const actorLayer = documentRef.getElementById("mapActors");
    if (!actorLayer) return;
    actorLayer.innerHTML = mapActorsHtml({
      operations: state.operations,
      currentOperationPhase: (operation) => currentOperationPhase(operation, hourFraction),
      interpolateCoord
    });
  }

  function renderLocationDetail() {
    const location = selectedLocation();
    const party = selectedParty();
    renderMapLocationDetail({
      documentRef,
      el,
      location,
      party,
      partyReady: partyAssignmentReadiness(party),
      tavernCoord: tavernCoord(),
      jobs: state.tavern.jobs,
      distanceText: formatMapDistance,
      rewardText: formatReward,
      heroName,
      onAssignSelectedParty: assignSelectedPartyToSelectedDungeon,
      onRunExpedition: runSelectedExpedition,
      renderExpeditionPlan,
      onUpgradeWorkSite: upgradeSelectedWorkSite,
      workSiteUpgrade: workSiteUpgrade?.(location)
    });
  }

  function renderMap() {
    const poi = mapLocations();
    const location = selectedLocation();
    const party = selectedParty();
    renderMapPanel({
      documentRef,
      el,
      poi,
      selectedLocationId: state.selectedLocationId,
      mapContextMenu: state.mapContextMenu,
      selectedLocation: location,
      selectedParty: party,
      partyReady: partyAssignmentReadiness(party),
      tavernCoord: tavernCoord(),
      mapWorld: mapWorld(),
      jobs: state.tavern.jobs,
      operations: state.operations,
      repeatedPlans: state.repeatedPlans,
      logEntries: state.log,
      resources: state.resources,
      currentOperationPhase,
      distanceText: formatMapDistance,
      rewardText: formatReward,
      heroName,
      workSiteUpgrade,
      applyMapTransform,
      renderMapActors,
      hourFraction: currentVisualHourFraction(),
      onSelectLocation: selectLocationFromMap || ((locationId) => selectLocation(locationId)),
      onAssignSelectedParty: assignSelectedPartyToSelectedDungeon,
      onRunExpedition: runSelectedExpedition,
      onUpgradeWorkSite: upgradeSelectedWorkSite,
      onRunContext: () => {
        const contextLocation = selectedLocation();
        if (contextLocation?.type === "expedition") runSelectedExpedition?.();
        else assignSelectedPartyToSelectedDungeon?.();
      },
      onCancelContext: closeMapContextMenu
    });
  }

  return {
    applyMapTransform,
    renderMap,
    renderMapActors,
    renderLocationDetail,
    mapStatusText,
    formatMapDistance
  };
}
