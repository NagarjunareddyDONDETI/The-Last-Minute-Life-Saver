import { countdown } from '../lib/time'
import { useTicker } from '../hooks/useTicker'

export function CountdownLabel({ deadline, done }: { deadline: number; done?: boolean }) {
  const tick = useTicker()
  if (done) return <span className="text-emerald-300">Completed</span>
  const c = countdown(deadline, tick)
  const cls = c.overdue
    ? 'text-red-400'
    : c.ms < 3_600_000
    ? 'text-orange-300'
    : c.ms < 86_400_000
    ? 'text-amber-300'
    : 'text-white/70'
  return (
    <span className={`tabular-nums font-medium ${cls}`}>
      {c.overdue ? `${c.label} overdue` : c.label}
    </span>
  )
}

export function CountdownRing({ deadline, createdAt, done }: { deadline: number; createdAt: number; done?: boolean }) {
  const tick = useTicker()
  const total = Math.max(1, deadline - createdAt)
  const elapsed = tick - createdAt
  const pct = Math.min(1, Math.max(0, elapsed / total))
  const r = 16
  const circ = 2 * Math.PI * r
  const c = countdown(deadline, tick)
  const color = done
    ? '#34d399'
    : c.overdue
    ? '#ef4444'
    : c.ms < 3_600_000
    ? '#fb923c'
    : '#a78bfa'
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={done ? 0 : circ * (1 - pct)}
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s' }}
      />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fill={color} fontWeight="700">
        {done ? '✓' : c.overdue ? '!' : `${Math.round(pct * 100)}`}
      </text>
    </svg>
  )
}
