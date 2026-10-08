import { describe, expect, it } from "vitest"
import { cardStyle, intensity, ramp } from "./heat"
import { paletteById } from "./palettes"

const ember = paletteById("ember").stops

describe("intensity", () => {
  it.each([
    [1 / 24, 10],
    [1, 38],
    [7, 62],
    [14, 70],
    [30, 78],
    [365, 100],
    [1000, 100],
  ])("reaches the design reference at %f days", (days, percent) => {
    expect(Math.round(intensity(days) * 100)).toBe(percent)
  })

  it("is zero for a start in the future", () => {
    expect(intensity(-3)).toBe(0)
  })
})

describe("ramp", () => {
  it("returns the light, mid and deep stops at 0, 0.5 and 1", () => {
    expect(ramp(ember, 0)).toEqual([255, 241, 232])
    expect(ramp(ember, 0.5)).toEqual([255, 138, 91])
    expect(ramp(ember, 1)).toEqual([179, 18, 43])
  })
})

describe("cardStyle", () => {
  it("uses dark text on a fresh counter", () => {
    expect(cardStyle(ember, 0).color).toBe("#1C1B18")
  })

  it("switches to white text once the card is deep", () => {
    expect(cardStyle(ember, 365).color).toBe("#FFFFFF")
  })

  it("reports the intensity as a whole percentage", () => {
    expect(cardStyle(ember, 7).intensityPct).toBe(62)
  })

  it("warms up as a countdown gets closer", () => {
    expect(cardStyle(ember, -37).intensityPct).toBe(20)
    expect(cardStyle(ember, -1).intensityPct).toBe(62)
    expect(cardStyle(ember, -0.001).intensityPct).toBe(98)
  })
})
