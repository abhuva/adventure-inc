import {
  CONTINENTS,
  EXPEDITION_ROUTES,
  continentById,
  expeditionRouteById
} from "./continentData.js";
import { createResourceState } from "../resources/resourceState.js";

export function createInitialContinentState() {
  return {
    focusedContinentId: "old_marches",
    selectedContinentId: "old_marches",
    selectedExpeditionRouteId: "old_marches_to_ash_coast",
    unlockedContinents: { old_marches: true },
    unlockedRoutes: {},
    resourcesByContinent: {},
    heroLocations: {},
    partyLocations: {},
    lastFocusedAtHours: { old_marches: 0 },
    lastCatchUpReport: null,
    transfers: [],
    pendingArrivals: []
  };
}

export function ensureContinentState(state) {
  state.world = {
    ...createInitialContinentState(),
    ...(state.world || {}),
    unlockedContinents: {
      ...createInitialContinentState().unlockedContinents,
      ...(state.world?.unlockedContinents || {})
    },
    unlockedRoutes: { ...(state.world?.unlockedRoutes || {}) },
    resourcesByContinent: { ...(state.world?.resourcesByContinent || {}) },
    heroLocations: { ...(state.world?.heroLocations || {}) },
    partyLocations: { ...(state.world?.partyLocations || {}) },
    lastFocusedAtHours: {
      old_marches: 0,
      ...(state.world?.lastFocusedAtHours || {})
    },
    lastCatchUpReport: state.world?.lastCatchUpReport || null,
    transfers: Array.isArray(state.world?.transfers) ? state.world.transfers.map(normalizeTransfer) : [],
    pendingArrivals: Array.isArray(state.world?.pendingArrivals) ? state.world.pendingArrivals.map(normalizeArrival) : []
  };
  if (!continentById(state.world.focusedContinentId)) {
    state.world.focusedContinentId = "old_marches";
  }
  if (!continentById(state.world.selectedContinentId)) {
    state.world.selectedContinentId = state.world.focusedContinentId;
  }
  ensureHeroAndPartyLocations(state);
  activateFocusedContinentResources(state);
  return state.world;
}

export function ensureHeroAndPartyLocations(state) {
  const world = state.world || ensureContinentState(state);
  const focused = world.focusedContinentId || "old_marches";
  (state.roster || []).forEach((hero) => {
    if (!world.heroLocations[hero.id]) {
      world.heroLocations[hero.id] = focused;
    }
  });
  (state.parties || []).forEach((party) => {
    if (!world.partyLocations[party.id]) {
      world.partyLocations[party.id] = focused;
    }
  });
  return world;
}

export function focusedContinent(state) {
  return continentById(ensureContinentState(state).focusedContinentId);
}

export function activateFocusedContinentResources(state) {
  const world = state.world || ensureContinentState(state);
  const focused = world.focusedContinentId || "old_marches";
  world.resourcesByContinent = world.resourcesByContinent || {};
  const knownResourceObjects = Object.values(world.resourcesByContinent);
  if (state.resources && !knownResourceObjects.includes(state.resources)) {
    world.resourcesByContinent[focused] = createResourceState(state.resources);
  }
  if (!world.resourcesByContinent.old_marches) {
    world.resourcesByContinent.old_marches = createResourceState(state.resources || {});
  } else {
    world.resourcesByContinent.old_marches = createResourceState(world.resourcesByContinent.old_marches);
  }
  if (!world.resourcesByContinent[focused]) {
    world.resourcesByContinent[focused] = createResourceState();
  } else {
    world.resourcesByContinent[focused] = createResourceState(world.resourcesByContinent[focused]);
  }
  Object.keys(world.unlockedContinents || {}).forEach((continentId) => {
    if (world.unlockedContinents[continentId] && !world.resourcesByContinent[continentId]) {
      world.resourcesByContinent[continentId] = createResourceState();
    } else if (world.unlockedContinents[continentId]) {
      world.resourcesByContinent[continentId] = createResourceState(world.resourcesByContinent[continentId]);
    }
  });
  state.resources = world.resourcesByContinent[focused];
  return state.resources;
}

export function unlockedContinents(state) {
  const world = ensureContinentState(state);
  return CONTINENTS.filter((continent) => world.unlockedContinents[continent.id]);
}

export function isRouteUnlocked(state, routeId) {
  return Boolean(ensureContinentState(state).unlockedRoutes[routeId]);
}

export function unlockedExpeditionRoutes(state) {
  return EXPEDITION_ROUTES.filter((route) => isRouteUnlocked(state, route.id));
}

export function expeditionRouteForSelectedPoi(state, poiId) {
  return unlockedExpeditionRoutes(state).find((route) => route.poiId === poiId) || null;
}

export function unlockExpeditionRoutesForDay(state) {
  const world = ensureContinentState(state);
  const unlocked = [];
  EXPEDITION_ROUTES.forEach((route) => {
    if (state.day >= route.unlockDay && !world.unlockedRoutes[route.id]) {
      world.unlockedRoutes[route.id] = true;
      unlocked.push(route);
    }
  });
  return unlocked;
}

export function visibleExpeditionPois(state) {
  const world = ensureContinentState(state);
  return unlockedExpeditionRoutes(state)
    .filter((route) => route.originContinentId === world.focusedContinentId)
    .map((route) => ({
      id: route.poiId,
      name: route.poiName,
      coord: route.coord,
      type: "expedition",
      route,
      description: route.description
    }));
}

export function localHeroes(state, continentId = ensureContinentState(state).focusedContinentId) {
  const world = ensureContinentState(state);
  return (state.roster || []).filter((hero) => world.heroLocations[hero.id] === continentId);
}

export function localParties(state, continentId = ensureContinentState(state).focusedContinentId) {
  const world = ensureContinentState(state);
  return (state.parties || []).filter((party) => world.partyLocations[party.id] === continentId);
}

export function partyContinentId(state, partyId) {
  return ensureContinentState(state).partyLocations[partyId] || "old_marches";
}

export function heroContinentId(state, heroId) {
  return ensureContinentState(state).heroLocations[heroId] || "old_marches";
}

export function isHeroTraveling(state, heroId) {
  return ensureContinentState(state).transfers.some((transfer) => transfer.memberIds.includes(heroId));
}

export function transferById(state, transferId) {
  return ensureContinentState(state).transfers.find((transfer) => transfer.id === transferId) || null;
}

export function selectedExpeditionRoute(state) {
  const world = ensureContinentState(state);
  return expeditionRouteById(world.selectedExpeditionRouteId)
    || unlockedExpeditionRoutes(state)[0]
    || EXPEDITION_ROUTES[0];
}

export function startExpeditionTransfer(state, routeId, partyId, { canPay, pay } = {}) {
  const world = ensureContinentState(state);
  const route = expeditionRouteById(routeId);
  const party = (state.parties || []).find((item) => item.id === partyId);
  if (!route) return { ok: false, reason: "route missing" };
  if (!world.unlockedRoutes[route.id]) return { ok: false, reason: "route locked", route };
  if (!party) return { ok: false, reason: "party missing", route };
  if (partyContinentId(state, party.id) !== route.originContinentId) {
    return { ok: false, reason: "party is not at the route origin", route, party };
  }
  if (!party.memberIds.length) return { ok: false, reason: "party is empty", route, party };
  const activeOperation = (state.operations || []).find((operation) => operation.partyId === party.id);
  if (activeOperation) return { ok: false, reason: "party is busy", route, party };
  if (ensureContinentState(state).transfers.some((transfer) => transfer.partyId === party.id)) {
    return { ok: false, reason: "party is already traveling", route, party };
  }
  if (canPay && !canPay(route.cost)) return { ok: false, reason: "missing expedition resources", route, party };
  pay?.(route.cost);
  const activeWorld = ensureContinentState(state);
  const transfer = {
    id: `transfer-${state.day}-${state.hour}-${party.id}-${route.id}`,
    routeId: route.id,
    partyId: party.id,
    partyName: party.name,
    memberIds: [...party.memberIds],
    originContinentId: route.originContinentId,
    destinationContinentId: route.destinationContinentId,
    startedDay: state.day,
    startedHour: state.hour,
    elapsedHours: 0,
    durationHours: route.durationHours,
    status: "traveling"
  };
  activeWorld.transfers.push(transfer);
  activeWorld.partyLocations[party.id] = `travel:${transfer.id}`;
  party.memberIds.forEach((heroId) => {
    activeWorld.heroLocations[heroId] = `travel:${transfer.id}`;
  });
  state.lastEstimate = null;
  delete state.repeatedPlans?.[party.id];
  if (party.memberIds.includes(state.focusedHeroId)) {
    const replacement = localHeroes(state, route.originContinentId).find((hero) => !transfer.memberIds.includes(hero.id));
    state.focusedHeroId = replacement?.id || null;
  }
  if (!localParties(state, route.originContinentId).length) {
    const index = (state.parties || []).length + 1;
    const replacementParty = {
      id: `party-${index}`,
      name: `Party ${index}`,
      memberIds: []
    };
    state.parties.push(replacementParty);
    ensureContinentState(state).partyLocations[replacementParty.id] = route.originContinentId;
    if (ensureContinentState(state).focusedContinentId === route.originContinentId) {
      state.selectedPartyId = replacementParty.id;
    }
  }
  return { ok: true, route, party, transfer };
}

export function advanceExpeditionTransfers(state, hours) {
  const world = ensureContinentState(state);
  const arrived = [];
  world.transfers.forEach((transfer) => {
    if (transfer.status !== "traveling") return;
    transfer.elapsedHours += hours;
    if (transfer.elapsedHours >= transfer.durationHours) {
      transfer.status = "arrived";
      const route = expeditionRouteById(transfer.routeId);
      world.unlockedContinents[transfer.destinationContinentId] = true;
      if (!Number.isFinite(world.lastFocusedAtHours[transfer.destinationContinentId])) {
        world.lastFocusedAtHours[transfer.destinationContinentId] = absoluteHour(state);
      }
      world.partyLocations[transfer.partyId] = transfer.destinationContinentId;
      transfer.memberIds.forEach((heroId) => {
        world.heroLocations[heroId] = transfer.destinationContinentId;
      });
      const arrival = {
        id: `arrival-${transfer.id}`,
        transferId: transfer.id,
        routeId: transfer.routeId,
        partyId: transfer.partyId,
        partyName: transfer.partyName,
        memberIds: [...transfer.memberIds],
        destinationContinentId: transfer.destinationContinentId,
        destinationName: continentById(transfer.destinationContinentId).name,
        routeName: route?.name || transfer.routeId
      };
      world.pendingArrivals.push(arrival);
      arrived.push(arrival);
    }
  });
  world.transfers = world.transfers.filter((transfer) => transfer.status === "traveling");
  return arrived;
}

export function resolveArrivalPrompt(state, arrivalId, { switchFocus = false } = {}) {
  const world = ensureContinentState(state);
  const arrival = world.pendingArrivals.find((item) => item.id === arrivalId);
  if (!arrival) return { ok: false, reason: "arrival missing" };
  world.pendingArrivals = world.pendingArrivals.filter((item) => item.id !== arrivalId);
  if (switchFocus) {
    focusContinent(state, arrival.destinationContinentId);
  }
  return { ok: true, arrival, switched: Boolean(switchFocus) };
}

export function focusContinent(state, continentId) {
  const world = ensureContinentState(state);
  if (!world.unlockedContinents[continentId]) {
    return { ok: false, reason: "continent locked", continentId };
  }
  const now = absoluteHour(state);
  const previousContinentId = world.focusedContinentId;
  world.lastFocusedAtHours[previousContinentId] = now;
  const lastFocused = world.lastFocusedAtHours[continentId];
  const timeAwayHours = Math.max(0, now - (Number.isFinite(lastFocused) ? lastFocused : now));
  world.lastCatchUpReport = {
    continentId,
    fromContinentId: previousContinentId,
    timeAwayHours,
    resolvedAtDay: state.day,
    resolvedAtHour: state.hour,
    summary: timeAwayHours > 0
      ? `${continentById(continentId).name}: ${timeAwayHours}h deterministic catch-up calculated; no passive remote production yet.`
      : `${continentById(continentId).name}: no time away to resolve.`
  };
  world.focusedContinentId = continentId;
  world.selectedContinentId = continentId;
  world.lastFocusedAtHours[continentId] = now;
  activateFocusedContinentResources(state);
  const parties = localParties(state, continentId);
  state.selectedPartyId = parties[0]?.id || state.parties[0]?.id || "";
  const heroes = localHeroes(state, continentId);
  state.focusedHeroId = heroes[0]?.id || null;
  state.selectedLocationId = continentId === "old_marches" ? state.selectedLocationId || "tavern" : "tavern";
  state.lastEstimate = null;
  return { ok: true, continent: continentById(continentId), catchUp: world.lastCatchUpReport };
}

export function absoluteHour(state) {
  return Math.max(0, ((state.day || 1) - 1) * 24 + (state.hour || 0));
}

function normalizeTransfer(transfer) {
  return {
    id: transfer.id,
    routeId: transfer.routeId,
    partyId: transfer.partyId,
    partyName: transfer.partyName || transfer.partyId,
    memberIds: Array.isArray(transfer.memberIds) ? [...transfer.memberIds] : [],
    originContinentId: transfer.originContinentId || "old_marches",
    destinationContinentId: transfer.destinationContinentId || "ash_coast",
    startedDay: transfer.startedDay || 1,
    startedHour: transfer.startedHour || 0,
    elapsedHours: Math.max(0, Number(transfer.elapsedHours || 0)),
    durationHours: Math.max(1, Number(transfer.durationHours || 1)),
    status: transfer.status || "traveling"
  };
}

function normalizeArrival(arrival) {
  return {
    id: arrival.id,
    transferId: arrival.transferId,
    routeId: arrival.routeId,
    partyId: arrival.partyId,
    partyName: arrival.partyName || arrival.partyId,
    memberIds: Array.isArray(arrival.memberIds) ? [...arrival.memberIds] : [],
    destinationContinentId: arrival.destinationContinentId || "ash_coast",
    destinationName: arrival.destinationName || continentById(arrival.destinationContinentId || "ash_coast").name,
    routeName: arrival.routeName || arrival.routeId
  };
}
