// Gemini API client — the core agent brain.
// Uses Gemini's structured JSON output for reliable, parseable plans.
// Falls back to the local reasoning engine if no key / network error.
import type { Task, RescuePlan, ReflectionReport, Settings, PlanBlock } from '../types'
import { buildPlan, buildReflection, rankTasks, decompose } from './agent'
import { HOUR, MIN, now } from './time'

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function endpoint(model: string, key: string) {
  return `${BASE}/${model}:generateContent?key=${encodeURIComponent(key)}`
}

interface GenConfig {
  responseMimeType?: string
  responseSchema?: unknown
  temperature?: number
}

async function callGemini(
  prompt: string,
  settings: Settings,
  genConfig: GenConfig
): Promise<string> {
  const res = await fetch(endpoint(settings.model, settings.geminiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: genConfig,
    }),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Gemini ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')
  return text
}

export function hasKey(settings: Settings) {
  return !!settings.geminiKey && settings.geminiKey.trim().length > 10
}

function taskDigest(tasks: Task[], ref: number) {
  return tasks
    .filter((t) => !t.done)
    .map((t) => {
      const hoursLeft = ((t.deadline - ref) / HOUR).toFixed(1)
      return `- id:${t.id} | "${t.title}" | importance:${t.importance} | est:${t.estMinutes}min | hoursToDeadline:${hoursLeft} | tags:[${t.tags.join(',')}]`
    })
    .join('\n')
}

/* ---------------- PLAN ---------------- */

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    ranking: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          urgencyScore: { type: 'integer' },
          quadrant: { type: 'integer' },
          rationale: { type: 'string' },
        },
        required: ['taskId', 'urgencyScore', 'rationale'],
      },
    },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          title: { type: 'string' },
          startOffsetMin: { type: 'integer' },
          durationMin: { type: 'integer' },
          kind: { type: 'string' },
          microSteps: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'startOffsetMin', 'durationMin', 'kind', 'microSteps'],
      },
    },
  },
  required: ['summary', 'ranking', 'blocks'],
}

export interface PlanResult {
  plan: RescuePlan
  ranking: { taskId: string; urgencyScore: number; quadrant?: number; rationale: string }[]
}

export async function generatePlan(
  tasks: Task[],
  settings: Settings,
  behavior?: string
): Promise<PlanResult> {
  const ref = now()
  if (!hasKey(settings)) return localPlanResult(tasks, settings, ref)

  const prompt = `You are RESCUE, an autonomous productivity agent. You run a PERCEIVE→REASON→PLAN→ACT loop.
Current time: ${new Date(ref).toISOString()}.
The user's workday ends at hour ${settings.workdayEnd}:00 local.
${behavior ? `\nWhat you've learned about this user's behavior (use it to personalize the plan — e.g. schedule hard work in their productive hours and add buffers if they run late):\n${behavior}\n` : ''}
Open tasks:
${taskDigest(tasks, ref) || '(none)'}

Do the following:
1. REASON: rank tasks by true urgency using a blend of deadline pressure, effort vs available time, and importance. Give each an urgencyScore 0-100 and an Eisenhower quadrant (1=urgent+important, 2=important, 3=urgent-only, 4=neither). Explain the rationale in one concise sentence ("why this first").
2. PLAN: produce an hour-by-hour schedule starting from now using startOffsetMin (minutes from now) and durationMin. Chunk focus into <=90min blocks, insert 'break' blocks, protect the tightest deadlines first. kind is 'task' | 'break' | 'buffer'.
3. ACT: for each task block, give 3-5 concrete microSteps.
Respond ONLY with JSON matching the schema.`

  try {
    const raw = await callGemini(prompt, settings, {
      responseMimeType: 'application/json',
      responseSchema: PLAN_SCHEMA,
      temperature: 0.4,
    })
    const parsed = JSON.parse(raw)
    const blocks: PlanBlock[] = (parsed.blocks ?? []).map((b: any, idx: number) => {
      const start = ref + (b.startOffsetMin ?? idx * 30) * MIN
      return {
        id: `g-blk-${idx}-${start}`,
        taskId: b.taskId ?? null,
        title: b.title,
        start,
        end: start + (b.durationMin ?? 30) * MIN,
        kind: (b.kind as PlanBlock['kind']) ?? 'task',
        microSteps: Array.isArray(b.microSteps) ? b.microSteps.slice(0, 5) : [],
      }
    })
    const plan: RescuePlan = {
      generatedAt: ref,
      summary: parsed.summary ?? 'Plan generated by Gemini.',
      blocks,
      source: 'gemini',
    }
    return { plan, ranking: parsed.ranking ?? [] }
  } catch (e) {
    console.warn('[RESCUE] Gemini plan failed, using local engine:', e)
    return localPlanResult(tasks, settings, ref)
  }
}

function localPlanResult(tasks: Task[], settings: Settings, ref: number): PlanResult {
  const plan = buildPlan(tasks, settings, ref)
  const ranking = rankTasks(tasks, ref).map((t) => ({
    taskId: t.id,
    urgencyScore: t.urgencyScore,
    quadrant: t.quadrant,
    rationale: t.rationale,
  }))
  return { plan, ranking }
}

/* ---------------- DECOMPOSE ---------------- */

const STEPS_SCHEMA = {
  type: 'object',
  properties: { steps: { type: 'array', items: { type: 'string' } } },
  required: ['steps'],
}

export async function decomposeTask(task: Task, settings: Settings): Promise<string[]> {
  if (!hasKey(settings)) return decompose(task)
  const prompt = `Break the task "${task.title}"${
    task.notes ? ` (notes: ${task.notes})` : ''
  } into 4-6 small, concrete, actionable micro-steps a person can start immediately. Estimated total effort: ${task.estMinutes} minutes. Respond ONLY as JSON {"steps": string[]}.`
  try {
    const raw = await callGemini(prompt, settings, {
      responseMimeType: 'application/json',
      responseSchema: STEPS_SCHEMA,
      temperature: 0.5,
    })
    const parsed = JSON.parse(raw)
    const steps = parsed.steps
    if (Array.isArray(steps) && steps.length) return steps.slice(0, 6)
    return decompose(task)
  } catch (e) {
    console.warn('[RESCUE] Gemini decompose failed, using local:', e)
    return decompose(task)
  }
}

/* ---------------- DRAFT (ACT) ---------------- */

export async function draftFor(task: Task, settings: Settings): Promise<string> {
  if (!hasKey(settings)) {
    return localDraft(task)
  }
  const prompt = `For the task "${task.title}"${
    task.notes ? ` (context: ${task.notes})` : ''
  }, write a short, ready-to-use draft that helps the user ACT now. If it's an email/message, write the email. If it's writing, write an opening paragraph. If it's code/work, give a concrete starting checklist with specifics. Keep it under 160 words. Plain text only.`
  try {
    return await callGemini(prompt, settings, { temperature: 0.7 })
  } catch (e) {
    console.warn('[RESCUE] Gemini draft failed, using local:', e)
    return localDraft(task)
  }
}

function localDraft(task: Task): string {
  const steps = decompose(task)
  return `Here's a fast start for "${task.title}":\n\n${steps
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n')}\n\nKick off with step 1 right now — momentum beats perfection.`
}

/* ---------------- REFLECT ---------------- */

const REFLECT_SCHEMA = {
  type: 'object',
  properties: {
    wins: { type: 'array', items: { type: 'string' } },
    missed: { type: 'array', items: { type: 'string' } },
    insight: { type: 'string' },
    tomorrow: { type: 'array', items: { type: 'string' } },
  },
  required: ['wins', 'missed', 'insight', 'tomorrow'],
}

export async function generateReflection(
  tasks: Task[],
  settings: Settings,
  behavior?: string
): Promise<ReflectionReport> {
  const ref = now()
  if (!hasKey(settings)) return buildReflection(tasks, ref)
  const start = new Date(ref)
  start.setHours(0, 0, 0, 0)
  const done = tasks.filter((t) => t.done && (t.completedAt ?? 0) >= start.getTime())
  const open = tasks.filter((t) => !t.done)
  const prompt = `You are RESCUE reflecting on the user's day (REFLECT phase).
Completed today: ${done.map((t) => `"${t.title}"`).join(', ') || 'none'}.
Still open: ${open.map((t) => `"${t.title}" (importance ${t.importance})`).join(', ') || 'none'}.
${behavior ? `Long-term behavior you've learned: ${behavior}\n` : ''}Write an encouraging but honest end-of-day reflection. Provide: wins (string[]), missed (string[]), one insight learned about their behavior (reference the long-term pattern when relevant), and tomorrow (top 3 priorities). Respond ONLY as JSON matching the schema.`
  try {
    const raw = await callGemini(prompt, settings, {
      responseMimeType: 'application/json',
      responseSchema: REFLECT_SCHEMA,
      temperature: 0.6,
    })
    const parsed = JSON.parse(raw)
    return {
      at: ref,
      wins: parsed.wins ?? [],
      missed: parsed.missed ?? [],
      insight: parsed.insight ?? '',
      tomorrow: parsed.tomorrow ?? [],
      source: 'gemini',
    }
  } catch (e) {
    console.warn('[RESCUE] Gemini reflect failed, using local:', e)
    return buildReflection(tasks, ref)
  }
}

/* ---------------- QUICK NUDGE ---------------- */

export async function nudgeFor(task: Task, settings: Settings, minutesLeft: number): Promise<string> {
  const tone =
    minutesLeft <= 0
      ? 'overdue-firm'
      : minutesLeft < 30
      ? 'urgent'
      : minutesLeft < 120
      ? 'assertive'
      : 'gentle'
  if (!hasKey(settings)) return localNudge(task, tone)
  const prompt = `Write ONE short context-aware nudge (max 18 words) for the task "${task.title}". Deadline is in ${Math.round(
    minutesLeft
  )} minutes. Tone: ${tone}. No quotes, no emoji spam. Make the user want to act now.`
  try {
    const txt = await callGemini(prompt, settings, { temperature: 0.9 })
    return txt.trim().replace(/^["']|["']$/g, '')
  } catch {
    return localNudge(task, tone)
  }
}

function localNudge(task: Task, tone: string): string {
  switch (tone) {
    case 'overdue-firm':
      return `"${task.title}" is overdue. Do the smallest next step right now.`
    case 'urgent':
      return `Under 30 minutes left on "${task.title}". Drop everything and start.`
    case 'assertive':
      return `"${task.title}" is closing in. Begin step one before the window shrinks.`
    default:
      return `Good time to chip away at "${task.title}" while there's slack.`
  }
}

/* ---------------- VIBE AI VOICE ASSISTANT ---------------- */

const VIBE_SCHEMA = {
  type: 'object',
  properties: {
    spokenResponse: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' }, // 'ADD_TASK', 'MARK_COMPLETE', 'OPEN_CALENDAR', 'SET_REMINDER', 'STOP_CONVERSATION'
          payload: { 
            type: 'object',
            properties: {
              title: { type: 'string' },
              estMinutes: { type: 'integer' },
              deadlineOffsetHours: { type: 'integer' },
              taskId: { type: 'string' },
            }
          }
        },
        required: ['type']
      }
    }
  },
  required: ['spokenResponse', 'actions']
}

export interface VibeAction {
  type: 'ADD_TASK' | 'MARK_COMPLETE' | 'OPEN_CALENDAR' | 'SET_REMINDER' | 'STOP_CONVERSATION'
  payload?: {
    title?: string
    estMinutes?: number
    deadlineOffsetHours?: number
    taskId?: string
    url?: string
  }
}

export interface VibeVoiceResponse {
  spokenResponse: string
  actions: VibeAction[]
}

export async function processVibeVoiceCommand(
  command: string,
  tasks: Task[],
  settings: Settings,
  ref = now()
): Promise<VibeVoiceResponse> {
  if (!hasKey(settings)) {
    return {
      spokenResponse: "I need a Gemini API key to process voice commands.",
      actions: []
    }
  }

  const prompt = `You are VibeAI, an intelligent AI Productivity Voice Assistant designed to help users plan, prioritize, and complete tasks before deadlines.
Current time: ${new Date(ref).toISOString()}.

Open tasks:
${taskDigest(tasks, ref) || '(no open tasks)'}

User Command: "${command}"

Instructions:
1. Understand the natural voice command.
2. If they want to add a task, return an 'ADD_TASK' action. You MUST extract the name of the task into payload.title (e.g. "Buy milk" or "Finish homework"). If they didn't specify a task name, use "New Task". Guess estMinutes (default 30) and deadlineOffsetHours (default 24).
3. If they want to complete a task, return 'MARK_COMPLETE' with the taskId from the open tasks list.
4. If they want to open calendar, return 'OPEN_CALENDAR'.
5. If they say goodbye, tell you to stop, or indicate they are done, return a 'STOP_CONVERSATION' action.
6. Always provide a concise, friendly, encouraging, and natural spokenResponse. Keep it very brief as this is an ongoing real-time voice conversation.

Respond ONLY with JSON matching the schema.`

  try {
    const raw = await callGemini(prompt, settings, {
      responseMimeType: 'application/json',
      responseSchema: VIBE_SCHEMA,
      temperature: 0.7,
    })
    const parsed = JSON.parse(raw)
    return {
      spokenResponse: parsed.spokenResponse ?? "I'm sorry, I didn't catch that.",
      actions: parsed.actions ?? []
    }
  } catch (e) {
    console.warn('[RESCUE] Gemini VibeAI failed:', e)
    const errMsg = e instanceof Error ? e.message : 'Unknown error'
    return {
      // Return the actual error so we know exactly why it's failing
      spokenResponse: `I encountered an error. ${errMsg}`,
      actions: []
    }
  }
}
