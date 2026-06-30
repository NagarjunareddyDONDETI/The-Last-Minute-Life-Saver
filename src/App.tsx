import { useEffect, useMemo, useState, type PointerEvent } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useStore } from './store/useStore'
import { useTicker } from './hooks/useTicker'
import { isPanic } from './lib/time'
import { hasKey } from './lib/gemini'

import Dashboard from './components/Dashboard'
import Planner from './components/Planner'
import Autopilot from './components/Autopilot'
import FocusMode from './components/FocusMode'
import Reflection from './components/Reflection'
import AgentPanel from './components/AgentPanel'
import AgentOrb from './components/AgentOrbLazy'
import TabBar from './components/TabBar'
import AddTaskFAB from './components/AddTaskFAB'
import Onboarding from './components/Onboarding'
import SettingsSheet from './components/SettingsSheet'
import NudgeCenter from './components/NudgeCenter'
import RescueOverlay from './components/RescueOverlay'
import Landing from './components/Landing'
import VibeVoiceButton from './components/VibeVoiceButton'
import { Icon } from './components/ui'

const VIEWS = {
  dashboard: Dashboard,
  planner: Planner,
  autopilot: Autopilot,
  focus: FocusMode,
  reflection: Reflection,
} as const

export default function App() {
  const tick = useTicker()
  const { tasks, mode, thinking, settings, syncMissed, entered } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Panic = any open task within 60 minutes of (or past) its deadline.
  const panic = useMemo(
    () => tasks.some((t) => !t.done && isPanic(t.deadline, tick, 60)),
    [tasks, tick]
  )

  // Reflect mode in browser tab title while panicking so it nags from the taskbar.
  useEffect(() => {
    document.title = panic
      ? '⚠️ RESCUE — deadline closing in'
      : 'RESCUE — The Last-Minute Life Saver'
  }, [panic])

  // Catch up on any deadlines that slipped while the app was closed.
  useEffect(() => {
    syncMissed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pointer-driven parallax for the ambient background layers.
  const reduce = settings.reducedMotion
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const layer1X = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [-40, 40])
  const layer1Y = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [-30, 30])
  const layer2X = useTransform(sx, [-0.5, 0.5], reduce ? [0, 0] : [50, -50])
  const layer2Y = useTransform(sy, [-0.5, 0.5], reduce ? [0, 0] : [40, -40])

  function onPointerMove(e: PointerEvent) {
    mx.set(e.clientX / window.innerWidth - 0.5)
    my.set(e.clientY / window.innerHeight - 0.5)
  }

  const View = VIEWS[mode] ?? Dashboard

  // Landing screen gates the app on first load (session-only).
  if (!entered) return <Landing />

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden" onPointerMove={onPointerMove}>
      {/* ambient background glow — parallax layers */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div
          style={{ x: layer1X, y: layer1Y }}
          className="absolute -left-24 top-[-10%] h-[42vh] w-[42vh] rounded-full bg-neon-violet/25 blur-[120px]"
        />
        <motion.div
          style={{ x: layer2X, y: layer2Y }}
          className="absolute right-[-10%] top-[20%] h-[38vh] w-[38vh] rounded-full bg-neon-magenta/20 blur-[120px]"
        />
        <AnimatePresence>
          {panic && (
            <motion.div
              key="panic-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/10"
              style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* header — mission-control bar */}
      <header className="sticky top-0 z-20 px-4 pt-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-background/70 px-3.5 py-2.5 backdrop-blur-xl md:gap-4 md:px-4">
          <span
            className="h-9 w-1 shrink-0 rounded-full"
            style={{
              background: panic
                ? 'linear-gradient(#ef4444,#f97316)'
                : 'linear-gradient(#3b82f6,#8b5cf6,#e935c1)',
            }}
          />
          <div className="-my-3 shrink-0">
            <AgentOrb thinking={thinking} panic={panic} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-bold leading-none tracking-tight text-white md:text-xl">
              RESCUE
            </h1>
            <p className="mt-1.5 truncate font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/45">
              {panic
                ? '⚠ deadline pressure — triaging now'
                : thinking
                ? 'reasoning & planning…'
                : 'standing by · monitoring deadlines'}
            </p>
          </div>

          <span
            className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider sm:inline-flex ${
              hasKey(settings)
                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                : 'border-white/15 bg-white/5 text-white/55'
            }`}
          >
            <Icon name={hasKey(settings) ? 'bolt' : 'memory'} className="text-[15px]" fill />
            {hasKey(settings) ? 'gemini' : 'local engine'}
          </span>

          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:border-white/25 hover:text-white"
          >
            <Icon name="settings" className="text-[20px]" />
          </button>
        </div>
      </header>

      {/* main view — 3D depth page transitions (z-axis push + rotateY) */}
      <main className="px-4 pb-32 pt-5 md:px-8" style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, z: -260, rotateY: reduce ? 0 : -18, scale: 0.94 }}
            animate={{ opacity: 1, z: 0, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, z: -200, rotateY: reduce ? 0 : 16, scale: 0.92 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d', transformPerspective: 1600 }}
          >
            <View />
          </motion.div>
        </AnimatePresence>
      </main>

      <NudgeCenter />
      <RescueOverlay />
      <AgentPanel panic={panic} />
      <AddTaskFAB />
      <VibeVoiceButton />
      <TabBar />

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {!settings.onboarded && <Onboarding />}
    </div>
  )
}
