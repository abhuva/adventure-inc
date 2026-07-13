import { SHARDS, TEMPLE_STONES } from "./templeData.js";
import {
  activeTempleStoneDefinition,
  activeTempleStoneState,
  hasShard,
  templeSocketColorId
} from "./templeState.js";

export function templeBonuses(templeState, { inventorySlots = 20, shards = SHARDS, stones = TEMPLE_STONES } = {}) {
  const bonuses = {
    party_atk: 0,
    party_def: 0,
    party_utility: 0,
    recovery_reduce: 0,
    loot_hide: 0,
    loot_ore: 0,
    loot_wood: 0,
    loot_coin: 0
  };
  const stone = activeTempleStoneDefinition(templeState, stones);
  const stoneState = activeTempleStoneState(templeState, { inventorySlots, stones });
  Object.entries(stoneState.slots).forEach(([socketId, shardId]) => {
    const slotColor = templeSocketColorId(socketId, stone);
    const shard = shards[shardId];
    if (!shard || !hasShard(templeState, shardId) || !shard.equipColors.includes(slotColor)) return;
    activeInfluenceColors(stoneState, socketId, shard, stone).forEach((colorId) => {
      applyTempleEffectsToTotals(bonuses, templeState, shardId, shard.colorEffects[colorId] || [], colorId, stone, shards);
    });
  });
  return bonuses;
}

export function activeInfluenceColors(stoneState, socketId, shard, stone) {
  const slotColor = templeSocketColorId(socketId, stone);
  const colors = new Set([slotColor]);
  stoneState.activeLines.forEach((line) => {
    if (line.a === socketId) colors.add(templeSocketColorId(line.b, stone));
    if (line.b === socketId) colors.add(templeSocketColorId(line.a, stone));
  });
  return [...colors].filter((colorId) => shard.affectedBy.includes(colorId));
}

export function shardEffectValue(templeState, shardId, effect, shards = SHARDS) {
  const shard = shards[shardId];
  const xp = templeState.shardInventory[shardId]?.xp || 0;
  if (!shard || xp <= 0) return 0;
  const capped = Math.min(xp, shard.xpToMax);
  const progress = shard.xpToMax <= 1 ? 1 : (capped - 1) / (shard.xpToMax - 1);
  return Math.floor(effect.min + (effect.max - effect.min) * progress);
}

export function effectFamily(effectType) {
  if (effectType.startsWith("party_") || effectType === "recovery_reduce") return "fight";
  if (effectType.startsWith("loot_")) return "loot";
  return "utility";
}

function applyTempleEffectsToTotals(totals, templeState, shardId, effects = [], colorId = null, stone, shards) {
  effects.forEach((effect) => {
    totals[effect.type] = (totals[effect.type] || 0) + modifiedTempleEffectValue(templeState, shardId, effect, colorId, stone, shards);
  });
}

function modifiedTempleEffectValue(templeState, shardId, effect, colorId, stone, shards) {
  let value = shardEffectValue(templeState, shardId, effect, shards);
  stone.modifiers.forEach((modifier) => {
    if (modifier.type === "color_power" && modifier.colorId === colorId) {
      value *= modifier.multiplier;
    }
    if (modifier.type === "effect_family_power" && effectFamily(effect.type) === modifier.family) {
      value *= modifier.multiplier;
    }
  });
  return Math.max(0, Math.floor(value));
}
