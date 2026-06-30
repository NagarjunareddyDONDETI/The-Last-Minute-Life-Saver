import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import Recommendations from './Recommendations'
import { Icon, SectionTitle, PrimaryPill } from './ui'
import { fmtTime } from '../lib/time'

function List({
  icon,
  color,
  title,
  items,
  empty,
}: {
  icon: string
  color: string
  title: string
  items: string[]
  empty: string
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${color}1f`, color }}>
          <Icon name={icon} className="text-[18px]" fill />
        </span>
        <h3 className="font-display text-sm font-semibold text-white">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-2 text-sm leading-snug text-white/80"
            >
              <span style={{ color }}>•</span>
              <span>{it}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Reflection() {
  const { reflection, reflect, thinking } = useStore()

  return (
    <div className="mx-auto w-full max-w-3xl">
      <SectionTitle icon="self_improvement" sub="The agent reviews your day and learns for tomorrow">
        Daily reflection
      </SectionTitle>

      <div className="mb-5">
        <Recommendations />
      </div>

      {!reflection ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass flex flex-col items-center gap-4 rounded-3xl p-12 text-center"
        >
          <Icon name="auto_awesome" className="text-[48px] text-neon-violet" />
          <h3 className="font-display text-xl font-semibold text-white">No reflection yet</h3>
          <p className="max-w-sm text-sm text-white/50">
            Ask the agent to review everything you tackled today. It surfaces wins, what slipped, and a focused plan for
            tomorrow.
          </p>
          <PrimaryPill icon="psychology" onClick={() => reflect()} disabled={thinking}>
            {thinking ? 'Reflecting…' : 'Reflect on today'}
          </PrimaryPill>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40">
              Generated {fmtTime(reflection.at)} ·{' '}
              {reflection.source === 'gemini' ? 'Gemini' : 'Local engine'}
            </p>
            <PrimaryPill icon="refresh" onClick={() => reflect()} disabled={thinking} className="px-3 py-1.5 text-xs">
              {thinking ? 'Reflecting…' : 'Refresh'}
            </PrimaryPill>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-neon-violet/30 bg-neon-violet/10 p-4"
          >
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neon-violet">
              <Icon name="tips_and_updates" className="text-[15px]" /> Key insight
            </div>
            <p className="text-sm leading-relaxed text-white/85">{reflection.insight}</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            <List icon="emoji_events" color="#34d399" title="Wins" items={reflection.wins} empty="No wins logged yet." />
            <List icon="schedule" color="#fb923c" title="Slipped" items={reflection.missed} empty="Nothing slipped — nice." />
          </div>

          <List
            icon="wb_sunny"
            color="#3b82f6"
            title="Plan for tomorrow"
            items={reflection.tomorrow}
            empty="No suggestions yet."
          />
        </div>
      )}
    </div>
  )
}
