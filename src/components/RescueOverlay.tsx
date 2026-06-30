import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { useTicker } from '../hooks/useTicker'
import { isPanic } from '../lib/time'
import { CountdownLabel } from './Countdown'
import AgentOrb from './AgentOrbLazy'
import { Icon } from './ui'
import { MIN } from '../lib/time'

/**
 * Panic / Rescue Mode takeover. When any task enters the danger window the
 * agent "takes charge": it dims everything, surfaces the SINGLE most critical
 * task, the one next action to take, and a live countdown. Dismissible and
 * snoozeable so it never becomes noise.
 */
export default function RescueOverlay() {
  const tick = useTicker()
  const { tasks, autoDecompose, setFocusTask, setMode, thinking } = useStore()
  const [snoozeUntil, setSnoozeUntil] = useState(0)
  const [dismissedId, setDismissedId] = useState<string | null>(null)

  // The single most critical open task in the panic window.
  const critical = useMemo(() => {
    const danger = tasks
      .filter((t) => !t.done && isPanic(t.deadline, tick, 60))
      .sort((a, b) => (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0) || a.deadline - b.deadline)
    return danger[0] ?? null
  }, [tasks, tick])

  // Reset dismissal when a *different* task becomes the critical one.
  useEffect(() => {
    if (critical && dismissedId && critical.id !== dismissedId) setDismissedId(null)
  }, [critical, dismissedId])

  const snoozed = tick < snoozeUntil
  const show = !!critical && critical.id !== dismissedId && !snoozed

  if (!critical) return null

  const minutesLeft = Math.round((critical.deadline - tick) / MIN)
  const nextStep = critical.steps.find((s) => !s.done)?.title

  function focusNow() {
    setFocusTask(critical!.id)
    setMode('focus')
    setDismissedId(critical!.id)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[58] grid place-items-center p-4"
        >
          {/* red emergency backdrop */}
          <motion.div
            className="absolute inset-0 bg-red-950/40 backdrop-blur-md"
            style={{ animation: 'pulseGlow 2.4s ease-in-out infinite' }}
          />

          <motion.div
            initial={{ scale: 0.85, y: 30, rotateX: -18, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotateX: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            style={{ transformPerspective: 1200 }}
            className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-center shadow-glow-red ring-1 ring-red-500/50"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />

            <div className="mx-auto -mt-1 flex justify-center">
              <AgentOrb thinking panic size={104} />
            </div>

            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-400" /> Rescue mode — agent in charge
            </span>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-white/50">
              Drop everything. One thing matters right now:
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-white">{critical.title}</h1>

            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2">
              <Icon name="timer" className="text-[20px] text-red-300" fill />
              <span className="font-display text-lg font-bold tabular-nums text-red-200">
                <CountdownLabel deadline={critical.deadline} />
              </span>
            </div>

            {/* The single next action */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neon-violet">
                <Icon name="bolt" className="text-[15px]" fill /> Your next action
              </div>
              {nextStep ? (
                <p className="text-sm leading-snug text-white/85">{nextStep}</p>
              ) : (
                <div>
                  <p className="text-sm leading-snug text-white/70">
                    {minutesLeft <= 0
                      ? "It's overdue — do the smallest possible version and ship it."
                      : `Only ~${minutesLeft}m left. Let me break this into a first step you can start instantly.`}
                  </p>
                  <button
                    onClick={() => autoDecompose(critical.id)}
                    disabled={thinking}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg border border-neon-violet/40 bg-neon-violet/15 px-2.5 py-1 text-[11px] font-semibold text-violet-200 disabled:opacity-50"
                  >
                    <Icon name="auto_awesome" className="text-[14px]" />
                    {thinking ? 'Breaking it down…' : 'Break it down for me'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={focusNow}
                className="shimmer-pill flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-glow"
              >
                <Icon name="center_focus_strong" /> Start focusing now
              </button>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setSnoozeUntil(Date.now() + 5 * MIN)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white"
                >
                  Snooze 5m
                </button>
                <button
                  onClick={() => setDismissedId(critical.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 hover:text-white"
                >
                  I'm on it
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
