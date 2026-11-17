import type { JSX } from "react"
import buttons from "./buttons.module.css"
import { goalProgress, startMs, type Counter } from "./counter"
import styles from "./counter-card.module.css"
import { CounterShapeArt } from "./counter-shape"
import { ElapsedText } from "./elapsed-text"
import { sinceLabel } from "./format"
import { PencilIcon } from "./icons"
import { growth, shapeAt } from "./shape"

const GOAL_CELLS = 10
const SHAPE_MIN = 56
const SHAPE_MAX = 200

type CounterCardProps = {
  readonly counter: Counter
  readonly index: number
  readonly now: number
  readonly onEdit: () => void
}

export function CounterCard({ counter, index, now, onEdit }: CounterCardProps): JSX.Element {
  const start = startMs(counter)
  const elapsed = now - start
  const goal = goalProgress(counter, now)
  const filled = goal ? Math.floor(goal.fraction * GOAL_CELLS) : 0

  return (
    <article className={styles.card} onClick={onEdit}>
      <CounterShapeArt
        shape={shapeAt(index)}
        t={growth(elapsed, counter.goalDays)}
        minSize={SHAPE_MIN}
        maxSize={SHAPE_MAX}
      />
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{counter.title}</h2>
          <button type="button" className={`${buttons.icon} ${styles.edit}`} aria-label="Edit counter" onClick={onEdit}>
            <PencilIcon />
          </button>
        </div>
        <ElapsedText elapsed={elapsed} precision={counter.precision} className={styles.timer} />
        <p className={styles.since}>{sinceLabel(start, now, counter.precision)}</p>
        {goal && (
          <div className={goal.over ? `${styles.goal} ${styles.over}` : styles.goal}>
            <div className={styles.cells} aria-hidden="true">
              {Array.from({ length: GOAL_CELLS }, (_, cell) => (
                <span key={cell} className={cell < filled ? `${styles.cell} ${styles.done}` : styles.cell} />
              ))}
            </div>
            <p className={styles.caption} aria-label={`${goal.days} of ${counter.goalDays} days`}>
              {goal.days}/{counter.goalDays}
            </p>
          </div>
        )}
      </div>
    </article>
  )
}
