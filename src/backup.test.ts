import { describe, expect, it } from "vitest"
import { exportFileName, parseCounters } from "./backup"
import type { Counter } from "./counter"

const coffee: Counter = {
  id: "a1",
  title: "Coffee",
  start: 1_700_000_000_000,
  unit: "seconds",
  limitDays: 30,
}

describe("parseCounters", () => {
  it("reads back an export", () => {
    expect(parseCounters(JSON.stringify([coffee]))).toEqual([coffee])
  })

  it("accepts an empty list", () => {
    expect(parseCounters("[]")).toEqual([])
  })

  it.each([
    ["invalid JSON", "{"],
    ["a single object", JSON.stringify(coffee)],
    ["an unknown unit", JSON.stringify([{ ...coffee, unit: "hours" }])],
    ["a limit above 90", JSON.stringify([{ ...coffee, limitDays: 91 }])],
    ["a fractional limit", JSON.stringify([{ ...coffee, limitDays: 1.5 }])],
    ["a non-string title", JSON.stringify([{ ...coffee, title: 3 }])],
    ["a missing start", JSON.stringify([{ id: "a1", title: "Coffee", unit: "days", limitDays: 0 }])],
  ])("rejects %s", (_label, json) => {
    expect(parseCounters(json)).toBeNull()
  })
})

describe("exportFileName", () => {
  it("names the file after the local date", () => {
    expect(exportFileName(new Date(2026, 9, 8, 23, 59).getTime())).toBe("counters-2026-10-08.json")
  })
})
