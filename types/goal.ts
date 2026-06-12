export enum GoalStatus {
  ACTIVE    = 'active',
  COMPLETED = 'completed',
  ARCHIVED  = 'archived',
}

export interface Goal {
  id:          string
  title:       string
  description?: string
  courseId?:   string
  dueDate?:    Date
  status:      GoalStatus
  color?:      string 
  createdAt:   Date
  updatedAt:   Date
  completedAt?: Date
}

export interface CreateGoalInput {
  title:        string
  description?: string
  courseId?:    string | null
  dueDate?:     Date
  color?:       string
}
