import { bindInventoryDrop, bindShardTokenInteractions, bindTempleBoardInteractions } from "../app/templeInteractions.js";
import { activeInfluenceColors } from "../game/temple/templeBonuses.js";
import { templeSocketId } from "../game/temple/templeState.js";
import {
  formatTempleEffectType,
  inventorySlotHtml,
  shardColorDotsHtml,
  shardDetailHtml,
  shardProgressHtml,
  shardTokenHtml,
  templeBoardHtml,
  templeBuffRowsHtml,
  templeLinksHtml,
  templeSocketHtml,
  templeStatusText,
  templeStoneButtonsHtml
} from "./templeView.js";

export function renderTemplePanel({
  el,
  temple,
  colors,
  stones,
  shards,
  stone,
  stoneState,
  activeStoneId,
  normalizedInventorySlots,
  bonuses,
  hasShard,
  shardEffectValue,
  templeColor,
  colorName,
  socketById,
  isLineActive,
  onSelectStone,
  onToggleLine,
  onEquipShard,
  onSelectShard,
  onMoveShardToInventorySlot
}) {
  const renderToken = (shardId, shard, options = {}) => {
    const found = options.found ?? hasShard(shardId);
    return shardTokenHtml({
      shardId,
      shard,
      found,
      selected: temple.selectedShardId === shardId,
      glyph: shardGlyph(shardId),
      colorDotsHtml: shardColorDotsHtml(shard, colors),
      options
    });
  };
  const renderProgress = (shardId, shard) => shardProgressHtml({
    xp: temple.shardInventory[shardId]?.xp || 0,
    xpToMax: shard.xpToMax
  });
  const renderSocket = (socket) => {
    const socketId = templeSocketId(socket);
    const color = templeColor(socket.colorId);
    const shardId = stoneState.slots[socketId];
    const shard = shards[shardId];
    const connected = stoneState.activeLines.some((line) => line.a === socketId || line.b === socketId);
    const influence = shard ? activeInfluenceColors(stoneState, socketId, shard, stone).map(colorName).join(", ") : "none";
    return templeSocketHtml({
      socket,
      socketId,
      color,
      shardId,
      shard,
      connected,
      influence,
      shardTokenHtml: renderToken
    });
  };

  el.templeStatus.textContent = templeStatusText(stone, stoneState);
  el.templeStoneButtons.innerHTML = templeStoneButtonsHtml({ stones, activeStoneId });
  el.templeStoneButtons.querySelectorAll("[data-temple-stone]").forEach((button) => {
    button.addEventListener("click", () => onSelectStone(button.dataset.templeStone));
  });
  el.templeMatrix.innerHTML = templeBoardHtml({
    stone,
    linksHtml: templeLinksHtml({
      stone,
      socketById,
      colorById: templeColor,
      isLineActive
    }),
    socketsHtml: renderSocket
  });
  bindTempleBoardInteractions({
    matrixElement: el.templeMatrix,
    onToggleLine,
    onEquipShard,
    onSelectShard,
    hasShard
  });
  el.shardInventoryRows.innerHTML = normalizedInventorySlots.map((shardId, index) => {
    const shard = shards[shardId];
    return inventorySlotHtml({
      index,
      shardId,
      shard,
      selected: shardId && temple.selectedShardId === shardId,
      shardTokenHtml: renderToken,
      shardProgressHtml: renderProgress
    });
  }).join("");
  bindShardTokenInteractions({ root: el.shardInventoryRows, onSelectShard, hasShard });
  bindInventoryDrop({
    inventoryElement: el.shardInventoryRows,
    onMoveShardToInventorySlot
  });
  el.templeBuffRows.innerHTML = templeBuffRowsHtml({ bonuses, formatEffectType: formatTempleEffectType });
  renderShardDetail({
    el,
    temple,
    stone,
    stoneState,
    shards,
    shardEffectValue,
    colorName
  });
}

export function renderShardDetail({ el, temple, stone, stoneState, shards, shardEffectValue, colorName }) {
  const shardId = temple.selectedShardId;
  const shard = shards[shardId];
  const xp = temple.shardInventory[shardId]?.xp || 0;
  el.shardDetailBox.innerHTML = shardDetailHtml({
    shardId,
    shard,
    stone,
    stoneState,
    xp,
    colorName,
    formatEffects: (selectedShardId, effects = []) => formatTempleEffects(selectedShardId, effects, shardEffectValue),
    dungeonVisits: temple.dungeonVisits,
    bossVisits: temple.bossVisits
  });
}

function formatTempleEffects(shardId, effects = [], shardEffectValue) {
  return effects.map((effect) => (
    `${formatTempleEffectType(effect.type)} +${shardEffectValue(shardId, effect)} (${effect.min}-${effect.max})`
  )).join(", ") || "none";
}

function shardGlyph(shardId) {
  const glyphs = {
    cellarFang: "F",
    broodCrown: "B",
    copperSplinter: "C",
    wardPrism: "W",
    captainGear: "G"
  };
  return glyphs[shardId] || "?";
}
