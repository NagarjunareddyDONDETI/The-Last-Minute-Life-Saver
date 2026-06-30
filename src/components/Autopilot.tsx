import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import AgentOrb from './AgentOrb'
import { Icon, PrimaryPill, GhostButton } from './ui'
import { fmtTime } from '../lib/time'

export default function Autopilot() {
  const { plan, replan, thinking, setMode, tasks } = useStore()
  const [approved, setApproved] = useState(false)
  const hasTasks = tasks.some((t) => !t.done)

  async function generate() {
    setApproved(false)
    await replan()
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-6 text-center">
        <div className="mx-auto flex justify-center">
          <AgentOrb thinking={thinking} size={140} />
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Auto-Pilot</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-white/55">
          Let the agent plan your entire day end-to-end. Review the proposed schedule, then approve with one tap.
        </p>

        {!plan || plan.blocks.length === 0 ? (
          <div className="mt-6">
            <PrimaryPill icon="auto_mode" onClick={generate} disabled={thinking || !hasTasks}>
              {thinking ? 'Planning your day…' : 'Generate my day'}
            </PrimaryPill>
            {!hasTasks && <p className="mt-3 text-xs text-white/40">Add a few tasks first so the agent has something to plan.</p>}
          </div>
        ) : (
          <div className="mt-5 text-left">
            <div className="rounded-2xl border border-neon-violet/20 bg-neon-violet/5 p-4">
              <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-neon-violet">
                <Icon name="strategy" className="text-[15px]" /> Proposed strategy
              </div>
              <p className="text-sm leading-relaxed text-white/80">{plan.summary}</p>
            </div>

            <div className="mt-4 space-y-2">
              {plan.blocks.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                >
                  <span className="w-24 shrink-0 text-xs tabular-nums text-white/50">
                    {fmtTime(b.start)}–{fmtTime(b.end)}
                  </span>
                  <Icon
                    name={b.kind === 'break' ? 'coffee' : 'bolt'}
                    className={`text-[18px] ${b.kind === 'break' ? 'text-neon-cyan' : 'text-neon-violet'}`}
                  />
                  <span className="text-sm text-white/85">{b.title}</span>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {approved ? (
                <motion.div
                  key="approved"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-center"
                >
                  <Icon name="verified" className="text-[36px] text-emerald-300" fill />
                  <p className="font-display font-semibold text-white">Day locked in. The agent will keep watch.</p>
                  <GhostButton icon="calendar_view_day" onClick={() => setMode('planner')}>
                    Open timeline
                  </GhostButton>
                </motion.div>
              ) : (
                <motion.div key="actions" className="mt-5 flex items-center justify-center gap-3">
                  <PrimaryPill icon="thumb_up" onClick={() => setApproved(true)}>
                    Approve plan
                  </PrimaryPill>
                  <GhostButton icon="refresh" onClick={generate} active={thinking}>
                    Regenerate
                  </GhostButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
