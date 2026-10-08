import { isCounter, type Counter } from "./counter"
import { toLocalDate } from "./datetime"

const JSON_INDENT = 2

export function parseCounters(json: string): readonly Counter[] | null {
  try {
    const value: unknown = JSON.parse(json)
    return Array.isArray(value) && value.every(isCounter) ? value : null
  } catch (error) {
    if (error instanceof SyntaxError) {
      return null
    }
    throw error
  }
}

export function exportFileName(now: number): string {
  return `counters-${toLocalDate(now)}.json`
}

export function downloadCounters(counters: readonly Counter[]): void {
  const blob = new Blob([JSON.stringify(counters, null, JSON_INDENT)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = exportFileName(Date.now())
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}
