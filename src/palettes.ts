export type PaletteStops = readonly [light: string, mid: string, deep: string]

export const PALETTES = [
  { id: "ember", name: "Ember", stops: ["#FFF1E8", "#FF8A5B", "#B3122B"] },
  { id: "terracotta", name: "Terracotta", stops: ["#FBEFE6", "#D9825B", "#7C2E17"] },
  { id: "marigold", name: "Marigold", stops: ["#FFF7DF", "#FFB020", "#B23A0B"] },
  { id: "honey", name: "Honey", stops: ["#FFF8E6", "#E8B84A", "#7A5410"] },
  { id: "moss", name: "Moss", stops: ["#F1F6E6", "#9CC460", "#24502B"] },
  { id: "lagoon", name: "Lagoon", stops: ["#EAF3EE", "#6FA895", "#1F4A47"] },
  { id: "cobalt", name: "Cobalt", stops: ["#ECF0F4", "#6F8CAE", "#1F3550"] },
  { id: "berry", name: "Berry", stops: ["#F8ECEE", "#C7768C", "#5E1E33"] },
  { id: "rosewood", name: "Rosewood", stops: ["#FBF0EC", "#D58C86", "#6A1C24"] },
] as const satisfies readonly { id: string; name: string; stops: PaletteStops }[]

export type Palette = (typeof PALETTES)[number]
export type PaletteId = Palette["id"]

export function isPaletteId(value: unknown): value is PaletteId {
  return PALETTES.some((palette) => palette.id === value)
}

export function paletteById(id: PaletteId): Palette {
  const palette = PALETTES.find((candidate) => candidate.id === id)
  if (!palette) {
    throw new Error(`Unknown palette: ${id}`)
  }
  return palette
}

export function paletteAt(index: number): PaletteId {
  return PALETTES[index % PALETTES.length]?.id ?? PALETTES[0].id
}

export function paletteAfter(id: PaletteId | undefined): PaletteId {
  return id === undefined ? PALETTES[0].id : paletteAt(PALETTES.findIndex((palette) => palette.id === id) + 1)
}
