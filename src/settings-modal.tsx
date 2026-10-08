import { useState, type FormEvent, type JSX } from "react"
import { isUnit, MAX_LIMIT_DAYS, UNITS, type Counter, type Unit } from "./counter"
import { startFromInput, toLocalInputValue } from "./datetime"
import { Modal } from "./modal"
import styles from "./modal.module.css"

const DEFAULT_UNIT: Unit = "days"
const DEFAULT_LIMIT_DAYS = 0
const NON_BLANK_PATTERN = ".*\\S.*"
const LIMIT_OPTIONS = Array.from({ length: MAX_LIMIT_DAYS + 1 }, (_, days) => days)

type SettingsModalProps = {
  readonly counter: Counter | null
  readonly onSave: (counter: Counter) => void
  readonly onDelete: (id: string) => void
  readonly onClose: () => void
}

export function SettingsModal({ counter, onSave, onDelete, onClose }: SettingsModalProps): JSX.Element {
  const [openedAt] = useState(Date.now)
  const initialStart = counter?.start ?? openedAt

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const unit = form.get("unit")
    if (!isUnit(unit)) {
      throw new Error(`Unknown unit: ${String(unit)}`)
    }
    onSave({
      id: counter?.id ?? crypto.randomUUID(),
      title: String(form.get("title")).trim(),
      start: startFromInput(String(form.get("start")), initialStart),
      unit,
      limitDays: Number(form.get("limitDays")),
    })
  }

  function handleDelete(existing: Counter): void {
    if (window.confirm(`Delete "${existing.title}"?`)) {
      onDelete(existing.id)
    }
  }

  return (
    <Modal title={counter ? "Edit counter" : "New counter"} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          Title
          <input name="title" defaultValue={counter?.title} required pattern={NON_BLANK_PATTERN} />
        </label>
        <label className={styles.field}>
          Start
          <input name="start" type="datetime-local" defaultValue={toLocalInputValue(initialStart)} required />
        </label>
        <label className={styles.field}>
          Unit
          <select name="unit" defaultValue={counter?.unit ?? DEFAULT_UNIT}>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Limit (days)
          <select name="limitDays" defaultValue={counter?.limitDays ?? DEFAULT_LIMIT_DAYS}>
            {LIMIT_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {days}
              </option>
            ))}
          </select>
        </label>
        {counter && (
          <div className={styles.row}>
            <button type="button" onClick={() => onSave({ ...counter, start: Date.now() })}>
              Reset
            </button>
            <button type="button" className={styles.danger} onClick={() => handleDelete(counter)}>
              Delete
            </button>
          </div>
        )}
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.primary}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
