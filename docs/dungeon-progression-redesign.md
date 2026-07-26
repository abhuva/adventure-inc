# Dungeon Progression Redesign

## Purpose

Document the first implemented slice of deeper dungeon progression:

- dungeon-first onboarding
- hidden world locations at campaign start
- route-based and click-planned dungeon paths
- persistent dungeon conquest graph state
- node modifiers, relief nodes, minibosses, and main bosses
- per-hero Resolve
- dungeon mastery XP/graph progression
- later dungeon unlocks through repeated clears

This keeps dungeons meaningful beyond a single linear combat preview while preserving deterministic simulation.

## Starting Flow

The game now starts from the founder fantasy:

1. The tavern exists, but it is barely established.
2. The only starting adventurer is the founder in party `Alpha`.
3. The first visible operation is Rat Cellar.
4. The player sends the founder from the Map.
5. The Dungeon tab explains the run result, route, Resolve, strategy, replay, and combat log.
6. Recruitment and Roster/party management come after the first dungeon loop.
7. Population/Workshop comes after that.
8. Temple onboarding is delayed until the second dungeon reveal.

Auto-time is on by default. Blocking encounters may pause it, then resume the previous running state when the encounter queue closes.

## World Visibility

The source POI data remains complete in `assets/data/poi.json`. Visibility is state-driven:

- visible at start: Tavern, Rat Cellar
- revealed from Population introduction: North Woodlot, Surface Ore Cut
- revealed after 50 successful Rat Cellar clears or Rat Cellar boss conquest: Old Copper Mine
- revealed after clearing all three Old Copper Mine branch bosses: Old Barracks

The state owner is `state.progression.unlockedLocations`. Query selectors filter map locations, work sites, and dungeon choices before UI adapters see them.

## Dungeon Routes And Planned Paths

Dungeons can now define named routes:

```json
{
  "routes": [
    { "id": "stores", "name": "Stores Sweep", "nodeIds": ["entry", "rats", "cache"] },
    { "id": "deep_nest", "name": "Deep Nest Push", "default": true, "nodeIds": ["entry", "rats", "cache", "guard", "boss"] }
  ]
}
```

The simulator still supports old linear `nodes` arrays. If no routes are present, it creates a compatible main route from node order.

The Dungeon tab renders authored routes as a compact clickable graph. Clicking nodes builds an explicit planned path for the current dungeon. Clicking a node that is already in the planned path truncates the plan before that node, effectively removing that node and anything after it. Legal paths must start from the dungeon start node and follow authored `edges`.

The simulator accepts explicit planned paths through stop values shaped like `path:<nodeId>,<nodeId>`. The stop/route select remains available as a compact Info-tab control and compatibility fallback; target-node options use values shaped like `node:<nodeId>`.

When multiple authored routes can reach the same target through legacy `node:<nodeId>` targeting, `src/game/dungeon/dungeonGraphModel.js` chooses the earliest matching route in source order, then the shortest path, then stable route ID. Graph clicks use `plannedPathAfterNodeClick()` instead, which finds the shortest legal path to a clicked node or extends/truncates the current plan.

Map `run` uses `all`, which resolves to the dungeon's default route.

## Conquest State

Dungeon graph progress is persistent and stored under `state.progression.dungeonConquest[dungeonId]`:

```js
{
  clearedNodes: {},
  unlockedNodes: {},
  disabledModifiers: {},
  nodeCostAdjustments: {},
  selectedNodeId: null,
  plannedNodeIds: []
}
```

Simulation reads this state, but does not mutate it. Completion mutates conquest state after a scheduled operation returns. This preserves the prototype rule that previews are inspectable and deterministic, while rewards/unlocks happen only when time has actually passed.

Supported node clear effects:

- `disable_modifier`: disables a dungeon modifier such as a boss/enemy buff.
- `unlock_node`: makes a locked node available.
- `unlock_location`: reveals a map location such as the next dungeon.
- `unlock_location_when_cleared`: reveals a map location only when every listed node has already been cleared in the same dungeon conquest state.
- `unlock_feature`: stores a lightweight feature flag under `state.progression.unlockedFeatures`.
- `node_resolve_cost_add`: changes future Resolve cost for a node; negative values create repeatable relief/shortcut progress.

## Modifiers And Relief

Dungeons can define `modifiers` that affect target nodes until disabled:

```json
{
  "id": "matron_frenzy",
  "sourceNodeId": "scent_warden",
  "targetNodeIds": ["guard", "boss"],
  "effects": [
    { "type": "enemy_atk_add", "value": 2 },
    { "type": "resolve_cost_add", "value": 1 }
  ]
}
```

Current supported modifier effects:

- `enemy_atk_add`
- `enemy_hp_add`
- `hazard_damage_add`
- `utility_required_add`
- `resolve_cost_add`

Relief nodes use the same completion effect system. For example, Rat Cellar's Larder Shortcut repeatedly reduces future Resolve cost on deeper nodes, making it a slowdown/pressure-release objective rather than a one-time treasure box.

## Resolve

Resolve is the dungeon pressure meter. It is individual, not just a party total.

Each hero has a derived `resolve` stat from `heroStats()`:

- base `hero.base.resolve`
- a small level contribution
- future skill effects can add `resolve_add`

Each dungeon node has `resolveCost`. After the node resolves, every living, non-withdrawn hero pays that cost. A hero whose Resolve reaches `0` withdraws and no longer contributes to deeper nodes. If no hero remains willing to continue before the next node, the run returns with rewards from already completed nodes.

This means a party can start with several heroes but finish a route with fewer active members.

## Node Types

Current supported node behavior:

- `hazard`: deterministic damage
- `check`: deterministic utility gate
- `combat`: deterministic combat timeline
- `relief`: deterministic objective node that can reduce future pressure
- `resource`: deterministic objective node for repeatable dungeon resources
- `modifier`: deterministic objective node for graph state changes
- `miniboss`: deterministic combat node, usually one-time, often disables a modifier or unlocks access
- `boss`: deterministic combat timeline with one-time boss semantics when `uniqueBoss` is true

Boss nodes are treated as combat by the resolver. A unique boss marks `state.progression.uniqueBosses[dungeonId:nodeId]` after a successful route containing that node. Later simulations can traverse that node as already cleared and do not award its one-time reward again.

One-time nodes are marked as cleared when they are reached by a completed operation, even if a later node in the same planned path fails. This lets partial routes still make conquest progress.

## Rat Cellar First Slice

Rat Cellar is the first authored conquest dungeon:

- `entry` branches to Rat Pack or Smuggler Crawl.
- `larder_shortcut` is a relief node that lowers future Resolve pressure for deeper nodes.
- `scent_warden` is a miniboss that disables `matron_frenzy`, unlocks Queen Tunnel, and introduces dungeon node modifier functionality.
- `matron_frenzy` buffs Nest Guard and Brood Matron until Scent Warden is cleared.
- `boss` unlocks Old Copper Mine through a node clear effect, while the older 50-clear Rat Cellar chain remains as a fallback progression gate.

## Old Copper Mine Slice

Old Copper Mine is the second authored conquest dungeon:

- It starts at `mine_mouth` and splits into three branches.
- Each branch is 7 nodes including the shared start and ends in a unique boss.
- Branch bosses are `boss_foreman`, `boss_sump`, and `boss_ward`.
- The sum of all Mine node Resolve costs is `79`, roughly one fifth of the original 392-point draft.
- The tree intentionally contains only one utility check (`mine_mouth`) and one hazard (`drowned_gallery`); the remaining route pressure is combat, plus the ward branch relief node.
- Each boss has a first-clear reward package. Because the bosses are `uniqueBoss` nodes, later traversal skips the one-time reward unless a node explicitly opts into repeat rewards.
- Each boss carries the same `unlock_location_when_cleared` effect. Old Barracks is revealed only after all three Mine bosses are cleared.

## Dungeon Mastery

Dungeon rewards can include `dungeonXp`. It is not a global inventory resource and is ignored by generic reward application. It feeds `state.progression.dungeonMastery[dungeonId]`.

Each dungeon can define a mastery progression graph using the existing generic progression graph rules:

```json
{
  "mastery": {
    "xpPerPoint": 12,
    "nodes": {
      "mapped_stores": {
        "name": "Mapped Stores",
        "requires": [],
        "effects": [{ "type": "route_hint", "valuePerRank": 1 }]
      }
    }
  }
}
```

For this first slice, points auto-spend deterministically into available graph nodes because there is no dedicated mastery UI yet. Blueprint hint effects immediately reveal the referenced blueprint. Later work can replace auto-spend with a proper Dungeon Mastery panel using the same graph state.

## Ownership

- `src/game/progression/worldProgression.js`: world visibility, dungeon clear counters, location unlock gates, dungeon conquest-state defaults.
- `src/game/dungeon/dungeonGraphModel.js`: route normalization, explicit planned paths, graph links/layout, node lookup, effective Resolve costs, active modifiers, unique boss detection.
- `src/game/dungeon/dungeonConquest.js`: completion-side node clear effects, persistent conquest-state mutation, and conquest log messages.
- `src/game/dungeon/dungeonMastery.js`: dungeon mastery graph normalization, XP-to-point conversion, deterministic point spending, mastery effects.
- `src/game/dungeon/dungeonRunSimulator.js`: planned path simulation, effective node simulation, Resolve withdrawal, partial rewards, one-time node traversal.
- `src/app/dungeonCommandHandlers.js`: graph node click planning, completion-side conquest/mastery awards, clear-counter updates, location unlock logs, second-dungeon Temple trigger.
- `src/data/poiSelectors.js`: visible POI/work-site/dungeon filtering.
- `src/game/roster/heroStats.js`: derived per-hero Resolve.
- `src/ui/dungeonView.js`: clickable dungeon route graph, Resolve costs, Resolve summary, and route name in the estimate/replay UI.

## Future Work

- Add a dedicated Dungeon Mastery UI using `src/ui/progressionGraphView.js`.
- Let mastery nodes unlock route branches directly instead of only auto-spending hints.
- Add a richer route-planning command bar once branches need named saved plans, waypoints, or per-node party setup.
- Let skills and gear modify Resolve cost, withdrawal behavior, or node-specific confidence.
- Add per-character action plans so routes ask different party builds to solve different pressure patterns.
