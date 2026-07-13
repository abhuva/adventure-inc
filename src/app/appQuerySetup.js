import { createAppQueries } from "./appQueries.js";
import { createAppSelectionFacade } from "./appSelectionFacade.js";
import { createTempleAppQueries } from "./templeAppQueries.js";

export function createAppQuerySetup({
  state,
  el,
  dataContext,
  colors,
  stones,
  shards,
  inventorySlots,
  skills,
  skillTrees
}) {
  const templeQueries = createTempleAppQueries({
    state,
    colors,
    stones,
    shards,
    inventorySlots
  });
  const appQueries = createAppQueries({
    state,
    el,
    getPoiData: () => dataContext.getPoiData(),
    templeQueries
  });
  const appSelection = createAppSelectionFacade({
    appQueries,
    skills,
    skillTrees
  });

  return {
    appQueries,
    appSelection,
    templeQueries
  };
}
