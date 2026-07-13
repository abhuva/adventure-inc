export function cloneEstimate(estimate) {
  return {
    ...estimate,
    rewards: { ...estimate.rewards },
    transcript: [...estimate.transcript],
    timeline: estimate.timeline ? estimate.timeline.map((event) => ({
      ...event,
      partyActors: event.partyActors.map((actor) => ({ ...actor })),
      enemyActors: event.enemyActors.map((actor) => ({ ...actor }))
    })) : []
  };
}

export function operationTotalHours(operation) {
  return operation.phases.reduce((sum, phase) => sum + phase.hours, 0);
}

export function currentOperationPhase(operation, { hourFraction = 0, queuedCoord = { x: 0, y: 0 } } = {}) {
  const totalHours = operationTotalHours(operation);
  const visualElapsed = Math.min(totalHours, operation.elapsed + hourFraction);
  if (visualElapsed < 0) {
    return {
      phase: { name: "queued", hours: Math.abs(visualElapsed), from: queuedCoord, to: queuedCoord },
      progress: 0,
      remaining: totalHours - visualElapsed
    };
  }

  let cursor = 0;
  for (const phase of operation.phases) {
    const next = cursor + phase.hours;
    if (visualElapsed < next) {
      const phaseProgress = phase.hours <= 0 ? 1 : (visualElapsed - cursor) / phase.hours;
      return { phase, progress: Math.max(0, Math.min(1, phaseProgress)), remaining: totalHours - visualElapsed };
    }
    cursor = next;
  }
  return { phase: operation.phases[operation.phases.length - 1], progress: 1, remaining: 0 };
}

export function queuedPartyHours(operations, partyId) {
  return operations
    .filter((operation) => operation.partyId === partyId)
    .reduce((sum, operation) => sum + Math.max(0, operationTotalHours(operation) - operation.elapsed), 0);
}

export function partyAssignmentReadiness({ party, operations = [], fullyHealed = false, phaseForOperation = null }) {
  if (!party) {
    return { canQueue: false, message: "blocked: party no longer exists" };
  }
  if (!party.memberIds.length) {
    return { canQueue: false, message: "blocked: empty party" };
  }
  const activeOperation = operations.find((operation) => operation.partyId === party.id);
  if (activeOperation) {
    const phase = phaseForOperation ? phaseForOperation(activeOperation).phase.name : "current operation";
    return { canQueue: true, message: `will queue after ${phase}` };
  }
  if (!fullyHealed) {
    return { canQueue: false, message: "blocked: party must be in town and fully healed" };
  }
  return { canQueue: true, message: "ready in town" };
}

export function canScheduleEstimate({ estimate, party, operations = [], resources = {}, fullyHealed = false, phaseForOperation = null }) {
  if (!estimate.memberIds.length) {
    return { ok: false, reason: "selected party is empty" };
  }
  const readiness = partyAssignmentReadiness({ party, operations, fullyHealed, phaseForOperation });
  if (!readiness.canQueue) {
    return { ok: false, reason: readiness.message };
  }
  if ((resources.food || 0) < estimate.foodCost) {
    return { ok: false, reason: "insufficient food" };
  }
  return { ok: true, reason: readiness.message };
}

export function createPartyOperation({ estimate, party, dungeon, operations = [], tavernCoord, id }) {
  const travelHours = estimate.travelHours || dungeon.travelHours;
  const dungeonHours = estimate.dungeonHours || Math.max(1, estimate.hours - travelHours * 2 - (estimate.recoveryHours || 1));
  const recoveryPhaseHours = estimate.recoveryHours || 1;
  return {
    id,
    type: "party",
    label: `${estimate.partyName}: ${estimate.dungeonName}`,
    partyId: party.id,
    memberIds: [...estimate.memberIds],
    estimate: cloneEstimate(estimate),
    elapsed: -queuedPartyHours(operations, party.id),
    phases: [
      { name: "outbound", hours: travelHours, from: tavernCoord, to: dungeon.coord },
      { name: "dungeon", hours: dungeonHours, from: dungeon.coord, to: dungeon.coord },
      { name: "return", hours: travelHours, from: dungeon.coord, to: tavernCoord },
      { name: "regenerate", hours: recoveryPhaseHours, from: tavernCoord, to: tavernCoord }
    ]
  };
}
