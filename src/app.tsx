import { useEffect, useState, type JSX } from "react"
import styles from "./app.module.css"
import { BackupModal } from "./backup-modal"
import type { Counter } from "./counter"
import { CounterCard } from "./counter-card"
import { SettingsModal } from "./settings-modal"
import { loadCounters, saveCounters } from "./storage"
import { useNow } from "./use-now"

const CENTISECOND_TICK_MS = 10
const SECOND_TICK_MS = 1_000

type ModalState =
  | { readonly kind: "settings"; readonly counter: Counter | null }
  | { readonly kind: "backup" }
  | null

export function App(): JSX.Element {
  const [counters, setCounters] = useState(loadCounters)
  const [modal, setModal] = useState<ModalState>(null)
  const showsCentiseconds = counters.some((counter) => counter.unit === "centiseconds")
  const now = useNow(showsCentiseconds ? CENTISECOND_TICK_MS : SECOND_TICK_MS)

  useEffect(() => saveCounters(counters), [counters])

  const closeModal = (): void => setModal(null)

  function saveCounter(saved: Counter): void {
    setCounters((current) =>
      current.some((counter) => counter.id === saved.id)
        ? current.map((counter) => (counter.id === saved.id ? saved : counter))
        : [...current, saved],
    )
    closeModal()
  }

  function deleteCounter(id: string): void {
    setCounters((current) => current.filter((counter) => counter.id !== id))
    closeModal()
  }

  function importCounters(imported: readonly Counter[]): void {
    setCounters(imported)
    closeModal()
  }

  return (
    <div className={styles.app}>
      <main className={styles.list}>
        {counters.length === 0 ? (
          <p className={styles.empty}>No counters yet. Tap Add to start one.</p>
        ) : (
          counters.map((counter) => (
            <CounterCard
              key={counter.id}
              counter={counter}
              now={now}
              onOpenSettings={() => setModal({ kind: "settings", counter })}
            />
          ))
        )}
      </main>
      <footer className={styles.footer}>
        <button type="button" className={styles.backup} onClick={() => setModal({ kind: "backup" })}>
          Backup
        </button>
        <button type="button" className={styles.add} onClick={() => setModal({ kind: "settings", counter: null })}>
          Add
        </button>
      </footer>
      {modal?.kind === "settings" && (
        <SettingsModal counter={modal.counter} onSave={saveCounter} onDelete={deleteCounter} onClose={closeModal} />
      )}
      {modal?.kind === "backup" && (
        <BackupModal counters={counters} onImport={importCounters} onClose={closeModal} />
      )}
    </div>
  )
}
