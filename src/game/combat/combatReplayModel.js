export function pushReplayEvent(timeline, event) {
  timeline.push({
    time: timeline.length ? timeline[timeline.length - 1].time + 1 : 0,
    type: event.type,
    icon: event.icon,
    text: event.text,
    actorId: event.actorId || null,
    targetId: event.targetId || null,
    partyActors: snapshotCombatActors(event.partyActors || []),
    enemyActors: snapshotCombatActors(event.enemyActors || [])
  });
}

export function snapshotCombatActors(actors) {
  return actors.map((actor) => ({
    id: actor.id,
    name: actor.name,
    team: actor.team,
    role: actor.role || "",
    spriteIndex: actor.spriteIndex ?? null,
    hp: Math.max(0, actor.hp),
    maxHp: actor.maxHp,
    atk: actor.atk,
    def: actor.def,
    initiative: actor.initiative,
    speed: actor.speed
  }));
}
