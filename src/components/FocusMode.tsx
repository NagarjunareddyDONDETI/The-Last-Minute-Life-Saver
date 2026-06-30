import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import AgentOrb from './AgentOrb'
import { Icon, GhostButton, PrimaryPill } from './ui'
import { CountdownLabel } from './Countdown'

const DURATIONS = [
  { label: 'Pomodoro', mins: 25 },
  { label: 'Short', mins: 15 },
  { label: 'Deep', mins: 50 },
]

export default function FocusMode() {
  const { tasks, focusTaskId, setFocusTask, setMode, toggleTask, toggleStep } = useStore()
  const open = tasks.filter((t) => !t.done)
  const task = useMemo(() => tasks.find((t) => t.id === focusTaskId) ?? open[0], [tasks, focusTaskId, open])

  const [minutes, setMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setSecondsLeft(minutes * 60)
    setRunning(false)
  }, [minutes])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          try {
            new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=').play()
          } catch {}
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  if (!task) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <Icon name="center_focus_strong" className="text-[48px] text-white/30" />
        <p className="text-white/50">No task to focus on. Add one first.</p>
        <PrimaryPill icon="arrow_back" onClick={() => setMode('dashboard')}>
          Back to tasks
        </PrimaryPill>
      </div>
    )
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const pct = 1 - secondsLeft / (minutes * 60)

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center py-8">
      {/* 3D ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center opacity-40">
        <AgentOrb thinking={running} size={420} />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full">
        <div className="mb-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-neon-violet">Focus session</span>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">{task.title}</h1>
          <p className="mt-1 text-sm text-white/50">
            Deadline <CountdownLabel deadline={task.deadline} done={task.done} />
          </p>
        </div>

        {/* Timer ring */}
        <div className="relative mx-auto h-64 w-64">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#focusGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={2 * Math.PI * 90 * (1 - pct)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="0.5" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#e935c1" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-6xl font-bold tabular-nums text-white">
              {mm}:{ss}
            </span>
            <span className="text-xs uppercase tracking-widest text-white/40">{running ? 'in focus' : 'paused'}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {DURATIONS.map((d) => (
            <GhostButton key={d.mins} active={minutes === d.mins} onClick={() => setMinutes(d.mins)}>
              {d.label} {d.mins}m
            </GhostButton>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <PrimaryPill icon={running ? 'pause' : 'play_arrow'} onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : 'Start'}
          </PrimaryPill>
          <GhostButton icon="replay" onClick={() => setSecondsLeft(minutes * 60)}>
            Reset
          </GhostButton>
          <GhostButton icon="check" onClick={() => { toggleTask(task.id); setMode('dashboard') }}>
            Complete
          </GhostButton>
        </div>

        {task.steps.length > 0 && (
          <div className="glass mx-auto mt-6 max-w-md rounded-2xl p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">Micro-steps</p>
            <ul className="space-y-1.5">
              {task.steps.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStep(task.id, s.id)}
                    className={`grid h-5 w-5 place-items-center rounded-md border text-[12px] ${
                      s.done ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' : 'border-white/20 text-transparent'
                    }`}
                  >
                    <Icon name="check" className="text-[12px]" fill />
                  </button>
                  <span className={`text-sm ${s.done ? 'text-white/40 line-through' : 'text-white/75'}`}>{s.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-center">
          <GhostButton icon="arrow_back" onClick={() => setMode('dashboard')}>
            Exit focus
          </GhostButton>
        </div>
      </motion.div>
    </div>
  )
}
