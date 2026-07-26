import { formatCost } from "../core/format.js";

export function recruitResultMessage(result, state) {
  if (!result.ok && result.reason === "capacity") {
    return { text: `recruit blocked: tavern capacity ${state.tavern.capacity}`, type: "warn", shouldRender: true };
  }
  if (!result.ok && result.reason === "not visiting") {
    return { text: `recruit blocked: ${result.visitor.name} is not waiting in the tavern`, type: "warn", shouldRender: true };
  }
  if (!result.ok && result.reason === "cost") {
    return { text: `recruit blocked: ${result.visitor.name} needs ${formatCost(result.visitor.cost)}`, type: "warn", shouldRender: true };
  }
  if (!result.ok) return null;
  return { text: `recruited ${result.visitor.name}; roster experimentation expanded`, type: "ok", shouldRender: true };
}

export function focusHeroResultMessage(result) {
  if (!result.ok) return null;
  return { text: `focused character set to ${result.hero.name}`, type: "ok", shouldRender: true };
}

export function learnSkillResultMessages(result, { fallbackHeroName, fallbackSkillName } = {}) {
  if (!result.ok && result.reason === "busy") {
    return [{ text: `skill blocked: ${result.hero.name} is ${result.status.state}`, type: "warn", shouldRender: true }];
  }
  if (!result.ok) {
    const heroName = result.hero?.name || fallbackHeroName || "unknown";
    const skillName = result.skill?.name || fallbackSkillName || "unknown";
    return [{ text: `skill blocked: ${heroName} ${skillName}: ${result.reason}`, type: "warn", shouldRender: true }];
  }

  const messages = [];
  if (result.stoppedRepeatedPlan) {
    messages.push({
      text: `repeated plan stopped for ${result.party.name}; ${result.hero.name} changed build`,
      type: "warn",
      shouldRender: true
    });
  }
  messages.push({
    text: `${result.hero.name} learned ${result.skill.name} ${result.rank}/${result.skill.maxRank}`,
    type: "ok",
    shouldRender: true
  });
  return messages;
}

export function craftResultMessage(result) {
  if (!result.ok && result.reason === "not discovered") {
    return { text: `craft blocked: blueprint ${result.blueprint.name} not discovered`, type: "warn", shouldRender: true };
  }
  if (!result.ok && result.reason === "cost") {
    return { text: `craft blocked: ${result.blueprint.name} needs ${formatCost(result.blueprint.cost)}`, type: "warn", shouldRender: true };
  }
  if (!result.ok && result.reason === "already equipped") {
    return { text: `craft skipped: ${result.hero.name} already has ${result.blueprint.name}`, type: "warn", shouldRender: true };
  }
  if (!result.ok) return null;
  return { text: `crafted ${result.blueprint.name} for ${result.hero.name}`, type: "ok", shouldRender: true };
}

export function upgradeTavernResultMessage(result, state, fallbackCost) {
  if (!result.ok) {
    return { text: `upgrade blocked: needs ${formatCost(result.cost || fallbackCost)}`, type: "warn", shouldRender: true };
  }
  return { text: `tavern upgraded: capacity ${state.tavern.capacity}, population ${state.tavern.population}`, type: "ok", shouldRender: true };
}

export function assignWorkerResultMessage(result, job) {
  if (!result.ok) {
    if (result.other) {
      return { text: `assignment blocked: no ${result.other} worker to move`, type: "warn", shouldRender: true };
    }
    return { text: `assignment blocked: ${result.reason || "no worker"} for ${job}`, type: "warn", shouldRender: true };
  }
  if (result.other || (result.source && result.source !== "unassigned")) {
    return { text: `worker moved from ${result.other || result.source} to ${job}`, type: "ok", shouldRender: true };
  }
  return { text: `worker assigned to ${job} from ${result.source}`, type: "ok", shouldRender: true };
}

export function adjustWorkerResultMessage(result, job) {
  if (!result.ok) {
    return { text: `worker change blocked: ${result.reason || "blocked"} for ${job}`, type: "warn", shouldRender: true };
  }
  const direction = result.delta > 0 ? "added to" : "removed from";
  return {
    text: `worker ${direction} ${job}: ${result.workers} assigned, ${result.unassigned} unassigned`,
    type: "ok",
    shouldRender: true
  };
}

export function adjustWageResultMessage(result) {
  if (!result.ok) {
    return { text: `worker upkeep is fixed: ${result.reason || "blocked"}`, type: "warn", shouldRender: true };
  }
  return {
    text: `worker upkeep set to ${result.wagePerWorker} coin/day; available workers ${result.availableWorkers}`,
    type: "ok",
    shouldRender: true
  };
}

export function buildHousesResultMessage(result) {
  if (!result.ok) {
    return { text: `worker hire blocked: needs ${formatCost(result.cost || {})}`, type: "warn", shouldRender: true };
  }
  return {
    text: `worker hired: ${result.availableWorkers} total workers; next ${formatCost(result.nextCost || {})}`,
    type: "ok",
    shouldRender: true
  };
}

export function workshopRecipeResultMessage(result) {
  if (!result.ok) {
    return { text: `workshop recipe blocked: ${result.reason}`, type: "warn", shouldRender: true };
  }
  return { text: `workshop slot ${result.slotIndex + 1} set to ${result.recipe.name}`, type: "ok", shouldRender: true };
}

export function workshopAutoInputsResultMessage(result) {
  if (!result.ok) {
    return { text: `workshop auto-input blocked: ${result.reason}`, type: "warn", shouldRender: true };
  }
  return { text: `workshop slot ${result.slotIndex + 1} auto-inputs ${result.enabled ? "on" : "off"}`, type: "ok", shouldRender: true };
}

export function workshopUpgradeResultMessage(result) {
  if (!result.ok) {
    return { text: `workshop upgrade blocked: ${result.reason}`, type: "warn", shouldRender: true };
  }
  return { text: `workshop upgrade learned: ${result.node.name} ${result.rank}/${result.node.maxRank}`, type: "ok", shouldRender: true };
}

export function workshopCraftedMessage(event, rewardText) {
  return { text: `workshop crafted ${event.recipe.name}: ${rewardText}`, type: "ok", shouldRender: true };
}

export function workshopBlockedMessage(event) {
  return { text: `workshop paused ${event.recipe.name}: missing inputs`, type: "warn", shouldRender: true };
}

export function workshopResearchMessage(pointsGained) {
  return { text: `workshop research complete: +${pointsGained} upgrade point${pointsGained === 1 ? "" : "s"}`, type: "ok", shouldRender: true };
}

export function settlementUpkeepMessage(result) {
  const missing = [];
  if (result.wageMissing > 0) missing.push(`${result.wageMissing} coin wages`);
  const suffix = missing.length ? `; missing ${missing.join(", ")}; production x${result.productionMultiplier}` : "";
  return {
    text: `worker upkeep: ${result.workers} workers, paid ${result.wagePaid}/${result.wageRequired} coin${suffix}`,
    type: missing.length ? "warn" : "ok",
    shouldRender: true
  };
}

export function autoTimeToggleMessage(result) {
  if (result === "started" || result === "already-running") {
    return { text: "auto time enabled: +1 hour per tick", type: "ok", shouldRender: true };
  }
  return { text: "auto time disabled", type: "warn", shouldRender: true };
}

export function timeAdvancedMessage(hours) {
  return { text: `time advanced ${hours}h`, type: "ok", shouldRender: true };
}

export function workerDeliveryMessage(siteName, rewardText) {
  return { text: `${siteName} delivery complete: ${rewardText}`, type: "ok", shouldRender: true };
}

export function heroLevelUpMessage(heroName, level) {
  return { text: `${heroName} reached level ${level}; skill point available`, type: "ok", shouldRender: true };
}

export function newVisitorQueuedMessage(visitorName, role) {
  return { text: `new visitor queued: ${visitorName} (${role})`, type: "ok", shouldRender: true };
}

export function addPartyResultMessage(result) {
  if (!result.ok) return null;
  return { text: `${result.party.name} formed`, type: "ok", shouldRender: true };
}

export function cancelPartyActionResultMessage(result) {
  if (!result.ok) return null;
  return {
    text: `${result.party.name} canceled: returned to town idle${result.removedOperations || result.hadRepeatedPlan ? "" : " (no active action)"}`,
    type: "warn",
    shouldRender: true
  };
}

export function partyEditBlockedMessage(heroName, stateLabel) {
  return { text: `party edit blocked: ${heroName} is ${stateLabel}`, type: "warn", shouldRender: true };
}

export function partyMemberRemovedMessage(heroName, partyName) {
  return { text: `${heroName} removed from ${partyName}`, type: "warn", shouldRender: true };
}

export function partyAddBlockedMessage(heroName, stateLabel) {
  return { text: `party add blocked: ${heroName} is ${stateLabel}`, type: "warn", shouldRender: true };
}

export function partyAlreadyHasHeroMessage(heroName, partyName) {
  return { text: `${heroName} is already in ${partyName}`, type: "warn", shouldRender: true };
}

export function partyHeroAssignedMessage(heroName, partyName) {
  return { text: `${heroName} assigned to ${partyName}`, type: "ok", shouldRender: true };
}

export function simulatedRunMessage(partyName, estimate) {
  return {
    text: `simulated ${partyName} -> ${estimate.dungeonName}: ${estimate.success ? "success" : "blocked"} at ${estimate.reached}/${estimate.totalNodes} nodes`,
    type: estimate.success ? "ok" : "warn",
    shouldRender: true
  };
}

export function automationMissingPlanMessage() {
  return { text: "automation blocked: simulate a plan first", type: "warn", shouldRender: true };
}

export function automationManualOnlyMessage() {
  return { text: "automation blocked: repeat plan is manual only", type: "warn", shouldRender: true };
}

export function repeatedPlanToggleMessage({ enabled, partyName }) {
  return {
    text: `repeated plan ${enabled ? "enabled" : "disabled"} for ${partyName}`,
    type: enabled ? "ok" : "warn",
    shouldRender: true
  };
}

export function repeatedPlanPausedMessage(partyName, reason) {
  return { text: `repeated plan paused for ${partyName}: ${reason}`, type: "warn", shouldRender: true };
}

export function scheduleBlockedMessage({ automated, reason }) {
  return { text: `${automated ? "automation" : "commit"} blocked: ${reason}`, type: "warn", shouldRender: true };
}

export function repeatedPlanStoppedForAssignmentMessage(partyName) {
  return { text: `repeated plan stopped for ${partyName}; new assignment queued`, type: "warn", shouldRender: true };
}

export function operationQueuedMessage({ automated, label, foodCost }) {
  return { text: `${automated ? "automation queued" : "run queued"}: ${label}, food -${foodCost}`, type: "ok", shouldRender: true };
}

export function mapRepeatedAssignmentMessage(partyName, dungeonName) {
  return { text: `repeated map assignment set: ${partyName} -> ${dungeonName}`, type: "ok", shouldRender: true };
}

export function workSiteUpgradeResultMessage(result, siteName) {
  if (!result.ok) {
    return { text: `location upgrade blocked: ${siteName} needs ${formatCost(result.cost || {})}`, type: "warn", shouldRender: true };
  }
  return {
    text: `${siteName} upgraded: level ${result.level}, workplaces ${result.maxWorkers}`,
    type: "ok",
    shouldRender: true
  };
}

export function templeResonanceMessage(rewardText) {
  return { text: `temple resonance added ${rewardText}`, type: "ok", shouldRender: true };
}

export function operationReturnedMessage(operationLabel, rewardText) {
  return { text: `${operationLabel} returned; rewards ${rewardText}`, type: "ok", shouldRender: true };
}

export function shardXpMessage({ wasNew, shardName, xp, xpToMax }) {
  return {
    text: `${wasNew ? "new shard found" : "duplicate shard absorbed"}: ${shardName} xp ${xp}/${xpToMax}`,
    type: "ok",
    shouldRender: true
  };
}

export function inventoryMoveBlockedMessage(slotNumber) {
  return { text: `inventory move blocked: slot ${slotNumber} is occupied`, type: "bad", shouldRender: true };
}

export function shardReturnedToInventoryMessage(shardName, slotNumber) {
  return { text: `${shardName} returned to inventory slot ${slotNumber}`, type: "warn", shouldRender: true };
}

export function templeStoneSelectedMessage(stoneName) {
  return { text: `temple stone selected: ${stoneName}`, type: "ok", shouldRender: true };
}

export function templeSocketClearedMessage(socketLabel) {
  return { text: `${socketLabel} socket cleared`, type: "warn", shouldRender: true };
}

export function templeEquipInvalidSocketMessage(shardName, colorName) {
  return { text: `temple equip blocked: ${shardName} cannot slot into ${colorName}`, type: "bad", shouldRender: true };
}

export function templeEquipNoInventorySlotMessage(shardName) {
  return { text: `temple equip blocked: no free inventory slot for ${shardName}`, type: "bad", shouldRender: true };
}

export function templeSocketEquippedMessage(socketLabel, shardName) {
  return { text: `temple socket ${socketLabel} equipped ${shardName}`, type: "ok", shouldRender: true };
}

export function templeLineToggleMessage({ enabled, aLabel, bLabel }) {
  return {
    text: `temple line ${enabled ? "enabled" : "disabled"}: ${aLabel} / ${bLabel}`,
    type: enabled ? "ok" : "warn",
    shouldRender: true
  };
}
