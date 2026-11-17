import type { JSX } from "react"
import styles from "./empty-state.module.css"

export function EmptyState(): JSX.Element {
  return (
    <div className={styles.empty}>
      <svg className={styles.art} viewBox="0 0 334 250" aria-hidden="true">
        <rect x="150" y="20" width="150" height="150" fill="var(--red)" />
        <circle cx="120" cy="140" r="92" fill="var(--blue)" />
        <path d="M232 92L310 236H154Z" fill="var(--yellow)" />
        <path d="M20 236A60 60 0 0 1 140 236Z" fill="var(--ink)" />
        <rect x="0" y="234" width="334" height="4" fill="var(--ink)" />
      </svg>
      <div className={styles.text}>
        <h2 className={styles.title}>no counters yet</h2>
        <p className={styles.body}>
          Track the time since anything
          <br />
          or until the next best thing.
        </p>
      </div>
    </div>
  )
}
