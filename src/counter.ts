import { pad } from "./datetime"

export const UNITS = ["days", "seconds", "centiseconds"] as const
export type Unit = (typeof UNITS)[number]

export const MAX_LIMIT_DAYS = 90

export type Counter = {
  readonly id: string
  readonly title: string
  readonly start: number
  readonly unit: Unit
  readonly limitDays: number
}

export type FormattedElapsed = {
  readonly text: string
  readonly centiseconds: string | null
}

const MS_PER_CENTISECOND = 10
const MS_PER_SECOND = 1_000
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

export function isUnit(value: unknown): value is Unit {
  return UNITS.some((unit) => unit === value)
}

function isLimitDays(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_LIMIT_DAYS
}

export function isCounter(value: unknown): value is Counter {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "start" in value &&
    typeof value.start === "number" &&
    Number.isFinite(value.start) &&
    "unit" in value &&
    isUnit(value.unit) &&
    "limitDays" in value &&
    isLimitDays(value.limitDays)
  )
}

export function elapsedMs(start: number, now: number): number {
  return Math.max(0, now - start)
}

export function isOverLimit(counter: Counter, now: number): boolean {
  return counter.limitDays > 0 && elapsedMs(counter.start, now) > counter.limitDays * MS_PER_DAY
}

export function formatElapsed(elapsed: number, unit: Unit): FormattedElapsed {
  const days = Math.floor(elapsed / MS_PER_DAY)
  const hours = Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR)
  const minutes = Math.floor((elapsed % MS_PER_HOUR) / MS_PER_MINUTE)
  const seconds = Math.floor((elapsed % MS_PER_MINUTE) / MS_PER_SECOND)
  const centiseconds = Math.floor((elapsed % MS_PER_SECOND) / MS_PER_CENTISECOND)
  const clock = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  switch (unit) {
    case "days":
      return { text: days === 1 ? "1 day" : `${days} days`, centiseconds: null }
    case "seconds":
      return { text: clock, centiseconds: null }
    case "centiseconds":
      return { text: clock, centiseconds: pad(centiseconds) }
  }
}
