import { cloneEstimate } from "./dungeonOperationModel.js";

export function toggleRepeatedPlan(repeatedPlans, estimate) {
  const partyId = estimate.partyId;
  if (repeatedPlans[partyId]) {
    delete repeatedPlans[partyId];
    return { enabled: false, partyId, estimate };
  }
  repeatedPlans[partyId] = cloneEstimate(estimate);
  return { enabled: true, partyId, estimate: repeatedPlans[partyId] };
}

export function repeatedPlanQueueStatus({ repeatedPlans, operations, parties, resources, partyId, readinessForParty }) {
  const estimate = repeatedPlans[partyId];
  if (!estimate) return { action: "none", reason: "no repeated plan" };
  if (operations.some((operation) => operation.partyId === partyId)) {
    return { action: "none", reason: "operation already active", estimate };
  }
  const party = parties.find((item) => item.id === partyId);
  const readiness = readinessForParty(party);
  if (!readiness.canQueue) {
    return { action: "pause", reason: readiness.message, estimate, party };
  }
  if ((resources.food || 0) < estimate.foodCost) {
    return { action: "pause", reason: `waiting for food ${resources.food || 0}/${estimate.foodCost}`, estimate, party };
  }
  return { action: "queue", estimate, party };
}

export function repeatedPlanPartyIds(repeatedPlans) {
  return Object.keys(repeatedPlans);
}
