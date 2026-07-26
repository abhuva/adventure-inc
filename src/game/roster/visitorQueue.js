export const MIN_VISITOR_STAY_DAYS = 5;

export function ensureTavernVisitorState(state) {
  state.tavern = state.tavern || {};
  state.tavern.visitorSeats = Math.max(1, state.tavern.visitorSeats || 3);
  state.tavernVisitors = {
    refreshedDay: null,
    visitors: {},
    ...(state.tavernVisitors || {})
  };
  state.tavernVisitors.visitors = state.tavernVisitors.visitors || {};
  return state.tavernVisitors;
}

export function refreshTavernVisitors(state, visitors) {
  const queueState = ensureTavernVisitorState(state);
  const day = Math.max(1, state.day || 1);
  if (queueState.refreshedDay === day) return queueState;

  const recruitedIds = new Set((state.roster || []).map((hero) => hero.id));
  const visitorById = new Map(visitors.map((visitor) => [visitor.id, visitor]));
  for (const [visitorId, status] of Object.entries(queueState.visitors)) {
    if (recruitedIds.has(visitorId) || !visitorById.has(visitorId)) {
      delete queueState.visitors[visitorId];
      continue;
    }
    if (status.state === "present" && day >= status.nextChangeDay) {
      const visitor = visitorById.get(visitorId);
      queueState.visitors[visitorId] = awayStatus(day, visitor);
    }
  }

  const presentIds = new Set(Object.entries(queueState.visitors)
    .filter(([, status]) => status.state === "present")
    .map(([visitorId]) => visitorId));
  const openSeats = Math.max(0, (state.tavern.visitorSeats || 3) - presentIds.size);
  const candidates = visitors.filter((visitor) => {
    if (recruitedIds.has(visitor.id) || presentIds.has(visitor.id)) return false;
    if (!isFameEligible(state, visitor)) return false;
    const status = queueState.visitors[visitor.id];
    return !status || status.state !== "away" || day >= status.nextChangeDay;
  });

  candidates.forEach((visitor, index) => {
    queueState.visitors[visitor.id] = index < openSeats
      ? presentStatus(day, visitor)
      : awayStatus(day, visitor);
  });
  queueState.refreshedDay = day;
  return queueState;
}

export function tavernVisitorsForDay(state, visitors) {
  const queueState = refreshTavernVisitors(state, visitors);
  const recruitedIds = new Set((state.roster || []).map((hero) => hero.id));
  return visitors.filter((visitor) => {
    const status = queueState.visitors[visitor.id];
    return status?.state === "present" && !recruitedIds.has(visitor.id);
  });
}

export function isVisitorPresent(state, visitorId) {
  const queueState = ensureTavernVisitorState(state);
  return queueState.visitors[visitorId]?.state === "present";
}

function isFameEligible(state, visitor) {
  return (state.tavern?.fame || 0) >= (visitor.fameThreshold || 0);
}

function presentStatus(day, visitor) {
  return {
    state: "present",
    nextChangeDay: day + visitorStayDays(visitor)
  };
}

function awayStatus(day, visitor) {
  return {
    state: "away",
    nextChangeDay: day + (visitor.awayDays || 10)
  };
}

export function visitorStayDays(visitor) {
  return Math.max(MIN_VISITOR_STAY_DAYS, visitor.stayDays || MIN_VISITOR_STAY_DAYS);
}
