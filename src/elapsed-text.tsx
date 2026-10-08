import type { JSX } from "react"
import type { Precision } from "./counter"
import styles from "./elapsed-text.module.css"
import { formatElapsed } from "./format"

type ElapsedTextProps = {
  readonly elapsed: number
  readonly precision: Precision
  readonly className?: string
}

export function ElapsedText({ elapsed, precision, className }: ElapsedTextProps): JSX.Element {
  const { main, suffix } = formatElapsed(elapsed, precision)
  return (
    <span className={`${styles.elapsed} ${className ?? ""}`}>
      {main}
      <span className={styles.suffix}>{suffix}</span>
    </span>
  )
}
