import { isPaletteId, type PaletteId } from "./palettes"

export const PRECISIONS = ["days", "hours", "seconds", "centis"] as const
export type Precision = (typeof PRECISIONS)[number]

export const MAX_GOAL_DAYS = 90
export const MS_PER_DAY = 86_400_000

export type Counter = {
  readonly id: string
  readonly title: string
  readonly startAt: string
  readonly precision: Precision
  readonly goalDays: number | null
  readonly palette: PaletteId
}

export type GoalProgress = {
  readonly fraction: number
  readonly days: number
  readonly over: boolean
}

export function isPrecision(value: unknown): value is Precision {
  return PRECISIONS.some((precision) => precision === value)
}

export function isGoalDays(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= MAX_GOAL_DAYS)
}

export function isStartAt(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
}

export function isCounter(value: unknown): value is Counter {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "startAt" in value &&
    isStartAt(value.startAt) &&
    "precision" in value &&
    isPrecision(value.precision) &&
    "goalDays" in value &&
    isGoalDays(value.goalDays) &&
    "palette" in value &&
    isPaletteId(value.palette)
  )
}

export function startMs(counter: Counter): number {
  return Date.parse(counter.startAt)
}

export function elapsedMs(start: number, now: number): number {
  return Math.max(0, now - start)
}

export function goalProgress(counter: Counter, now: number): GoalProgress | null {
  if (counter.goalDays === null) {
    return null
  }
  const elapsed = elapsedMs(startMs(counter), now)
  const goalMs = counter.goalDays * MS_PER_DAY
  return {
    fraction: Math.min(1, elapsed / goalMs),
    days: Math.floor(elapsed / MS_PER_DAY),
    over: elapsed > goalMs,
  }
}
