import { heroStats } from "../roster/heroStats.js";
import {
  ensureContinentState,
  isHeroTraveling,
  localParties
} from "../continent/continentState.js";

export function focusedHero(state) {
  const world = ensureContinentState(state);
  return state.roster.find((hero) => hero.id === state.focusedHeroId && world.heroLocations[hero.id] === world.focusedContinentId)
    || state.roster.find((hero) => world.heroLocations[hero.id] === world.focusedContinentId)
    || state.roster[0];
}

export function selectedParty(state) {
  const parties = localParties(state);
  return parties.find((party) => party.id === state.selectedPartyId) || parties[0] || state.parties[0];
}

export function partyForHero(state, heroId) {
  const world = ensureContinentState(state);
  return state.parties.find((party) => party.memberIds.includes(heroId) && world.partyLocations[party.id] === world.heroLocations[heroId]) || null;
}

export function heroName(state, heroId) {
  return state.roster.find((hero) => hero.id === heroId)?.name || heroId;
}

export function characterState(state, heroId, { currentOperationPhase }) {
  if (isHeroTraveling(state, heroId)) {
    return { state: "Traveling", party: "expedition" };
  }
  const operation = state.operations.find((item) => item.memberIds.includes(heroId));
  if (!operation) {
    return { state: "Idle", party: partyForHero(state, heroId)?.name || "-" };
  }
  const phase = currentOperationPhase(operation).phase.name;
  const stateByPhase = {
    queued: "Queued",
    outbound: "Walking to dungeon",
    dungeon: "Fighting",
    return: "Walking home",
    regenerate: "Recovering"
  };
  return { state: stateByPhase[phase] || phase, party: operation.label };
}

export function partyMembers(state, party = selectedParty(state)) {
  if (!party) return [];
  const memberIds = new Set(party.memberIds);
  const world = ensureContinentState(state);
  return state.roster.filter((hero) => memberIds.has(hero.id) && world.heroLocations[hero.id] === world.partyLocations[party.id]);
}

export function isPartyFullyHealed(state, party = selectedParty(state)) {
  return partyMembers(state, party).every((hero) => {
    const stats = heroStats(hero);
    return hero.hp >= stats.hpMax;
  });
}

export function partyStats(state, party = selectedParty(state), bonuses = {}) {
  const stats = partyMembers(state, party).reduce((partyTotals, hero) => {
    const heroStat = heroStats(hero);
    partyTotals.hpMax += heroStat.hpMax;
    partyTotals.hpCurrent += Math.min(hero.hp, heroStat.hpMax);
    partyTotals.atk += heroStat.atk;
    partyTotals.def += heroStat.def;
    partyTotals.utility += heroStat.utility;
    partyTotals.resolve += heroStat.resolve;
    partyTotals.travelSpeed += heroStat.travelSpeed;
    partyTotals.recoveryReduce += heroStat.recoveryReduce;
    partyTotals.foodCostReduce += heroStat.foodCostReduce;
    return partyTotals;
  }, { hpMax: 0, hpCurrent: 0, atk: 0, def: 0, utility: 0, resolve: 0, travelSpeed: 0, recoveryReduce: 0, foodCostReduce: 0 });

  stats.atk += bonuses.party_atk || 0;
  stats.def += bonuses.party_def || 0;
  stats.utility += bonuses.party_utility || 0;
  stats.recoveryReduce += bonuses.recovery_reduce || 0;
  return stats;
}
