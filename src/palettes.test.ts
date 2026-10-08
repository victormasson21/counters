import { describe, expect, it } from "vitest"
import { isPaletteId, paletteAfter, PALETTES, paletteById } from "./palettes"

describe("palettes", () => {
  it("lists the nine palettes in picker order", () => {
    expect(PALETTES.map((palette) => palette.id)).toEqual([
      "ember",
      "terracotta",
      "marigold",
      "honey",
      "moss",
      "lagoon",
      "cobalt",
      "berry",
      "rosewood",
    ])
  })

  it("recognises palette ids", () => {
    expect(isPaletteId("moss")).toBe(true)
    expect(isPaletteId("Moss")).toBe(false)
  })

  it("finds a palette by id", () => {
    expect(paletteById("cobalt").name).toBe("Cobalt")
  })

  it("picks the next palette, wrapping at the end", () => {
    expect(paletteAfter(undefined)).toBe("ember")
    expect(paletteAfter("ember")).toBe("terracotta")
    expect(paletteAfter("rosewood")).toBe("ember")
  })
})
