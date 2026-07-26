import assert from "node:assert/strict";
import test from "node:test";

import {
  addPartyResultMessage,
  automationManualOnlyMessage,
  automationMissingPlanMessage,
  assignWorkerResultMessage,
  autoTimeToggleMessage,
  cancelPartyActionResultMessage,
  craftResultMessage,
  focusHeroResultMessage,
  heroLevelUpMessage,
  learnSkillResultMessages,
  mapRepeatedAssignmentMessage,
  newVisitorQueuedMessage,
  operationQueuedMessage,
  operationReturnedMessage,
  inventoryMoveBlockedMessage,
  partyAddBlockedMessage,
  partyAlreadyHasHeroMessage,
  partyEditBlockedMessage,
  partyHeroAssignedMessage,
  partyMemberRemovedMessage,
  recruitResultMessage,
  repeatedPlanPausedMessage,
  repeatedPlanStoppedForAssignmentMessage,
  repeatedPlanToggleMessage,
  scheduleBlockedMessage,
  shardReturnedToInventoryMessage,
  shardXpMessage,
  simulatedRunMessage,
  templeEquipInvalidSocketMessage,
  templeEquipNoInventorySlotMessage,
  templeLineToggleMessage,
  templeResonanceMessage,
  templeSocketClearedMessage,
  templeSocketEquippedMessage,
  templeStoneSelectedMessage,
  timeAdvancedMessage,
  upgradeTavernResultMessage,
  workerDeliveryMessage
} from "../src/app/commandMessages.js";

test("recruitResultMessage formats capacity, cost, success, and unknown failures", () => {
  const state = { tavern: { capacity: 1 } };
  assert.deepEqual(
    recruitResultMessage({ ok: false, reason: "capacity" }, state),
    { text: "recruit blocked: tavern capacity 1", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    recruitResultMessage({
      ok: false,
      reason: "cost",
      visitor: { name: "Mira", cost: { coin: 4, food: 2 } }
    }, state),
    { text: "recruit blocked: Mira needs 4 coin, 2 food", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    recruitResultMessage({ ok: true, visitor: { name: "Mira" } }, state),
    { text: "recruited Mira; roster experimentation expanded", type: "ok", shouldRender: true }
  );
  assert.equal(recruitResultMessage({ ok: false, reason: "missing" }, state), null);
});

test("focusHeroResultMessage formats successful focus changes", () => {
  assert.deepEqual(
    focusHeroResultMessage({ ok: true, hero: { name: "Ada" } }),
    { text: "focused character set to Ada", type: "ok", shouldRender: true }
  );
  assert.equal(focusHeroResultMessage({ ok: false }), null);
});

test("learnSkillResultMessages formats blocked and success states", () => {
  assert.deepEqual(
    learnSkillResultMessages({
      ok: false,
      reason: "busy",
      hero: { name: "Dani" },
      status: { state: "Walking home" }
    }),
    [{ text: "skill blocked: Dani is Walking home", type: "warn", shouldRender: true }]
  );
  assert.deepEqual(
    learnSkillResultMessages({ ok: false, reason: "prerequisite" }, {
      fallbackHeroName: "Dani",
      fallbackSkillName: "Smashing Hands"
    }),
    [{ text: "skill blocked: Dani Smashing Hands: prerequisite", type: "warn", shouldRender: true }]
  );
  assert.deepEqual(
    learnSkillResultMessages({
      ok: true,
      hero: { name: "Dani" },
      skill: { name: "Smashing Hands", maxRank: 3 },
      rank: 2
    }),
    [{ text: "Dani learned Smashing Hands 2/3", type: "ok", shouldRender: true }]
  );
  assert.deepEqual(
    learnSkillResultMessages({
      ok: true,
      stoppedRepeatedPlan: true,
      party: { name: "Alpha" },
      hero: { name: "Dani" },
      skill: { name: "Smashing Hands", maxRank: 3 },
      rank: 2
    }),
    [
      { text: "repeated plan stopped for Alpha; Dani changed build", type: "warn", shouldRender: true },
      { text: "Dani learned Smashing Hands 2/3", type: "ok", shouldRender: true }
    ]
  );
});

test("craftResultMessage formats craft outcomes", () => {
  const blueprint = { name: "Iron Blade", cost: { ore: 2 } };

  assert.deepEqual(
    craftResultMessage({ ok: false, reason: "not discovered", blueprint }),
    { text: "craft blocked: blueprint Iron Blade not discovered", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    craftResultMessage({ ok: false, reason: "cost", blueprint }),
    { text: "craft blocked: Iron Blade needs 2 ore", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    craftResultMessage({ ok: false, reason: "already equipped", blueprint, hero: { name: "Ada" } }),
    { text: "craft skipped: Ada already has Iron Blade", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    craftResultMessage({ ok: true, blueprint, hero: { name: "Ada" } }),
    { text: "crafted Iron Blade for Ada", type: "ok", shouldRender: true }
  );
  assert.equal(craftResultMessage({ ok: false, reason: "missing" }), null);
});

test("upgradeTavernResultMessage formats blocked and success states", () => {
  assert.deepEqual(
    upgradeTavernResultMessage({ ok: false }, {}, { wood: 6 }),
    { text: "upgrade blocked: needs 6 wood", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    upgradeTavernResultMessage({ ok: true }, { tavern: { capacity: 5, population: 4 } }, {}),
    { text: "tavern upgraded: capacity 5, population 4", type: "ok", shouldRender: true }
  );
});

test("assignWorkerResultMessage formats worker reassignment outcomes", () => {
  assert.deepEqual(
    assignWorkerResultMessage({ ok: false, other: "ore" }, "wood"),
    { text: "assignment blocked: no ore worker to move", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    assignWorkerResultMessage({ ok: true, other: "ore" }, "wood"),
    { text: "worker moved from ore to wood", type: "ok", shouldRender: true }
  );
});

test("time and progression messages format deterministic log events", () => {
  assert.deepEqual(
    autoTimeToggleMessage("started"),
    { text: "auto time enabled: +1 hour per tick", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    autoTimeToggleMessage("stopped"),
    { text: "auto time disabled", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    timeAdvancedMessage(4),
    { text: "time advanced 4h", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    workerDeliveryMessage("North Woodlot", "3 wood"),
    { text: "North Woodlot delivery complete: 3 wood", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    heroLevelUpMessage("Dani", 2),
    { text: "Dani reached level 2; skill point available", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    newVisitorQueuedMessage("Mira", "Healer"),
    { text: "new visitor queued: Mira (Healer)", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    mapRepeatedAssignmentMessage("Alpha", "Rat Cellar"),
    { text: "repeated map assignment set: Alpha -> Rat Cellar", type: "ok", shouldRender: true }
  );
});

test("party result messages format add and cancel outcomes", () => {
  assert.deepEqual(
    addPartyResultMessage({ ok: true, party: { name: "Beta" } }),
    { text: "Beta formed", type: "ok", shouldRender: true }
  );
  assert.equal(addPartyResultMessage({ ok: false }), null);

  assert.deepEqual(
    cancelPartyActionResultMessage({
      ok: true,
      party: { name: "Alpha" },
      removedOperations: 0,
      hadRepeatedPlan: false
    }),
    { text: "Alpha canceled: returned to town idle (no active action)", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    cancelPartyActionResultMessage({
      ok: true,
      party: { name: "Alpha" },
      removedOperations: 1,
      hadRepeatedPlan: false
    }),
    { text: "Alpha canceled: returned to town idle", type: "warn", shouldRender: true }
  );
  assert.equal(cancelPartyActionResultMessage({ ok: false }), null);
});

test("party edit messages format member edit and assignment outcomes", () => {
  assert.deepEqual(
    partyEditBlockedMessage("Dani", "Fighting"),
    { text: "party edit blocked: Dani is Fighting", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    partyMemberRemovedMessage("Dani", "Alpha"),
    { text: "Dani removed from Alpha", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    partyAddBlockedMessage("Dani", "Walking home"),
    { text: "party add blocked: Dani is Walking home", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    partyAlreadyHasHeroMessage("Dani", "Alpha"),
    { text: "Dani is already in Alpha", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    partyHeroAssignedMessage("Dani", "Alpha"),
    { text: "Dani assigned to Alpha", type: "ok", shouldRender: true }
  );
});

test("dungeon simulation and automation messages format outcomes", () => {
  assert.deepEqual(
    simulatedRunMessage("Alpha", {
      dungeonName: "Rat Cellar",
      success: true,
      reached: 3,
      totalNodes: 3
    }),
    { text: "simulated Alpha -> Rat Cellar: success at 3/3 nodes", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    simulatedRunMessage("Alpha", {
      dungeonName: "Rat Cellar",
      success: false,
      reached: 1,
      totalNodes: 3
    }),
    { text: "simulated Alpha -> Rat Cellar: blocked at 1/3 nodes", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    automationMissingPlanMessage(),
    { text: "automation blocked: simulate a plan first", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    automationManualOnlyMessage(),
    { text: "automation blocked: repeat plan is manual only", type: "warn", shouldRender: true }
  );
});

test("repeated plan and schedule messages format queue states", () => {
  assert.deepEqual(
    repeatedPlanToggleMessage({ enabled: true, partyName: "Alpha" }),
    { text: "repeated plan enabled for Alpha", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    repeatedPlanToggleMessage({ enabled: false, partyName: "Alpha" }),
    { text: "repeated plan disabled for Alpha", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    repeatedPlanPausedMessage("Alpha", "waiting for resources"),
    { text: "repeated plan paused for Alpha: waiting for resources", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    scheduleBlockedMessage({ automated: true, reason: "blocked: not healed" }),
    { text: "automation blocked: blocked: not healed", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    scheduleBlockedMessage({ automated: false, reason: "blocked: no food" }),
    { text: "commit blocked: blocked: no food", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    repeatedPlanStoppedForAssignmentMessage("Alpha"),
    { text: "repeated plan stopped for Alpha; new assignment queued", type: "warn", shouldRender: true }
  );
});

test("operation queue and completion messages format rewards", () => {
  assert.deepEqual(
    operationQueuedMessage({ automated: false, label: "Alpha: Rat Cellar", foodCost: 2 }),
    { text: "run queued: Alpha: Rat Cellar, food -2", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    operationQueuedMessage({ automated: true, label: "Alpha: Rat Cellar", foodCost: 2 }),
    { text: "automation queued: Alpha: Rat Cellar, food -2", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    templeResonanceMessage("1 shard"),
    { text: "temple resonance added 1 shard", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    operationReturnedMessage("Alpha: Rat Cellar", "4 coin"),
    { text: "Alpha: Rat Cellar returned; rewards 4 coin", type: "ok", shouldRender: true }
  );
});

test("Temple shard and inventory messages format shard events", () => {
  assert.deepEqual(
    shardXpMessage({ wasNew: true, shardName: "Fang", xp: 1, xpToMax: 10 }),
    { text: "new shard found: Fang xp 1/10", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    shardXpMessage({ wasNew: false, shardName: "Fang", xp: 3, xpToMax: 10 }),
    { text: "duplicate shard absorbed: Fang xp 3/10", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    inventoryMoveBlockedMessage(2),
    { text: "inventory move blocked: slot 2 is occupied", type: "bad", shouldRender: true }
  );
  assert.deepEqual(
    shardReturnedToInventoryMessage("Fang", 3),
    { text: "Fang returned to inventory slot 3", type: "warn", shouldRender: true }
  );
});

test("Temple equip and line messages format interaction outcomes", () => {
  assert.deepEqual(
    templeStoneSelectedMessage("Triangle"),
    { text: "temple stone selected: Triangle", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    templeSocketClearedMessage("Ember"),
    { text: "Ember socket cleared", type: "warn", shouldRender: true }
  );
  assert.deepEqual(
    templeEquipInvalidSocketMessage("Fang", "Azure"),
    { text: "temple equip blocked: Fang cannot slot into Azure", type: "bad", shouldRender: true }
  );
  assert.deepEqual(
    templeEquipNoInventorySlotMessage("Prism"),
    { text: "temple equip blocked: no free inventory slot for Prism", type: "bad", shouldRender: true }
  );
  assert.deepEqual(
    templeSocketEquippedMessage("Ember", "Fang"),
    { text: "temple socket Ember equipped Fang", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    templeLineToggleMessage({ enabled: true, aLabel: "Ember", bLabel: "Azure" }),
    { text: "temple line enabled: Ember / Azure", type: "ok", shouldRender: true }
  );
  assert.deepEqual(
    templeLineToggleMessage({ enabled: false, aLabel: "Ember", bLabel: "Azure" }),
    { text: "temple line disabled: Ember / Azure", type: "warn", shouldRender: true }
  );
});
