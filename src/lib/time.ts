export const MIN = 60_000
export const HOUR = 3_600_000
export const DAY = 86_400_000

export function now() {
  return Date.now()
}

export function startOfDay(ts: number = Date.now()) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface Countdown {
  ms: number
  overdue: boolean
  d: number
  h: number
  m: number
  s: number
  label: string
}

export function countdown(deadline: number, ref: number = Date.now()): Countdown {
  let ms = deadline - ref
  const overdue = ms < 0
  ms = Math.abs(ms)
  const d = Math.floor(ms / DAY)
  const h = Math.floor((ms % DAY) / HOUR)
  const m = Math.floor((ms % HOUR) / MIN)
  const s = Math.floor((ms % MIN) / 1000)
  let label: string
  if (d > 0) label = `${d}d ${h}h ${m}m`
  else if (h > 0) label = `${h}h ${m}m ${s}s`
  else label = `${m}m ${s}s`
  return { ms: deadline - ref, overdue, d, h, m, s, label }
}

/** true when a non-done task is within `mins` of its deadline (or overdue) */
export function isPanic(deadlineMs: number, ref: number = Date.now(), mins = 60) {
  const diff = deadlineMs - ref
  return diff <= mins * MIN
}

export function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function fmtDateTimeLocal(ts: number) {
  // for <input type="datetime-local">
  const d = new Date(ts - new Date().getTimezoneOffset() * MIN)
  return d.toISOString().slice(0, 16)
}

export function relative(ts: number, ref = Date.now()) {
  const diff = ts - ref
  const abs = Math.abs(diff)
  const suffix = diff < 0 ? 'ago' : ''
  const prefix = diff >= 0 ? 'in' : ''
  let v: string
  if (abs < HOUR) v = `${Math.round(abs / MIN)}m`
  else if (abs < DAY) v = `${Math.round(abs / HOUR)}h`
  else v = `${Math.round(abs / DAY)}d`
  return `${prefix} ${v} ${suffix}`.trim()
}
