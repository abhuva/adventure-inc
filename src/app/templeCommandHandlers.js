import {
  inventoryMoveBlockedMessage,
  shardReturnedToInventoryMessage,
  shardXpMessage,
  templeEquipInvalidSocketMessage,
  templeEquipNoInventorySlotMessage,
  templeLineToggleMessage,
  templeSocketClearedMessage,
  templeSocketEquippedMessage,
  templeStoneSelectedMessage
} from "./commandMessages.js";
import {
  equipShard as commandEquipShard,
  moveShardToInventorySlot as commandMoveShardToInventorySlot,
  placeShardInFirstFreeInventorySlot as commandPlaceShardInFirstFreeInventorySlot,
  selectShard as commandSelectShard,
  selectTempleStone as commandSelectTempleStone,
  toggleTempleLine as commandToggleTempleLine
} from "../game/temple/templeCommands.js";
import { addShardXp as addShardXpToTemple } from "../game/temple/shardProgression.js";
import {
  activeTempleStoneState,
  isShardSocketed,
  templeSocketById,
  templeSocketColorId
} from "../game/temple/templeState.js";

export function createTempleCommandHandlers({
  state,
  stones,
  shards,
  inventorySlots,
  activeStoneDefinition,
  colorName,
  addLog,
  render
}) {
  const options = () => ({ inventorySlots, shards, stones });

  function stoneState() {
    return activeTempleStoneState(state.temple, options());
  }

  function socketLabel(socketId, stone = activeStoneDefinition()) {
    const socket = templeSocketById(socketId, stone);
    return socket?.label || colorName(socket?.colorId || socketId);
  }

  function logMessage(message) {
    if (!message) return;
    addLog(message.text, message.type);
  }

  return {
    addShardXp(shardId, amount) {
      const shard = shards[shardId];
      if (!shard) return;
      const result = addShardXpToTemple(state.temple, shardId, amount);
      if (result.wasNew && !isShardSocketed(stoneState(), shardId)) {
        commandPlaceShardInFirstFreeInventorySlot(state.temple, shardId, options());
      }
      logMessage(shardXpMessage({
        wasNew: result.wasNew,
        shardName: shard.name,
        xp: result.xp,
        xpToMax: shard.xpToMax
      }));
    },

    moveShardToInventorySlot(shardId, targetIndex) {
      const result = commandMoveShardToInventorySlot(state.temple, shardId, targetIndex, options());
      if (!result.ok && result.reason === "target occupied") {
        logMessage(inventoryMoveBlockedMessage(targetIndex + 1));
        render();
        return;
      }
      if (!result.ok) return;
      if (result.action === "unequipped") {
        logMessage(shardReturnedToInventoryMessage(result.shard.name, targetIndex + 1));
      }
      render();
    },

    selectTempleStone(stoneId) {
      const result = commandSelectTempleStone(state.temple, stoneId, stones);
      if (!result.ok) return;
      logMessage(templeStoneSelectedMessage(result.stone.name));
      render();
    },

    selectShard(shardId) {
      commandSelectShard(state.temple, shardId);
      render();
    },

    equipShard(socketId, shardId) {
      const stone = activeStoneDefinition();
      const colorId = templeSocketColorId(socketId, stone);
      const result = commandEquipShard(state.temple, socketId, shardId, options());
      const label = templeSocketById(socketId, stone)?.label || colorName(colorId);
      if (result.ok && result.action === "cleared") {
        logMessage(templeSocketClearedMessage(label));
        render();
        return;
      }
      if (!result.ok && result.reason === "invalid socket") {
        logMessage(templeEquipInvalidSocketMessage(result.shard?.name || shardId, colorName(colorId)));
        render();
        return;
      }
      if (!result.ok && result.reason === "no free inventory slot") {
        logMessage(templeEquipNoInventorySlotMessage(shards[result.replacedShardId]?.name || result.replacedShardId));
        render();
        return;
      }
      if (!result.ok) return;
      logMessage(templeSocketEquippedMessage(label, result.shard.name));
      render();
    },

    toggleTempleLine(a, b) {
      const stone = activeStoneDefinition();
      const result = commandToggleTempleLine(state.temple, a, b, stones);
      if (!result.ok) return;
      logMessage(templeLineToggleMessage({
        enabled: result.action !== "disabled",
        aLabel: socketLabel(a, stone),
        bLabel: socketLabel(b, stone)
      }));
      render();
    }
  };
}
