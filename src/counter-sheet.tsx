import { useState, type FormEvent, type JSX } from "react"
import buttons from "./buttons.module.css"
import { MAX_GOAL_DAYS, PRECISIONS, startMs, type Counter, type Precision } from "./counter"
import styles from "./counter-sheet.module.css"
import { startFromInput, toLocalDate, toLocalTime } from "./datetime"
import { ElapsedText } from "./elapsed-text"
import { dateLabel, TICK_MS } from "./format"
import { CounterShapeArt } from "./counter-shape"
import { BinIcon, RestartIcon } from "./icons"
import { growth, SHAPE_COLORS, shapeAt } from "./shape"
import { Sheet } from "./sheet"
import { useNow } from "./use-now"

const PRECISION_LABELS: Readonly<Record<Precision, string>> = {
  days: "Days",
  hours: "Hours",
  seconds: "Secs",
  centis: "1/100",
}

const PRESET_GOALS = [7, 30, 90] as const
const PREVIEW_SHAPE_MIN = 48
const PREVIEW_SHAPE_MAX = 160
const NON_BLANK_PATTERN = ".*\\S.*"
const DEFAULT_PRECISION: Precision = "days"

type GoalChoice = "none" | "custom" | (typeof PRESET_GOALS)[number]

function initialGoalChoice(goalDays: number | null): GoalChoice {
  if (goalDays === null) {
    return "none"
  }
  return PRESET_GOALS.find((preset) => preset === goalDays) ?? "custom"
}

type CounterSheetProps = {
  readonly counter: Counter | null
  /** The counter's place in the list. A new counter goes to the top, so it is 0. */
  readonly index: number
  readonly onSave: (counter: Counter) => void
  readonly onDelete: (id: string) => void
  readonly onClose: () => void
}

export function CounterSheet({ counter, index, onSave, onDelete, onClose }: CounterSheetProps): JSX.Element {
  const [title, setTitle] = useState(counter?.title ?? "")
  const [start, setStart] = useState(() => (counter ? startMs(counter) : Date.now()))
  const [precision, setPrecision] = useState(counter?.precision ?? DEFAULT_PRECISION)
  const [goalChoice, setGoalChoice] = useState(initialGoalChoice(counter?.goalDays ?? null))
  const [customGoal, setCustomGoal] = useState(counter?.goalDays?.toString() ?? "")
  const now = useNow(TICK_MS[precision])
  const shape = shapeAt(index)

  function goalDays(): number | null {
    switch (goalChoice) {
      case "none":
        return null
      case "custom":
        return Number(customGoal)
      default:
        return goalChoice
    }
  }

  function changeStart(date: string, time: string): void {
    if (date && time) {
      setStart(startFromInput(`${date}T${time}`, start))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSave({
      id: counter?.id ?? crypto.randomUUID(),
      title: title.trim(),
      startAt: new Date(start).toISOString(),
      precision,
      goalDays: goalDays(),
    })
  }

  function restart(existing: Counter): void {
    if (window.confirm(`Restart "${existing.title}" from now?`)) {
      onSave({ ...existing, startAt: new Date().toISOString() })
    }
  }

  function remove(existing: Counter): void {
    if (window.confirm(`Delete "${existing.title}"? This can't be undone.`)) {
      onDelete(existing.id)
    }
  }

  const elapsed = now - start
  const previewGoal = goalChoice === "custom" ? Number(customGoal) || null : goalDays()
  const previewGrowth = growth(elapsed, previewGoal)

  return (
    <Sheet title={counter ? "Edit counter" : "New counter"} compact={counter !== null} onClose={onClose}>
      <form className={counter ? `${styles.form} ${styles.compact}` : styles.form} onSubmit={handleSubmit}>
        {counter && (
          <div className={styles.preview}>
            <CounterShapeArt shape={shape} t={previewGrowth} minSize={PREVIEW_SHAPE_MIN} maxSize={PREVIEW_SHAPE_MAX} />
            <div className={styles.previewBody}>
              <span className={styles.previewTitle}>{title.trim() || counter.title}</span>
              <ElapsedText elapsed={elapsed} precision={precision} className={styles.previewTimer} />
              <span className={styles.previewMeta}>
                {previewGoal ? `Goal ${previewGoal} days` : "No goal, full at 1 year"} · {Math.round(previewGrowth * 100)}%
                size
              </span>
            </div>
          </div>
        )}

        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            className={styles.input}
            value={title}
            placeholder="e.g. Since our last holiday"
            required
            pattern={NON_BLANK_PATTERN}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Started</span>
          <div className={styles.row}>
            <label className={`${styles.input} ${styles.picker} ${styles.datePicker}`}>
              {dateLabel(start)}
              <input
                type="date"
                className={styles.nativePicker}
                aria-label="Start date"
                value={toLocalDate(start)}
                onClick={(event) => event.currentTarget.showPicker()}
                onChange={(event) => changeStart(event.target.value, toLocalTime(start))}
              />
            </label>
            <label className={`${styles.input} ${styles.picker}`}>
              {toLocalTime(start)}
              <input
                type="time"
                className={styles.nativePicker}
                aria-label="Start time"
                value={toLocalTime(start)}
                onClick={(event) => event.currentTarget.showPicker()}
                onChange={(event) => changeStart(toLocalDate(start), event.target.value)}
              />
            </label>
            {!counter && (
              <button type="button" className={styles.now} onClick={() => setStart(Date.now())}>
                Now
              </button>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Precision</span>
          <div className={styles.segments} role="radiogroup" aria-label="Precision">
            {PRECISIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={option === precision}
                className={styles.segment}
                onClick={() => setPrecision(option)}
              >
                {PRECISION_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            Goal <span className={styles.hint}>· optional, sets when the shape is full size</span>
          </span>
          <div className={styles.chips}>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={goalChoice === "none"}
              onClick={() => setGoalChoice("none")}
            >
              None
            </button>
            {PRESET_GOALS.map((days) => (
              <button
                key={days}
                type="button"
                className={styles.chip}
                aria-pressed={goalChoice === days}
                onClick={() => setGoalChoice(days)}
              >
                {days} days
              </button>
            ))}
            <button
              type="button"
              className={`${styles.chip} ${styles.custom}`}
              aria-pressed={goalChoice === "custom"}
              onClick={() => setGoalChoice("custom")}
            >
              Custom…
            </button>
          </div>
          {goalChoice === "custom" && (
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              aria-label="Goal in days"
              placeholder={`Days, 1–${MAX_GOAL_DAYS}`}
              min={1}
              max={MAX_GOAL_DAYS}
              step={1}
              required
              value={customGoal}
              onChange={(event) => setCustomGoal(event.target.value)}
            />
          )}
        </div>

        {counter ? (
          <div className={styles.actions}>
            <button type="button" className={styles.delete} aria-label="Delete counter" onClick={() => remove(counter)}>
              <BinIcon />
            </button>
            <button type="button" className={`${buttons.secondary} ${styles.restart}`} onClick={() => restart(counter)}>
              <RestartIcon />
              Restart
            </button>
            <button type="submit" className={`${buttons.primary} ${styles.save}`}>
              Save
            </button>
          </div>
        ) : (
          <>
            <p className={styles.info}>
              <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
                <path d={shape.path} fill={SHAPE_COLORS[shape.color]} />
              </svg>
              <span>
                New counters go to the top and get the <b>{shape.name}</b>. The others shift along.
              </span>
            </p>
            <button type="submit" className={`${buttons.primary} ${styles.start}`}>
              Start counter
            </button>
          </>
        )}
      </form>
    </Sheet>
  )
}
