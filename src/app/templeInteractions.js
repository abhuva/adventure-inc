export function bindTempleBoardInteractions({
  matrixElement,
  onToggleLine,
  onEquipShard,
  onSelectShard,
  hasShard
}) {
  matrixElement.querySelectorAll(".temple-link-hit").forEach((line) => {
    line.addEventListener("click", () => onToggleLine(line.dataset.lineA, line.dataset.lineB));
  });
  matrixElement.querySelectorAll("[data-temple-slot]").forEach((slot) => {
    slot.addEventListener("dragover", (event) => {
      event.preventDefault();
      slot.classList.add("drop-target");
    });
    slot.addEventListener("dragleave", () => {
      slot.classList.remove("drop-target");
    });
    slot.addEventListener("drop", (event) => {
      event.preventDefault();
      slot.classList.remove("drop-target");
      const shardId = event.dataTransfer.getData("text/plain");
      onEquipShard(slot.dataset.templeSlot, shardId);
    });
  });
  bindShardTokenInteractions({ root: matrixElement, onSelectShard, hasShard });
}

export function bindShardTokenInteractions({ root, onSelectShard, hasShard }) {
  root.querySelectorAll("[data-select-shard]").forEach((button) => {
    button.addEventListener("click", () => onSelectShard(button.dataset.selectShard));
  });
  root.querySelectorAll("[data-shard-token]").forEach((token) => {
    token.addEventListener("dragstart", (event) => {
      if (!hasShard(token.dataset.shardToken)) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", token.dataset.shardToken);
      event.dataTransfer.setData("source", token.dataset.tokenSource || "");
      event.dataTransfer.setData("inventoryIndex", token.dataset.inventoryIndex || "");
      event.dataTransfer.effectAllowed = "move";
      token.classList.add("dragging");
    });
    token.addEventListener("dragend", () => {
      token.classList.remove("dragging");
    });
  });
}

export function bindInventoryDrop({ inventoryElement, onMoveShardToInventorySlot }) {
  inventoryElement.querySelectorAll("[data-inventory-slot]").forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("drop-target");
    });
    cell.addEventListener("dragleave", () => {
      cell.classList.remove("drop-target");
    });
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      cell.classList.remove("drop-target");
      const shardId = event.dataTransfer.getData("text/plain");
      onMoveShardToInventorySlot(shardId, Number(cell.dataset.inventorySlot));
    });
  });
}
