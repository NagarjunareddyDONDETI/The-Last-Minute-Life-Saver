// Local reasoning engine — the deterministic fallback "brain".
// Implements the agent loop primitives: scoring, ranking, planning, reflection.
import type { Task, RescuePlan, PlanBlock, ReflectionReport, Settings } from '../types'
import { HOUR, MIN, now } from './time'

const IMPORTANCE_WEIGHT: Record<Task['importance'], number> = {
  low: 0.4,
  medium: 0.7,
  high: 1,
}

export interface Scored extends Task {
  urgencyScore: number
  quadrant: 1 | 2 | 3 | 4
  rationale: string
}

/** REASON: compute an urgency score (0-100) + Eisenhower quadrant + rationale. */
export function scoreTask(task: Task, ref = now()): Scored {
  const msLeft = task.deadline - ref
  const hoursLeft = msLeft / HOUR
  const effortHours = task.estMinutes / 60

  // Time pressure: how tight is the deadline vs the work required?
  // slack = time available minus effort needed.
  const slack = hoursLeft - effortHours
  let pressure: number
  if (msLeft <= 0) pressure = 1 // overdue = max
  else if (slack <= 0) pressure = 0.95 // not enough time left
  else pressure = Math.min(1, 1 / (1 + slack / 6)) // decays as slack grows

  const importance = IMPORTANCE_WEIGHT[task.importance]

  // Dependencies waiting on this task add weight (it's a blocker).
  const score = Math.round(
    Math.min(100, (pressure * 0.6 + importance * 0.4) * 100)
  )

  const urgent = pressure >= 0.55 || msLeft <= 0
  const important = task.importance !== 'low'
  let quadrant: 1 | 2 | 3 | 4
  if (urgent && important) quadrant = 1
  else if (!urgent && important) quadrant = 2
  else if (urgent && !important) quadrant = 3
  else quadrant = 4

  const rationale = buildRationale(task, { hoursLeft, slack, quadrant, score })

  return { ...task, urgencyScore: score, quadrant, rationale }
}

function buildRationale(
  task: Task,
  ctx: { hoursLeft: number; slack: number; quadrant: number; score: number }
): string {
  const parts: string[] = []
  if (ctx.hoursLeft <= 0) parts.push('This is already overdue — it needs immediate triage.')
  else if (ctx.hoursLeft < 1) parts.push(`Only ${Math.round(ctx.hoursLeft * 60)} minutes until the deadline.`)
  else if (ctx.hoursLeft < 24) parts.push(`Due in ~${Math.round(ctx.hoursLeft)}h.`)
  else parts.push(`Due in ~${Math.round(ctx.hoursLeft / 24)} day(s).`)

  if (ctx.slack <= 0 && ctx.hoursLeft > 0)
    parts.push(`There is not enough buffer for the ${task.estMinutes}m of work — start now.`)
  else if (ctx.slack > 0 && ctx.hoursLeft > 0)
    parts.push(`~${Math.round(ctx.slack)}h of slack remains after the work.`)

  parts.push(`Importance is ${task.importance}.`)
  const qNames = ['', 'Do First (urgent + important)', 'Schedule (important, not urgent)', 'Delegate/Quick (urgent, not important)', 'Backlog (neither)']
  parts.push(`Eisenhower: ${qNames[ctx.quadrant]}.`)
  return parts.join(' ')
}

/** Rank all open tasks by urgency score (desc), then deadline. */
export function rankTasks(tasks: Task[], ref = now()): Scored[] {
  return tasks
    .filter((t) => !t.done)
    .map((t) => scoreTask(t, ref))
    .sort((a, b) => b.urgencyScore - a.urgencyScore || a.deadline - b.deadline)
}

/** ACT: auto-decompose a task into micro-steps when none exist. */
export function decompose(task: Task): string[] {
  const t = task.title.toLowerCase()
  const n = task.title.replace(/\.$/, '')
  if (/email|reply|message|reach out|contact/.test(t))
    return [
      `Clarify the goal of "${n}"`,
      'Draft the key message in 3 bullet points',
      'Write the full draft',
      'Proofread tone & ask',
      'Send',
    ]
  if (/essay|report|write|blog|article|paper|doc/.test(t))
    return [
      'Outline the main sections',
      'Collect sources / notes',
      'Write a rough first draft',
      'Revise for clarity',
      'Final proofread & format',
    ]
  if (/study|exam|revise|learn|prepare/.test(t))
    return [
      'List every topic to cover',
      'Rank topics by exam weight',
      'Active-recall the hardest topic',
      'Practice 5 questions',
      'Quick review of weak spots',
    ]
  if (/code|bug|fix|build|deploy|feature|app/.test(t))
    return [
      'Reproduce / define the problem',
      'Sketch the smallest working approach',
      'Implement the core change',
      'Test it end to end',
      'Clean up & ship',
    ]
  if (/presentation|slide|pitch|deck/.test(t))
    return [
      'Define the single key message',
      'Draft the slide structure',
      'Build the slides',
      'Add visuals & polish',
      'Rehearse once out loud',
    ]
  // generic fallback
  return [
    `Define what "done" looks like for "${n}"`,
    'Gather what you need to start',
    'Do the core 50%',
    'Finish the remaining details',
    'Review & wrap up',
  ]
}

/** PLAN: build an hour-by-hour rescue plan from ranked tasks. */
export function buildPlan(tasks: Task[], settings: Settings, ref = now()): RescuePlan {
  const ranked = rankTasks(tasks, ref)
  const blocks: PlanBlock[] = []
  let cursor = ref

  const endOfWindow = (() => {
    const d = new Date(ref)
    d.setHours(settings.workdayEnd, 0, 0, 0)
    let t = d.getTime()
    if (t < ref) t = ref + 8 * HOUR
    return t
  })()

  let i = 0
  for (const task of ranked) {
    if (cursor >= endOfWindow && task.urgencyScore < 90) break
    const dur = Math.max(15, Math.min(task.estMinutes, 90)) // chunk to ≤90m focus
    const start = cursor
    const end = start + dur * MIN
    const steps = task.steps.length ? task.steps.map((s) => s.title) : decompose(task)
    blocks.push({
      id: `blk-${task.id}-${start}`,
      taskId: task.id,
      title: task.title,
      start,
      end,
      kind: 'task',
      microSteps: steps.slice(0, 5),
    })
    cursor = end
    i++
    // insert a short break every 2 focus blocks
    if (i % 2 === 0 && cursor < endOfWindow) {
      const bEnd = cursor + 10 * MIN
      blocks.push({
        id: `brk-${start}`,
        taskId: null,
        title: 'Recharge break',
        start: cursor,
        end: bEnd,
        kind: 'break',
        microSteps: ['Stand up & stretch', 'Water', 'Look away from the screen'],
      })
      cursor = bEnd
    }
  }

  const top = ranked[0]
  const summary = top
    ? `Start with "${top.title}" (urgency ${top.urgencyScore}/100). I've sequenced ${ranked.length} open task(s) into ${blocks.filter((b) => b.kind === 'task').length} focus blocks with breaks so the tightest deadlines are protected.`
    : 'No open tasks. Add something and I will build your rescue plan instantly.'

  return { generatedAt: ref, summary, blocks, source: 'local' }
}

/** REFLECT: end-of-day summary from local heuristics. */
export function buildReflection(tasks: Task[], ref = now()): ReflectionReport {
  const today = new Date(ref)
  today.setHours(0, 0, 0, 0)
  const start = today.getTime()
  const done = tasks.filter((t) => t.done && (t.completedAt ?? 0) >= start)
  const missed = tasks.filter((t) => !t.done && t.deadline < ref)

  const wins = done.length
    ? done.map((t) => `Completed "${t.title}"`)
    : ['No tasks completed yet today — even one finished task counts.']
  const missedList = missed.map((t) => `"${t.title}" slipped past its deadline`)

  let insight: string
  if (done.length >= 3) insight = 'Strong momentum today. You cleared the high-pressure items early — keep front-loading the hardest work.'
  else if (missed.length > done.length) insight = 'Deadlines are outpacing completions. Tomorrow, cut scope: pick the single most important task and protect a focus block for it first thing.'
  else insight = 'Steady progress. Batching similar tasks and using focus blocks will compound your output.'

  const tomorrow = rankTasks(tasks, ref)
    .slice(0, 3)
    .map((t) => `Tackle "${t.title}" first (urgency ${t.urgencyScore})`)

  return { at: ref, wins, missed: missedList, insight, tomorrow, source: 'local' }
}
