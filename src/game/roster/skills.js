function skill(name, category, maxRank, requires, effects) {
  return { name, category, maxRank, requires, effects };
}

export const SKILL_TREES = {
  "race.human": {
    name: "Human",
    skillIds: ["race.human.adaptable", "race.human.cross_training", "race.human.logistics"]
  },
  "race.dwarf": {
    name: "Dwarf",
    skillIds: ["race.dwarf.stone_bones", "race.dwarf.ore_sense", "race.dwarf.grit"]
  },
  "race.elf": {
    name: "Elf",
    skillIds: ["race.elf.light_step", "race.elf.keen_eye", "race.elf.precision"]
  },
  "race.half-elf": {
    name: "Half-Elf",
    skillIds: ["race.half-elf.bridge", "race.half-elf.field_medic", "race.half-elf.negotiator"]
  },
  "race.demon": {
    name: "Demon",
    skillIds: ["race.demon.burning_blood", "race.demon.hunger", "race.demon.dread"]
  },
  "race.halfling": {
    name: "Halfling",
    skillIds: ["race.halfling.light_pack", "race.halfling.forager", "race.halfling.slip"]
  },
  "race.orc": {
    name: "Orc",
    skillIds: ["race.orc.brute_force", "race.orc.thick_hide", "race.orc.war_cry"]
  },
  "race.undead": {
    name: "Undead",
    skillIds: ["race.undead.no_appetite", "race.undead.bone_frame", "race.undead.cold_focus"]
  },
  "job.guard": {
    name: "Guard",
    skillIds: ["job.guard.steady_stance", "job.guard.shield_wall", "job.guard.intercept"]
  },
  "job.scout": {
    name: "Scout",
    skillIds: ["job.scout.pathfinder", "job.scout.trap_read", "job.scout.forward_camp"]
  },
  "job.smith": {
    name: "Smith",
    skillIds: ["job.smith.field_repair", "job.smith.ore_sorting", "job.smith.hardened_edges"]
  },
  "job.healer": {
    name: "Healer",
    skillIds: ["job.healer.first_aid", "job.healer.clean_recovery", "job.healer.triage"]
  },
  "job.delver": {
    name: "Delver",
    skillIds: ["job.delver.dungeon_pace", "job.delver.hazard_sense", "job.delver.clean_finish"]
  },
  "job.warden": {
    name: "Warden",
    skillIds: ["job.warden.anchor", "job.warden.guardian_aura", "job.warden.lockdown"]
  },
  "job.scholar": {
    name: "Scholar",
    skillIds: ["job.scholar.field_notes", "job.scholar.blueprint_reading", "job.scholar.pattern_logic"]
  },
  "job.hunter": {
    name: "Hunter",
    skillIds: ["job.hunter.tracker", "job.hunter.clean_shot", "job.hunter.field_dressing"]
  }
};

export const SKILLS = {
  "race.human.adaptable": skill("Adaptable", "utility", 3, [], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.human.cross_training": skill("Cross Training", "utility", 1, ["race.human.adaptable"], [{ type: "skill_point_bonus", valuePerRank: 1 }]),
  "race.human.logistics": skill("Logistics", "resource", 2, ["race.human.adaptable"], [{ type: "food_cost_reduce", valuePerRank: 1 }]),
  "race.dwarf.stone_bones": skill("Stone Bones", "fight", 3, [], [{ type: "def_add", valuePerRank: 1 }]),
  "race.dwarf.ore_sense": skill("Ore Sense", "resource", 2, ["race.dwarf.stone_bones"], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.dwarf.grit": skill("Grit", "fight", 2, ["race.dwarf.stone_bones"], [{ type: "hp_add", valuePerRank: 4 }]),
  "race.elf.light_step": skill("Light Step", "utility", 3, [], [{ type: "travel_speed_add", valuePerRank: 1 }]),
  "race.elf.keen_eye": skill("Keen Eye", "utility", 2, ["race.elf.light_step"], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.elf.precision": skill("Precision", "fight", 2, ["race.elf.keen_eye"], [{ type: "atk_add", valuePerRank: 1 }]),
  "race.half-elf.bridge": skill("Bridge", "utility", 3, [], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.half-elf.field_medic": skill("Field Medic", "utility", 2, ["race.half-elf.bridge"], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "race.half-elf.negotiator": skill("Negotiator", "resource", 2, ["race.half-elf.bridge"], [{ type: "hire_discount", valuePerRank: 1 }]),
  "race.demon.burning_blood": skill("Burning Blood", "fight", 3, [], [{ type: "atk_add", valuePerRank: 2 }]),
  "race.demon.hunger": skill("Hunger", "resource", 1, ["race.demon.burning_blood"], [{ type: "food_cost_add", valuePerRank: 1 }]),
  "race.demon.dread": skill("Dread", "fight", 2, ["race.demon.burning_blood"], [{ type: "def_add", valuePerRank: 1 }]),
  "race.halfling.light_pack": skill("Light Pack", "resource", 3, [], [{ type: "food_cost_reduce", valuePerRank: 1 }]),
  "race.halfling.forager": skill("Forager", "resource", 2, ["race.halfling.light_pack"], [{ type: "utility_add", valuePerRank: 1 }]),
  "race.halfling.slip": skill("Slip", "fight", 2, ["race.halfling.light_pack"], [{ type: "def_add", valuePerRank: 1 }]),
  "race.orc.brute_force": skill("Brute Force", "fight", 3, [], [{ type: "atk_add", valuePerRank: 2 }]),
  "race.orc.thick_hide": skill("Thick Hide", "fight", 2, ["race.orc.brute_force"], [{ type: "hp_add", valuePerRank: 5 }]),
  "race.orc.war_cry": skill("War Cry", "fight", 1, ["race.orc.brute_force"], [{ type: "atk_add", valuePerRank: 2 }]),
  "race.undead.no_appetite": skill("No Appetite", "resource", 1, [], [{ type: "food_cost_reduce", valuePerRank: 2 }]),
  "race.undead.bone_frame": skill("Bone Frame", "fight", 2, ["race.undead.no_appetite"], [{ type: "def_add", valuePerRank: 1 }]),
  "race.undead.cold_focus": skill("Cold Focus", "utility", 2, ["race.undead.no_appetite"], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.guard.steady_stance": skill("Steady Stance", "fight", 3, [], [{ type: "hp_add", valuePerRank: 4 }]),
  "job.guard.shield_wall": skill("Shield Wall", "fight", 3, ["job.guard.steady_stance"], [{ type: "def_add", valuePerRank: 1 }]),
  "job.guard.intercept": skill("Intercept", "fight", 1, ["job.guard.shield_wall"], [{ type: "def_add", valuePerRank: 2 }]),
  "job.scout.pathfinder": skill("Pathfinder", "utility", 3, [], [{ type: "travel_speed_add", valuePerRank: 1 }]),
  "job.scout.trap_read": skill("Trap Read", "utility", 2, ["job.scout.pathfinder"], [{ type: "utility_add", valuePerRank: 2 }]),
  "job.scout.forward_camp": skill("Forward Camp", "resource", 1, ["job.scout.pathfinder"], [{ type: "food_cost_reduce", valuePerRank: 1 }]),
  "job.smith.field_repair": skill("Field Repair", "utility", 3, [], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "job.smith.ore_sorting": skill("Ore Sorting", "resource", 2, ["job.smith.field_repair"], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.smith.hardened_edges": skill("Hardened Edges", "fight", 2, ["job.smith.field_repair"], [{ type: "atk_add", valuePerRank: 1 }]),
  "job.healer.first_aid": skill("First Aid", "utility", 3, [], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "job.healer.clean_recovery": skill("Clean Recovery", "utility", 2, ["job.healer.first_aid"], [{ type: "hp_add", valuePerRank: 3 }]),
  "job.healer.triage": skill("Triage", "fight", 1, ["job.healer.first_aid"], [{ type: "def_add", valuePerRank: 1 }]),
  "job.delver.dungeon_pace": skill("Dungeon Pace", "utility", 3, [], [{ type: "travel_speed_add", valuePerRank: 1 }]),
  "job.delver.hazard_sense": skill("Hazard Sense", "utility", 2, ["job.delver.dungeon_pace"], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.delver.clean_finish": skill("Clean Finish", "fight", 2, ["job.delver.dungeon_pace"], [{ type: "atk_add", valuePerRank: 1 }]),
  "job.warden.anchor": skill("Anchor", "fight", 3, [], [{ type: "def_add", valuePerRank: 1 }]),
  "job.warden.guardian_aura": skill("Guardian Aura", "fight", 2, ["job.warden.anchor"], [{ type: "hp_add", valuePerRank: 4 }]),
  "job.warden.lockdown": skill("Lockdown", "fight", 1, ["job.warden.guardian_aura"], [{ type: "def_add", valuePerRank: 2 }]),
  "job.scholar.field_notes": skill("Field Notes", "utility", 3, [], [{ type: "utility_add", valuePerRank: 2 }]),
  "job.scholar.blueprint_reading": skill("Blueprint Reading", "resource", 2, ["job.scholar.field_notes"], [{ type: "recovery_reduce", valuePerRank: 1 }]),
  "job.scholar.pattern_logic": skill("Pattern Logic", "fight", 1, ["job.scholar.field_notes"], [{ type: "atk_add", valuePerRank: 1 }]),
  "job.hunter.tracker": skill("Tracker", "utility", 3, [], [{ type: "utility_add", valuePerRank: 1 }]),
  "job.hunter.clean_shot": skill("Clean Shot", "fight", 2, ["job.hunter.tracker"], [{ type: "atk_add", valuePerRank: 2 }]),
  "job.hunter.field_dressing": skill("Field Dressing", "resource", 2, ["job.hunter.tracker"], [{ type: "food_cost_reduce", valuePerRank: 1 }])
};
