import { parseCounters } from "./backup"
import type { Counter } from "./counter"

const STORAGE_KEY = "counters"

export function loadCounters(): readonly Counter[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) {
    return []
  }
  const counters = parseCounters(stored)
  if (counters === null) {
    throw new Error(`localStorage "${STORAGE_KEY}" does not hold valid counters`)
  }
  return counters
}

export function saveCounters(counters: readonly Counter[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counters))
}

export function requestPersistentStorage(): void {
  void navigator.storage.persist()
}
