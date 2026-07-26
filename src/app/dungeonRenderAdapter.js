import {
  renderDungeonPanel,
  renderDungeonReplayOnly
} from "../ui/dungeonPanel.js";

export function createDungeonRenderAdapter({
  state,
  el,
  documentRef,
  selectedDungeon,
  repeatMode,
  formatReward,
  replaySpeedLabel,
  portraitStyle,
  selectedTargetNodeId,
  plannedNodeIds,
  conquestState,
  onSelectTargetNode
}) {
  function renderDungeon() {
    renderDungeonPanel({
      el,
      documentRef,
      dungeon: selectedDungeon(),
      estimate: state.lastEstimate,
      repeatedPlans: state.repeatedPlans,
      repeatMode: repeatMode(),
      rewardText: formatReward,
      replay: state.dungeonReplay,
      replaySpeedLabel,
      portraitStyle,
      selectedTargetNodeId: selectedTargetNodeId?.(),
      plannedNodeIds: plannedNodeIds?.() || [],
      conquestState: conquestState?.() || {},
      onSelectTargetNode
    });
  }

  function renderDungeonReplay() {
    renderDungeonReplayOnly({
      el,
      documentRef,
      replay: state.dungeonReplay,
      replaySpeedLabel,
      portraitStyle
    });
  }

  return {
    renderDungeon,
    renderDungeonReplay
  };
}
