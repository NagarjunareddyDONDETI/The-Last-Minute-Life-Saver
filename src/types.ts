// Core domain types for RESCUE

export type Importance = 'low' | 'medium' | 'high'
export type EnergyLevel = 'low' | 'medium' | 'high'

export interface SubStep {
  id: string
  title: string
  done: boolean
  estMinutes: number
}

export interface Task {
  id: string
  title: string
  notes?: string
  deadline: number // epoch ms
  createdAt: number
  estMinutes: number // estimated effort
  importance: Importance
  tags: string[]
  done: boolean
  completedAt?: number
  /** ids of tasks that must be done first */
  dependsOn: string[]
  steps: SubStep[]
  // Agent-derived fields
  urgencyScore?: number // 0-100
  quadrant?: 1 | 2 | 3 | 4 // Eisenhower
  rationale?: string // why the agent ranked it here
}

export interface Goal {
  id: string
  title: string
  streak: number
  lastCheckIn?: number // epoch ms (start of day)
  history: number[] // list of day-start timestamps completed
  target: number // days target
}

export interface PlanBlock {
  id: string
  taskId: string | null
  title: string
  start: number // epoch ms
  end: number // epoch ms
  kind: 'task' | 'break' | 'buffer'
  microSteps: string[]
}

export interface RescuePlan {
  generatedAt: number
  summary: string
  blocks: PlanBlock[]
  source: 'gemini' | 'local'
}

export interface AgentThought {
  id: string
  at: number
  phase: 'perceive' | 'reason' | 'plan' | 'act' | 'reflect'
  text: string
}

export interface ReflectionReport {
  at: number
  wins: string[]
  missed: string[]
  insight: string
  tomorrow: string[]
  source: 'gemini' | 'local'
}

/** A recorded outcome used to learn the user's behavior over time. */
export interface BehaviorEvent {
  at: number // when recorded
  type: 'completed' | 'missed'
  importance: Importance
  tags: string[]
  hourOfDay: number // 0-23 when completed/missed
  onTime: boolean // completed before deadline
  leadMin: number // minutes before deadline it was completed (neg = late)
  estMinutes: number
}

/** Aggregated insight derived from BehaviorEvents. */
export interface BehaviorProfile {
  total: number
  completed: number
  missed: number
  completionRate: number // 0-1
  onTimeRate: number // 0-1 of completed
  bestHours: number[] // most productive hours of day
  avgLeadMin: number // avg minutes finished before deadline
  weakTags: string[] // tags most often missed
  lastMinute: boolean // tends to finish right at the wire
}

export type AppMode = 'dashboard' | 'planner' | 'focus' | 'autopilot' | 'reflection'

export interface Settings {
  geminiKey: string
  model: string
  reducedMotion: boolean
  workdayStart: number // hour 0-23
  workdayEnd: number // hour 0-23
  onboarded: boolean
  entered: boolean // has the user crossed from the marketing landing into the app
}
