import { motion } from 'framer-motion'
import {
  Radar,
  BrainCircuit,
  CalendarClock,
  RotateCcw,
  Play,
  Plus,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import AgentOrb from './AgentOrbLazy'
import { PrimaryPill, GhostButton } from './ui'

interface FeatureCard {
  eyebrow: string
  title: string
  text: string
  icon: React.ComponentType<{ className?: string }>
  colorClass: string
  bgClass: string
}

const FEATURES: FeatureCard[] = [
  {
    eyebrow: '01 · Triage',
    title: 'Perceives',
    text: 'Capture any task — the agent instantly scores its deadline urgency.',
    icon: Radar,
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-400/10',
  },
  {
    eyebrow: '02 · Reason',
    title: 'Reasons',
    text: 'Ranks everything by deadline pressure, effort, and true impact.',
    icon: BrainCircuit,
    colorClass: 'text-neon-violet',
    bgClass: 'bg-neon-violet/15',
  },
  {
    eyebrow: '03 · Plan',
    title: 'Plans',
    text: 'Builds a minute-by-minute rescue schedule to beat the clock.',
    icon: CalendarClock,
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-400/10',
  },
  {
    eyebrow: '04 · Adapt',
    title: 'Reflects',
    text: 'Reviews your day and learns what to change tomorrow.',
    icon: RotateCcw,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-400/10',
  },
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="glass-strong relative my-auto w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-7 text-center shadow-2xl"
      >
        {/* Ambient top glow */}
        <div className="pointer-events-none absolute -top-12 left-1/2 h-36 w-48 -translate-x-1/2 rounded-full bg-neon-violet/20 blur-3xl" />

        {/* Hero 3D Agent Orb */}
        <div className="relative mx-auto -mt-1 mb-2 flex justify-center">
          <AgentOrb size={96} />
        </div>

        {/* Hero Text */}
        <h1
          id="onboarding-title"
          className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Meet <span className="bg-neon-gradient bg-clip-text text-transparent">RESCUE</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/65 sm:text-sm">
          An agentic productivity companion that steps in when deadlines close in — perceiving, reasoning, planning, and
          acting so nothing slips.
        </p>

        {/* 4 Feature Cards */}
        <div className="mt-5 grid grid-cols-1 gap-2.5 text-left sm:grid-cols-2 sm:gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${f.bgClass} ${f.colorClass} shrink-0`}
                >
                  <f.icon className="size-4.5" />
                </span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-white/40">
                  {f.eyebrow}
                </span>
              </div>
              <div className="mt-2.5">
                <h3 className="font-display text-sm font-semibold tracking-tight text-white sm:text-[15px]">
                  {f.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {f.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <PrimaryPill
            icon={<Play className="size-4 shrink-0 fill-current text-white" />}
            onClick={() => start(true)}
            className="w-full sm:w-auto"
          >
            Try with demo tasks
          </PrimaryPill>
          <GhostButton
            icon={<Plus className="size-4 shrink-0 text-white/80" />}
            onClick={() => start(false)}
            className="w-full sm:w-auto"
          >
            Start empty
          </GhostButton>
        </div>
      </motion.div>
    </motion.div>
  )
}
