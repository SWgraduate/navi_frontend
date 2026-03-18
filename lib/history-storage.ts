"use client";

const HISTORY_PIN_KEY = "navi_history_pins";

type PinMap = Record<string, boolean>;

function safeParse(json: string | null): PinMap {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as PinMap;
    }
    return {};
  } catch {
    return {};
  }
}

export function getPinnedMap(): PinMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(HISTORY_PIN_KEY);
  return safeParse(raw);
}

export function setPinnedMap(map: PinMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_PIN_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / serialization errors
  }
}

export function togglePinned(id: string, current: boolean): PinMap {
  const map = { ...getPinnedMap() };
  if (current) {
    delete map[id];
  } else {
    map[id] = true;
  }
  setPinnedMap(map);
  return map;
}

