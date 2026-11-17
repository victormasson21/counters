import { MS_PER_DAY } from "./counter"

export const SHAPE_COLORS = {
  blue: "#1F4FA3",
  red: "#D2382B",
  yellow: "#F2B300",
  ink: "#141414",
} as const

export type ShapeColor = keyof typeof SHAPE_COLORS

export type CounterShape = {
  readonly name: string
  readonly color: ShapeColor
  /** SVG path in a 0 0 100 100 viewBox. */
  readonly path: string
}

/** Colour and shape follow a counter's position in the list, so neighbours always differ. */
export const SHAPE_CYCLE: readonly CounterShape[] = [
  { name: "blue circle", color: "blue", path: "M50 0A50 50 0 1 1 49.99 0Z" },
  { name: "red square", color: "red", path: "M0 0H100V100H0Z" },
  { name: "yellow triangle", color: "yellow", path: "M50 0L100 100H0Z" },
  { name: "black half-moon", color: "ink", path: "M0 100A50 50 0 0 1 100 100Z" },
]

const DAYS_TO_FULL_SIZE = 365
const GROWTH_CURVE = 0.456
const RIGHT_OVERHANG = 0.42
const TOP_OVERHANG = 0.28

export function shapeAt(index: number): CounterShape {
  const shape = SHAPE_CYCLE[((index % SHAPE_CYCLE.length) + SHAPE_CYCLE.length) % SHAPE_CYCLE.length]
  if (!shape) {
    throw new Error(`No shape for index ${index}`)
  }
  return shape
}

/** Front-loaded growth from 0 to 1 over `spanDays`. */
export function intensity(days: number, spanDays: number = DAYS_TO_FULL_SIZE): number {
  return Math.min(1, (Math.log(1 + Math.max(0, days)) / Math.log(1 + spanDays)) ** GROWTH_CURVE)
}

/**
 * How grown a counter's shape is, from 0 to 1. Full size at the goal when there is one, else at one year.
 * A countdown grows as its date nears, over a one-year span.
 */
export function growth(elapsedMs: number, goalDays: number | null): number {
  const days = elapsedMs / MS_PER_DAY
  if (days < 0) {
    return 1 - intensity(-days)
  }
  return intensity(days, goalDays ?? DAYS_TO_FULL_SIZE)
}

export type ShapeBox = {
  readonly size: number
  readonly right: number
  readonly top: number
}

/** Size in px between `minSize` and `maxSize`, anchored past the card's top-right corner. */
export function shapeBox(t: number, minSize: number, maxSize: number): ShapeBox {
  const size = Math.round(minSize + t * (maxSize - minSize))
  return { size, right: Math.round(-RIGHT_OVERHANG * size), top: Math.round(-TOP_OVERHANG * size) }
}
