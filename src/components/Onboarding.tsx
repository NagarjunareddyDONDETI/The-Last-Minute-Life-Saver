import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import AgentOrb from './AgentOrbLazy'
import { Icon, PrimaryPill, GhostButton } from './ui'

const FEATURES = [
  { icon: 'sensors', title: 'Perceives', text: 'Capture any task — the agent instantly scores its urgency.' },
  { icon: 'psychology', title: 'Reasons', text: 'Ranks everything by deadline pressure, effort, and importance.' },
  { icon: 'calendar_view_day', title: 'Plans', text: 'Builds a minute-by-minute rescue schedule to beat the clock.' },
  { icon: 'self_improvement', title: 'Reflects', text: 'Reviews your day and learns what to change tomorrow.' },
]

export default function Onboarding() {
  const { setSettings, seedDemo } = useStore()

  const start = (demo: boolean) => {
    if (demo) seedDemo()
    setSettings({ onboarded: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="glass-strong relative w-full max-w-lg overflow-hidden rounded-3xl p-7 text-center"
      >
        <div className="mx-auto -mt-2 mb-1 flex justify-center">
          <AgentOrb size={132} />
        </div>

        <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
          Meet <span className="bg-neon-gradient bg-clip-text text-transparent">RESCUE</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          An agentic productivity companion that steps in when deadlines close in — perceiving, reasoning, planning, and
          acting so nothing slips.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="glass rounded-2xl p-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-neon-violet/15 text-neon-violet">
                <Icon name={f.icon} className="text-[20px]" fill />
              </span>
              <h3 className="mt-2 text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-xs leading-snug text-white/55">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <PrimaryPill icon="play_arrow" onClick={() => start(true)}>
            Try with demo tasks
          </PrimaryPill>
          <GhostButton icon="add" onClick={() => start(false)}>
            Start empty
          </GhostButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
