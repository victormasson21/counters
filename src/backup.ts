import { isCounter, isGoalDays, type Counter, type Precision } from "./counter"
import { toLocalDate } from "./datetime"
import { paletteAt, type PaletteId } from "./palettes"

const JSON_INDENT = 2

const LEGACY_PRECISION = {
  days: "days",
  seconds: "seconds",
  centiseconds: "centis",
} as const satisfies Record<string, Precision>

type LegacyUnit = keyof typeof LEGACY_PRECISION

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null

const isLegacyUnit = (value: unknown): value is LegacyUnit =>
  typeof value === "string" && Object.hasOwn(LEGACY_PRECISION, value)

function fromLegacy(value: Record<string, unknown>, palette: PaletteId): Counter | null {
  const { id, title, start, unit, limitDays } = value
  const goalDays = limitDays === 0 ? null : limitDays
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof start !== "number" ||
    !Number.isFinite(start) ||
    !isLegacyUnit(unit) ||
    !isGoalDays(goalDays)
  ) {
    return null
  }
  return { id, title, startAt: new Date(start).toISOString(), precision: LEGACY_PRECISION[unit], goalDays, palette }
}

function toCounter(value: unknown, index: number): Counter | null {
  if (!isRecord(value)) {
    return null
  }
  const fallbackPalette = paletteAt(index)
  if ("unit" in value) {
    return fromLegacy(value, fallbackPalette)
  }
  const candidate = { ...value, palette: value.palette ?? fallbackPalette }
  if (!isCounter(candidate)) {
    return null
  }
  const { id, title, startAt, precision, goalDays, palette } = candidate
  return { id, title, startAt, precision, goalDays, palette }
}

export function parseCounters(json: string): readonly Counter[] | null {
  try {
    const value: unknown = JSON.parse(json)
    if (!Array.isArray(value)) {
      return null
    }
    const counters = value.map(toCounter)
    return counters.every((counter) => counter !== null) ? counters : null
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null
    }
    throw error
  }
}

export function exportFileName(now: number): string {
  return `counters-${toLocalDate(now)}.json`
}

export function downloadCounters(counters: readonly Counter[]): void {
  const blob = new Blob([JSON.stringify(counters, null, JSON_INDENT)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = exportFileName(Date.now())
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}
