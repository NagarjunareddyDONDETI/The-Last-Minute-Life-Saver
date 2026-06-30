import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { useTicker } from '../hooks/useTicker'
import { nudgeFor } from '../lib/gemini'
import { Icon } from './ui'
import { MIN } from '../lib/time'

interface Toast {
  id: string
  taskId: string
  title: string
  text: string
  tone: 'gentle' | 'assertive' | 'urgent' | 'overdue'
  minutesLeft: number
}

// Escalation thresholds (minutes before deadline). 0 = overdue.
const THRESHOLDS = [120, 60, 30, 10, 0]

function toneFor(min: number): Toast['tone'] {
  if (min <= 0) return 'overdue'
  if (min < 30) return 'urgent'
  if (min < 120) return 'assertive'
  return 'gentle'
}

const toneStyle: Record<Toast['tone'], { ring: string; icon: string; chip: string }> = {
  gentle: { ring: 'ring-neon-blue/40', icon: 'notifications', chip: 'text-sky-300' },
  assertive: { ring: 'ring-neon-violet/50', icon: 'priority_high', chip: 'text-violet-300' },
  urgent: { ring: 'ring-orange-400/60', icon: 'local_fire_department', chip: 'text-orange-300' },
  overdue: { ring: 'ring-red-500/70', icon: 'warning', chip: 'text-red-300' },
}

/**
 * Watches open tasks and surfaces context-aware nudges with an escalating tone
 * as each deadline approaches (gentle → assertive → urgent → overdue). Each
 * task fires at most once per threshold. Also records misses for learning.
 */
export default function NudgeCenter() {
  const tick = useTicker(5000) // 5s cadence is plenty for nudges
  const { tasks, settings, setFocusTask, setMode, syncMissed } = useStore()
  const [toasts, setToasts] = useState<Toast[]>([])
  const fired = useRef<Set<string>>(new Set())
  const inFlight = useRef(false)

  useEffect(() => {
    syncMissed()
    if (inFlight.current) return

    const open = tasks.filter((t) => !t.done)
    for (const task of open) {
      const minutesLeft = (task.deadline - tick) / MIN
      // smallest threshold the task has crossed
      const crossed = THRESHOLDS.filter((th) => minutesLeft <= th).sort((a, b) => b - a)[0]
      if (crossed === undefined) continue
      const key = `${task.id}:${crossed}`
      if (fired.current.has(key)) continue
      fired.current.add(key)

      inFlight.current = true
      nudgeFor(task, settings, minutesLeft)
        .then((text) => {
          setToasts((prev) => [
            {
              id: key,
              taskId: task.id,
              title: task.title,
              text,
              tone: toneFor(minutesLeft),
              minutesLeft: Math.round(minutesLeft),
            },
            ...prev,
          ].slice(0, 3))
        })
        .finally(() => {
          inFlight.current = false
        })
      break // one nudge per cycle keeps it calm
    }
  }, [tick, tasks, settings, syncMissed])

  // auto-dismiss after a while
  useEffect(() => {
    if (!toasts.length) return
    const id = setTimeout(() => setToasts((p) => p.slice(0, -1)), 9000)
    return () => clearTimeout(id)
  }, [toasts])

  function dismiss(id: string) {
    setToasts((p) => p.filter((t) => t.id !== id))
  }

  function act(t: Toast) {
    setFocusTask(t.taskId)
    setMode('focus')
    dismiss(t.id)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[55] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = toneStyle[t.tone]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -40, rotateX: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              style={{ transformPerspective: 800 }}
              className={`glass-strong pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl p-3 shadow-glow ring-1 ${s.ring}`}
            >
              <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 ${s.chip}`}>
                <Icon name={s.icon} className="text-[20px]" fill />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${s.chip}`}>
                    {t.tone === 'overdue' ? 'Overdue' : t.minutesLeft <= 0 ? 'Now' : `${t.minutesLeft}m left`}
                  </span>
                  <span className="truncate text-[11px] text-white/40">{t.title}</span>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-white/85">{t.text}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => act(t)}
                    className="inline-flex items-center gap-1 rounded-lg bg-neon-gradient px-2.5 py-1 text-[11px] font-semibold text-white shadow-glow"
                  >
                    <Icon name="center_focus_strong" className="text-[14px]" /> Focus now
                  </button>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="rounded-lg px-2 py-1 text-[11px] font-medium text-white/50 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
