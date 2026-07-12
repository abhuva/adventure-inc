# Adventurer And Skill Design

## Purpose

Define the first design direction for adventurer identity, race/job skill sources, multiclassing, and deterministic skill trees.

## Design Goals

- Support many adventurers without making them interchangeable.
- Encourage build experimentation and theory-crafting.
- Keep skill rules deterministic and inspectable.
- Allow combat, travel, resource, crafting, and settlement roles to share one character-development model.
- Keep first trees simple enough to implement and visualize early.

## Adventurer Identity

Each adventurer has three build sources:

- `Race`: inherited baseline identity and racial skill tree.
- `Primary Job`: initial role, such as Guard, Healer, Scout, Smith, or Hunter.
- `Secondary Job`: later multiclass option that adds another job tree.

Example character shape:

```js
{
  id: "ada",
  name: "Ada",
  race: "human",
  primaryJob: "guard",
  secondaryJob: null,
  level: 1,
  skillPoints: 0,
  learnedSkills: {
    "race.human.adaptable": 1,
    "job.guard.steady_stance": 2
  }
}
```

## Races

Races provide identity, baseline tendencies, and racial skills. They should influence builds without hard-locking jobs.

Candidate races:

- `Human`: flexible progression, faster leveling, multiclass support.
- `Dwarf`: armor, ore/smithing synergy, reduced travel fatigue.
- `Elf`: scouting, speed, precision damage.
- `Half-Elf`: hybrid utility, tavern/social bonuses, party support.
- `Demon`: high power with upkeep or recovery tradeoffs.
- `Halfling`: food efficiency, resource efficiency, evasion.
- `Orc`: raw damage and durability, lower utility.
- `Undead`: no food consumption, poor normal healing, special recovery rules.

Race skills can be passive or active, but should usually be broad enough to combine with several jobs.

## Jobs

Jobs define what an adventurer is good at first.

Candidate jobs:

- `Guard`: mitigation, protecting the party, deterministic defense triggers.
- `Healer`: healing, recovery speed, cleansing debuffs.
- `Scout`: travel speed, dungeon preview, traps, utility checks.
- `Smith`: crafting efficiency, gear unlocks, ore economy.
- `Hunter`: food gain, tracking, single-target damage.
- `Scholar`: XP, blueprint research, magic utility.
- `Delver`: general dungeon efficiency, hazard reduction, flexible combat.
- `Cook`: food efficiency, recovery speed, tavern support.

Jobs can include combat and non-combat skills. A character can be built for dungeon fights, base economy, crafting support, travel logistics, or other management roles.

## Multiclassing

Multiclassing unlocks after a later progression point.

Initial rule proposal:

- Unlock `secondaryJob` at level `10`.
- A character can choose one secondary job.
- Secondary job roots become available after selection.
- Secondary job skills may cost more than primary skills, for example `2` skill points per rank.
- Some race skills, especially Human/Half-Elf skills, can reduce multiclass penalties.

Design intent:

- Multiclassing should expand build options.
- It should not make all characters identical.
- It should create deterministic build planning decisions.

## Skill Categories

Every skill has one primary category.

Optional secondary tags can be added later, but the primary category should drive UI grouping and balance discussion.

### Resource

Resource skills affect economy, consumption, gains, unlocks, or crafting.

Examples:

- Reduce party food consumption.
- Increase wood/ore delivery output.
- Improve blueprint research speed.
- Unlock a deterministic crafting recipe.
- Reduce recovery cost at the tavern.

### Fight

Fight skills affect combat resolution.

Examples:

- Add damage.
- Add mitigation.
- Heal under deterministic conditions.
- Apply deterministic debuffs.
- Change targeting or skill timing.

### Utility

Utility skills affect travel, recovery, checks, visibility, and automation quality.

Examples:

- Increase party travel speed.
- Improve heal efficiency.
- Pass trap or lock checks.
- Reveal more map information.
- Reduce dungeon hazard damage.

## Skill Tree Structure

Trees should be simple directed node structures.

Supported shape:

```text
A -> B -> C
     B -> D
     B -> E -> F
```

This allows small branches without complex graph behavior.

Example data shape:

```js
{
  id: "job.guard",
  rootSkillIds: ["job.guard.steady_stance"],
  skills: {
    "job.guard.steady_stance": {
      name: "Steady Stance",
      category: "fight",
      maxRank: 3,
      requires: []
    },
    "job.guard.shield_wall": {
      name: "Shield Wall",
      category: "fight",
      maxRank: 3,
      requires: ["job.guard.steady_stance"]
    },
    "job.guard.intercept": {
      name: "Intercept",
      category: "fight",
      maxRank: 1,
      requires: ["job.guard.shield_wall"]
    },
    "job.guard.rally": {
      name: "Rally",
      category: "utility",
      maxRank: 2,
      requires: ["job.guard.shield_wall"]
    }
  }
}
```

## Unlock Rule

A skill can receive a point if either condition is true:

- It is a root skill.
- At least one connected prerequisite has at least one assigned skill point.

This means a prerequisite does not need to be maxed unless a specific skill explicitly says so later.

Default rule:

```text
canSkill(skill) =
  skill.requires is empty
  OR any required skill has rank >= 1
```

## Skill Effects

Skill effects should be data-driven where practical.

Example:

```js
{
  id: "job.guard.shield_wall",
  name: "Shield Wall",
  category: "fight",
  maxRank: 3,
  requires: ["job.guard.steady_stance"],
  effects: [
    { type: "party_defense_add", valuePerRank: 1 }
  ]
}
```

Effects should be explicit and inspectable. Avoid hidden state changes.

## Determinism Rules

Skills must fit the deterministic game direction.

Avoid:

- Percent chance to trigger.
- Random damage ranges.
- Random crafting outcomes.
- Random loot quality.

Prefer:

- Every `N`th event triggers.
- First/last combat round effects.
- Threshold rules.
- Fixed cooldown timing.
- Deterministic resource deltas.

Examples:

- Bad: `20% chance to block`.
- Good: `Every third incoming hit is reduced by 4`.
- Bad: `Deal 3-8 damage`.
- Good: `Deal 5 damage, +2 if target is marked`.
- Bad: `10% chance to find extra ore`.
- Good: `Every fourth ore delivery adds +1 ore`.

## First Implementation Slice

Recommended first implementation:

1. Add `race`, `primaryJob`, `secondaryJob`, and `learnedSkills` to character data.
2. Create small race/job skill definitions in data or constants.
3. Add skill-point assignment for focused character.
4. Apply a few derived stat/resource effects through `heroStats()` and party/run estimation.
5. Show compact trees in the focused-character sidebar.
6. Keep respec/refund easy during prototype iteration.

Avoid building a large tree editor or final balance pass before the model is proven.

Current prototype status:

- Implemented `race`, `primaryJob`, `secondaryJob`, and `learnedSkills` fields.
- Implemented first race/job skill definitions as constants in `src/app.js`.
- Implemented focused-character skill buttons with the root/connected-node unlock rule.
- Implemented first derived effects for HP, attack, defense, utility, travel time, recovery time, and food cost.
- Not yet implemented: respec/refund, secondary-job selection UI, per-character combat tactics, final balancing, or external data files.
