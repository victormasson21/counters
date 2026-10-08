import { useRef, useState, type ChangeEvent, type JSX } from "react"
import { downloadCounters, parseCounters } from "./backup"
import type { Counter } from "./counter"
import { Modal } from "./modal"
import styles from "./modal.module.css"

type BackupModalProps = {
  readonly counters: readonly Counter[]
  readonly onImport: (counters: readonly Counter[]) => void
  readonly onClose: () => void
}

export function BackupModal({ counters, onImport, onClose }: BackupModalProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function importFile(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }
    const imported = parseCounters(await file.text())
    if (imported === null) {
      setError(`${file.name} is not a counters backup.`)
      return
    }
    if (window.confirm(`Replace ${counters.length} counters with ${imported.length} from ${file.name}?`)) {
      onImport(imported)
    }
  }

  return (
    <Modal title="Backup" onClose={onClose}>
      <div className={styles.form}>
        <button type="button" onClick={() => downloadCounters(counters)}>
          Export
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(event) => void importFile(event)}
        />
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
