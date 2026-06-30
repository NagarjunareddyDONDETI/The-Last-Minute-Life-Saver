import { useEffect, useState } from 'react'

/** Global 1-second tick so countdowns update live across the app. */
export function useTicker(intervalMs = 1000) {
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return tick
}
