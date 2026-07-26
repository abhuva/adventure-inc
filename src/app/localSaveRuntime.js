import {
  createSavePayload,
  restoreSavePayload
} from "./saveLoad.js";

export const LOCAL_SAVE_KEY = "adventure-inc:save:v1";
export const DEFAULT_AUTOSAVE_DELAY_MS = 250;

export function createLocalSaveRuntime({
  state,
  storage,
  key = LOCAL_SAVE_KEY,
  delayMs = DEFAULT_AUTOSAVE_DELAY_MS,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
  createPayload = createSavePayload,
  restorePayload = restoreSavePayload
}) {
  let pendingTimer = null;

  function available() {
    return Boolean(storage && typeof storage.getItem === "function" && typeof storage.setItem === "function");
  }

  function load() {
    if (!available()) return { ok: false, reason: "unavailable" };
    const raw = storage.getItem(key);
    if (!raw) return { ok: false, reason: "empty" };
    const payload = JSON.parse(raw);
    restorePayload(payload, state);
    return { ok: true, savedAt: payload.savedAt || null };
  }

  function saveNow() {
    if (!available()) return { ok: false, reason: "unavailable" };
    const payload = createPayload(state);
    storage.setItem(key, JSON.stringify(payload));
    return { ok: true, savedAt: payload.savedAt };
  }

  function scheduleSave() {
    if (!available()) return { ok: false, reason: "unavailable" };
    if (pendingTimer !== null) {
      clearTimeoutFn(pendingTimer);
    }
    pendingTimer = setTimeoutFn(() => {
      pendingTimer = null;
      saveNow();
    }, delayMs);
    return { ok: true, pending: true };
  }

  function reset() {
    if (!available()) return { ok: false, reason: "unavailable" };
    if (pendingTimer !== null) {
      clearTimeoutFn(pendingTimer);
      pendingTimer = null;
    }
    storage.removeItem(key);
    return { ok: true };
  }

  return {
    key,
    load,
    reset,
    saveNow,
    scheduleSave
  };
}
