import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/app/appState.js";
import { createHeroFromVisitor, focusHero, learnSkill, nextVisitor, recruitVisitor } from "../src/game/roster/rosterCommands.js";

const visitor = {
  id: "mira",
  name: "Mira",
  role: "Guard",
  race: "human",
  primaryJob: "guard",
  secondaryJob: null,
  stats: { hp: 30, atk: 5, def: 2, utility: 1 },
  spriteIndex: 1,
  cost: { coin: 4 }
};

test("nextVisitor returns the first unrecruited visitor", () => {
  const state = createInitialState();
  assert.equal(nextVisitor(state.roster, [visitor])?.id, "mira");
  state.roster.push(createHeroFromVisitor(visitor));
  assert.equal(nextVisitor(state.roster, [visitor]), null);
});

test("createHeroFromVisitor maps visitor data into level-one hero state", () => {
  const hero = createHeroFromVisitor(visitor);

  assert.equal(hero.id, "mira");
  assert.equal(hero.level, 1);
  assert.equal(hero.hp, 30);
  assert.deepEqual(hero.learnedSkills, {});
  assert.deepEqual(hero.gear, []);
});

test("recruitVisitor blocks capacity and cost before mutating roster", () => {
  const state = createInitialState();
  state.tavernVisitors.visitors.mira = { state: "present", nextChangeDay: 3 };
  state.tavern.capacity = 1;
  assert.equal(recruitVisitor(state, "mira", [visitor]).reason, "capacity");
  assert.equal(state.roster.length, 1);

  state.tavern.capacity = 2;
  assert.equal(recruitVisitor(state, "mira", [visitor], { canPay: () => false }).reason, "cost");
  assert.equal(state.roster.length, 1);
});

test("recruitVisitor pays cost and appends hero", () => {
  const state = createInitialState();
  state.tavernVisitors.visitors.mira = { state: "present", nextChangeDay: 3 };
  state.tavern.capacity = 2;
  let paid = null;
  const result = recruitVisitor(state, "mira", [visitor], { canPay: () => true, pay: (cost) => { paid = cost; } });

  assert.equal(result.ok, true);
  assert.equal(state.roster.at(-1).id, "mira");
  assert.equal(state.tavernVisitors.visitors.mira, undefined);
  assert.deepEqual(paid, { coin: 4 });
});

test("recruitVisitor blocks visitors who are not currently waiting", () => {
  const state = createInitialState();
  state.tavern.capacity = 2;
  const result = recruitVisitor(state, "mira", [visitor], { canPay: () => true });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "not visiting");
  assert.equal(state.roster.length, 1);
});

test("focusHero changes focus and invalidates cached estimate", () => {
  const state = createInitialState();
  state.lastEstimate = { id: "cached" };
  const result = focusHero(state, "ada");

  assert.equal(result.ok, true);
  assert.equal(state.focusedHeroId, "ada");
  assert.equal(state.lastEstimate, null);
  assert.deepEqual(focusHero(state, "missing"), { ok: false, reason: "hero missing" });
});

test("learnSkill applies rank, spends points, and preserves full-heal state", () => {
  const state = createInitialState();
  const hero = state.roster[0];
  hero.skillPoints = 2;
  hero.hp = 42;

  const result = learnSkill(state, "ada", "race.human.adaptable");

  assert.equal(result.ok, true);
  assert.equal(result.rank, 1);
  assert.equal(hero.skillPoints, 1);
  assert.equal(hero.learnedSkills["race.human.adaptable"], 1);
  assert.equal(hero.hp, 42);
});

test("learnSkill blocks busy heroes and unmet prerequisites", () => {
  const state = createInitialState();

  const busy = learnSkill(state, "ada", "race.human.adaptable", { characterState: () => ({ state: "Walking home" }) });
  assert.equal(busy.ok, false);
  assert.equal(busy.reason, "busy");

  const blocked = learnSkill(state, "ada", "race.human.cross_training");
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "requires connected skill");
});

test("learnSkill applies skill point bonus and stops repeated plan for hero party", () => {
  const state = createInitialState();
  const hero = state.roster[0];
  hero.skillPoints = 1;
  hero.learnedSkills = { "race.human.adaptable": 1 };
  state.repeatedPlans["party-1"] = { id: "plan" };
  state.lastEstimate = { id: "cached" };

  const result = learnSkill(state, "ada", "race.human.cross_training", {
    partyForHero: () => state.parties[0]
  });

  assert.equal(result.ok, true);
  assert.equal(result.rank, 1);
  assert.equal(hero.skillPoints, 1);
  assert.equal(result.stoppedRepeatedPlan, true);
  assert.equal(state.repeatedPlans["party-1"], undefined);
  assert.equal(state.lastEstimate, null);
});

test("learnSkill spends expensive resolve rank costs", () => {
  const state = createInitialState();
  const hero = state.roster[0];
  hero.skillPoints = 3;
  hero.learnedSkills = { "race.human.resolve_nerve": 1 };

  const result = learnSkill(state, "ada", "race.human.resolve_grit");

  assert.equal(result.ok, true);
  assert.equal(result.rank, 1);
  assert.equal(hero.skillPoints, 1);
  assert.equal(hero.learnedSkills["race.human.resolve_grit"], 1);
});
