import { templeLootFromBonuses } from "../game/resources/resourceRewards.js";
import {
  activeTempleStoneDefinition,
  hasShard as hasTempleShard
} from "../game/temple/templeState.js";
import { templeBonuses } from "../game/temple/templeBonuses.js";

const FALLBACK_TEMPLE_COLOR = { id: "", name: "", hex: "#d3ddce" };

export function createTempleAppQueries({
  state,
  colors,
  stones,
  shards,
  inventorySlots
}) {
  function colorById(colorId) {
    return colors.find((color) => color.id === colorId) || {
      ...FALLBACK_TEMPLE_COLOR,
      id: colorId,
      name: colorId
    };
  }

  function bonuses() {
    return templeBonuses(state.temple, { inventorySlots, shards, stones });
  }

  return {
    activeStoneDefinition() {
      return activeTempleStoneDefinition(state.temple, stones);
    },
    bonuses,
    colorById,
    colorName(colorId) {
      return colorById(colorId).name;
    },
    hasShard(shardId) {
      return hasTempleShard(state.temple, shardId);
    },
    lootBonus() {
      return templeLootFromBonuses(bonuses());
    }
  };
}
