import { heroStats as calculateHeroStats } from "./heroStats.js";

export function grantHeroXp(hero, xp, { heroStats = calculateHeroStats } = {}) {
  hero.xp += xp;
  const levelUps = [];
  while (hero.xp >= hero.level * 8) {
    hero.xp -= hero.level * 8;
    hero.level += 1;
    hero.skillPoints += 1;
    const stats = heroStats(hero);
    hero.hp = stats.hpMax;
    levelUps.push({
      hero,
      level: hero.level,
      hpMax: stats.hpMax
    });
  }
  return {
    hero,
    levelUps
  };
}
