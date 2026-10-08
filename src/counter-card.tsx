import type { JSX } from "react"
import buttons from "./buttons.module.css"
import { goalProgress, MS_PER_DAY, startMs, type Counter } from "./counter"
import styles from "./counter-card.module.css"
import { ElapsedText } from "./elapsed-text"
import { sinceLabel } from "./format"
import { cardStyle } from "./heat"
import { PencilIcon } from "./icons"
import { paletteById } from "./palettes"

type CounterCardProps = {
  readonly counter: Counter
  readonly now: number
  readonly onEdit: () => void
}

export function CounterCard({ counter, now, onEdit }: CounterCardProps): JSX.Element {
  const start = startMs(counter)
  const elapsed = now - start
  const style = cardStyle(paletteById(counter.palette).stops, elapsed / MS_PER_DAY)
  const goal = goalProgress(counter, now)
  const goalColor = goal?.over ? style.alertColor : style.color

  return (
    <article
      className={styles.card}
      style={{ background: style.background, color: style.color, boxShadow: style.shadow }}
      onClick={onEdit}
    >
      <div className={styles.body}>
        <h2 className={styles.title}>{counter.title}</h2>
        <ElapsedText elapsed={elapsed} precision={counter.precision} className={styles.timer} />
        <p className={styles.since} style={{ color: style.secondaryColor }}>
          {sinceLabel(start, now, counter.precision)}
        </p>
        {goal && (
          <div className={goal.over ? `${styles.goal} ${styles.over}` : styles.goal}>
            <div className={styles.track} style={{ background: style.goalTrack }}>
              <div className={styles.fill} style={{ width: `${goal.fraction * 100}%`, background: goalColor }} />
            </div>
            <p className={styles.caption} style={{ color: goal.over ? style.alertColor : style.secondaryColor }}>
              {goal.days} of {counter.goalDays} days
            </p>
          </div>
        )}
      </div>
      <button type="button" className={buttons.icon} aria-label="Edit counter" onClick={onEdit}>
        <PencilIcon />
      </button>
    </article>
  )
}
