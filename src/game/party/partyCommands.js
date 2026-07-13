import { heroStats } from "../roster/heroStats.js";

export function addParty(state) {
  const index = state.parties.length + 1;
  const party = {
    id: `party-${index}`,
    name: `Party ${index}`,
    memberIds: []
  };
  state.parties.push(party);
  state.selectedPartyId = party.id;
  return { ok: true, party };
}

export function selectParty(state, partyId) {
  const party = state.parties.find((item) => item.id === partyId);
  if (!party) return { ok: false, reason: "party missing" };
  state.selectedPartyId = partyId;
  state.lastEstimate = null;
  return { ok: true, party };
}

export function cancelPartyAction(state, partyId) {
  const party = state.parties.find((item) => item.id === partyId);
  if (!party) return { ok: false, reason: "party missing" };
  const removedOperations = state.operations.filter((operation) => operation.partyId === partyId).length;
  state.operations = state.operations.filter((operation) => operation.partyId !== partyId);
  const hadRepeatedPlan = Boolean(state.repeatedPlans[partyId]);
  delete state.repeatedPlans[partyId];
  party.memberIds.forEach((heroId) => {
    const hero = state.roster.find((item) => item.id === heroId);
    if (!hero) return;
    hero.hp = heroStats(hero).hpMax;
  });
  state.lastEstimate = null;
  return { ok: true, party, removedOperations, hadRepeatedPlan };
}

export function removePartyMember(state, partyId, heroId) {
  const party = state.parties.find((item) => item.id === partyId);
  if (!party) return { ok: false, reason: "party missing" };
  const wasMember = party.memberIds.includes(heroId);
  if (wasMember) {
    party.memberIds = party.memberIds.filter((id) => id !== heroId);
    state.lastEstimate = null;
  }
  return { ok: true, party, wasMember };
}

export function addHeroToParty(state, partyId, heroId) {
  const hero = state.roster.find((item) => item.id === heroId);
  const party = state.parties.find((item) => item.id === partyId);
  if (!hero) return { ok: false, reason: "hero missing" };
  if (!party) return { ok: false, reason: "party missing" };
  if (party.memberIds.includes(hero.id)) {
    return { ok: false, reason: "already member", hero, party };
  }
  state.parties.forEach((item) => {
    item.memberIds = item.memberIds.filter((id) => id !== hero.id);
  });
  party.memberIds.push(hero.id);
  state.lastEstimate = null;
  return { ok: true, hero, party };
}
