import type { JSX, ReactNode } from "react"

type IconProps = {
  readonly size?: number
  readonly strokeWidth?: number
  readonly children: ReactNode
}

const DEFAULT_SIZE = 20
const DEFAULT_STROKE = 2.2

function Icon({ size = DEFAULT_SIZE, strokeWidth = DEFAULT_STROKE, children }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function MenuIcon(): JSX.Element {
  return (
    <Icon size={22} strokeWidth={2.4}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  )
}

export function PencilIcon(): JSX.Element {
  return (
    <Icon size={18}>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    </Icon>
  )
}

/** The plus in a red dot, used on the New counter button. */
export function AddDot(): JSX.Element {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="11" fill="var(--red)" />
      <path d="M11 6v10M6 11h10" stroke="var(--paper)" strokeWidth="2.2" />
    </svg>
  )
}

/** Blue circle, red square, yellow triangle: the header mark. */
export function ShapesMark(): JSX.Element {
  return (
    <svg width="51" height="14" viewBox="0 0 51 14" aria-hidden="true">
      <circle cx="7" cy="7" r="7" fill="var(--blue)" />
      <rect x="18" y="1" width="13" height="13" fill="var(--red)" />
      <path d="M43.5 0L51 14H36Z" fill="var(--yellow)" />
    </svg>
  )
}

export function CloseIcon(): JSX.Element {
  return (
    <Icon>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  )
}

export function BinIcon(): JSX.Element {
  return (
    <Icon>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </Icon>
  )
}

export function RestartIcon(): JSX.Element {
  return (
    <Icon size={18}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4h4" />
    </Icon>
  )
}
