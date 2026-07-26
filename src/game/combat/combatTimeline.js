import { heroStats } from "../roster/heroStats.js";
import {
  chooseEnemyTarget,
  choosePartyAction,
  enemyActionLabel,
  enemyActionRecovery,
  enemyDamage,
  lowestHpActor
} from "./combatActions.js";
import { pushReplayEvent } from "./combatReplayModel.js";

export function resolveNode(node, stats, partyActors, strategy, timeline) {
  if (node.type === "hazard") {
    const damage = Math.max(0, node.damage - Math.floor(stats.def / 2));
    applyPartyDamage(partyActors, damage);
    const hp = partyHpCurrent(partyActors);
    pushReplayEvent(timeline, {
      type: "hazard",
      icon: "!",
      text: `${node.name}: hazard deals ${damage} party damage.`,
      partyActors,
      enemyActors: []
    });
    return {
      success: hp > 0,
      hp,
      hours: 1,
      summary: `hazard damage ${damage}`
    };
  }

  if (node.type === "check") {
    const success = stats.utility >= node.utility;
    pushReplayEvent(timeline, {
      type: "check",
      icon: success ? "OK" : "X",
      text: `${node.name}: ${success ? "passed" : "failed"} utility check ${stats.utility}/${node.utility}.`,
      partyActors,
      enemyActors: []
    });
    return {
      success,
      hp: partyHpCurrent(partyActors),
      hours: 1,
      summary: success ? `utility check ${stats.utility}/${node.utility}` : `failed utility check ${stats.utility}/${node.utility}`
    };
  }

  if (!node.enemy) {
    pushReplayEvent(timeline, {
      type: "objective",
      icon: "OK",
      text: `${node.name}: objective secured.`,
      partyActors,
      enemyActors: []
    });
    return {
      success: true,
      hp: partyHpCurrent(partyActors),
      hours: 1,
      summary: "objective secured"
    };
  }

  return resolveCombat(node, stats, partyActors, strategy, timeline);
}

function resolveCombat(node, stats, partyActors, strategy, timeline) {
  const startHp = partyHpCurrent(partyActors);
  const enemyActors = [createEnemyCombatActor(node)];
  const actors = [...partyActors, ...enemyActors];
  const transcript = [];
  const maxEvents = 80;
  let eventCount = 0;
  let guardUntil = 0;

  pushReplayEvent(timeline, {
    type: "combat_start",
    icon: "VS",
    text: `${node.name}: ${enemyActors[0].name} engages.`,
    partyActors,
    enemyActors
  });

  while (eventCount < maxEvents && livingActors(partyActors).length && livingActors(enemyActors).length) {
    const actor = nextCombatActor(actors);
    if (!actor) break;
    actor.nextActionAt = Math.max(actor.nextActionAt, 0);

    if (actor.team === "party") {
      const action = choosePartyAction(actor, partyActors, enemyActors, strategy, actor.nextActionAt, node);
      if (action.type === "heal") {
        const target = lowestHpActor(partyActors);
        const before = target.hp;
        target.hp = Math.min(target.maxHp, target.hp + action.amount);
        actor.cooldowns[action.id] = actor.nextActionAt + action.cooldown;
        actor.nextActionAt += action.recovery;
        transcript.push(`${actor.name} ${action.name} +${target.hp - before}`);
        pushReplayEvent(timeline, {
          type: "heal",
          icon: "+",
          text: `${actor.name} used ${action.name} on ${target.name} for ${target.hp - before} HP.`,
          partyActors,
          enemyActors,
          actorId: actor.id,
          targetId: target.id
        });
      } else if (action.type === "guard") {
        guardUntil = Math.max(guardUntil, actor.nextActionAt + action.duration);
        actor.cooldowns[action.id] = actor.nextActionAt + action.cooldown;
        actor.nextActionAt += action.recovery;
        transcript.push(`${actor.name} guards`);
        pushReplayEvent(timeline, {
          type: "guard",
          icon: "[]",
          text: `${actor.name} used ${action.name}; next incoming heavy pressure is reduced.`,
          partyActors,
          enemyActors,
          actorId: actor.id
        });
      } else {
        const target = firstLiving(enemyActors);
        const damage = Math.max(1, Math.floor(actor.atk * action.power) - target.def);
        target.hp = Math.max(0, target.hp - damage);
        actor.cooldowns[action.id] = actor.nextActionAt + action.cooldown;
        actor.nextActionAt += action.recovery;
        transcript.push(`${actor.name} ${action.name} ${damage}`);
        pushReplayEvent(timeline, {
          type: "attack",
          icon: "ATK",
          text: `${actor.name} hit ${target.name} with ${action.name} for ${damage} HP.`,
          partyActors,
          enemyActors,
          actorId: actor.id,
          targetId: target.id
        });
      }
    } else {
      const actionName = actor.script[actor.scriptIndex % actor.script.length];
      actor.scriptIndex += 1;
      const target = chooseEnemyTarget(partyActors);
      const guarded = guardUntil >= actor.nextActionAt && actionName === "heavy";
      const incoming = enemyDamage(actor.atk, actionName);
      const damage = Math.max(1, incoming - target.def - (guarded ? 5 : 0));
      target.hp = Math.max(0, target.hp - damage);
      actor.nextActionAt += enemyActionRecovery(actionName, actor.speed);
      transcript.push(`${actor.name} ${actionName} ${damage}`);
      pushReplayEvent(timeline, {
        type: "enemy",
        icon: "DMG",
        text: `${actor.name} used ${enemyActionLabel(actionName)} on ${target.name} for ${damage} HP${guarded ? " (guarded)" : ""}.`,
        partyActors,
        enemyActors,
        actorId: actor.id,
        targetId: target.id
      });
    }
    eventCount += 1;
  }

  const heroHp = partyHpCurrent(partyActors);
  const enemyHp = partyHpCurrent(enemyActors);
  const success = heroHp > 0 && enemyHp <= 0;
  return {
    success,
    hp: heroHp,
    hours: Math.max(1, Math.ceil(eventCount / 4)),
    summary: `${success ? "won" : "lost"}; hp ${startHp}->${heroHp}; ${transcript.join(", ")}`
  };
}

export function createPartyCombatActors(partyMembers) {
  return partyMembers.map((hero, index) => {
    const stats = heroStats(hero);
    const initiative = 35 + stats.utility * 5 + stats.travelSpeed * 4 + index;
    const speed = 20 + stats.utility * 3 + stats.travelSpeed * 5;
    return {
      id: hero.id,
      name: hero.name,
      team: "party",
      role: hero.role,
      spriteIndex: hero.spriteIndex ?? 0,
      hp: Math.min(hero.hp, stats.hpMax),
      maxHp: stats.hpMax,
      atk: stats.atk,
      def: stats.def,
      utility: stats.utility,
      resolveMax: stats.resolve ?? 10,
      resolveLeft: stats.resolve ?? 10,
      withdrew: false,
      initiative,
      speed,
      nextActionAt: Math.max(0, 100 - initiative),
      cooldowns: {},
      order: index
    };
  });
}

function createEnemyCombatActor(node) {
  const enemy = node.enemy;
  const initiative = enemy.initiative ?? 30;
  const speed = enemy.speed ?? 20;
  return {
    id: `enemy-${node.id}`,
    name: node.name,
    team: "enemy",
    hp: enemy.hp,
    maxHp: enemy.hp,
    atk: enemy.atk,
    def: enemy.def || 0,
    initiative,
    speed,
    nextActionAt: Math.max(0, 110 - initiative),
    script: enemy.script?.length ? enemy.script : ["strike"],
    scriptIndex: 0,
    cooldowns: {},
    order: 100
  };
}

function nextCombatActor(actors) {
  return actors
    .filter((actor) => actor.hp > 0)
    .sort((a, b) => a.nextActionAt - b.nextActionAt || b.initiative - a.initiative || teamOrder(a) - teamOrder(b) || a.id.localeCompare(b.id))[0];
}

function teamOrder(actor) {
  return actor.team === "party" ? 0 : 1;
}

function livingActors(actors) {
  return actors.filter((actor) => actor.hp > 0);
}

function firstLiving(actors) {
  return livingActors(actors)[0];
}

export function partyHpCurrent(actors) {
  return actors.reduce((sum, actor) => sum + Math.max(0, actor.hp), 0);
}

function applyPartyDamage(partyActors, damage) {
  let remaining = damage;
  const targets = livingActors(partyActors).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.order - b.order);
  for (const target of targets) {
    if (remaining <= 0) break;
    const dealt = Math.min(target.hp, remaining);
    target.hp -= dealt;
    remaining -= dealt;
  }
}

export function recoveryHours(hp, maxHp, stats = null) {
  const base = Math.max(1, Math.ceil((maxHp - Math.max(0, hp)) / 8));
  return Math.max(1, base - Math.max(0, stats?.recoveryReduce || 0));
}

