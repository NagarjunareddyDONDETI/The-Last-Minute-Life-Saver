import { motion } from 'framer-motion'
import {
  Radar,
  Brain,
  CalendarClock,
  Zap,
  RotateCcw,
  Mic,
  Flame,
  TrendingUp,
  ScissorsLineDashed,
  ArrowUpRight,
  CircleDot,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import AgentOrb from './AgentOrbLazy'
import DisplayCards from './ui/display-cards'

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { type: 'spring', stiffness: 200, damping: 26 },
} as const

/* Mono label like [ 01 / PERCEIVE ] used throughout the dossier identity */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-neon-violet/90">
      {children}
    </span>
  )
}

const LOOP = [
  { k: '01', t: 'PERCEIVE', d: 'Captures every task by voice or text and scores it on sight.', Icon: Radar, c: '#22d3ee' },
  { k: '02', t: 'REASON', d: 'Weighs deadline pressure, effort and importance into one score.', Icon: Brain, c: '#8b5cf6' },
  { k: '03', t: 'PLAN', d: 'Lays out an hour-by-hour rescue route with protected focus blocks.', Icon: CalendarClock, c: '#3b82f6' },
  { k: '04', t: 'ACT', d: 'Drafts, decomposes and nudges — it does the first move for you.', Icon: Zap, c: '#e935c1' },
  { k: '05', t: 'REFLECT', d: 'Reviews the day and rewrites tomorrow around how you actually work.', Icon: RotateCcw, c: '#34d399' },
]

const CAPS = [
  { Icon: Flame, t: 'Rescue Mode', d: 'Under an hour to a deadline, the agent seizes the wheel and shows the one action that matters.' },
  { Icon: TrendingUp, t: 'Live triage', d: 'Eisenhower + urgency scoring re-rank the queue the instant anything moves.' },
  { Icon: Brain, t: 'Knows your habits', d: 'Learns your sharpest hours and on-time rate, then bends every plan to fit.' },
  { Icon: ScissorsLineDashed, t: 'Breaks it down', d: 'Vague task in, 4–6 concrete first steps out — plus a drafted opener.' },
  { Icon: Mic, t: 'Talk to it', d: 'Speak a task; it lands scored, scheduled and ready.' },
  { Icon: CalendarClock, t: 'Timeline + grid', d: 'Your rescue plan as a timeline or a real day-grid calendar.' },
]

export default function Landing() {
  const { setEntered, seedDemo } = useStore()
  const enter = (demo: boolean) => {
    if (demo) seedDemo()
    setEntered(true)
  }

  // DisplayCards configured as a live "critical queue" dossier
  const queueCards = [
    {
      icon: <Flame className="size-4 text-red-300" />,
      title: 'CRITICAL',
      description: 'Email professor — extension',
      date: '47m left · urgency 98',
      iconClassName: 'text-red-400',
      titleClassName: 'text-red-300',
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Zap className="size-4 text-amber-300" />,
      title: 'HIGH',
      description: 'Finish client slide deck',
      date: '3h left · urgency 86',
      iconClassName: 'text-amber-400',
      titleClassName: 'text-amber-300',
      className:
        "[grid-area:stack] translate-x-16 translate-y-12 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Brain className="size-4 text-violet-300" />,
      title: 'PLANNED',
      description: 'Study chapter 7 for exam',
      date: '5h left · urgency 61',
      iconClassName: 'text-violet-400',
      titleClassName: 'text-violet-300',
      className: '[grid-area:stack] translate-x-32 translate-y-24 hover:translate-y-12',
    },
  ]

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-background">
      {/* engineered grid + aurora backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%,#000 40%,transparent 85%)',
          }}
        />
        <div className="absolute -left-24 top-[-10%] h-[44vh] w-[44vh] rounded-full bg-neon-blue/20 blur-[130px]" />
        <div className="absolute right-[-12%] top-[6%] h-[40vh] w-[40vh] rounded-full bg-neon-magenta/15 blur-[130px]" />
      </div>

      {/* status ticker — mission control vibe */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 font-mono text-[11px] tracking-wide text-white/55 md:px-8">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CircleDot className="size-3 animate-pulse" /> SYSTEM ONLINE
          </span>
          <span className="text-white/20">/</span>
          <span>AGENT: ACTIVE</span>
          <span className="text-white/20">/</span>
          <span className="text-red-300">3 DEADLINES TRACKED</span>
          <span className="ml-auto hidden md:inline text-white/35">v1.0 · GEMINI CORE</span>
        </div>
      </div>

      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
          <div className="-my-2 shrink-0">
            <AgentOrb size={44} />
          </div>
          <motion.span
            className="font-display text-xl font-bold tracking-tight text-white"
            aria-label="RESCUE"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } } }}
          >
            {'RESCUE'.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: '0.5em', rotateX: -70 },
                  show: { opacity: 1, y: 0, rotateX: 0 },
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                style={{ transformOrigin: 'bottom' }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
          <button
            onClick={() => enter(false)}
            className="group ml-auto inline-flex items-center gap-2 rounded-none border border-white/20 px-5 py-2.5 font-mono text-[12px] uppercase tracking-widest text-white transition-colors hover:border-neon-violet hover:bg-neon-violet/10"
          >
            Launch
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </header>

      {/* HERO — asymmetric dossier */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 md:grid-cols-[1.05fr_1fr] md:px-8 md:pt-24">
        <motion.div {...reveal}>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-neon-violet" />
            <Tag>[ Brief 01 · The Problem ]</Tag>
          </div>
          <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-white md:text-[5.2rem]">
            Deadlines
            <br />
            don't wait.
            <br />
            <span className="bg-neon-gradient bg-clip-text text-transparent">Neither does RESCUE.</span>
          </h1>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/60">
            RESCUE isn't a reminder you'll swipe away. It's an autonomous agent that reads the clock, ranks the chaos,
            builds the plan, and makes the first move — so the work is done before time runs out.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={() => enter(true)}
              className="shimmer-pill inline-flex items-center gap-2 rounded-none px-7 py-4 font-mono text-[13px] font-semibold uppercase tracking-widest text-white shadow-glow"
            >
              <Zap className="size-4" /> Deploy with demo
            </button>
            <button
              onClick={() => enter(false)}
              className="inline-flex items-center gap-2 rounded-none border border-white/15 px-6 py-4 font-mono text-[13px] uppercase tracking-widest text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              Start clean
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[11px] text-white/40">
            <span>► RUNS IN BROWSER</span>
            <span>► VOICE-ENABLED</span>
            <span>► POWERED BY GEMINI</span>
          </div>
        </motion.div>

        {/* DisplayCards stack = live critical queue */}
        <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.12 }} className="flex justify-center md:justify-end">
          <div className="w-full max-w-md scale-90 md:scale-100">
            <div className="mb-10 ml-auto flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
              <CircleDot className="size-3 text-red-400" /> live priority queue
            </div>
            <DisplayCards cards={queueCards} />
          </div>
        </motion.div>
      </section>

      {/* metrics rail */}
      <section className="mx-auto mt-24 max-w-6xl px-4 md:px-8">
        <motion.div {...reveal} className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 md:grid-cols-4">
          {[
            ['05', 'agent phases / task'],
            ['<1s', 'live re-prioritization'],
            ['0–100', 'urgency scoring'],
            ['24/7', 'deadline watch'],
          ].map(([b, s], i) => (
            <div key={s} className={`px-5 py-7 ${i % 2 ? '' : 'pl-0 md:pl-5'}`}>
              <div className="font-display text-3xl font-bold text-white md:text-4xl">
                <span className="bg-neon-gradient bg-clip-text text-transparent">{b}</span>
              </div>
              <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/40">{s}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* AGENT LOOP — dossier rows */}
      <section className="mx-auto max-w-6xl px-4 py-28 md:px-8">
        <motion.div {...reveal} className="mb-3 flex items-center gap-3">
          <span className="h-px w-10 bg-neon-violet" />
          <Tag>[ Brief 02 · The Loop ]</Tag>
        </motion.div>
        <motion.h2 {...reveal} className="max-w-2xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
          One transparent loop.
          <br />
          <span className="text-white/40">You see every decision.</span>
        </motion.h2>

        <div className="mt-14 divide-y divide-white/10 border-t border-white/10">
          {LOOP.map((s, i) => (
            <motion.div
              key={s.t}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.05 }}
              className="group grid grid-cols-[auto_1fr] items-center gap-5 py-6 transition-colors hover:bg-white/[0.02] md:grid-cols-[80px_220px_1fr_auto]"
            >
              <span className="font-mono text-2xl font-bold text-white/25 transition-colors group-hover:text-white/60">
                {s.k}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-lg"
                  style={{ background: `${s.c}1f`, color: s.c }}
                >
                  <s.Icon className="size-5" />
                </span>
                <span className="font-mono text-sm font-semibold uppercase tracking-widest text-white">{s.t}</span>
              </div>
              <p className="col-span-2 text-[15px] leading-relaxed text-white/55 md:col-span-1">{s.d}</p>
              <ArrowUpRight className="hidden size-5 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-neon-violet md:block" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CAPABILITIES — engineered card grid */}
      <section className="mx-auto max-w-6xl px-4 pb-28 md:px-8">
        <motion.div {...reveal} className="mb-3 flex items-center gap-3">
          <span className="h-px w-10 bg-neon-violet" />
          <Tag>[ Brief 03 · The Arsenal ]</Tag>
        </motion.div>
        <motion.h2 {...reveal} className="max-w-2xl font-display text-3xl font-bold leading-tight text-white md:text-5xl">
          Built to make you <span className="bg-neon-gradient bg-clip-text text-transparent">actually finish.</span>
        </motion.h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-3">
          {CAPS.map((f, i) => (
            <motion.div
              key={f.t}
              {...reveal}
              transition={{ ...reveal.transition, delay: (i % 3) * 0.06 }}
              className="group relative bg-background p-7 transition-colors hover:bg-white/[0.03]"
            >
              <span className="absolute right-5 top-5 font-mono text-[11px] text-white/20">0{i + 1}</span>
              <span className="mb-5 grid size-11 place-items-center rounded-lg bg-neon-violet/12 text-neon-violet transition-transform group-hover:-translate-y-1">
                <f.Icon className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold text-white">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-28 md:px-8">
        <motion.div
          {...reveal}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#15102e] to-[#0a0a14] p-12 md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(124,92,255,.45),transparent_55%)]" />
          <div className="relative">
            <Tag>[ Brief 04 · Deploy ]</Tag>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              Your deadlines don't<br />stand a chance.
            </h2>
            <p className="mt-5 max-w-md text-[15px] text-white/60">
              Drop in one task and watch RESCUE build the escape route in seconds.
            </p>
            <button
              onClick={() => enter(true)}
              className="shimmer-pill mt-9 inline-flex items-center gap-2 rounded-none px-8 py-4 font-mono text-[13px] font-semibold uppercase tracking-widest text-white shadow-glow"
            >
              <Zap className="size-4" /> Launch RESCUE
            </button>
          </div>
        </motion.div>
        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-widest text-white/30">
          RESCUE · the last-minute life saver · built with gemini · vibe2ship
        </p>
      </section>
    </div>
  )
}
