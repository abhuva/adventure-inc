export const RESOURCE_DEFAULTS = {
  coin: 0,
  food: 0,
  wood: 0,
  ore: 0,
  hide: 0,
  planks: 0,
  comfort_goods: 0,
  training_bow: 0
};

export const STARTING_RESOURCES = {
  coin: 10,
  food: 6,
  wood: 8,
  ore: 4,
  hide: 0,
  planks: 0,
  comfort_goods: 0,
  training_bow: 0
};

export function createResourceState(values = {}) {
  return {
    ...RESOURCE_DEFAULTS,
    ...values
  };
}

export function createStartingResourceState() {
  return createResourceState(STARTING_RESOURCES);
}
