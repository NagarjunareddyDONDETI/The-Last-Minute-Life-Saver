import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import TaskCard from './TaskCard'
import Goals from './Goals'
import Recommendations from './Recommendations'
import { Icon, SectionTitle } from './ui'
import { useTicker } from '../hooks/useTicker'
import { isPanic } from '../lib/time'

function Stat({ icon, label, value, color, delay = 0 }: { icon: string; label: string; value: string | number; color: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 22 }}
      className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition-colors hover:border-white/20"
    >
      <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: color }} />
      <div className="grid h-11 w-11 place-items-center rounded-lg" style={{ background: `${color}1a`, color }}>
        <Icon name={icon} className="text-[22px]" fill />
      </div>
      <div>
        <div className="font-display text-2xl font-bold leading-none tracking-tight text-white tabular-nums">{value}</div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">{label}</div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const tick = useTicker()
  const { tasks } = useStore()

  const open = useMemo(
    () => tasks.filter((t) => !t.done).sort((a, b) => (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0) || a.deadline - b.deadline),
    [tasks]
  )
  const done = tasks.filter((t) => t.done)
  const panicCount = open.filter((t) => isPanic(t.deadline, tick, 60)).length
  const completedToday = done.filter((t) => {
    const s = new Date()
    s.setHours(0, 0, 0, 0)
    return (t.completedAt ?? 0) >= s.getTime()
  }).length

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon="format_list_bulleted" label="Open tasks" value={open.length} color="#3b82f6" delay={0} />
        <Stat icon="local_fire_department" label="Critical (<1h)" value={panicCount} color="#ef4444" delay={0.05} />
        <Stat icon="task_alt" label="Done today" value={completedToday} color="#34d399" delay={0.1} />
        <Stat icon="bolt" label="Top urgency" value={open[0]?.urgencyScore ?? 0} color="#e935c1" delay={0.15} />
      </div>

      <div className="mb-6">
        <Recommendations compact />
      </div>

      <SectionTitle icon="sort" sub="Ranked live by the agent — highest urgency first">
        Priority queue
      </SectionTitle>

      {open.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass flex flex-col items-center gap-3 rounded-3xl p-12 text-center"
        >
          <Icon name="rocket_launch" className="text-[48px] text-neon-violet" />
          <h3 className="font-display text-xl font-semibold text-white">All clear</h3>
          <p className="max-w-xs text-sm text-white/50">
            No open tasks. Hit the <span className="text-neon-pink">+</span> button to capture one — the agent will instantly
            score it and rebuild your rescue plan.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {open.map((t, i) => (
              <TaskCard key={t.id} task={t} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-8">
        <Goals />
      </div>

      {done.length > 0 && (
        <div className="mt-8">
          <SectionTitle icon="check_circle" sub={`${done.length} completed`}>
            Completed
          </SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {done.slice(0, 6).map((t, i) => (
                <TaskCard key={t.id} task={t} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
