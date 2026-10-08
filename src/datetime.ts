export function pad(value: number): string {
  return String(value).padStart(2, "0")
}

export function toLocalDate(ms: number): string {
  const date = new Date(ms)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toLocalTime(ms: number): string {
  const date = new Date(ms)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function toLocalInputValue(ms: number): string {
  return `${toLocalDate(ms)}T${toLocalTime(ms)}`
}

export function startFromInput(value: string, previous: number): number {
  return value === toLocalInputValue(previous) ? previous : new Date(value).getTime()
}
