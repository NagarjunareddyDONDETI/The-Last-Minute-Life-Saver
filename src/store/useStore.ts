import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Task,
  Goal,
  Settings,
  RescuePlan,
  AgentThought,
  ReflectionReport,
  AppMode,
  SubStep,
  BehaviorEvent,
  BehaviorProfile,
} from '../types'
import { now, startOfDay, DAY } from '../lib/time'
import {
  generatePlan,
  decomposeTask,
  generateReflection,
} from '../lib/gemini'
import { scoreTask } from '../lib/agent'
import { makeEvent, summarizeBehavior, behaviorDigest, newlyMissed } from '../lib/behavior'

const uid = () => Math.random().toString(36).slice(2, 10)

interface NewTaskInput {
  title: string
  notes?: string
  deadline: number
  estMinutes: number
  importance: Task['importance']
  tags?: string[]
}

interface State {
  tasks: Task[]
  goals: Goal[]
  settings: Settings
  plan: RescuePlan | null
  thoughts: AgentThought[]
  reflection: ReflectionReport | null
  mode: AppMode
  thinking: boolean
  focusTaskId: string | null
  entered: boolean
  lastRanking: Record<string, { urgencyScore: number; quadrant?: number; rationale: string }>
  events: BehaviorEvent[]
  missedIds: string[]

  // actions
  addTask: (t: NewTaskInput) => Promise<void>
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleStep: (taskId: string, stepId: string) => void
  setSteps: (taskId: string, titles: string[]) => void

  addGoal: (title: string, target: number) => void
  checkInGoal: (id: string) => void
  removeGoal: (id: string) => void

  setMode: (m: AppMode) => void
  setFocusTask: (id: string | null) => void
  setEntered: (v: boolean) => void
  setSettings: (patch: Partial<Settings>) => void
  pushThought: (phase: AgentThought['phase'], text: string) => void
  clearThoughts: () => void

  replan: () => Promise<void>
  autoDecompose: (taskId: string) => Promise<void>
  reflect: () => Promise<void>
  syncMissed: () => void
  profile: () => BehaviorProfile
  seedDemo: () => void
}

const defaultSettings: Settings = {
  geminiKey: '',
  model: 'gemini-2.0-flash',
  reducedMotion: false,
  workdayStart: 9,
  workdayEnd: 21,
  onboarded: false,
  entered: false,
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: [],
      goals: [],
      settings: defaultSettings,
      plan: null,
      thoughts: [],
      reflection: null,
      mode: 'dashboard',
      thinking: false,
      focusTaskId: null,
      entered: false,
      lastRanking: {},
      events: [],
      missedIds: [],

      pushThought: (phase, text) =>
        set((s) => ({
          thoughts: [
            { id: uid(), at: now(), phase, text },
            ...s.thoughts,
          ].slice(0, 40),
        })),

      clearThoughts: () => set({ thoughts: [] }),

      addTask: async (input) => {
        const task: Task = {
          id: uid(),
          title: input.title.trim(),
          notes: input.notes,
          deadline: input.deadline,
          createdAt: now(),
          estMinutes: input.estMinutes,
          importance: input.importance,
          tags: input.tags ?? [],
          done: false,
          dependsOn: [],
          steps: [],
        }
        const scored = scoreTask(task)
        task.urgencyScore = scored.urgencyScore
        task.quadrant = scored.quadrant
        task.rationale = scored.rationale
        set((s) => ({ tasks: [task, ...s.tasks] }))
        get().pushThought('perceive', `New task captured: "${task.title}".`)
        get().pushThought('reason', `Scored urgency ${task.urgencyScore}/100 — ${task.rationale}`)
        await get().replan()
      },

      toggleTask: (id) => {
        const t = get().tasks.find((x) => x.id === id)
        if (!t) return
        const done = !t.done
        const completedAt = done ? now() : undefined
        set((s) => ({
          tasks: s.tasks.map((x) =>
            x.id === id ? { ...x, done, completedAt } : x
          ),
        }))
        if (done) {
          // Learn from the completion for future personalization.
          const ev = makeEvent({ ...t, completedAt }, 'completed')
          set((s) => ({
            events: [ev, ...s.events].slice(0, 300),
            missedIds: s.missedIds.filter((m) => m !== id), // it got done after all
          }))
        }
        get().pushThought(
          done ? 'reflect' : 'perceive',
          done ? `"${t.title}" completed. Learning from it and re-planning.` : `"${t.title}" reopened.`
        )
        void get().replan()
      },

      removeTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) }))
        void get().replan()
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((x) => {
            if (x.id !== id) return x
            const merged = { ...x, ...patch }
            const sc = scoreTask(merged)
            return { ...merged, urgencyScore: sc.urgencyScore, quadrant: sc.quadrant, rationale: sc.rationale }
          }),
        })),

      toggleStep: (taskId, stepId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, steps: t.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st)) }
              : t
          ),
        })),

      setSteps: (taskId, titles) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  steps: titles.map<SubStep>((title) => ({
                    id: uid(),
                    title,
                    done: false,
                    estMinutes: Math.max(5, Math.round(t.estMinutes / titles.length)),
                  })),
                }
              : t
          ),
        })),

      addGoal: (title, target) =>
        set((s) => ({
          goals: [
            { id: uid(), title: title.trim(), streak: 0, history: [], target },
            ...s.goals,
          ],
        })),

      checkInGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== id) return g
            const today = startOfDay()
            if (g.lastCheckIn === today) return g // already checked in
            const continued = g.lastCheckIn === today - DAY
            return {
              ...g,
              streak: continued ? g.streak + 1 : 1,
              lastCheckIn: today,
              history: [...g.history, today],
            }
          }),
        })),

      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      setMode: (m) => set({ mode: m }),
      setFocusTask: (id) => set({ focusTaskId: id }),
      setEntered: (v) => set({ entered: v }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      replan: async () => {
        const { tasks, settings, events } = get()
        set({ thinking: true })
        get().pushThought('plan', 'Re-planning your day around the latest tasks…')
        try {
          const digest = behaviorDigest(summarizeBehavior(events))
          const { plan, ranking } = await generatePlan(tasks, settings, digest)
          const rankMap: State['lastRanking'] = {}
          for (const r of ranking) rankMap[r.taskId] = { urgencyScore: r.urgencyScore, quadrant: r.quadrant, rationale: r.rationale }
          // fold ranking back into tasks for display
          set((s) => ({
            plan,
            lastRanking: rankMap,
            tasks: s.tasks.map((t) =>
              rankMap[t.id]
                ? {
                    ...t,
                    urgencyScore: rankMap[t.id].urgencyScore,
                    quadrant: (rankMap[t.id].quadrant as Task['quadrant']) ?? t.quadrant,
                    rationale: rankMap[t.id].rationale,
                  }
                : t
            ),
          }))
          get().pushThought(
            'plan',
            `${plan.source === 'gemini' ? 'Gemini' : 'Local engine'}: ${plan.summary}`
          )
        } finally {
          set({ thinking: false })
        }
      },

      autoDecompose: async (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId)
        if (!task) return
        set({ thinking: true })
        get().pushThought('act', `Breaking "${task.title}" into micro-steps…`)
        try {
          const steps = await decomposeTask(task, get().settings)
          get().setSteps(taskId, steps)
          get().pushThought('act', `Created ${steps.length} micro-steps for "${task.title}".`)
        } finally {
          set({ thinking: false })
        }
      },

      reflect: async () => {
        set({ thinking: true })
        get().pushThought('reflect', 'Reviewing the day and learning for tomorrow…')
        try {
          get().syncMissed()
          const digest = behaviorDigest(summarizeBehavior(get().events))
          const report = await generateReflection(get().tasks, get().settings, digest)
          set({ reflection: report })
        } finally {
          set({ thinking: false })
        }
      },

      syncMissed: () => {
        const { tasks, missedIds } = get()
        const missed = newlyMissed(tasks, missedIds)
        if (!missed.length) return
        const evs = missed.map((t) => makeEvent(t, 'missed'))
        set((s) => ({
          events: [...evs, ...s.events].slice(0, 300),
          missedIds: [...s.missedIds, ...missed.map((t) => t.id)],
        }))
      },

      profile: () => summarizeBehavior(get().events),

      seedDemo: () => {
        const t = now()
        const mk = (
          title: string,
          mins: number,
          est: number,
          importance: Task['importance'],
          tags: string[],
          notes?: string
        ): Task => {
          const base: Task = {
            id: uid(),
            title,
            notes,
            deadline: t + mins * 60_000,
            createdAt: t,
            estMinutes: est,
            importance,
            tags,
            done: false,
            dependsOn: [],
            steps: [],
          }
          const sc = scoreTask(base)
          return { ...base, urgencyScore: sc.urgencyScore, quadrant: sc.quadrant, rationale: sc.rationale }
        }
        set({
          tasks: [
            mk('Email professor about deadline extension', 45, 15, 'high', ['email', 'school'], 'Need 2 more days for the research paper'),
            mk('Finish slide deck for client pitch', 180, 90, 'high', ['work', 'presentation']),
            mk('Submit expense report', 26 * 60, 20, 'medium', ['admin']),
            mk('Study chapter 7 for exam', 5 * 60, 75, 'high', ['study']),
            mk('Reply to recruiter', 9 * 60, 10, 'medium', ['email', 'career']),
          ],
          goals: [
            { id: uid(), title: 'Deep work 2h/day', streak: 3, history: [], target: 30, lastCheckIn: startOfDay() - DAY },
            { id: uid(), title: 'Inbox zero', streak: 1, history: [], target: 14 },
          ],
          // Seed a little history so personalized recommendations are live from the start.
          events: [
            { at: t - DAY, type: 'completed', importance: 'high', tags: ['work'], hourOfDay: 10, onTime: true, leadMin: 25, estMinutes: 60 },
            { at: t - DAY, type: 'completed', importance: 'medium', tags: ['email'], hourOfDay: 9, onTime: true, leadMin: 15, estMinutes: 15 },
            { at: t - 2 * DAY, type: 'completed', importance: 'high', tags: ['study'], hourOfDay: 10, onTime: true, leadMin: 30, estMinutes: 75 },
            { at: t - 2 * DAY, type: 'missed', importance: 'medium', tags: ['admin'], hourOfDay: 18, onTime: false, leadMin: -60, estMinutes: 20 },
            { at: t - 3 * DAY, type: 'completed', importance: 'medium', tags: ['work'], hourOfDay: 11, onTime: true, leadMin: 20, estMinutes: 45 },
            { at: t - 3 * DAY, type: 'missed', importance: 'low', tags: ['admin'], hourOfDay: 20, onTime: false, leadMin: -120, estMinutes: 30 },
          ],
        })
      },
    }),
    {
      name: 'rescue-store-v1',
      partialize: (s) => ({
        tasks: s.tasks,
        goals: s.goals,
        settings: s.settings,
        reflection: s.reflection,
        events: s.events,
        missedIds: s.missedIds,
      }),
    }
  )
)
