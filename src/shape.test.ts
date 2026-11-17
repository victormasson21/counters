import { describe, expect, it } from "vitest"
import { MS_PER_DAY } from "./counter"
import { growth, intensity, SHAPE_CYCLE, shapeAt, shapeBox } from "./shape"

describe("shapeAt", () => {
  it("cycles blue circle, red square, yellow triangle, black half-moon", () => {
    expect([0, 1, 2, 3, 4].map((index) => shapeAt(index).name)).toEqual([
      "blue circle",
      "red square",
      "yellow triangle",
      "black half-moon",
      "blue circle",
    ])
  })

  it("never gives neighbours the same colour", () => {
    for (let index = 0; index < 12; index++) {
      expect(shapeAt(index).color).not.toBe(shapeAt(index + 1).color)
    }
  })

  it("has four pairs", () => {
    expect(SHAPE_CYCLE).toHaveLength(4)
  })
})

describe("intensity", () => {
  it.each([
    [1 / 24, 10],
    [1, 38],
    [7, 62],
    [14, 70],
    [30, 78],
    [365, 100],
    [1000, 100],
  ])("reaches the design reference at %f days over a year", (days, percent) => {
    expect(Math.round(intensity(days) * 100)).toBe(percent)
  })

  it("is zero before the start", () => {
    expect(intensity(-3)).toBe(0)
  })

  it("reaches full size at the end of a shorter span", () => {
    expect(intensity(30, 30)).toBe(1)
    expect(intensity(15, 30)).toBeLessThan(1)
  })
})

describe("growth", () => {
  it("uses one year without a goal", () => {
    expect(growth(7 * MS_PER_DAY, null)).toBeCloseTo(intensity(7))
  })

  it("is full size at the goal", () => {
    expect(growth(14 * MS_PER_DAY, 14)).toBe(1)
    expect(growth(60 * MS_PER_DAY, 14)).toBe(1)
  })

  it("grows faster with a short goal than without one", () => {
    expect(growth(7 * MS_PER_DAY, 14)).toBeGreaterThan(growth(7 * MS_PER_DAY, null))
  })

  it("grows as a countdown gets closer", () => {
    expect(Math.round(growth(-37 * MS_PER_DAY, null) * 100)).toBe(20)
    expect(Math.round(growth(-1 * MS_PER_DAY, null) * 100)).toBe(62)
    expect(growth(-1 * MS_PER_DAY, 7)).toBe(growth(-1 * MS_PER_DAY, null))
  })
})

describe("shapeBox", () => {
  it("spans the size range and overhangs the top-right corner", () => {
    expect(shapeBox(0, 56, 200)).toEqual({ size: 56, right: -24, top: -16 })
    expect(shapeBox(1, 56, 200)).toEqual({ size: 200, right: -84, top: -56 })
  })
})
