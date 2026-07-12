# Temple Shard Design

## Purpose

Define the first deterministic shard-equipping system for the Temple tab.

The system is inspired by limited socket/line buff planning: the player cannot enable every shard interaction at once, so they build temporary setups for party power, loot, resource production, recovery, or later systems.

## Design Goals

- Create a compact build puzzle outside character skill trees.
- Support burst setups where the player optimizes one goal, then switches setup for another.
- Keep all drops, upgrades, and effects deterministic.
- Let dungeon automation feed long-term shard progression.
- Keep the first slice small enough to inspect directly in the UI.

## Temple Board

The Temple is made of selectable Ritual Stones. Each stone is a carved layout with its own sockets, links, line capacity, saved shard placement, saved inventory positions, and stone-level modifier.

Only the currently selected stone applies effects.

Global state:

- shard ownership
- shard XP
- dungeon shard counters

Per-stone state:

- socket placements
- active links
- `2x10` inventory slot positions

The first prototype starts with:

- multiple stone layouts
- `1-2` active connection lines depending on the stone
- `1` shard per socket.
- No duplicate-equipping the same shard in multiple sockets.
- Drag-and-drop shard placement.
- Clickable board lines for enabling/disabling the active connection.
- A `2x10` free-form shard inventory grid.

Current first colors:

- `Ember`
- `Verdant`
- `Azure`

Later progression can add more colors, more sockets, more lines, color-specific restrictions, or alternate board layouts.

## Ritual Stones

Current prototype stones:

- `Triangle Stone`: 3 sockets, 1 active line, fight color effects +10%.
- `Square Stone`: 4 sockets, 2 active lines, Verdant and Azure effects +15%.
- `Hourglass Stone`: 5 sockets, 1 active line, loot color effects +20% and fight color effects -10%.

Stone modifiers apply after shard XP scaling.

Current first modifier families:

- `color_power`: multiplies effects tied to one active color.
- `effect_family_power`: multiplies effects by broad family.

Current effect families:

- `fight`: `party_*` effects and `recovery_reduce`.
- `loot`: `loot_*` effects.
- `utility`: fallback family for future effects.

## Shard Slot Rules

Each shard defines:

- `equipColors`: colors where the shard can be placed.
- `affectedBy`: colors that can influence the shard.
- `colorEffects`: effects keyed by color.

Influence colors are:

- The socket color the shard is placed into.
- The other endpoint of the active line if the socket is connected.

Effects are only active when their color is active for the shard. There are no unconditional shard effects.

Example:

```js
{
  equipColors: ["ember", "verdant"],
  affectedBy: ["ember", "verdant", "azure"],
  colorEffects: {
    ember: [{ type: "party_atk", min: 1, max: 3 }],
    verdant: [{ type: "loot_hide", min: 1, max: 3 }],
    azure: [{ type: "recovery_reduce", min: 1, max: 2 }]
  }
}
```

If this shard is placed in `Ember` and the active line connects `Ember -> Azure`, the shard receives `Ember` and `Azure` influence, so only the `party_atk` and `recovery_reduce` effects apply. If the active line connects `Verdant -> Azure`, the shard only receives `Ember` influence because its socket is not on that line, so only the `party_atk` effect applies.

## UI Interaction

The Temple UI should behave like a board, not a form.

- Shards are draggable tokens.
- Dropping a found shard onto a valid color socket equips it there.
- Dragging an equipped shard back to the inventory unequips it.
- Dropping a shard onto another valid socket moves it; it cannot remain equipped twice.
- Stone selector buttons switch the active Ritual Stone.
- Switching stones restores that stone's saved socket placements, active links, and inventory slots.
- All possible lines can be visible.
- Clicking an inactive line enables it.
- Clicking the active line disables it.
- If a stone's active-line capacity is full, enabling a new line removes the oldest active line.
- The shard inventory lives as a compact `2x10` grid at the bottom of the Temple board.
- Inventory slots are explicit positions; dragging a shard between inventory slots moves or swaps it.
- The side panel remains the selected-shard information surface.

## Shard Progression

Shards are deterministic progression items.

- First find unlocks the shard.
- Duplicate finds add shard XP.
- Each shard has `xpToMax`.
- Effects interpolate from `min` to `max` based on shard XP.
- Excess XP can be retained for future systems, but the first slice caps effect value at `xpToMax`.

This gives designers tuning levers:

- Drop interval.
- Drop source.
- XP required for max effect.
- Min/max effect range.
- Future skill modifiers for drop amount or interval.

## Dungeon Sources

Shards are tied to dungeon sources.

First slice source types:

- `visit`: increments whenever a dungeon operation completes.
- `boss`: increments only when the run fully succeeds.

Current prototype drop rule:

```text
if source counter % dropEvery == 0:
  award 1 shard XP
```

There is no random roll.

Design intent:

- Common shards can come from repeated dungeon visits.
- Stronger shards should usually be tied to boss clears.
- Later bosses can carry unique shards, set shards, or board-expansion shards.

## Effect Categories

First implemented effect types:

- `party_atk`
- `party_def`
- `party_utility`
- `recovery_reduce`
- `loot_hide`
- `loot_ore`
- `loot_wood`
- `loot_coin`

Future effect targets:

- Party-specific bonuses.
- Dungeon-family bonuses.
- Crafting output.
- Worker output.
- Shard drop interval reduction.
- Shard XP amount increase.
- Building unlock modifiers.
- Temple-board expansion rules.

## Determinism Rules

Avoid:

- Random shard drops.
- Random shard stats.
- Random effect ranges.
- Random upgrade outcomes.

Prefer:

- Every `N` visits.
- Every `N` boss clears.
- Fixed XP increments.
- Fixed min/max interpolation.
- Explicit board constraints.

## Current Prototype Status

- `Temple` top-level tab exists.
- Triangle, Square, and Hourglass stones are implemented.
- Per-stone saved layouts are implemented.
- Only the selected stone applies shard effects.
- Stone modifiers are implemented for color power and effect-family power.
- Board-style drag/drop shard placement is implemented.
- Clickable SVG line toggles are implemented.
- Free-form `2x10` inventory slot movement is implemented.
- Shard inventory, socket assignment, selected-shard detail, and active buff readout are implemented.
- Dungeon completion increments deterministic visit/boss counters.
- Duplicate shards increase shard XP.
- Active shard buffs currently affect party stats and extra loot.
- First shard definitions live in `src/app.js`; moving them to data files is a likely later step after the shape stabilizes.
