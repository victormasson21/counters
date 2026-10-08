import type { PaletteStops } from "./palettes"

type Rgb = readonly [number, number, number]

export type CardStyle = {
  readonly background: string
  readonly color: string
  readonly secondaryColor: string
  readonly goalTrack: string
  readonly alertColor: string
  readonly shadow: string
  readonly intensityPct: number
}

const DAYS_TO_FULL_INTENSITY = 365
const INTENSITY_CURVE = 0.456
const EDGE_SHARE = 0.4
const BODY_SHARE = 0.72
const DARK_LUMINANCE = 0.28
const SWATCH_INNER = 0.8
const SWATCH_OUTER = 0.35
const RAMP_BAR_STOPS = [0, 0.376, 0.62, 0.78, 1]

const INK = "#1C1B18"
const WHITE = "#FFFFFF"
const DANGER = "#B42318"
const DANGER_ON_DARK = "#FFB4A8"

const hexToRgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]

const mix = (from: Rgb, to: Rgb, t: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * t),
  Math.round(from[1] + (to[1] - from[1]) * t),
  Math.round(from[2] + (to[2] - from[2]) * t),
]

const toCss = ([r, g, b]: Rgb): string => `rgb(${r},${g},${b})`

const channel = (value: number): number => {
  const scaled = value / 255
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
}

const luminance = ([r, g, b]: Rgb): number => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

export function ramp(stops: PaletteStops, t: number): Rgb {
  const [light, mid, deep] = stops
  return t < 0.5 ? mix(hexToRgb(light), hexToRgb(mid), t * 2) : mix(hexToRgb(mid), hexToRgb(deep), (t - 0.5) * 2)
}

export function intensity(days: number): number {
  return Math.min(1, (Math.log(1 + Math.max(0, days)) / Math.log(1 + DAYS_TO_FULL_INTENSITY)) ** INTENSITY_CURVE)
}

export function cardStyle(stops: PaletteStops, days: number): CardStyle {
  const t = intensity(days)
  const mid = ramp(stops, t)
  const edge = ramp(stops, t * EDGE_SHARE)
  const dark = luminance(ramp(stops, t * BODY_SHARE)) < DARK_LUMINANCE
  return {
    background: `radial-gradient(130% 170% at 58% 50%, ${toCss(mid)} 0%, ${toCss(edge)} 85%)`,
    color: dark ? WHITE : INK,
    secondaryColor: dark ? "rgba(255,255,255,0.84)" : "rgba(28,27,24,0.72)",
    goalTrack: dark ? "rgba(255,255,255,0.25)" : "rgba(28,27,24,0.14)",
    alertColor: dark ? DANGER_ON_DARK : DANGER,
    shadow: `0 10px 28px -16px ${toCss(mid)}`,
    intensityPct: Math.round(t * 100),
  }
}

export function swatchBackground(stops: PaletteStops): string {
  return `radial-gradient(circle, ${toCss(ramp(stops, SWATCH_INNER))}, ${toCss(ramp(stops, SWATCH_OUTER))})`
}

export function rampBar(stops: PaletteStops): string {
  const colourStops = RAMP_BAR_STOPS.map((t) => `${toCss(ramp(stops, t))} ${Math.round(t * 100)}%`)
  return `linear-gradient(90deg, ${colourStops.join(", ")})`
}
