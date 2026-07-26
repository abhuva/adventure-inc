export function formatTempleEffectType(type) {
  return String(type).replace(/_/g, " ");
}

export function templeStatusText(stone, stoneState) {
  return `${stone.name} / links active: ${stoneState.activeLines.length}/${stone.maxActiveLines} / ${stone.modifierText}`;
}

export function templeStoneButtonsHtml({ stones, activeStoneId }) {
  return Object.entries(stones).map(([stoneId, stone]) => `
    <button class="temple-stone-button ${stoneId === activeStoneId ? "active" : ""}" data-temple-stone="${stoneId}" ${stone.unlocked ? "" : "disabled"}>
      ${stone.name}
    </button>
  `).join("");
}

export function templeBoardHtml({ stone, linksHtml, socketsHtml }) {
  return `
    <div class="temple-board-surface ${stone.boardClass || "temple-board-grid"}">
      <div class="temple-help">
        <div>drag shards onto colored sockets</div>
        <div>click a link to enable it; click active link to disable</div>
      </div>
      <svg class="temple-link-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${linksHtml}
      </svg>
      ${stone.sockets.map((socket) => socketsHtml(socket, stone)).join("")}
    </div>
  `;
}

export function templeSocketHtml({
  socket,
  socketId,
  color,
  shardId,
  shard,
  connected,
  influence,
  shardTokenHtml
}) {
  return `
    <div class="temple-socket ${connected ? "connected" : ""}" data-temple-slot="${socketId}" style="left:${socket.x}%;top:${socket.y}%;--socket-color:${color.hex}">
      <div class="temple-socket-title"><span class="temple-slot-color" style="background:${color.hex}"></span>${socket.label || color.name}</div>
      <div class="temple-socket-pad">
        ${shard ? shardTokenHtml(shardId, shard, { source: "socket", slotColor: socket.colorId }) : `<span class="empty-socket">drop shard</span>`}
      </div>
      <div class="detail-line">influence: ${influence}</div>
    </div>
  `;
}

export function templeLinksHtml({ stone, socketById, colorById, isLineActive }) {
  return stone.links.map(([aId, bId]) => {
    const a = socketById(aId, stone);
    const b = socketById(bId, stone);
    const aColor = colorById(a.colorId);
    const bColor = colorById(b.colorId);
    const active = isLineActive(aId, bId);
    return `
      <line class="temple-link-hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" data-line-a="${aId}" data-line-b="${bId}"></line>
      <line class="temple-link ${active ? "active" : "inactive"}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" style="--line-a:${aColor.hex};--line-b:${bColor.hex}" data-line-a="${aId}" data-line-b="${bId}"></line>
    `;
  }).join("");
}

export function shardColorDotsHtml(shard, colors) {
  return colors.map((color) => {
    const canSlot = shard.equipColors.includes(color.id);
    const affected = shard.affectedBy.includes(color.id);
    return `<span class="${canSlot ? "can-slot" : affected ? "affected" : ""}" style="--dot-color:${color.hex}"></span>`;
  }).join("");
}

export function shardTokenHtml({ shardId, shard, found, selected, glyph, colorDotsHtml, options = {} }) {
  const draggable = found ? "true" : "false";
  const equipped = options.source === "socket";
  return `
    <button class="shard-token ${selected ? "selected" : ""} ${found ? "" : "unfound"} ${equipped ? "equipped" : ""}"
      data-select-shard="${shardId}"
      data-shard-token="${shardId}"
      data-token-source="${options.source || "inventory"}"
      ${options.slotColor ? `data-slot-color="${options.slotColor}"` : ""}
      ${options.inventoryIndex !== undefined ? `data-inventory-index="${options.inventoryIndex}"` : ""}
      draggable="${draggable}"
      title="${found ? shard.name : "unknown shard"}">
      <span class="shard-glyph">${glyph}</span>
      <span class="shard-dots">${colorDotsHtml}</span>
      <span class="shard-token-name">${found ? shard.name : "unknown"}</span>
    </button>
  `;
}

export function shardProgressHtml({ xp, xpToMax }) {
  const progress = Math.min(100, (xp / xpToMax) * 100);
  return `
    <span class="shard-meta">xp ${xp}/${xpToMax}</span>
    <span class="bar"><span style="width:${progress}%"></span></span>
  `;
}

export function inventorySlotHtml({ index, shardId, shard, selected, shardTokenHtml, shardProgressHtml }) {
  return `
    <div class="shard-inventory-cell ${selected ? "selected" : ""} ${shard ? "" : "empty"}" data-inventory-slot="${index}">
      ${shard ? shardTokenHtml(shardId, shard, { source: "inventory", inventoryIndex: index }) : `<span class="empty-inventory-slot">${index + 1}</span>`}
      ${shard ? shardProgressHtml(shardId, shard) : ""}
    </div>
  `;
}

export function templeBuffRowsHtml({ bonuses, formatEffectType = formatTempleEffectType }) {
  const rows = Object.entries(bonuses)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `<div class="temple-buff-line">${formatEffectType(key)} +${value}</div>`);
  return rows.length ? rows.join("") : `<div class="temple-buff-line">no active shard buffs</div>`;
}

export function shardDetailHtml({
  shardId,
  shard,
  stone,
  stoneState,
  xp,
  colorName,
  formatEffects,
  dungeonVisits,
  bossVisits
}) {
  if (!shard) {
    return `
      <div class="detail-title">${stone.name}</div>
      <div class="detail-line">links: ${stoneState.activeLines.length}/${stone.maxActiveLines}</div>
      <div class="detail-line">modifier: ${stone.modifierText}</div>
      <div class="detail-line">select a shard</div>
    `;
  }
  const found = xp > 0;
  return [
    `<div class="detail-title">${stone.name}</div>`,
    `<div class="detail-line">links: ${stoneState.activeLines.length}/${stone.maxActiveLines}</div>`,
    `<div class="detail-line">modifier: ${stone.modifierText}</div>`,
    `<div class="detail-line">selected shard:</div>`,
    `<div class="detail-title">${found ? shard.name : "Unknown Shard"}</div>`,
    `<div class="detail-line">state: ${found ? "found" : "not found"}</div>`,
    `<div class="detail-line">source: ${shard.source}</div>`,
    `<div class="detail-line">progress: ${xp}/${shard.xpToMax}</div>`,
    `<div class="detail-line">can slot: ${shard.equipColors.map(colorName).join(", ")}</div>`,
    `<div class="detail-line">affected by: ${shard.affectedBy.map(colorName).join(", ")}</div>`,
    `<div class="detail-line">effects by color: ${Object.entries(shard.colorEffects).map(([colorId, effects]) => `${colorName(colorId)} ${formatEffects(shardId, effects)}`).join(" / ")}</div>`,
    `<div class="detail-line">dungeon counter: visits ${dungeonVisits[shard.dungeonId] || 0}, boss ${bossVisits[shard.dungeonId] || 0}</div>`
  ].join("");
}
