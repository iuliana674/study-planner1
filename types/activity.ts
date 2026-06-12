export enum ActivityCategory {
  LESSON     = 'lesson',
  ASSIGNMENT = 'assignment',
  QUIZ       = 'quiz',
  PROJECT    = 'project',
  WORKSHOP   = 'workshop',
  SESSION    = 'session',
}

export enum ActivityStatus {
  DRAFT      = 'draft',
  PUBLISHED  = 'published',
  COMPLETED  = 'completed',
}

export interface Course {
  id:    string
  name:  string
  color: string
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'custom'

export interface Recurrence {
  frequency:   RecurrenceFrequency
  interval:    number
  daysOfWeek?: number[]
  endsOn?:     Date
}

// Fields that can be overridden per-instance without detaching from the series.
// Stored on the master keyed by midnight(dueDate).toISOString().
export type InstanceOverride = Partial<Pick<Activity,
  'title' | 'description' | 'category' | 'estimatedHours' | 'courseId' | 'goalId' | 'steps' | 'actualHours' | 'timeLogs'
>>

export interface Activity {
  id:               string
  title:            string
  description?:     string
  category:         ActivityCategory
  status:           ActivityStatus
  dueDate?:         Date
  estimatedHours?:  number
  createdAt:        Date
  updatedAt:        Date
  completedAt?:     Date
  attachments?:     string[]

  courseId?:        string
  goalId?:          string

  steps?:           SessionStep[]

  actualHours?:     number
  timeLogs?:        TimeLog[]

  recurrence?:      Recurrence
  recurringGroupId?: string
  recurringIndex?:  number
  exceptDates?:     Date[]
  completedStatuses?: Record<string, { status: ActivityStatus; completedAt: string }>
  // Per-instance field overrides keyed by midnight(dueDate).toISOString().
  // "Just this one" writes here so the instance stays in the series.
  instanceOverrides?: Record<string, InstanceOverride>
}

// ─── Time Tracking ───────────────────────────────────────────────────────────

export interface TimeLog {
  start:    string
  end:      string
  duration: number
  note?:    string
}

export interface SessionStep {
  id:   string
  text: string
  done: boolean
}

export interface CreateActivityInput {
  title:           string
  description?:    string
  category:        ActivityCategory
  dueDate?:        Date
  estimatedHours?: number
  recurrence?:     Recurrence
  courseId?:       string | null
  goalId?:         string | null
  steps?:          SessionStep[]
}

export interface UpdateActivityInput extends Partial<CreateActivityInput> {
  status?: ActivityStatus
}
