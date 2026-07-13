import {
  dungeonEstimateText,
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
  portraitStyle
}) {
  const reached = estimate && estimate.dungeonId === dungeon.id ? estimate.reached : 0;
  const failedIndex = estimate && !estimate.success ? estimate.reached : -1;
  el.nodeMap.innerHTML = dungeonNodeMapHtml({
    dungeon,
    reached,
    failedIndex,
    rewardText
  });

  el.estimateBox.textContent = dungeonEstimateText({
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
