import { useState, type FormEvent, type JSX } from "react"
import buttons from "./buttons.module.css"
import { elapsedMs, MAX_GOAL_DAYS, MS_PER_DAY, PRECISIONS, startMs, type Counter, type Precision } from "./counter"
import styles from "./counter-sheet.module.css"
import { startFromInput, toLocalDate, toLocalTime } from "./datetime"
import { ElapsedText } from "./elapsed-text"
import { dateLabel, TICK_MS } from "./format"
import { cardStyle, rampBar, swatchBackground } from "./heat"
import { BinIcon, RestartIcon } from "./icons"
import { PALETTES, paletteById, type PaletteId } from "./palettes"
import { Sheet } from "./sheet"
import { useNow } from "./use-now"

const PRECISION_LABELS: Readonly<Record<Precision, string>> = {
  days: "Days",
  hours: "Hours",
  seconds: "Seconds",
  centis: "1/100 s",
}

const PRESET_GOALS = [7, 30] as const
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
  readonly defaultPalette: PaletteId
  readonly onSave: (counter: Counter) => void
  readonly onDelete: (id: string) => void
  readonly onClose: () => void
}

export function CounterSheet({ counter, defaultPalette, onSave, onDelete, onClose }: CounterSheetProps): JSX.Element {
  const [title, setTitle] = useState(counter?.title ?? "")
  const [start, setStart] = useState(() => (counter ? startMs(counter) : Date.now()))
  const [precision, setPrecision] = useState(counter?.precision ?? DEFAULT_PRECISION)
  const [palette, setPalette] = useState(counter?.palette ?? defaultPalette)
  const [goalChoice, setGoalChoice] = useState(initialGoalChoice(counter?.goalDays ?? null))
  const [customGoal, setCustomGoal] = useState(counter?.goalDays?.toString() ?? "")
  const now = useNow(TICK_MS[precision])
  const stops = paletteById(palette).stops

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
      palette,
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

  const elapsed = elapsedMs(start, now)
  const preview = cardStyle(stops, elapsed / MS_PER_DAY)

  return (
    <Sheet title={counter ? "Edit counter" : "New counter"} compact={counter !== null} onClose={onClose}>
      <form className={counter ? `${styles.form} ${styles.compact}` : styles.form} onSubmit={handleSubmit}>
        {counter && (
          <div className={styles.preview} style={{ background: preview.background, color: preview.color }}>
            <span className={styles.previewLabel} style={{ color: preview.secondaryColor }}>
              {title.trim() || counter.title} · {preview.intensityPct}% intensity
            </span>
            <ElapsedText elapsed={elapsed} precision={precision} className={styles.previewTimer} />
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
          <span className={styles.label}>
            Colour <span className={styles.hint}>· {paletteById(palette).name}</span>
          </span>
          <div className={styles.swatches}>
            {PALETTES.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.swatch}
                aria-label={option.name}
                aria-pressed={option.id === palette}
                onClick={() => setPalette(option.id)}
              >
                <span className={styles.swatchDot} style={{ background: swatchBackground(option.stops) }} />
              </button>
            ))}
          </div>
          {!counter && (
            <div className={styles.ramp}>
              <div className={styles.rampBar} style={{ background: rampBar(stops) }} />
              <div className={styles.rampCaption}>
                <span>Just started</span>
                <span>Deepens as it runs</span>
              </div>
            </div>
          )}
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
            Goal <span className={styles.hint}>· optional</span>
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
          <button type="submit" className={`${buttons.primary} ${styles.start}`}>
            Start counter
          </button>
        )}
      </form>
    </Sheet>
  )
}
