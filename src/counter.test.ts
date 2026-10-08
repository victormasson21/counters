import { describe, expect, it } from "vitest"
import { elapsedMs, formatElapsed, isOverLimit, type Counter } from "./counter"

const SECOND = 1_000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const ONE_DAY_TWO_HOURS_NINE_MINUTES = DAY + 2 * HOUR + 9 * MINUTE + SECOND + 349

const counterWithLimit = (limitDays: number): Counter => ({
  id: "id",
  title: "Coffee",
  start: 0,
  unit: "days",
  limitDays,
})

describe("formatElapsed", () => {
  it("shows whole days with singular and plural wording", () => {
    expect(formatElapsed(ONE_DAY_TWO_HOURS_NINE_MINUTES, "days")).toEqual({ text: "1 day", centiseconds: null })
    expect(formatElapsed(12 * DAY + 5, "days")).toEqual({ text: "12 days", centiseconds: null })
    expect(formatElapsed(DAY - 1, "days")).toEqual({ text: "0 days", centiseconds: null })
  })

  it("stops at seconds for the seconds unit", () => {
    expect(formatElapsed(ONE_DAY_TWO_HOURS_NINE_MINUTES, "seconds")).toEqual({ text: "1d 02:09:01", centiseconds: null })
  })

  it("truncates centiseconds", () => {
    expect(formatElapsed(ONE_DAY_TWO_HOURS_NINE_MINUTES, "centiseconds")).toEqual({ text: "1d 02:09:01", centiseconds: "34" })
  })

  it("pads every part under one day", () => {
    expect(formatElapsed(5 * SECOND + 70, "centiseconds")).toEqual({ text: "0d 00:00:05", centiseconds: "07" })
  })
})

describe("elapsedMs", () => {
  it("measures from start to now", () => {
    expect(elapsedMs(1_000, 4_500)).toBe(3_500)
  })

  it("is zero for a start in the future", () => {
    expect(elapsedMs(10_000, 4_500)).toBe(0)
  })
})

describe("isOverLimit", () => {
  it("never flags a zero limit", () => {
    expect(isOverLimit(counterWithLimit(0), 365 * DAY)).toBe(false)
  })

  it("does not flag exactly at the limit", () => {
    expect(isOverLimit(counterWithLimit(3), 3 * DAY)).toBe(false)
  })

  it("flags once past the limit", () => {
    expect(isOverLimit(counterWithLimit(3), 3 * DAY + 1)).toBe(true)
  })
})
