import { formatLabel } from "../../core/format.js";

export function choosePartyAction(actor, partyActors, enemyActors, strategy, now, node) {
  const wounded = lowestHpActor(partyActors);
  if ((strategy === "balanced" || actor.role === "Healer") && wounded && wounded.hp / wounded.maxHp <= 0.45 && isCooldownReady(actor, "field_dress", now)) {
    return {
      id: "field_dress",
      type: "heal",
      name: actor.role === "Healer" ? "Field Mend" : "Field Dress",
      amount: Math.max(5, 6 + Math.floor(actor.utility / 2)),
      recovery: actionRecovery(actor, 120),
      cooldown: 280
    };
  }
  if (strategy === "guarded" && enemyUpcomingHeavy(node, enemyActors[0]) && isCooldownReady(actor, "guard", now)) {
    return {
      id: "guard",
      type: "guard",
      name: "Guard Stance",
      recovery: actionRecovery(actor, 80),
      cooldown: 240,
      duration: 180
    };
  }
  if (strategy === "burst" && isCooldownReady(actor, "power_strike", now)) {
    return {
      id: "power_strike",
      type: "attack",
      name: actor.role === "Hunter" ? "Clean Shot" : "Smashing Hands",
      power: 1.55,
      recovery: actionRecovery(actor, 145),
      cooldown: 220
    };
  }
  return {
    id: "basic_attack",
    type: "attack",
    name: actor.role === "Scout" ? "Quick Cut" : "Strike",
    power: 1,
    recovery: actionRecovery(actor, 100),
    cooldown: 0
  };
}

export function chooseEnemyTarget(partyActors) {
  return livingActors(partyActors)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || b.atk - a.atk || a.order - b.order)[0];
}

export function enemyDamage(atk, action) {
  if (action === "heavy") return atk + 5;
  if (action === "pulse" || action === "shriek") return atk + 2;
  if (action === "brace" || action === "guard") return Math.max(1, atk - 2);
  return atk;
}

export function enemyActionRecovery(actionName, speed) {
  const base = actionName === "heavy" ? 150 : actionName === "guard" || actionName === "brace" ? 120 : 100;
  return Math.max(40, base - speed);
}

export function enemyActionLabel(actionName) {
  return formatLabel(actionName);
}

function enemyUpcomingHeavy(node, enemyActor) {
  if (!enemyActor || !node.enemy.script?.length) return false;
  return node.enemy.script[enemyActor.scriptIndex % node.enemy.script.length] === "heavy";
}

function isCooldownReady(actor, skillId, now) {
  return !actor.cooldowns[skillId] || actor.cooldowns[skillId] <= now;
}

function actionRecovery(actor, baseRecovery) {
  return Math.max(35, baseRecovery - actor.speed);
}

function livingActors(actors) {
  return actors.filter((actor) => actor.hp > 0);
}

export function lowestHpActor(actors) {
  return livingActors(actors)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp || a.order - b.order || a.id.localeCompare(b.id))[0];
}
