import { MS_PER_DAY, type Precision } from "./counter"
import { pad, toLocalDate, toLocalTime } from "./datetime"

export type FormattedElapsed = {
  readonly main: string
  readonly suffix: string
}

export const TICK_MS: Readonly<Record<Precision, number>> = {
  days: 60_000,
  hours: 60_000,
  seconds: 1_000,
  centis: 50,
}

const MS_PER_CENTISECOND = 10
const MS_PER_SECOND = 1_000
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function dayLabel(ms: number): string {
  const date = new Date(ms)
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatElapsed(elapsed: number, precision: Precision): FormattedElapsed {
  const days = Math.floor(elapsed / MS_PER_DAY)
  const hours = Math.floor((elapsed % MS_PER_DAY) / MS_PER_HOUR)
  const minutes = Math.floor((elapsed % MS_PER_HOUR) / MS_PER_MINUTE)
  const seconds = Math.floor((elapsed % MS_PER_MINUTE) / MS_PER_SECOND)
  const centiseconds = Math.floor((elapsed % MS_PER_SECOND) / MS_PER_CENTISECOND)
  const dayPrefix = days > 0 ? `${days}d ` : ""
  const clock = `${dayPrefix}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  switch (precision) {
    case "days":
      return { main: String(days), suffix: days === 1 ? " day" : " days" }
    case "hours":
      return { main: `${dayPrefix}${hours}h`, suffix: ` ${minutes}m` }
    case "seconds":
      return { main: clock, suffix: "" }
    case "centis":
      return { main: clock, suffix: `.${pad(centiseconds)}` }
  }
}

export function dateLabel(ms: number): string {
  return `${dayLabel(ms)} ${new Date(ms).getFullYear()}`
}

export function sinceLabel(start: number, now: number, precision: Precision): string {
  const withTime = (label: string): string => (precision === "days" ? label : `${label}, ${toLocalTime(start)}`)
  if (toLocalDate(start) === toLocalDate(now)) {
    return withTime("Started today")
  }
  const sameYear = new Date(start).getFullYear() === new Date(now).getFullYear()
  return withTime(`Since ${sameYear ? dayLabel(start) : dateLabel(start)}`)
}
