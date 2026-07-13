export function dungeonNodeMapHtml({ dungeon, reached = 0, failedIndex = -1, rewardText }) {
  return dungeon.nodes.map((node, index) => `
    <div class="node ${index < reached ? "reached" : ""} ${index === failedIndex ? "failed" : ""}">
      <div class="node-title">${index + 1}. ${node.name}</div>
      <div class="node-meta">${node.type}</div>
      <div class="node-meta">reward: ${rewardText(node.reward)}</div>
    </div>
  `).join("");
}

export function dungeonEstimateText({ estimate, repeated, repeatMode }) {
  if (!estimate) {
    return "No cached estimate.\n\nRun simulate to preview deterministic combat, food cost, rewards, and recovery time.";
  }
  return [
    `${estimate.dungeonName} / ${estimate.strategy}`,
    `party: ${estimate.partyName}`,
    `repeat: ${repeated ? "repeated" : repeatMode === "repeat" ? "ready to enable" : "manual"}`,
    `target nodes: ${estimate.totalNodes}`,
    `reached: ${estimate.reached}`,
    `success: ${estimate.success ? "yes" : "no"}`,
    `time: ${estimate.hours}h`,
    `food: -${estimate.foodCost}`,
    `hp: ${estimate.hpStart} -> ${estimate.hpEnd}`,
    `rewards: ${estimate.rewardText}`,
    "",
    ...estimate.transcript
  ].join("\n");
}

export function replayActorRowsHtml({ actors = [], event = {}, portraitHtml }) {
  if (!actors.length) {
    return `<div class="replay-empty">none</div>`;
  }
  return actors.map((actor) => {
    const pct = actor.maxHp > 0 ? Math.max(0, Math.min(100, actor.hp / actor.maxHp * 100)) : 0;
    const active = actor.id === event.actorId;
    const targeted = actor.id === event.targetId;
    return `
      <div class="replay-actor ${active ? "active" : ""} ${targeted ? "targeted" : ""}">
        ${actor.spriteIndex !== null ? portraitHtml(actor.spriteIndex) : `<span class="enemy-portrait">${actor.name.slice(0, 2).toUpperCase()}</span>`}
        <div class="replay-actor-body">
          <div class="replay-actor-name">${actor.name}</div>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <div class="shard-meta">hp ${actor.hp}/${actor.maxHp} / init ${actor.initiative} / spd ${actor.speed}</div>
        </div>
      </div>
    `;
  }).join("");
}

export function replayEventRowsHtml(events = [], cursor = 0) {
  return events.slice(0, cursor + 1).slice(-12).map((item, index, list) => `
    <li class="${index === list.length - 1 ? "current" : ""}">
      <span class="tag">${item.icon}</span> ${item.text}
    </li>
  `).join("");
}

export function replayEmptyState() {
  return {
    partyActorsHtml: `<div class="replay-empty">no party snapshot</div>`,
    enemyActorsHtml: `<div class="replay-empty">no enemy snapshot</div>`,
    actionIcon: "--",
    eventText: "simulate a run to inspect combat events",
    eventRowsHtml: ""
  };
}
