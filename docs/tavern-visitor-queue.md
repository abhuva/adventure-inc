# Tavern Visitor Queue

## Intent

The tavern should not feel like a static list of recruits. Adventurers become eligible through fame, then move through deterministic visit/away cycles. This creates empty seats early, makes fame meaningful, and keeps recruitment inspectable without introducing randomness.

## Data Ownership

Visitor definitions live in `src/game/roster/adventurerData.js`.

Each visitor owns:

- `availabilityTier`: broad fame band.
- `fameThreshold`: exact fame required before the visitor can appear.
- `stayDays`: days the visitor remains in the tavern once seated. Runtime clamps this to a minimum of `5` days.
- `awayDays`: days the visitor stays away after leaving or being turned away.

Current tier sizes:

- tier 0: first 2 visitors, fame threshold `0`.
- tier 1: next 5 visitors, threshold band starting at `100`.
- tier 2: next 5 visitors, threshold band starting at `500`.
- tier 3: next 10 visitors, threshold band starting at `1000`.
- tier 4: remaining current visitors, threshold band starting at `2000`.

The current roster data has 48 recruitable visitors, so tier 4 contains the remaining 26 prototype visitors.

## Runtime State

Runtime visitor cycle state lives in `state.tavernVisitors`:

```js
{
  refreshedDay: 12,
  visitors: {
    mira: { state: "present", nextChangeDay: 14 },
    sana: { state: "away", nextChangeDay: 28 }
  }
}
```

The number of visible visitor slots lives in `state.tavern.visitorSeats`, defaulting to `3`.

This is separate from `state.tavern.capacity`. Visitor seats decide who is waiting in the tavern. Tavern capacity still decides whether the roster can hire another adventurer.

## Daily Refresh Rules

Runtime owner: `src/game/roster/visitorQueue.js`.

On the first render of a day, or on day rollover:

1. Remove recruited visitors from visitor-cycle state.
2. Present visitors whose `nextChangeDay` has arrived leave and become `away`.
3. Count still-present visitors against `state.tavern.visitorSeats`.
4. Build a candidate list from unrecruited visitors who:
   - meet the current fame threshold,
   - are not already present,
   - are not still away.
5. Seat the first candidates up to the remaining open seats.
6. Eligible candidates who do not fit are turned away and receive a fresh away timer.

The candidate order is the fixed visitor definition order. No random selection is used.

## Recruitment

`recruitVisitor()` rejects visitors who are not currently present in the tavern. A successful recruit pays the visitor cost, creates the hero, appends them to the roster, and removes their visitor-cycle state so they no longer reappear.

## UI Contract

The Tavern tab shows only visitors currently present today. It can show fewer than three cards when fame is low, visitors are away, or seats are empty after recruitment.

Visitor cards display the visitor's tier, fame threshold, and how many days remain before the visitor leaves. Away timers are intentionally not shown yet; the player-facing first slice is simply "who is waiting today."

The old Tavern-only `advance day` button was removed. Time advancement remains on the Map controls and auto-time system.
