import { useEffect, useRef, type JSX, type MouseEvent, type ReactNode } from "react"
import buttons from "./buttons.module.css"
import { CloseIcon } from "./icons"
import styles from "./sheet.module.css"

type SheetProps = {
  readonly title: string
  readonly compact?: boolean
  readonly onClose: () => void
  readonly children: ReactNode
}

export function Sheet({ title, compact = false, onClose, children }: SheetProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      dialog.focus()
    }
  }, [])

  function closeOnScrim(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-label={title}
      tabIndex={-1}
      onClose={onClose}
      onClick={closeOnScrim}
    >
      <div className={compact ? `${styles.body} ${styles.compact}` : styles.body}>
        <div className={styles.grabber} />
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={`${buttons.icon} ${styles.close}`} aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
