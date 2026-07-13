import assert from "node:assert/strict";
import test from "node:test";

import { grantHeroXp } from "../src/game/roster/leveling.js";

test("grantHeroXp adds xp without level up below threshold", () => {
  const hero = {
    level: 1,
    xp: 2,
    skillPoints: 0,
    hp: 5
  };

  const result = grantHeroXp(hero, 3, {
    heroStats: () => ({ hpMax: 10 })
  });

  assert.equal(hero.xp, 5);
  assert.equal(hero.level, 1);
  assert.equal(hero.skillPoints, 0);
  assert.equal(hero.hp, 5);
  assert.deepEqual(result.levelUps, []);
});

test("grantHeroXp handles multiple level ups and restores hp to derived max", () => {
  const hero = {
    level: 1,
    xp: 7,
    skillPoints: 0,
    hp: 3
  };

  const result = grantHeroXp(hero, 20, {
    heroStats: (currentHero) => ({ hpMax: currentHero.level * 10 })
  });

  assert.equal(hero.level, 3);
  assert.equal(hero.xp, 3);
  assert.equal(hero.skillPoints, 2);
  assert.equal(hero.hp, 30);
  assert.deepEqual(
    result.levelUps.map((levelUp) => [levelUp.level, levelUp.hpMax]),
    [[2, 20], [3, 30]]
  );
});
