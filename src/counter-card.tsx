import type { JSX } from "react"
import { elapsedMs, formatElapsed, isOverLimit, type Counter } from "./counter"
import styles from "./counter-card.module.css"

const SETTINGS_ICON = "⚙︎"

type CounterCardProps = {
  readonly counter: Counter
  readonly now: number
  readonly onOpenSettings: () => void
}

export function CounterCard({ counter, now, onOpenSettings }: CounterCardProps): JSX.Element {
  const { text, centiseconds } = formatElapsed(elapsedMs(counter.start, now), counter.unit)
  const timeClassName = isOverLimit(counter, now) ? `${styles.time} ${styles.over}` : styles.time

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{counter.title}</h2>
      <p className={timeClassName}>
        {text}
        {centiseconds !== null && <span className={styles.centiseconds}>.{centiseconds}</span>}
      </p>
      <button
        type="button"
        className={styles.settings}
        aria-label={`Settings for ${counter.title}`}
        onClick={onOpenSettings}
      >
        {SETTINGS_ICON}
      </button>
    </article>
  )
}
