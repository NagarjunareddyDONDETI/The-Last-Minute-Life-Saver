// Behavioral learning — turns recorded outcomes into a profile the agent uses
// to personalize planning, reflection, and recommendations.
import type { BehaviorEvent, BehaviorProfile, Task } from '../types'
import { HOUR, MIN, now } from './time'

export function makeEvent(task: Task, type: 'completed' | 'missed', ref = now()): BehaviorEvent {
  const when = type === 'completed' ? task.completedAt ?? ref : task.deadline
  const leadMin = Math.round((task.deadline - (task.completedAt ?? ref)) / MIN)
  return {
    at: ref,
    type,
    importance: task.importance,
    tags: task.tags ?? [],
    hourOfDay: new Date(when).getHours(),
    onTime: type === 'completed' ? (task.completedAt ?? ref) <= task.deadline : false,
    leadMin,
    estMinutes: task.estMinutes,
  }
}

/** Aggregate raw events into an actionable profile. */
export function summarizeBehavior(events: BehaviorEvent[]): BehaviorProfile {
  const completed = events.filter((e) => e.type === 'completed')
  const missed = events.filter((e) => e.type === 'missed')
  const total = events.length

  // Most productive hours: bucket completions by hour, take the top 2-3.
  const hourBuckets = new Array(24).fill(0)
  for (const e of completed) hourBuckets[e.hourOfDay]++
  const bestHours = hourBuckets
    .map((count, hour) => ({ hour, count }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((b) => b.hour)

  const onTimeCount = completed.filter((e) => e.onTime).length
  const onTimeRate = completed.length ? onTimeCount / completed.length : 1

  const leadValues = completed.filter((e) => e.onTime).map((e) => e.leadMin)
  const avgLeadMin = leadValues.length
    ? Math.round(leadValues.reduce((a, b) => a + b, 0) / leadValues.length)
    : 0

  // Tags that show up disproportionately in misses.
  const missTagCount: Record<string, number> = {}
  for (const e of missed) for (const t of e.tags) missTagCount[t] = (missTagCount[t] ?? 0) + 1
  const weakTags = Object.entries(missTagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)

  return {
    total,
    completed: completed.length,
    missed: missed.length,
    completionRate: total ? completed.length / total : 0,
    onTimeRate,
    bestHours,
    avgLeadMin,
    weakTags,
    lastMinute: completed.length >= 3 && avgLeadMin >= 0 && avgLeadMin < 45,
  }
}

const HOUR_LABELS = (h: number) => {
  const am = h < 12
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}${am ? 'am' : 'pm'}`
}

/** Compact digest fed into Gemini prompts so plans/reflection are personalized. */
export function behaviorDigest(p: BehaviorProfile): string {
  if (p.total < 2) return 'No meaningful behavior history yet.'
  const parts: string[] = []
  parts.push(`Completion rate ${Math.round(p.completionRate * 100)}% over ${p.total} tracked items.`)
  parts.push(`On-time rate ${Math.round(p.onTimeRate * 100)}%.`)
  if (p.bestHours.length) parts.push(`Most productive around ${p.bestHours.map(HOUR_LABELS).join(', ')}.`)
  if (p.lastMinute) parts.push(`Tends to finish last-minute (avg ${p.avgLeadMin}m before deadline) — front-load buffers.`)
  else if (p.avgLeadMin > 0) parts.push(`Usually finishes ~${p.avgLeadMin}m before deadline.`)
  if (p.weakTags.length) parts.push(`Frequently slips on: ${p.weakTags.map((t) => `#${t}`).join(', ')}.`)
  return parts.join(' ')
}

/** Human-facing personalized recommendations derived purely from behavior. */
export function recommendations(p: BehaviorProfile): string[] {
  const recs: string[] = []
  if (p.total < 2) {
    return [
      'Complete a few tasks and the agent will start learning your patterns to personalize advice.',
    ]
  }
  if (p.bestHours.length) {
    recs.push(
      `You ship the most around ${p.bestHours.map(HOUR_LABELS).join(' & ')}. Schedule your hardest task in that window.`
    )
  }
  if (p.completionRate < 0.6) {
    recs.push(
      `Your completion rate is ${Math.round(
        p.completionRate * 100
      )}%. Try capturing fewer, sharper tasks and decomposing big ones immediately.`
    )
  } else if (p.completionRate >= 0.8) {
    recs.push(`Strong ${Math.round(p.completionRate * 100)}% completion rate — keep the momentum, you can take on more.`)
  }
  if (p.lastMinute) {
    recs.push(
      `You typically finish only ~${p.avgLeadMin}m before deadlines. Set personal deadlines 1–2h earlier to build a safety buffer.`
    )
  }
  if (p.onTimeRate < 0.7) {
    recs.push(`On-time rate is ${Math.round(p.onTimeRate * 100)}%. Protect the first focus block of the day for the tightest deadline.`)
  }
  if (p.weakTags.length) {
    recs.push(`"${p.weakTags[0]}" tasks slip most often for you — auto-decompose them the moment they're captured.`)
  }
  return recs.length ? recs : ['Your habits look balanced — keep front-loading the highest-urgency work.']
}

/** Find open tasks that just went overdue and haven't been recorded yet. */
export function newlyMissed(tasks: Task[], recordedIds: string[], ref = now()): Task[] {
  const recorded = new Set(recordedIds)
  return tasks.filter((t) => !t.done && t.deadline < ref && !recorded.has(t.id) && ref - t.deadline < 12 * HOUR)
}
