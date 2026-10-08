import { useEffect, useRef, useState, type JSX } from "react"
import styles from "./app.module.css"
import { BackupSheet } from "./backup-sheet"
import buttons from "./buttons.module.css"
import type { Counter } from "./counter"
import { CounterCard } from "./counter-card"
import { CounterSheet } from "./counter-sheet"
import { EmptyState } from "./empty-state"
import { TICK_MS } from "./format"
import { MoreIcon, PlusIcon } from "./icons"
import { paletteAfter } from "./palettes"
import { loadCounters, saveCounters } from "./storage"
import { useNow } from "./use-now"

const MENU_ID = "app-menu"

type SheetState =
  | { readonly kind: "counter"; readonly counter: Counter | null }
  | { readonly kind: "backup" }
  | null

export function App(): JSX.Element {
  const [counters, setCounters] = useState(loadCounters)
  const [sheet, setSheet] = useState<SheetState>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const now = useNow(Math.min(...counters.map((counter) => TICK_MS[counter.precision]), TICK_MS.days))

  useEffect(() => saveCounters(counters), [counters])

  const closeSheet = (): void => setSheet(null)

  function saveCounter(saved: Counter): void {
    setCounters((current) =>
      current.some((counter) => counter.id === saved.id)
        ? current.map((counter) => (counter.id === saved.id ? saved : counter))
        : [saved, ...current],
    )
    closeSheet()
  }

  function deleteCounter(id: string): void {
    setCounters((current) => current.filter((counter) => counter.id !== id))
    closeSheet()
  }

  function importCounters(imported: readonly Counter[]): void {
    setCounters(imported)
    closeSheet()
  }

  function openBackup(): void {
    menuRef.current?.hidePopover()
    setSheet({ kind: "backup" })
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Counters</h1>
        <button
          type="button"
          className={`${buttons.icon} ${styles.menuButton}`}
          aria-label="Backup and settings"
          popoverTarget={MENU_ID}
        >
          <MoreIcon />
        </button>
        <div ref={menuRef} id={MENU_ID} popover="auto" className={styles.menu}>
          <button type="button" className={styles.menuItem} onClick={openBackup}>
            Backup
          </button>
        </div>
      </header>
      <main className={styles.list}>
        {counters.length === 0 ? (
          <EmptyState />
        ) : (
          counters.map((counter) => (
            <CounterCard
              key={counter.id}
              counter={counter}
              now={now}
              onEdit={() => setSheet({ kind: "counter", counter })}
            />
          ))
        )}
      </main>
      <footer className={styles.footer}>
        <button
          type="button"
          className={`${buttons.primary} ${styles.add}`}
          onClick={() => setSheet({ kind: "counter", counter: null })}
        >
          <PlusIcon />
          New counter
        </button>
      </footer>
      {sheet?.kind === "counter" && (
        <CounterSheet
          counter={sheet.counter}
          defaultPalette={paletteAfter(counters[0]?.palette)}
          onSave={saveCounter}
          onDelete={deleteCounter}
          onClose={closeSheet}
        />
      )}
      {sheet?.kind === "backup" && (
        <BackupSheet counters={counters} onImport={importCounters} onClose={closeSheet} />
      )}
    </div>
  )
}
