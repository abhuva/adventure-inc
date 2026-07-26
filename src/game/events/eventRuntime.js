export function createInitialEventState() {
  return {
    seen: {},
    queue: [],
    activeId: null,
    pausedTimeRunning: false
  };
}

export function ensureEventState(state) {
  state.events = {
    ...createInitialEventState(),
    ...(state.events || {}),
    seen: { ...(state.events?.seen || {}) },
    queue: Array.isArray(state.events?.queue) ? [...state.events.queue] : []
  };
  if (state.events.activeId && state.events.seen[state.events.activeId]) {
    state.events.activeId = null;
  }
  state.events.queue = state.events.queue.filter((eventId) => !state.events.seen[eventId]);
  return state.events;
}

export function eventDefinitionById(eventDefinitions, eventId) {
  return eventDefinitions.find((definition) => definition.id === eventId) || null;
}

export function activeEventDefinition(eventState, eventDefinitions) {
  if (!eventState?.activeId) return null;
  return eventDefinitionById(eventDefinitions, eventState.activeId);
}

export function isBlockingEvent(definition) {
  return definition?.presentation?.level === "blocking";
}

export function triggerEvent(eventState, eventDefinitions, trigger) {
  const queuedIds = [];
  const matchingDefinitions = eventDefinitions
    .filter((definition) => definition.trigger === trigger)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  matchingDefinitions.forEach((definition) => {
    if (!canQueueEvent(eventState, definition)) return;
    eventState.queue.push(definition.id);
    queuedIds.push(definition.id);
  });

  const openedId = openNextQueuedEvent(eventState, eventDefinitions);
  return {
    activeId: eventState.activeId,
    openedId,
    openedBlocking: isBlockingEvent(eventDefinitionById(eventDefinitions, openedId)),
    queuedIds
  };
}

export function closeActiveEvent(eventState, eventDefinitions) {
  const closedId = eventState.activeId;
  if (!closedId) {
    return { closedId: null, activeId: null, openedId: null };
  }
  eventState.seen[closedId] = true;
  eventState.activeId = null;
  const openedId = openNextQueuedEvent(eventState, eventDefinitions);
  return {
    closedId,
    activeId: eventState.activeId,
    openedId,
    openedBlocking: isBlockingEvent(eventDefinitionById(eventDefinitions, openedId))
  };
}

function canQueueEvent(eventState, definition) {
  if (!definition) return false;
  if (definition.once !== false && eventState.seen[definition.id]) return false;
  if (eventState.activeId === definition.id) return false;
  return !eventState.queue.includes(definition.id);
}

function openNextQueuedEvent(eventState, eventDefinitions) {
  if (eventState.activeId) return null;
  const nextId = eventState.queue.shift();
  if (!nextId) return null;
  if (!eventDefinitionById(eventDefinitions, nextId)) {
    return openNextQueuedEvent(eventState, eventDefinitions);
  }
  eventState.activeId = nextId;
  return nextId;
}
