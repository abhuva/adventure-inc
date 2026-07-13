import {
  heroLevelUpMessage,
  learnSkillResultMessages
} from "./commandMessages.js";
import { learnSkill as learnRosterSkill } from "../game/roster/rosterCommands.js";
import { grantHeroXp } from "../game/roster/leveling.js";

export function createRosterProgressionHandlers({
  state,
  skills,
  skillTrees,
  characterState,
  partyForHero,
  heroStats,
  addLog,
  render
}) {
  function learnSkill(heroId, skillId) {
    const result = learnRosterSkill(state, heroId, skillId, {
      skills,
      skillTrees,
      characterState,
      partyForHero
    });
    const fallbackHero = result.hero || state.roster.find((item) => item.id === heroId);
    const messages = learnSkillResultMessages(result, {
      fallbackHeroName: fallbackHero?.name || heroId,
      fallbackSkillName: skills[skillId]?.name || skillId
    });
    messages.forEach((message) => addLog(message.text, message.type));
    render();
  }

  function gainXp(hero, xp) {
    const result = grantHeroXp(hero, xp, { heroStats });
    result.levelUps.forEach((levelUp) => {
      const message = heroLevelUpMessage(hero.name, levelUp.level);
      addLog(message.text, message.type);
    });
  }

  return {
    gainXp,
    learnSkill
  };
}
