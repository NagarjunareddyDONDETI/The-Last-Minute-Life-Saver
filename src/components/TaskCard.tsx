import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { useState, type PointerEvent } from 'react'
import type { Task } from '../types'
import { useStore } from '../store/useStore'
import { CountdownLabel, CountdownRing } from './Countdown'
import { Chip, Icon, IconButton } from './ui'
import { isPanic } from '../lib/time'
import { useTicker } from '../hooks/useTicker'
import { draftFor } from '../lib/gemini'
import { generateGoogleCalendarUrl } from '../lib/gcal'

const quadrantLabel: Record<number, string> = {
  1: 'Do First',
  2: 'Schedule',
  3: 'Delegate',
  4: 'Backlog',
}

export default function TaskCard({ task, index }: { task: Task; index: number }) {
  const tick = useTicker()
  const { toggleTask, removeTask, autoDecompose, toggleStep, setFocusTask, setMode, settings, thinking } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [drafting, setDrafting] = useState(false)
  const [busy, setBusy] = useState(false)

  // Tilt-on-hover (3D rotateX/rotateY)
  const reduce = settings.reducedMotion
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], reduce ? [0, 0] : [8, -8]), { stiffness: 200, damping: 20 })
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], reduce ? [0, 0] : [-10, 10]), { stiffness: 200, damping: 20 })

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onLeave() {
    px.set(0)
    py.set(0)
  }

  const panic = !task.done && isPanic(task.deadline, tick, 60)
  const score = task.urgencyScore ?? 0
  const completedSteps = task.steps.filter((s) => s.done).length

  async function handleDecompose() {
    setBusy(true)
    await autoDecompose(task.id)
    setExpanded(true)
    setBusy(false)
  }

  async function handleDraft() {
    setDrafting(true)
    setExpanded(true)
    try {
      const d = await draftFor(task, settings)
      setDraft(d)
    } finally {
      setDrafting(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, rotateX: -12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.85, rotateY: 90 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26, delay: reduce ? 0 : index * 0.05 }}
      style={{ perspective: 1200 }}
      className="relative"
    >
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        animate={task.done ? { rotateY: reduce ? 0 : 360 } : {}}
        transition={{ duration: 0.7 }}
        className={`relative overflow-hidden rounded-xl border bg-white/[0.02] p-4 backdrop-blur-sm transition-colors ${
          panic ? 'border-red-500/50 shadow-glow-red' : 'border-white/10 hover:border-white/25'
        } ${task.done ? 'opacity-60' : ''}`}
      >
        {/* urgency accent bar */}
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{
            background: panic
              ? 'linear-gradient(#ef4444,#f97316)'
              : score > 75
              ? 'linear-gradient(#e935c1,#8b5cf6)'
              : score > 45
              ? 'linear-gradient(#8b5cf6,#3b82f6)'
              : 'linear-gradient(#3b82f6,#22d3ee)',
          }}
        />

        <div className="flex items-start gap-3">
          <CountdownRing deadline={task.deadline} createdAt={task.createdAt} done={task.done} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-display font-semibold leading-tight ${task.done ? 'text-white/50 line-through' : 'text-white'}`}>
                {task.title}
              </h3>
              {/* 3D flip toggle to complete */}
              <button
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? 'Reopen task' : 'Complete task'}
                className="perspective shrink-0"
              >
                <motion.span
                  className="grid h-8 w-8 place-items-center rounded-lg border preserve-3d"
                  animate={{ rotateY: task.done ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    borderColor: task.done ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.2)',
                    background: task.done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Icon name={task.done ? 'check' : 'radio_button_unchecked'} className="text-[18px]" fill={task.done} />
                </motion.span>
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-white/50">
                <Icon name="schedule" className="text-[14px]" />
                <CountdownLabel deadline={task.deadline} done={task.done} />
              </span>
              <Chip tone={task.importance}>{task.importance}</Chip>
              {task.quadrant && <Chip>{quadrantLabel[task.quadrant]}</Chip>}
              <span className="flex items-center gap-1 text-white/40">
                <Icon name="bolt" className="text-[14px]" />
                {task.estMinutes}m
              </span>
              {task.tags.map((t) => (
                <span key={t} className="text-white/30">#{t}</span>
              ))}
            </div>

            {/* urgency meter + score */}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  style={{
                    background: panic ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#3b82f6,#8b5cf6,#e935c1)',
                  }}
                />
              </div>
              <span className="w-10 text-right text-xs font-bold tabular-nums text-white/80">{score}</span>
            </div>

            {/* agent rationale — visible reasoning */}
            {task.rationale && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5">
                <Icon name="psychology" className="text-[15px] text-neon-violet" />
                <p className="text-[11px] leading-snug text-white/55">{task.rationale}</p>
              </div>
            )}

            {/* step progress */}
            {task.steps.length > 0 && (
              <button onClick={() => setExpanded((e) => !e)} className="mt-2 flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80">
                <Icon name={expanded ? 'expand_less' : 'expand_more'} className="text-[16px]" />
                {completedSteps}/{task.steps.length} micro-steps
              </button>
            )}

            {/* actions */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleDecompose}
                disabled={busy || thinking}
                className="inline-flex items-center gap-1 rounded-lg border border-neon-violet/30 bg-neon-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet-200 hover:bg-neon-violet/20 disabled:opacity-50"
              >
                <Icon name="auto_awesome" className="text-[14px]" />
                {busy ? 'Breaking down…' : 'Auto-decompose'}
              </button>
              <button
                onClick={handleDraft}
                disabled={drafting}
                className="inline-flex items-center gap-1 rounded-lg border border-neon-blue/30 bg-neon-blue/10 px-2.5 py-1 text-[11px] font-medium text-sky-200 hover:bg-neon-blue/20 disabled:opacity-50"
              >
                <Icon name="edit_note" className="text-[14px]" />
                {drafting ? 'Drafting…' : 'Draft for me'}
              </button>
              <button
                onClick={() => {
                  setFocusTask(task.id)
                  setMode('focus')
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/70 hover:text-white"
              >
                <Icon name="center_focus_strong" className="text-[14px]" />
                Focus
              </button>
              <a
                href={generateGoogleCalendarUrl(task)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-medium text-orange-200 hover:bg-orange-500/20"
                title="Add to Google Calendar"
              >
                <Icon name="calendar_month" className="text-[14px]" />
              </a>
              <IconButton name="delete" label="Delete" onClick={() => removeTask(task.id)} className="ml-auto h-7 w-7" />
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
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
                        <span className={`text-xs ${s.done ? 'text-white/40 line-through' : 'text-white/75'}`}>{s.title}</span>
                        <span className="ml-auto text-[10px] text-white/30">{s.estMinutes}m</span>
                      </li>
                    ))}
                  </ul>
                  {draft && (
                    <div className="mt-3 rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-3">
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-sky-200">
                        <Icon name="smart_toy" className="text-[14px]" /> Agent draft
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-white/75">{draft}</pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
