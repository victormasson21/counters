import { useEffect, useRef, type JSX, type ReactNode } from "react"
import styles from "./modal.module.css"

type ModalProps = {
  readonly title: string
  readonly onClose: () => void
  readonly children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={onClose}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </dialog>
  )
}
