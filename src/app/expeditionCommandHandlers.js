import {
  ensureContinentState,
  focusContinent,
  resolveArrivalPrompt,
  selectedExpeditionRoute,
  startExpeditionTransfer
} from "../game/continent/continentState.js";

export function createExpeditionCommandHandlers({
  state,
  controls,
  canPay,
  pay,
  addLog,
  render,
  renderMapActors,
  currentVisualHourFraction,
  setTab
}) {
  function logResult(result) {
    if (result.ok) return;
    addLog(`expedition blocked: ${result.reason}`, "bad");
  }

  function refreshFocusedMapActors() {
    renderMapActors?.(currentVisualHourFraction?.() || 0);
  }

  return {
    selectRoute(routeId) {
      state.world.selectedExpeditionRouteId = routeId;
      render();
    },

    selectParty(partyId) {
      state.selectedPartyId = partyId;
      controls.setParty?.(partyId);
      render();
    },

    startSelectedExpedition() {
      const route = selectedExpeditionRoute(state);
      const partyId = controls.partyId?.() || state.selectedPartyId;
      const result = startExpeditionTransfer(state, route.id, partyId, { canPay, pay });
      if (result.ok) {
        addLog(`${result.party.name} departed for ${result.route.name}. Arrival in ${Math.ceil(result.route.durationHours / 24)} days.`, "ok");
        render();
        return result;
      }
      logResult(result);
      render();
      return result;
    },

    resolveArrival(arrivalId, switchFocus) {
      const result = resolveArrivalPrompt(state, arrivalId, { switchFocus });
      if (result.ok) {
        addLog(`${result.arrival.partyName} arrived at ${result.arrival.destinationName}.`, "ok");
        if (result.switched) setTab?.("map");
      } else {
        logResult(result);
      }
      render();
      if (result.ok && result.switched) refreshFocusedMapActors();
      return result;
    },

    selectContinent(continentId) {
      ensureContinentState(state).selectedContinentId = continentId;
      state.continentContextMenu = null;
      render();
    },

    selectContinentFromMap(continentId, point = null) {
      const world = ensureContinentState(state);
      world.selectedContinentId = continentId;
      const canSwitch = Boolean(world.unlockedContinents?.[continentId])
        && continentId !== world.focusedContinentId;
      state.continentContextMenu = canSwitch && point
        ? { continentId, x: point.x, y: point.y }
        : null;
      render();
    },

    closeContinentContextMenu() {
      state.continentContextMenu = null;
      render();
    },

    focusSelectedContinent(continentId = state.world.selectedContinentId) {
      state.continentContextMenu = null;
      const result = focusContinent(state, continentId);
      if (result.ok) {
        controls.setParty?.(state.selectedPartyId);
        addLog(`focused continent: ${result.continent.name}`, "ok");
        if (result.catchUp?.summary) {
          addLog(result.catchUp.summary, "info");
        }
        setTab?.("map");
      } else {
        logResult(result);
      }
      render();
      if (result.ok) refreshFocusedMapActors();
      return result;
    }
  };
}
