# Workforce And Production Workshop System

## Intent

The settlement workforce is a direct early-game management loop. The player starts with a minimum of three workers, assigns them to jobs, and hires additional workers with coin. Housing and happiness are intentionally ignored for now so Population is clear and low-friction.

## Workforce Model

Runtime owner: `src/game/settlement/workforceModel.js`.

Core state:

- `state.settlement.availableWorkers`: current hired workforce, never below `3`.
- `state.settlement.hiredWorkers`: persisted hired worker count, never below `3`.
- `state.settlement.wagePerWorker`: fixed compatibility field, currently always `1`.
- `state.settlement.productionMultiplier`: `1` when upkeep is paid, `0.5` when upkeep is underpaid.
- `state.tavern.jobs`: assigned workers by job.

Current jobs:

- `wood`: feeds existing deterministic wood work-site cycles.
- `ore`: feeds existing deterministic ore work-site cycles.
- `workshop`: mans workshop production stations in slot order.
- `research`: contributes worker-hours to workshop research.

Unassigned workers are the difference between hired workers and assigned workers. Assignment first consumes unassigned workers; if none are free, the legacy one-click assignment helper may rebalance from the largest other job. The explicit per-job `+` control only uses unassigned workers, while `-` releases assigned workers back to the unassigned pool.

Current workforce target:

```text
availableWorkers = max(3, hiredWorkers)
```

## Hiring And Upkeep

The Population tab exposes a single `hire worker` action. It spends coin and adds `+1` worker.

Current cost curve:

```text
nextWorkerCost = floor(10 * 1.55 ^ (hiredWorkers - 3)) coin
```

Runtime owner: `src/game/settlement/happinessRuntime.js`.

Daily upkeep is fixed:

- `1 coin` per worker per day.

If the settlement can pay the full upkeep, worker production runs at `x1`. If coin is missing, available coin is paid, the workforce remains intact, and all worker production runs at `x0.5` until the next fully paid daily upkeep. Comfort goods, happiness changes, and housing capacity are not part of the current worker calculation.

The production multiplier is consumed by:

- `src/game/time/gameClock.js` for work-site worker-hour cycles.
- `src/game/workshop/workshopRuntime.js` for workshop production and research progress.

## Production Workshop

Runtime owner: `src/game/workshop/workshopRuntime.js`.

The workshop has production stations. Each station selects one recipe and stores independent progress. One workshop worker mans one station. Stations are manned from first to last, so with four stations and two workshop workers only stations one and two advance.

Workshop workers can exceed the station count. The first workers activate stations; overflow workers become assistants and increase all active station speed by `+5%` each. This is intentionally fractional: slot progress is stored as a number and can accumulate values such as `1.05` work. Extra stations come from workshop upgrades such as `Worker Benches`; assigning more workers does not create more stations.

Each station has a player-selected target recipe. If `auto inputs` is enabled, the station may temporarily switch its active recipe to a known prerequisite recipe when the target cannot be crafted. For example, a station targeting `simpleFurniture` will craft `planks` while planks are missing, then return to `simpleFurniture` once enough planks exist. The resolver is generic and walks missing-input chains through known recipe outputs. If a missing input has no known producer, the station pauses on the current active recipe and reports missing inputs. Progress resets when the active recipe changes.

Current recipes:

- `rations`: input none, output `2 food`, renewable dungeon provisions.
- `planks`: input `3 wood`, output `1 planks`, short processed-material craft.
- `simpleFurniture`: input `2 planks`, output `10 comfort_goods`, current sink/source for future settlement comfort work.
- `trainingBow`: input `20 planks` and `4 hide`, output `1 training_bow`, first slow combat-item stock.

Food and coin are not passive tavern income. Food is produced through `rations` workshop stations or earned from fixed dungeon rewards. Coin comes from fixed dungeon rewards and direct resource rewards, then is spent on workers/upkeep and other costs.

Inputs are consumed only when a craft completes. If a slot reaches completion but lacks inputs, it pauses at the completion threshold and logs a blocked workshop event.

## Recipe Experience

Runtime owner: `src/game/workshop/workshopRecipeProgression.js`.

Each crafted recipe gains deterministic recipe XP in `state.workshop.recipeXp[recipeId]`. Recipe level uses square XP thresholds:

```text
level = 1 + floor(sqrt(recipeXp))
```

Recipe definitions own their level unlocks. Unlocks can reduce input costs, increase output, or reduce worker-hours. `effectiveWorkshopRecipe()` applies the unlocked bonuses and is consumed by both `workshopRuntime.js` and the Population UI, so the displayed hover details match actual crafting rules.

Current item unlock themes:

- `rations`: extra food output and faster work.
- `planks`: reduced wood input, extra plank output, faster work.
- `simpleFurniture`: extra comfort output, reduced plank input, faster work.
- `trainingBow`: reduced hide input, faster work, extra bow output.

## Workshop Research And Progression

Research workers fill `state.workshop.researchProgress`. Every `24` research worker-hours grants one workshop upgrade point.

Workshop upgrades use the generic progression graph system:

- Graph definition: `src/game/workshop/workshopData.js`.
- Commands: `src/game/workshop/workshopCommands.js`.
- UI renderer: generic `src/ui/progressionGraphView.js` embedded in `src/ui/populationView.js`.

Current upgrade nodes:

- `Sharper Saws`: workshop production speed.
- `Worker Benches`: additional production stations.
- `Comfort Patterns`: stronger comfort-good output.
- `Research Desk`: research speed.

## UI Contract

The Population tab uses second-order local tabs:

- `population`: worker hiring, job assignment, and labor/upkeep notes.
- `workshop`: recipe stations, product selectors, manned/unmanned state, progress bars, recipe level labels, and recipe XP hover panels.
- `upgrades`: research progress and the workshop upgrade graph.

The Population screen also has a persistent right side panel that remains visible across all three local tabs. It displays gathered settlement goods:

- food
- wood
- ore
- hide
- planks
- comfort
- bows

Population controls include:

- `hire worker` button.
- Settlement labor notes showing next worker cost, daily upkeep, and current production multiplier.
- Population job table with an unassigned row and a hired-workers/upkeep row.
- Per-job `-` and `+` assignment controls in the jobs table.

The global title status line stays compact and shows only high-level state such as coin and fame. Gathered goods are intentionally scoped to the Population side panel to reduce top-bar clutter.

## Verification

Focused tests:

```powershell
node --test tests\workforceModel.test.js tests\happinessRuntime.test.js tests\workshopRuntime.test.js
```

Full checks:

```powershell
npm run check:js
npm test
```
