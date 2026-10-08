import type { JSX } from "react"
import logo from "./assets/logo-simple.svg"
import styles from "./empty-state.module.css"

export function EmptyState(): JSX.Element {
  return (
    <div className={styles.empty}>
      <div className={styles.tile}>
        <img src={logo} alt="" width={76} height={76} />
      </div>
      <h2 className={styles.title}>No counters yet</h2>
      <p className={styles.body}>
        Track the time since anything
        <br />
        or until the next best thing.
      </p>
    </div>
  )
}
