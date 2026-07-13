import { bindElementsById } from "../ui/dom.js";

export const REQUIRED_ELEMENT_IDS = [
  "dayLabel",
  "phaseLabel",
  "runStateLabel",
  "mapStatus",
  "overlandMap",
  "locationDetail",
  "operationRows",
  "poiRows",
  "tavernStatus",
  "tavernResourceLine",
  "visitorRows",
  "jobRows",
  "rosterRows",
  "partyRows",
  "focusedCharacterBox",
  "partyStatus",
  "toggleRosterViewBtn",
  "partySelect",
  "dungeonSelect",
  "strategySelect",
  "stopNodeSelect",
  "repeatSelect",
  "nodeMap",
  "estimateBox",
  "replayStatus",
  "replayPartyActors",
  "replayEnemyActors",
  "replayActionIcon",
  "replayEventText",
  "replayEventRows",
  "replayTimelineSlider",
  "templeStatus",
  "templeStoneButtons",
  "templeMatrix",
  "templeBuffRows",
  "shardInventoryRows",
  "shardDetailBox",
  "logRows",
  "blueprintRows"
];

export function bindAppElements(root = document) {
  return bindElementsById(REQUIRED_ELEMENT_IDS, root);
}
