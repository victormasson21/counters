import { afterEach, describe, expect, it, vi } from "vitest"
import { downloadCounters, exportFileName, parseCounters } from "./backup"
import type { Counter } from "./counter"

const coffee: Counter = {
  id: "a1",
  title: "Coffee",
  startAt: "2023-11-14T22:13:20.000Z",
  precision: "seconds",
  goalDays: 30,
  palette: "moss",
}

const legacyDrink = {
  id: "last-drink",
  title: "Last drink",
  start: 1_791_226_800_000,
  unit: "centiseconds",
  limitDays: 0,
}

describe("parseCounters", () => {
  it("reads back an export", () => {
    expect(parseCounters(JSON.stringify([coffee]))).toEqual([coffee])
  })

  it("accepts an empty list", () => {
    expect(parseCounters("[]")).toEqual([])
  })

  it("keeps a hand-written local start as written", () => {
    const handWritten = { ...coffee, startAt: "2026-10-05T20:00" }
    expect(parseCounters(JSON.stringify([handWritten]))).toEqual([handWritten])
  })

  it("migrates the first data format", () => {
    const legacyRun = { id: "run", title: "Last run", start: 1_790_503_200_000, unit: "days", limitDays: 5 }
    expect(parseCounters(JSON.stringify([legacyDrink, legacyRun]))).toEqual([
      {
        id: "last-drink",
        title: "Last drink",
        startAt: "2026-10-05T19:00:00.000Z",
        precision: "centis",
        goalDays: null,
        palette: "ember",
      },
      {
        id: "run",
        title: "Last run",
        startAt: "2026-09-27T10:00:00.000Z",
        precision: "days",
        goalDays: 5,
        palette: "terracotta",
      },
    ])
  })

  it("assigns a palette by rotation when one is missing", () => {
    const { palette: _palette, ...withoutPalette } = coffee
    expect(parseCounters(JSON.stringify([coffee, withoutPalette, withoutPalette]))?.map((counter) => counter.palette)).toEqual([
      "moss",
      "terracotta",
      "marigold",
    ])
  })

  it.each([
    ["invalid JSON", "{"],
    ["a single object", JSON.stringify(coffee)],
    ["an unknown precision", JSON.stringify([{ ...coffee, precision: "minutes" }])],
    ["a goal above 90", JSON.stringify([{ ...coffee, goalDays: 91 }])],
    ["an unknown palette", JSON.stringify([{ ...coffee, palette: "teal" }])],
    ["a non-string title", JSON.stringify([{ ...coffee, title: 3 }])],
    ["an unreadable start", JSON.stringify([{ ...coffee, startAt: "soon" }])],
    ["a legacy limit above 90", JSON.stringify([{ ...legacyDrink, limitDays: 91 }])],
    ["a legacy unknown unit", JSON.stringify([{ ...legacyDrink, unit: "hours" }])],
    ["a legacy counter without a start", JSON.stringify([{ ...legacyDrink, start: undefined }])],
  ])("rejects %s", (_label, json) => {
    expect(parseCounters(json)).toBeNull()
  })
})

describe("downloadCounters", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("revokes the file URL only after the download has started", () => {
    vi.useFakeTimers()
    const click = vi.fn()
    vi.stubGlobal("document", { createElement: () => ({ click }) })
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:counters")
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined)

    downloadCounters([coffee])

    expect(click).toHaveBeenCalledOnce()
    expect(revoke).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledWith("blob:counters")
  })
})

describe("exportFileName", () => {
  it("names the file after the local date", () => {
    expect(exportFileName(new Date(2026, 9, 8, 23, 59).getTime())).toBe("counters-2026-10-08.json")
  })
})
