import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import AgentOrb from './AgentOrbLazy'
import { Icon, PrimaryPill } from './ui'
import { relative } from '../lib/time'

const phaseMeta: Record<string, { color: string; icon: string; label: string }> = {
  perceive: { color: '#22d3ee', icon: 'sensors', label: 'PERCEIVE' },
  reason: { color: '#8b5cf6', icon: 'psychology', label: 'REASON' },
  plan: { color: '#3b82f6', icon: 'calendar_view_day', label: 'PLAN' },
  act: { color: '#e935c1', icon: 'bolt', label: 'ACT' },
  reflect: { color: '#34d399', icon: 'self_improvement', label: 'REFLECT' },
}

export default function AgentPanel({ panic }: { panic: boolean }) {
  const { thoughts, thinking, replan, plan } = useStore()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Agent trigger — a contained, stable orb button (no drifting/blooming glow). */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="group fixed bottom-24 left-4 z-40 md:bottom-6 md:left-6"
        aria-label="Open RESCUE agent"
        title="RESCUE agent"
      >
        <span
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border transition-shadow duration-300"
          style={{
            borderColor: panic ? 'rgba(239,68,68,.55)' : 'rgba(139,92,246,.45)',
            background: 'rgba(10,11,25,.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: panic
              ? '0 0 18px rgba(239,68,68,.4)'
              : '0 0 16px rgba(139,92,246,.35)',
          }}
        >
          {/* orb is clipped to the circle so it can never drift outside the button */}
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <AgentOrb thinking={thinking} panic={panic} size={50} />
          </span>
        </span>

        {/* compact status dot instead of a large pulsing blob */}
        {thinking && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: panic ? '#ef4444' : '#a78bfa' }}
            />
            <span
              className="relative inline-flex h-3.5 w-3.5 rounded-full ring-2 ring-black/40"
              style={{ background: panic ? '#ef4444' : '#a78bfa' }}
            />
          </span>
        )}
        <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {thinking ? 'Agent is reasoning…' : 'Open agent'}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%', rotateY: 35, opacity: 0 }}
              animate={{ x: 0, rotateY: 0, opacity: 1 }}
              exit={{ x: '-100%', rotateY: 35, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              style={{ transformOrigin: 'left center' }}
              className="glass-strong fixed inset-y-0 left-0 z-50 flex w-[90vw] max-w-md flex-col p-5"
            >
              <div className="flex items-center gap-3">
                <AgentOrb thinking={thinking} panic={panic} size={64} />
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold text-white">RESCUE Agent</h2>
                  <p className="text-xs text-white/50">
                    {thinking ? 'Reasoning & planning…' : plan?.source === 'gemini' ? 'Powered by Gemini' : 'Local reasoning engine'}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
                  <Icon name="close" />
                </button>
              </div>

              {plan && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neon-violet">
                    <Icon name="tips_and_updates" className="text-[15px]" /> Current strategy
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">{plan.summary}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/40">Agent reasoning loop</span>
                <PrimaryPill icon="refresh" onClick={() => replan()} className="px-3 py-1.5 text-xs">
                  Re-plan
                </PrimaryPill>
              </div>

              <div className="scrollbar-thin mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {thoughts.length === 0 && (
                    <p className="mt-8 text-center text-sm text-white/40">
                      The agent's thinking will stream here as you add and complete tasks.
                    </p>
                  )}
                  {thoughts.map((th) => {
                    const meta = phaseMeta[th.phase]
                    return (
                      <motion.div
                        key={th.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
                      >
                        <span
                          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md"
                          style={{ background: `${meta.color}22`, color: meta.color }}
                        >
                          <Icon name={meta.icon} className="text-[15px]" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-wide" style={{ color: meta.color }}>
                              {meta.label}
                            </span>
                            <span className="text-[10px] text-white/30">{relative(th.at)}</span>
                          </div>
                          <p className="text-xs leading-snug text-white/75">{th.text}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
