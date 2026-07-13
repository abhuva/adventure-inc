import { SHARDS, TEMPLE_STONES } from "./templeData.js";
import {
  activeTempleStoneDefinition,
  activeTempleStoneState,
  hasShard,
  hasTempleLink,
  isShardSocketed,
  templeSocketById,
  templeSocketColorId
} from "./templeState.js";

export function normalizedInventorySlots(templeState, { inventorySlots = 20, shards = SHARDS, stones = TEMPLE_STONES } = {}) {
  const stoneState = activeTempleStoneState(templeState, { inventorySlots, stones });
  if (!Array.isArray(stoneState.inventorySlots)) {
    stoneState.inventorySlots = [];
  }
  stoneState.inventorySlots = stoneState.inventorySlots.slice(0, inventorySlots);
  while (stoneState.inventorySlots.length < inventorySlots) {
    stoneState.inventorySlots.push(null);
  }
  const seen = new Set();
  stoneState.inventorySlots = stoneState.inventorySlots.map((shardId) => {
    if (!shardId || !hasShard(templeState, shardId) || isShardSocketed(stoneState, shardId) || seen.has(shardId)) return null;
    seen.add(shardId);
    return shardId;
  });
  Object.keys(templeState.shardInventory).forEach((shardId) => {
    if (!hasShard(templeState, shardId) || isShardSocketed(stoneState, shardId) || seen.has(shardId) || !shards[shardId]) return;
    const freeIndex = firstFreeInventorySlot(templeState, { inventorySlots, shards, stones });
    if (freeIndex >= 0) {
      stoneState.inventorySlots[freeIndex] = shardId;
      seen.add(shardId);
    }
  });
  return stoneState.inventorySlots;
}

export function firstFreeInventorySlot(templeState, options = {}) {
  return activeTempleStoneState(templeState, options).inventorySlots.findIndex((shardId) => !shardId);
}

export function inventorySlotOf(templeState, shardId, options = {}) {
  return activeTempleStoneState(templeState, options).inventorySlots.findIndex((entry) => entry === shardId);
}

export function removeShardFromInventory(templeState, shardId, options = {}) {
  activeTempleStoneState(templeState, options).inventorySlots = normalizedInventorySlots(templeState, options).map((entry) => entry === shardId ? null : entry);
}

export function placeShardInFirstFreeInventorySlot(templeState, shardId, options = {}) {
  normalizedInventorySlots(templeState, options);
  const freeIndex = firstFreeInventorySlot(templeState, options);
  if (freeIndex < 0) return false;
  activeTempleStoneState(templeState, options).inventorySlots[freeIndex] = shardId;
  return true;
}

export function selectTempleStone(templeState, stoneId, stones = TEMPLE_STONES) {
  const stone = stones[stoneId];
  if (!stone || !stone.unlocked) return { ok: false, reason: "stone unavailable", stone: stone || null };
  templeState.activeStoneId = stoneId;
  activeTempleStoneState(templeState, { stones });
  return { ok: true, stone, stoneId };
}

export function selectShard(templeState, shardId) {
  templeState.selectedShardId = shardId;
  return { ok: true, shardId };
}

export function moveShardToInventorySlot(templeState, shardId, targetIndex, { inventorySlots = 20, shards = SHARDS, stones = TEMPLE_STONES } = {}) {
  const shard = shards[shardId];
  if (!shard || !hasShard(templeState, shardId) || targetIndex < 0 || targetIndex >= inventorySlots) {
    return { ok: false, reason: "invalid target", shard: shard || null, shardId, targetIndex };
  }
  const options = { inventorySlots, shards, stones };
  const slots = normalizedInventorySlots(templeState, options);
  const sourceIndex = inventorySlotOf(templeState, shardId, options);
  const targetShardId = slots[targetIndex];
  if (sourceIndex === targetIndex) return { ok: true, action: "unchanged", shard, shardId, targetIndex };

  if (sourceIndex >= 0) {
    slots[sourceIndex] = targetShardId || null;
    slots[targetIndex] = shardId;
    templeState.selectedShardId = shardId;
    return { ok: true, action: "moved", shard, shardId, sourceIndex, targetIndex, swappedShardId: targetShardId || null };
  }

  const stoneState = activeTempleStoneState(templeState, options);
  if (isShardSocketed(stoneState, shardId)) {
    if (targetShardId) {
      return { ok: false, reason: "target occupied", shard, shardId, targetIndex, targetShardId };
    }
    Object.entries(stoneState.slots).forEach(([slotColor, equippedShardId]) => {
      if (equippedShardId === shardId) stoneState.slots[slotColor] = null;
    });
    slots[targetIndex] = shardId;
    templeState.selectedShardId = shardId;
    return { ok: true, action: "unequipped", shard, shardId, targetIndex };
  }

  return { ok: false, reason: "shard unavailable", shard, shardId, targetIndex };
}

export function equipShard(templeState, socketId, shardId, { inventorySlots = 20, shards = SHARDS, stones = TEMPLE_STONES } = {}) {
  const options = { inventorySlots, shards, stones };
  const stone = activeTempleStoneDefinition(templeState, stones);
  const stoneState = activeTempleStoneState(templeState, options);
  const colorId = templeSocketColorId(socketId, stone);
  const socket = templeSocketById(socketId, stone);
  if (!shardId) {
    stoneState.slots[socketId] = null;
    return { ok: true, action: "cleared", socketId, colorId, socket };
  }
  const shard = shards[shardId];
  if (!shard || !hasShard(templeState, shardId) || !shard.equipColors.includes(colorId)) {
    return { ok: false, reason: "invalid socket", socketId, colorId, socket, shard: shard || null, shardId };
  }
  normalizedInventorySlots(templeState, options);
  const replacedShardId = stoneState.slots[socketId];
  const sourceInventoryIndex = inventorySlotOf(templeState, shardId, options);
  if (replacedShardId && replacedShardId !== shardId && sourceInventoryIndex < 0 && firstFreeInventorySlot(templeState, options) < 0) {
    return { ok: false, reason: "no free inventory slot", socketId, colorId, socket, shard, shardId, replacedShardId };
  }
  removeShardFromInventory(templeState, shardId, options);
  Object.entries(stoneState.slots).forEach(([otherSocketId, equippedShardId]) => {
    if (equippedShardId === shardId && otherSocketId !== socketId) {
      stoneState.slots[otherSocketId] = null;
    }
  });
  if (replacedShardId && replacedShardId !== shardId) {
    placeShardInFirstFreeInventorySlot(templeState, replacedShardId, options);
  }
  stoneState.slots[socketId] = shardId;
  templeState.selectedShardId = shardId;
  return { ok: true, action: "equipped", socketId, colorId, socket, shard, shardId, replacedShardId: replacedShardId || null };
}

export function isTempleLineActive(stoneState, a, b) {
  return stoneState.activeLines.some((line) => (line.a === a && line.b === b) || (line.a === b && line.b === a));
}

export function toggleTempleLine(templeState, a, b, stones = TEMPLE_STONES) {
  const stone = activeTempleStoneDefinition(templeState, stones);
  const stoneState = activeTempleStoneState(templeState, { stones });
  if (!hasTempleLink(stone, a, b)) return { ok: false, reason: "invalid line", stone, a, b };
  if (isTempleLineActive(stoneState, a, b)) {
    stoneState.activeLines = stoneState.activeLines.filter((line) => !((line.a === a && line.b === b) || (line.a === b && line.b === a)));
    return { ok: true, action: "disabled", stone, a, b };
  }
  stoneState.activeLines.push({ a, b });
  while (stoneState.activeLines.length > stone.maxActiveLines) {
    stoneState.activeLines.shift();
  }
  return { ok: true, action: "enabled", stone, a, b };
}
