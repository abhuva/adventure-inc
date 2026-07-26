# Progression Graph System

## Purpose

The progression graph system is the reusable node-based skill/buff/upgrade foundation for `adventure-inc`.

It is intended to support:

- character race/job skill trees
- future building upgrades such as Tavern, Blacksmith, University, etc.
- future dungeon mastery or route-knowledge upgrades
- future generic buff trees where nodes have ranks and deterministic effects

The first implemented consumer is character skill progression in the focused-character sidebar.

## Design Rules

- Graphs are deterministic.
- Nodes have ranks, usually `0..maxRank`.
- A root node is available if it has no prerequisites.
- A non-root node is available if at least one connected prerequisite has rank `>= 1`.
- Prerequisites do not need to be maxed unless a future graph explicitly adds stricter rules.
- Nodes can define `costPerRank`; omitted cost defaults to `1`.
- Effects are data-driven and explicit.
- Graph definitions are static content.
- Graph state is stored separately per owner.

## Module Ownership

Runtime/domain modules:

- `src/game/progression/progressionGraphModel.js`
  - normalizes graph definitions
  - derives graph links from node prerequisites
  - derives simple graph layouts from existing linear skill-tree data
  - computes graph bounds for rendering
- `src/game/progression/progressionGraphRules.js`
  - reads node ranks
  - counts spent points
  - checks root/connected-node unlock rules
  - checks whether a point can be spent
- `src/game/progression/progressionGraphEffects.js`
  - aggregates active effects from ranked nodes
- `src/game/progression/progressionGraphCommands.js`
  - spends and refunds points on generic graph state

UI module:

- `src/ui/progressionGraphView.js`
  - renders a positioned node graph
  - renders SVG links between nodes
  - renders node rank, availability, locked/learned/maxed visual state

Character adapter:

- `src/game/roster/skillProgression.js`
  - adapts current race/job skill definitions to generic graph rules
  - keeps current character-facing reason strings such as `requires connected skill`

## Graph Definition Shape

Graph definitions should be pure data.

```js
{
  id: "building.tavern",
  name: "Tavern",
  type: "buildingUpgradeTree",
  nodes: {
    "extra_bunks": {
      id: "extra_bunks",
      name: "Extra Bunks",
      category: "settlement",
      maxRank: 5,
      requires: [],
      costPerRank: 1,
      icon: "BN",
      x: 0,
      y: 0,
      effects: [
        { type: "tavern_capacity_add", valuePerRank: 1 }
      ]
    },
    "warm_meals": {
      id: "warm_meals",
      name: "Warm Meals",
      category: "resource",
      maxRank: 3,
      requires: ["extra_bunks"],
      icon: "FD",
      x: 0,
      y: 1,
      effects: [
        { type: "daily_food_add", valuePerRank: 1 }
      ]
    }
  }
}
```

Links can be omitted if every link is identical to a prerequisite edge. `normalizeProgressionGraph()` derives links from `requires`.

Explicit links are allowed when the visual graph should show a specific edge set:

```js
links: [
  { from: "extra_bunks", to: "warm_meals" }
]
```

## Graph State Shape

Graph state is owner-specific and separate from the graph definition.

```js
{
  points: {
    "extra_bunks": 2,
    "warm_meals": 1
  },
  availablePoints: 3
}
```

For characters, the current adapter maps:

```js
hero.learnedSkills -> graphState.points
hero.skillPoints -> graphState.availablePoints
```

This preserves existing save data and stat code while using the new reusable graph rules.

## Unlock Rule

The current default unlock rule is:

```text
canSpend(node) =
  availablePoints >= node.costPerRank
  AND rank(node) < maxRank(node)
  AND (
    node.requires is empty
    OR any required node has rank >= 1
  )
```

Generic rule output uses graph vocabulary:

- `missing node`
- `no points`
- `max rank`
- `requires connected node`
- `available`

Character skills translate `no points` to `no skill points` and `requires connected node` to `requires connected skill`.

`spendProgressionPoint()` and `refundProgressionPoint()` mutate `availablePoints` by the node's `costPerRank`, so expensive ranked nodes work consistently across character skills, workshop upgrades, dungeon mastery, and future graph consumers.

## Effect Resolution

`progressionEffects(graph, state)` aggregates effects from every node with rank `> 0`.

For each effect:

```js
{ type: "atk_add", valuePerRank: 2 }
```

At rank `3`, the aggregate contains:

```js
{ atk_add: 6 }
```

The graph system does not decide what an effect means. Consumers interpret only the effect types they understand.

Current character stats still resolve effects through existing `heroStats()` logic and current skill definitions. Future systems can either consume `progressionEffects()` directly or adapt their existing stat path to it.

## UI Contract

`progressionGraphHtml()` renders a compact node map:

- links are SVG lines
- nodes are positioned with `x/y`
- rank is displayed as `current/max`
- state classes include:
  - `progression-node`
  - `available`
  - `locked`
  - `learned`
  - `maxed`

Character skill trees call it from `skillTreesHtml()` in `src/ui/rosterView.js`.

`progressionGraphHtml()` also accepts an optional per-node detail renderer. Character skills use this to attach hover panels that show flavor text, cost, requirements, current availability state, and effect deltas. Generic consumers can omit the hook and keep the compact node-only view.

The current layout uses the existing skill list order and derives simple coordinates from prerequisite depth. Future authored graphs should provide explicit `x/y` coordinates to achieve more intentional layouts like square, pentagram, hourglass, or large skill maps.

## Current Character Skill Integration

Character skills still use:

- `src/game/roster/skills.js`
- `hero.learnedSkills`
- `hero.skillPoints`
- `learnSkill()` in `src/game/roster/rosterCommands.js`
- `heroStats()` for stat effects

The change is that availability is now routed through the generic progression graph backend:

```text
skills.js -> skillProgression.js -> progressionGraphRules.js
```

This keeps existing behavior stable while making the graph rules reusable.

Character race trees can now include non-default skill costs. The current race Resolve chain uses three connected nodes:

- rank 1 spine: 3 ranks, `+1 Resolve` per rank, cost `1`
- rank 2 spine: 5 ranks, `+2 Resolve` per rank, cost `2`
- rank 3 spine: 5 ranks, `+7 Resolve` per rank, cost `5`

## Extending To Buildings

Recommended building upgrade state:

```js
state.buildingProgression = {
  tavern: {
    points: {},
    availablePoints: 0
  }
}
```

Recommended flow:

1. Define `building.tavern` graph data.
2. Add an owner-specific command adapter for spending upgrade points or resources.
3. Use `canSpendProgressionPoint()` for availability.
4. Use `spendProgressionPoint()` for mutation.
5. Use `progressionEffects()` to aggregate building effects.
6. Let tavern/population systems consume only effect types they understand.

## Extending To Dungeons

Dungeon progression can use the same shape:

```js
state.dungeonProgression = {
  cellar: {
    points: {},
    availablePoints: 0
  }
}
```

Possible dungeon effects:

- reduce travel time to a dungeon
- reveal a fixed node ahead of time
- reduce hazard damage
- unlock deeper routes
- improve deterministic repeat automation
- increase deterministic shard XP or resource output

Avoid random drop or random reward modifiers. Use fixed counters or deterministic multipliers.

## Non-Goals For Current Slice

- No respec UI yet.
- No secondary-job selection UI yet.
- No building or dungeon progression consumer yet.
- No final authored large graph layout yet.
- No graph editor.
- No external JSON graph loading yet.

## Validation

Core tests live in `tests/progressionGraph.test.js`.

Current validation commands:

```powershell
npm run check:js
npm test
```
