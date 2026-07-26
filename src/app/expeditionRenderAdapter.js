import { CONTINENTS, continentById, expeditionRouteById } from "../game/continent/continentData.js";
import {
  ensureContinentState,
  focusedContinent,
  isRouteUnlocked,
  localHeroes,
  localParties,
  selectedExpeditionRoute,
  unlockedContinents
} from "../game/continent/continentState.js";
import {
  renderArrivalPrompt,
  renderContinentPanel,
  renderExpeditionPanel
} from "../ui/expeditionPanel.js";

export function createExpeditionRenderAdapter({
  state,
  el,
  formatReward,
  heroStats,
  characterState,
  partyMembers,
  canPay,
  onSelectParty,
  onStartExpedition,
  onResolveArrival,
  onSelectContinent,
  onCancelContinentContext,
  onFocusContinent,
  heroName
}) {
  function expeditionReadiness(route, party) {
    if (!route) return { ok: false, message: "no route selected" };
    if (!isRouteUnlocked(state, route.id)) return { ok: false, message: "route is locked" };
    if (!party) return { ok: false, message: "no local party available" };
    if (!party.memberIds.length) return { ok: false, message: "selected party is empty" };
    if (state.operations.some((operation) => operation.partyId === party.id)) {
      return { ok: false, message: "selected party is busy" };
    }
    if (!canPay(route.cost)) return { ok: false, message: `missing resources: ${formatReward(route.cost)}` };
    return { ok: true, message: "ready" };
  }

  function selectedLocalParty(parties) {
    return parties.find((party) => party.id === state.selectedPartyId) || parties[0] || null;
  }

  function renderExpedition() {
    const route = selectedExpeditionRoute(state);
    const parties = localParties(state, route.originContinentId);
    const selectedParty = selectedLocalParty(parties);
    const members = selectedParty ? partyMembers(selectedParty) : [];
    renderExpeditionPanel(el, {
      route,
      origin: continentById(route.originContinentId),
      destination: continentById(route.destinationContinentId),
      costText: formatReward(route.cost),
      readiness: expeditionReadiness(route, selectedParty),
      parties,
      selectedParty,
      members,
      memberStatus: (hero) => ({
        ...characterState(hero.id),
        hpMax: heroStats(hero).hpMax
      })
    }, {
      onSelectParty,
      onStart: onStartExpedition
    });
  }

  function renderContinent() {
    const world = ensureContinentState(state);
    const focused = focusedContinent(state);
    const unlocked = unlockedContinents(state);
    const unlockedById = Object.fromEntries(unlocked.map((continent) => [continent.id, true]));
    const selected = continentById(world.selectedContinentId);
    renderContinentPanel(el, {
      focusedContinent: focused,
      selectedContinent: selected,
      continents: CONTINENTS,
      unlockedById,
      heroCount: localHeroes(state, selected.id).length,
      partyCount: localParties(state, selected.id).length,
      transfers: world.transfers,
      pendingArrivals: world.pendingArrivals,
      catchUpReport: world.lastCatchUpReport,
      contextMenu: state.continentContextMenu,
      routeName: (routeId) => expeditionRouteById(routeId)?.name || routeId,
      heroName
    }, {
      onSelectContinent,
      onCancelContext: onCancelContinentContext,
      onFocusContinent
    });
  }

  function renderArrival() {
    const world = ensureContinentState(state);
    renderArrivalPrompt(el, {
      arrival: world.pendingArrivals[0] || null,
      heroName
    }, {
      onResolve: onResolveArrival
    });
  }

  return {
    renderExpedition,
    renderContinent,
    renderArrival
  };
}
