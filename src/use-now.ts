import { useEffect, useState } from "react"

export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const tick = (): void => {
      if (!document.hidden) {
        setNow(Date.now())
      }
    }
    const timer = setInterval(tick, intervalMs)
    document.addEventListener("visibilitychange", tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [intervalMs])

  return now
}
