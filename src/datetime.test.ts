import { describe, expect, it } from "vitest"
import { pad, startFromInput, toLocalDate, toLocalInputValue } from "./datetime"

const preciseStart = new Date(2026, 9, 8, 7, 5, 37, 120).getTime()

describe("pad", () => {
  it("pads single digits to two", () => {
    expect(pad(7)).toBe("07")
    expect(pad(42)).toBe("42")
  })
})

describe("toLocalDate", () => {
  it("formats the local calendar date", () => {
    expect(toLocalDate(preciseStart)).toBe("2026-10-08")
  })
})

describe("toLocalInputValue", () => {
  it("formats a datetime-local value to the minute", () => {
    expect(toLocalInputValue(preciseStart)).toBe("2026-10-08T07:05")
  })
})

describe("startFromInput", () => {
  it("keeps the precise start when the input is unchanged", () => {
    expect(startFromInput("2026-10-08T07:05", preciseStart)).toBe(preciseStart)
  })

  it("reads a changed input as local time", () => {
    expect(startFromInput("2026-10-08T09:30", preciseStart)).toBe(new Date(2026, 9, 8, 9, 30).getTime())
  })
})
