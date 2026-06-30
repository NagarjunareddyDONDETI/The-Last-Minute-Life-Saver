import { motion } from 'framer-motion'
import type { AppMode } from '../types'
import { useStore } from '../store/useStore'
import { Icon } from './ui'

const TABS: { id: AppMode; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Tasks' },
  { id: 'planner', icon: 'calendar_view_day', label: 'Plan' },
  { id: 'autopilot', icon: 'auto_mode', label: 'Auto-Pilot' },
  { id: 'focus', icon: 'center_focus_strong', label: 'Focus' },
  { id: 'reflection', icon: 'self_improvement', label: 'Reflect' },
]

export default function TabBar() {
  const { mode, setMode } = useStore()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-3 md:left-1/2 md:bottom-6 md:w-auto md:-translate-x-1/2 md:px-0">
      <div className="glass-strong mx-auto flex max-w-md items-center justify-around gap-1 rounded-2xl p-1.5 shadow-glow md:max-w-none md:gap-2">
        {TABS.map((tab) => {
          const active = mode === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 md:flex-row md:flex-none md:gap-2 md:px-4"
              style={{ perspective: 600 }}
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-xl bg-neon-gradient opacity-90 shadow-glow"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  style={{ transformStyle: 'preserve-3d' }}
                />
              )}
              <motion.span
                animate={{ rotateY: active ? 360 : 0, scale: active ? 1.1 : 1 }}
                transition={{ duration: 0.5 }}
                className={`relative z-10 ${active ? 'text-white' : 'text-white/55'}`}
              >
                <Icon name={tab.icon} className="text-[22px]" fill={active} />
              </motion.span>
              <span className={`relative z-10 whitespace-nowrap text-[10px] font-medium leading-none md:text-xs ${active ? 'text-white' : 'text-white/55'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
