import type { JSX } from "react"
import { SHAPE_COLORS, shapeBox, type CounterShape } from "./shape"
import styles from "./counter-shape.module.css"

type CounterShapeProps = {
  readonly shape: CounterShape
  /** Growth from 0 to 1. */
  readonly t: number
  readonly minSize: number
  readonly maxSize: number
}

/** The counter's shape, cropped by its card's top-right corner. The card needs `position: relative; overflow: hidden`. */
export function CounterShapeArt({ shape, t, minSize, maxSize }: CounterShapeProps): JSX.Element {
  const { size, right, top } = shapeBox(t, minSize, maxSize)
  return (
    <svg
      className={styles.shape}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ width: size, height: size, right, top }}
    >
      <path d={shape.path} fill={SHAPE_COLORS[shape.color]} />
    </svg>
  )
}
