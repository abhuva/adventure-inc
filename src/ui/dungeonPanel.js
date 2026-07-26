import {
  dungeonEstimateHtml,
  dungeonNodeGraphHtml,
  dungeonNodeInfoHtml,
  dungeonNodeMapHtml,
  replayActorRowsHtml
} from "./dungeonView.js";
import { renderDungeonReplayPanel } from "./dungeonReplayPanel.js";

export function renderDungeonPanel({
  el,
  documentRef,
  dungeon,
  estimate,
  repeatedPlans,
  repeatMode,
  rewardText,
  replay,
  replaySpeedLabel,
  portraitStyle,
  selectedTargetNodeId,
  plannedNodeIds = [],
  conquestState = {},
  onSelectTargetNode
}) {
  const reached = estimate && estimate.dungeonId === dungeon.id ? estimate.reached : 0;
  const failedIndex = estimate && !estimate.success ? estimate.reached : -1;
  el.nodeMap.innerHTML = dungeonNodeGraphHtml({
    dungeon,
    selectedTargetNodeId,
    plannedNodeIds,
    conquestState,
    estimate: estimate && estimate.dungeonId === dungeon.id ? estimate : null,
    rewardText
  });
  el.dungeonNodeInfo.innerHTML = dungeonNodeInfoHtml({
    dungeon,
    nodeId: selectedTargetNodeId || plannedNodeIds.at(-1),
    conquestState,
    rewardText
  });
  el.nodeMap.onclick = (event) => {
    const button = event.target.closest?.("[data-dungeon-target-node]");
    if (!button || !el.nodeMap.contains?.(button)) return;
    onSelectTargetNode?.(button.dataset.dungeonTargetNode);
  };

  el.estimateBox.innerHTML = dungeonEstimateHtml({
    estimate: estimate ? {
      ...estimate,
      rewardText: rewardText(estimate.rewards)
    } : null,
    repeated: estimate ? Boolean(repeatedPlans[estimate.partyId]) : false,
    repeatMode
  });

  renderDungeonReplayOnly({
    el,
    documentRef,
    replay,
    replaySpeedLabel,
    portraitStyle
  });
}

export function renderDungeonReplayOnly({
  el,
  documentRef,
  replay,
  replaySpeedLabel,
  portraitStyle
}) {
  renderDungeonReplayPanel({
    el,
    documentRef,
    replay,
    replaySpeedLabel,
    renderActors: (actors, event) => replayActorRowsHtml({
      actors,
      event,
      portraitHtml: (spriteIndex) => (
        `<span class="char-portrait card replay-portrait" style="${portraitStyle(spriteIndex)}"></span>`
      )
    })
  });
}
