import type { JSX, ReactNode } from "react"

type IconProps = {
  readonly size?: number
  readonly strokeWidth?: number
  readonly children: ReactNode
}

const DEFAULT_SIZE = 20
const DEFAULT_STROKE = 1.8

function Icon({ size = DEFAULT_SIZE, strokeWidth = DEFAULT_STROKE, children }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function MoreIcon(): JSX.Element {
  return (
    <Icon size={22}>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </Icon>
  )
}

export function PencilIcon(): JSX.Element {
  return (
    <Icon>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </Icon>
  )
}

export function PlusIcon(): JSX.Element {
  return (
    <Icon strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
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
