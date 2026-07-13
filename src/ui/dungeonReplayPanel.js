import {
  replayEmptyState,
  replayEventRowsHtml
} from "./dungeonView.js";

const REPLAY_CONTROL_IDS = [
  "replayFirstBtn",
  "replayPrevBtn",
  "replayPlayBtn",
  "replayNextBtn",
  "replayLastBtn",
  "replaySpeedBtn"
];

export function renderDungeonReplayPanel({
  el,
  documentRef,
  replay,
  replaySpeedLabel,
  renderActors
}) {
  const event = replay.events[replay.cursor] || null;
  const hasEvents = replay.events.length > 0;
  const maxCursor = Math.max(0, replay.events.length - 1);

  el.replayTimelineSlider.max = String(maxCursor);
  el.replayTimelineSlider.value = String(Math.max(0, Math.min(maxCursor, replay.cursor)));
  el.replayTimelineSlider.disabled = !hasEvents;
  el.replayStatus.textContent = hasEvents
    ? `event ${replay.cursor + 1}/${replay.events.length} / ${replay.playing ? "playing" : "paused"}`
    : "no replay";

  REPLAY_CONTROL_IDS.forEach((id) => {
    documentRef.getElementById(id).disabled = !hasEvents;
  });
  documentRef.getElementById("replayPlayBtn").textContent = replay.playing ? "pause" : "play";
  documentRef.getElementById("replaySpeedBtn").textContent = `speed ${replaySpeedLabel()}`;

  if (!event) {
    const empty = replayEmptyState();
    el.replayPartyActors.innerHTML = empty.partyActorsHtml;
    el.replayEnemyActors.innerHTML = empty.enemyActorsHtml;
    el.replayActionIcon.textContent = empty.actionIcon;
    el.replayEventText.textContent = empty.eventText;
    el.replayEventRows.innerHTML = empty.eventRowsHtml;
    return;
  }

  el.replayPartyActors.innerHTML = renderActors(event.partyActors, event);
  el.replayEnemyActors.innerHTML = renderActors(event.enemyActors, event);
  el.replayActionIcon.textContent = event.icon || "--";
  el.replayEventText.textContent = event.text;
  el.replayEventRows.innerHTML = replayEventRowsHtml(replay.events, replay.cursor);
}
