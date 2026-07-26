import assert from "node:assert/strict";
import test from "node:test";

import {
  SAVEGAME_SCHEMA_VERSION,
  createSavePayload,
  createSerializableState,
  restoreSavePayload
} from "../src/app/saveLoad.js";
import { createInitialState } from "../src/app/appState.js";

test("createSavePayload writes schema version and serializable state", () => {
  const state = createInitialState();
  state.resources.coin = 42;
  state.events.seen["tutorial.tavern_charter"] = true;
  state.dungeonReplay.timer = { nonSerializable: true };
  state.mapView.dragging = true;
  state.mapView.dragStartX = 12;

  const payload = createSavePayload(state);

  assert.equal(payload.version, SAVEGAME_SCHEMA_VERSION);
  assert.equal(payload.state.resources.coin, 42);
  assert.equal(payload.state.events.seen["tutorial.tavern_charter"], true);
  assert.equal(payload.state.dungeonReplay, undefined);
  assert.equal(payload.state.mapView.dragging, false);
  assert.equal(payload.state.mapView.dragStartX, 0);
});

test("createSerializableState clones nested values without mutating source", () => {
  const state = createInitialState();
  const serializable = createSerializableState(state);

  serializable.resources.coin = 999;
  serializable.roster[0].hp = 1;

  assert.notEqual(state.resources.coin, serializable.resources.coin);
  assert.notEqual(state.roster[0].hp, serializable.roster[0].hp);
});

test("restoreSavePayload rejects unsupported versions and restores supported state", () => {
  const source = createInitialState();
  source.day = 7;
  source.resources.wood = 55;
  const target = createInitialState();

  restoreSavePayload(createSavePayload(source), target);

  assert.equal(target.day, 7);
  assert.equal(target.resources.wood, 55);
  assert.throws(() => restoreSavePayload({ version: 999, state: {} }, target), /Unsupported save payload version/);
});
