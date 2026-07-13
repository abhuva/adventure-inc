import {
  activeTempleStoneDefinition,
  activeTempleStoneId,
  activeTempleStoneState,
  templeSocketById
} from "../game/temple/templeState.js";
import { shardEffectValue, templeBonuses } from "../game/temple/templeBonuses.js";
import {
  isTempleLineActive,
  normalizedInventorySlots
} from "../game/temple/templeCommands.js";
import { renderTemplePanel } from "../ui/templePanel.js";

export function createTempleRenderAdapter({
  state,
  el,
  colors,
  stones,
  shards,
  inventorySlots,
  hasShard,
  templeColor,
  colorName,
  onSelectStone,
  onToggleLine,
  onEquipShard,
  onSelectShard,
  onMoveShardToInventorySlot
}) {
  function currentStoneState() {
    return activeTempleStoneState(state.temple, { inventorySlots, stones });
  }

  function renderTemple() {
    renderTemplePanel({
      el,
      temple: state.temple,
      colors,
      stones,
      shards,
      stone: activeTempleStoneDefinition(state.temple, stones),
      stoneState: currentStoneState(),
      activeStoneId: activeTempleStoneId(state.temple, stones),
      normalizedInventorySlots: normalizedInventorySlots(state.temple, { inventorySlots, shards, stones }),
      bonuses: templeBonuses(state.temple, { inventorySlots, shards, stones }),
      hasShard,
      shardEffectValue: (shardId, effect) => shardEffectValue(state.temple, shardId, effect, shards),
      templeColor,
      colorName,
      socketById: templeSocketById,
      isLineActive: (a, b) => isTempleLineActive(currentStoneState(), a, b),
      onSelectStone,
      onToggleLine,
      onEquipShard,
      onSelectShard,
      onMoveShardToInventorySlot
    });
  }

  return {
    renderTemple
  };
}
