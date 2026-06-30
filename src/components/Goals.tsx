import { motion } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Icon, SectionTitle } from './ui'
import { startOfDay } from '../lib/time'

export default function Goals() {
  const { goals, addGoal, checkInGoal, removeGoal } = useStore()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const today = startOfDay()

  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionTitle icon="local_fire_department" sub="Build momentum with daily streaks">
          Goals & habits
        </SectionTitle>
        <button
          onClick={() => setAdding((a) => !a)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-white/70 hover:text-white"
        >
          <Icon name={adding ? 'close' : 'add'} className="text-[16px]" /> {adding ? 'Cancel' : 'New goal'}
        </button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) {
                addGoal(title, 30)
                setTitle('')
                setAdding(false)
              }
            }}
            placeholder="e.g. Write 500 words daily"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-neon-violet/60"
          />
          <button
            onClick={() => {
              if (title.trim()) {
                addGoal(title, 30)
                setTitle('')
                setAdding(false)
              }
            }}
            className="shimmer-pill rounded-xl px-4 text-sm font-semibold text-white"
          >
            Add
          </button>
        </motion.div>
      )}

      {goals.length === 0 ? (
        <p className="glass rounded-2xl p-5 text-center text-sm text-white/40">No goals yet. Add one to start a streak.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => {
            const checkedToday = g.lastCheckIn === today
            return (
              <motion.div
                key={g.id}
                layout
                whileHover={{ y: -3 }}
                className="glass relative overflow-hidden rounded-2xl p-4"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display font-semibold text-white">{g.title}</span>
                  <button onClick={() => removeGoal(g.id)} className="text-white/30 hover:text-red-300">
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <Icon name="local_fire_department" className="text-[28px] text-orange-400" fill />
                  <span className="font-display text-3xl font-bold gradient-text">{g.streak}</span>
                  <span className="mb-1 text-xs text-white/40">day streak</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-neon-gradient"
                    style={{ width: `${Math.min(100, (g.streak / g.target) * 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => checkInGoal(g.id)}
                  disabled={checkedToday}
                  className={`mt-3 w-full rounded-xl py-2 text-sm font-semibold transition ${
                    checkedToday
                      ? 'border border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                      : 'shimmer-pill text-white shadow-glow'
                  }`}
                >
                  {checkedToday ? '✓ Done today' : 'Check in'}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
