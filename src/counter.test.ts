import { describe, expect, it } from "vitest"
import { goalProgress, isCounter, type Counter } from "./counter"

const DAY = 86_400_000
const start = Date.UTC(2026, 9, 1)

const counterWithGoal = (goalDays: number | null): Counter => ({
  id: "id",
  title: "Coffee",
  startAt: new Date(start).toISOString(),
  precision: "days",
  goalDays,
  palette: "ember",
})

describe("goalProgress", () => {
  it("is absent without a goal", () => {
    expect(goalProgress(counterWithGoal(null), start + DAY)).toBeNull()
  })

  it("is absent until the start date passes", () => {
    expect(goalProgress(counterWithGoal(30), start - DAY)).toBeNull()
  })

  it("counts whole days towards the goal", () => {
    expect(goalProgress(counterWithGoal(30), start + 24.5 * DAY)).toEqual({ fraction: 24.5 / 30, days: 24, over: false })
  })

  it("is not over exactly at the goal", () => {
    expect(goalProgress(counterWithGoal(7), start + 7 * DAY)).toEqual({ fraction: 1, days: 7, over: false })
  })

  it("caps the bar and flags the counter once past the goal", () => {
    expect(goalProgress(counterWithGoal(7), start + 9 * DAY)).toEqual({ fraction: 1, days: 9, over: true })
  })
})

describe("isCounter", () => {
  const valid = counterWithGoal(30)

  it("accepts a valid counter", () => {
    expect(isCounter(valid)).toBe(true)
  })

  it.each([
    ["an unreadable start", { ...valid, startAt: "soon" }],
    ["an unknown precision", { ...valid, precision: "minutes" }],
    ["a goal above 90", { ...valid, goalDays: 91 }],
    ["a goal of 0", { ...valid, goalDays: 0 }],
    ["a fractional goal", { ...valid, goalDays: 1.5 }],
    ["an unknown palette", { ...valid, palette: "teal" }],
  ])("rejects %s", (_label, value) => {
    expect(isCounter(value)).toBe(false)
  })
})
