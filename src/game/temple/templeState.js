import { TEMPLE_STONES } from "./templeData.js";

export function activeTempleStoneId(templeState, stones = TEMPLE_STONES) {
  return templeState.activeStoneId && stones[templeState.activeStoneId] ? templeState.activeStoneId : "triangle";
}

export function activeTempleStoneDefinition(templeState, stones = TEMPLE_STONES) {
  return stones[activeTempleStoneId(templeState, stones)];
}

export function createTempleStoneState(stoneId, { inventorySlots = 20, stones = TEMPLE_STONES } = {}) {
  const definition = stones[stoneId];
  if (!definition) {
    throw new Error(`Unknown Temple stone: ${stoneId}`);
  }
  const slots = {};
  definition.sockets.forEach((socket) => {
    slots[templeSocketId(socket)] = null;
  });
  return {
    slots,
    activeLines: [],
    inventorySlots: Array(inventorySlots).fill(null)
  };
}

export function normalizeTempleStoneState(stoneId, stoneState, { stones = TEMPLE_STONES } = {}) {
  const definition = stones[stoneId];
  if (!definition) {
    throw new Error(`Unknown Temple stone: ${stoneId}`);
  }
  const validSocketIds = new Set(definition.sockets.map(templeSocketId));
  const nextSlots = {};
  definition.sockets.forEach((socket) => {
    const socketId = templeSocketId(socket);
    nextSlots[socketId] = stoneState.slots?.[socketId] || null;
  });
  stoneState.slots = nextSlots;
  stoneState.activeLines = (stoneState.activeLines || [])
    .filter((line) => validSocketIds.has(line.a) && validSocketIds.has(line.b) && hasTempleLink(definition, line.a, line.b))
    .slice(0, definition.maxActiveLines);
  if (!Array.isArray(stoneState.inventorySlots)) {
    stoneState.inventorySlots = [];
  }
  return stoneState;
}

export function activeTempleStoneState(templeState, options = {}) {
  const stoneId = activeTempleStoneId(templeState, options.stones);
  if (!templeState.stones) {
    templeState.stones = {};
  }
  if (!templeState.stones[stoneId]) {
    templeState.stones[stoneId] = createTempleStoneState(stoneId, options);
  }
  return normalizeTempleStoneState(stoneId, templeState.stones[stoneId], options);
}

export function templeSocketId(socket) {
  return socket.socketId || socket.colorId;
}

export function templeSocketById(socketId, stone) {
  return stone.sockets.find((socket) => templeSocketId(socket) === socketId);
}

export function templeSocketColorId(socketId, stone) {
  return templeSocketById(socketId, stone)?.colorId || socketId;
}

export function hasTempleLink(stone, a, b) {
  return stone.links.some(([linkA, linkB]) => (linkA === a && linkB === b) || (linkA === b && linkB === a));
}

export function hasShard(templeState, shardId) {
  return (templeState.shardInventory[shardId]?.xp || 0) > 0;
}

export function isShardSocketed(stoneState, shardId) {
  return Object.values(stoneState.slots).includes(shardId);
}
