import { describe, expect, it } from "vitest"
import { dateLabel, formatElapsed, sinceLabel } from "./format"

const SECOND = 1_000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const SEVEN_DAYS_FIVE_HOURS = 7 * DAY + 5 * HOUR + 7 * MINUTE + 48 * SECOND + 629
const FOUR_HOURS = 4 * HOUR + 6 * MINUTE + 9 * SECOND + 30

describe("formatElapsed", () => {
  it("shows whole days with singular and plural wording", () => {
    expect(formatElapsed(49 * DAY + HOUR, "days")).toEqual({ main: "49", suffix: " days" })
    expect(formatElapsed(DAY, "days")).toEqual({ main: "1", suffix: " day" })
    expect(formatElapsed(DAY - 1, "days")).toEqual({ main: "0", suffix: " days" })
  })

  it("shows days and hours, then minutes in the suffix", () => {
    expect(formatElapsed(24 * DAY + 4 * HOUR + 46 * MINUTE, "hours")).toEqual({ main: "24d 4h", suffix: " 46m" })
    expect(formatElapsed(FOUR_HOURS, "hours")).toEqual({ main: "4h", suffix: " 6m" })
  })

  it("shows a padded clock at seconds precision", () => {
    expect(formatElapsed(SEVEN_DAYS_FIVE_HOURS, "seconds")).toEqual({ main: "7d 05:07:48", suffix: "" })
    expect(formatElapsed(FOUR_HOURS, "seconds")).toEqual({ main: "04:06:09", suffix: "" })
  })

  it("adds truncated centiseconds in the suffix", () => {
    expect(formatElapsed(SEVEN_DAYS_FIVE_HOURS, "centis")).toEqual({ main: "7d 05:07:48", suffix: ".62" })
    expect(formatElapsed(FOUR_HOURS, "centis")).toEqual({ main: "04:06:09", suffix: ".03" })
  })
})

describe("sinceLabel", () => {
  const now = new Date(2026, 9, 8, 15, 0).getTime()

  it("says started today for a start earlier today", () => {
    expect(sinceLabel(new Date(2026, 9, 8, 10, 34).getTime(), now, "seconds")).toBe("Started today, 10:34")
    expect(sinceLabel(new Date(2026, 9, 8, 10, 34).getTime(), now, "days")).toBe("Started today")
  })

  it("leaves out the year this year", () => {
    expect(sinceLabel(new Date(2026, 9, 1, 8, 40).getTime(), now, "hours")).toBe("Since Thu 1 Oct, 08:40")
    expect(sinceLabel(new Date(2026, 7, 20, 8, 40).getTime(), now, "days")).toBe("Since Thu 20 Aug")
  })

  it("adds the year for earlier years", () => {
    expect(sinceLabel(new Date(2025, 5, 2, 8, 40).getTime(), now, "centis")).toBe("Since Mon 2 Jun 2025, 08:40")
  })
})

describe("dateLabel", () => {
  it("writes out the date", () => {
    expect(dateLabel(new Date(2026, 9, 8, 13, 46).getTime())).toBe("Thu 8 Oct 2026")
    expect(dateLabel(new Date(2026, 8, 14).getTime())).toBe("Mon 14 Sep 2026")
  })
})
