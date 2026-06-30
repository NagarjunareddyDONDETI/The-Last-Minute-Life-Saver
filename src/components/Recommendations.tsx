import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { summarizeBehavior, recommendations } from '../lib/behavior'
import { Icon, Reveal } from './ui'

/**
 * Personalized productivity recommendations derived from the user's tracked
 * behavior over time (completion rate, productive hours, lateness, weak tags).
 */
export default function Recommendations({ compact = false }: { compact?: boolean }) {
  const events = useStore((s) => s.events)
  const { recs, profile } = useMemo(() => {
    const p = summarizeBehavior(events)
    return { recs: recommendations(p), profile: p }
  }, [events])

  return (
    <Reveal className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon-violet/15 text-neon-violet">
            <Icon name="insights" className="text-[20px]" fill />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Personalized for you</h3>
            <p className="text-[11px] text-white/45">Learned from {profile.total} tracked task{profile.total === 1 ? '' : 's'}</p>
          </div>
        </div>
        {profile.total >= 2 && (
          <div className="hidden items-center gap-3 sm:flex">
            <Metric label="Done" value={`${Math.round(profile.completionRate * 100)}%`} color="#34d399" />
            <Metric label="On-time" value={`${Math.round(profile.onTimeRate * 100)}%`} color="#3b82f6" />
          </div>
        )}
      </div>

      <ul className="space-y-2">
        {(compact ? recs.slice(0, 2) : recs).map((r, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <Icon name="lightbulb" className="mt-0.5 text-[16px] text-amber-300" fill />
            <span className="text-xs leading-snug text-white/75">{r}</span>
          </motion.li>
        ))}
      </ul>
    </Reveal>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <div className="font-display text-base font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  )
}
