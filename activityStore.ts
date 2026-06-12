import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  Activity, ActivityCategory, ActivityStatus,
  CreateActivityInput, InstanceOverride, TimeLog,
} from '../types/activity'

// ─── Date revival ─────────────────────────────────────────────────────────────

const DATE_FIELDS: (keyof Activity)[] = ['dueDate', 'createdAt', 'updatedAt', 'completedAt']

function reviveDates(a: Activity): Activity {
  const r = { ...a }
  for (const f of DATE_FIELDS) {
    const v = r[f]
    if (typeof v === 'string') (r as Record<string, unknown>)[f] = new Date(v)
  }
  if (r.recurrence?.endsOn && typeof r.recurrence.endsOn === 'string') {
    r.recurrence = { ...r.recurrence, endsOn: new Date(r.recurrence.endsOn) }
  }
  if (Array.isArray(r.exceptDates)) {
    r.exceptDates = r.exceptDates.map((d: string | Date) =>
      typeof d === 'string' ? new Date(d) : d
    )
  }
  return r
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => crypto.randomUUID()
const HORIZON_DAYS = 90

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}

function midnight(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}

function sameDay(a: Date, b: Date): boolean {
  return midnight(a).getTime() === midnight(b).getTime()
}

// ─── Recurrence expansion ─────────────────────────────────────────────────────

function expandRecurring(master: Activity): Activity[] {
  const rec = master.recurrence
  if (!rec || !master.dueDate) return [master]

  const start   = midnight(new Date(master.dueDate))
  const horizon = addDays(midnight(new Date()), HORIZON_DAYS)
  const end     = rec.endsOn ? midnight(new Date(rec.endsOn)) : horizon
  const cap     = end < horizon ? end : horizon
  const excepts = (master.exceptDates ?? []).map(d => midnight(new Date(d)))

  const dates: Date[] = []
  const groupId = master.recurringGroupId ?? master.id

  if (rec.frequency === 'daily') {
    let cur = new Date(start)
    while (cur <= cap) {
      dates.push(new Date(cur))
      cur = addDays(cur, rec.interval || 1)
    }
  } else if (rec.frequency === 'weekly') {
    let cur = new Date(start)
    while (cur <= cap) {
      dates.push(new Date(cur))
      cur = addDays(cur, (rec.interval || 1) * 7)
    }
  } else if (rec.frequency === 'custom' && rec.daysOfWeek?.length) {
    const days = rec.daysOfWeek.slice().sort()
    let weekStart = new Date(start)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    while (weekStart <= cap) {
      for (const dow of days) {
        const candidate = addDays(weekStart, dow)
        if (candidate >= start && candidate <= cap) {
          dates.push(new Date(candidate))
        }
      }
      weekStart = addDays(weekStart, (rec.interval || 1) * 7)
    }
  }

  const unique = Array.from(new Set(dates.map(d => d.toDateString())))
    .map(s => new Date(s))
    .filter(d => !excepts.some(ex => sameDay(ex, d)))
    .sort((a, b) => a.getTime() - b.getTime())

  return unique.map((date, idx) => {
    const dateKey             = midnight(date).toISOString()
    const statusRecord        = master.completedStatuses?.[dateKey]
    const instanceStatus      = statusRecord?.status ?? master.status
    const instanceCompletedAt = statusRecord ? new Date(statusRecord.completedAt) : undefined
    // Merge any per-instance field overrides saved by "Just this one"
    const overrides           = master.instanceOverrides?.[dateKey] ?? {}

    return {
      ...master,
      ...overrides,
      id:                idx === 0 ? master.id : `${groupId}-${idx}`,
      dueDate:           date,
      status:            instanceStatus,
      completedAt:       instanceCompletedAt,
      recurringGroupId:  groupId,
      recurringIndex:    idx,
      recurrence:        idx === 0 ? rec : undefined,
      exceptDates:       undefined,
      completedStatuses: undefined,
      instanceOverrides: undefined,
    }
  })
}

function rebuildFromMasters(masters: Activity[]): Activity[] {
  return masters.flatMap(m => expandRecurring(m))
}

// ─── Timer state ──────────────────────────────────────────────────────────────

export interface TimerState {
  activityId: string
  startedAt:  number
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface ActivityState {
  masters:               Activity[]
  activities:            Activity[]
  isLoading:             boolean
  error:                 string | null
  timer:                 TimerState | null

  addActivity:           (input: CreateActivityInput) => void
  updateActivity:        (id: string, updates: Partial<Activity>) => void
  updateThisAndFuture:   (id: string, updates: Partial<Activity>) => void
  deleteActivity:        (id: string) => void
  deleteAllInSeries:     (groupId: string) => void
  deleteThisAndFuture:   (id: string) => void
  rescheduleInstance:    (id: string, newDate: Date) => string
  // Detaches the instance as a standalone clone (use only when changing the date)
  updateInstance:        (id: string, updates: Partial<Activity>) => void
  // Saves edits in-place via instanceOverrides — instance stays in the series
  updateInstanceInPlace: (id: string, updates: InstanceOverride) => void
  toggleInstanceStatus:  (id: string) => void
  toggleStep:            (id: string, stepId: string) => void
  startTimer:            (id: string) => void
  stopTimer:             () => TimerState | null
  logTime:               (id: string, log: TimeLog) => void
  clearCourse:           (courseId: string) => void
  getActivity:           (id: string) => Activity | undefined
  setError:              (error: string | null) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      masters:    [],
      activities: [],
      isLoading:  false,
      error:      null,
      timer:      null,

      addActivity: (input) => {
        const master: Activity = {
          id:               uid(),
          title:            input.title,
          description:      input.description ?? '',
          category:         input.category ?? ActivityCategory.ASSIGNMENT,
          status:           ActivityStatus.PUBLISHED,
          dueDate:          input.dueDate,
          estimatedHours:   input.estimatedHours,
          courseId:         input.courseId ?? undefined,
          recurrence:       input.recurrence,
          steps:            input.steps,
          recurringGroupId: undefined,
          createdAt:        new Date(),
          updatedAt:        new Date(),
        }
        if (master.recurrence) master.recurringGroupId = master.id
        set(s => {
          const masters = [...s.masters, master]
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      updateActivity: (id, updates) => {
        set(s => {
          const masters = s.masters.map(m => {
            if (m.id !== id) return m
            const merged = { ...m, ...updates, updatedAt: new Date() }
            if (updates.courseId === null) merged.courseId = undefined
            if (updates.status === ActivityStatus.COMPLETED && m.status !== ActivityStatus.COMPLETED) {
              merged.completedAt = new Date()
            } else if (updates.status && updates.status !== ActivityStatus.COMPLETED) {
              merged.completedAt = undefined
            }
            return merged
          })
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      updateThisAndFuture: (id, updates) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return

        const groupId = instance.recurringGroupId
        const cutDate = instance.dueDate ? midnight(new Date(instance.dueDate)) : null

        set(s => {
          let masters = s.masters.map(m => {
            if (m.id !== groupId || !cutDate) return m
            const newEnd = addDays(cutDate, -1)
            const rec    = m.recurrence ? { ...m.recurrence, endsOn: newEnd } : m.recurrence
            return { ...m, recurrence: rec, updatedAt: new Date() }
          })

          const oldMaster = s.masters.find(m => m.id === groupId)
          if (oldMaster) {
            const newRec = updates.recurrence !== undefined ? updates.recurrence : oldMaster.recurrence
            const newMaster: Activity = {
              ...oldMaster,
              ...updates,
              id:                uid(),
              dueDate:           cutDate ?? oldMaster.dueDate,
              recurrence:        newRec,
              recurringGroupId:  undefined,
              recurringIndex:    0,
              exceptDates:       undefined,
              instanceOverrides: undefined,
              createdAt:         new Date(),
              updatedAt:         new Date(),
            }
            if (newMaster.recurrence) newMaster.recurringGroupId = newMaster.id
            masters = [...masters, newMaster]
          }

          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      deleteActivity: (id) => {
        set(s => {
          const instance = s.activities.find(a => a.id === id)
          if (!instance) return s

          if (!instance.recurringGroupId) {
            const masters = s.masters.filter(m => m.id !== id)
            return { masters, activities: rebuildFromMasters(masters) }
          }

          const groupId  = instance.recurringGroupId
          const instDate = instance.dueDate ? midnight(new Date(instance.dueDate)) : null
          if (!instDate) return s

          const masters = s.masters.map(m => {
            if (m.id !== groupId) return m
            const exceptions = [...(m.exceptDates ?? []), instDate]
            const instanceOverrides = { ...(m.instanceOverrides ?? {}) }
            delete instanceOverrides[instDate.toISOString()]
            return { ...m, exceptDates: exceptions, instanceOverrides, updatedAt: new Date() }
          })

          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      deleteAllInSeries: (groupId) => {
        set(s => {
          const masters = s.masters.filter(m => m.id !== groupId)
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      deleteThisAndFuture: (id) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return

        const groupId = instance.recurringGroupId
        const cutDate = instance.dueDate ? midnight(new Date(instance.dueDate)) : null

        if (!groupId || !cutDate) {
          get().deleteActivity(id)
          return
        }

        set(s => {
          const masters = s.masters.map(m => {
            if (m.id !== groupId) return m
            const newEnd = addDays(cutDate, -1)
            const rec    = m.recurrence ? { ...m.recurrence, endsOn: newEnd } : m.recurrence
            return { ...m, recurrence: rec, updatedAt: new Date() }
          })
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      // Detaches this occurrence as a standalone clone.
      // Only use this when the user explicitly wants to change the date of one occurrence.
      updateInstance: (id, updates) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return

        if (!instance.recurringGroupId) {
          get().updateActivity(id, updates)
          return
        }

        const groupId = instance.recurringGroupId
        const oldDate = instance.dueDate ? midnight(new Date(instance.dueDate)) : null
        if (!oldDate) return

        set(s => {
          const masters = s.masters.map(m => {
            if (m.id !== groupId) return m
            const exceptions = [...(m.exceptDates ?? []), oldDate]
            const instanceOverrides = { ...(m.instanceOverrides ?? {}) }
            delete instanceOverrides[oldDate.toISOString()]
            return { ...m, exceptDates: exceptions, instanceOverrides, updatedAt: new Date() }
          })

          const sourceMaster = s.masters.find(m => m.id === groupId)
          if (!sourceMaster) return { masters, activities: rebuildFromMasters(masters) }

          const clone: Activity = {
            ...sourceMaster,
            ...updates,
            id:                uid(),
            dueDate:           updates.dueDate ?? instance.dueDate,
            status:            updates.status ?? instance.status ?? sourceMaster.status,
            completedAt: (() => {
              const newStatus = updates.status ?? instance.status ?? sourceMaster.status
              if (newStatus === ActivityStatus.COMPLETED && instance.status !== ActivityStatus.COMPLETED)
                return new Date()
              if (newStatus !== ActivityStatus.COMPLETED) return undefined
              return instance.completedAt
            })(),
            recurrence:        undefined,
            recurringGroupId:  undefined,
            recurringIndex:    undefined,
            exceptDates:       undefined,
            instanceOverrides: undefined,
            updatedAt:         new Date(),
          }

          const allMasters = [...masters, clone]
          return { masters: allMasters, activities: rebuildFromMasters(allMasters) }
        })
      },

      // Saves edits to a single occurrence WITHOUT detaching it from the series.
      // Writes the changed fields into instanceOverrides on the master, keyed by
      // this instance's date. expandRecurring merges them on every rebuild.
      updateInstanceInPlace: (id, updates) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return

        if (!instance.recurringGroupId) {
          get().updateActivity(id, updates)
          return
        }

        const groupId = instance.recurringGroupId
        const dateKey = instance.dueDate
          ? midnight(new Date(instance.dueDate)).toISOString()
          : id

        set(s => {
          const masters = s.masters.map(m => {
            if (m.id !== groupId) return m
            const existing = m.instanceOverrides?.[dateKey] ?? {}
            return {
              ...m,
              instanceOverrides: {
                ...(m.instanceOverrides ?? {}),
                [dateKey]: { ...existing, ...updates },
              },
              updatedAt: new Date(),
            }
          })
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      toggleInstanceStatus: (id) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return

        if (!instance.recurringGroupId) {
          const next = instance.status === ActivityStatus.COMPLETED
            ? ActivityStatus.PUBLISHED
            : ActivityStatus.COMPLETED
          get().updateActivity(id, {
            status:      next,
            completedAt: next === ActivityStatus.COMPLETED ? new Date() : undefined,
          })
          return
        }

        const groupId   = instance.recurringGroupId
        const dateKey   = instance.dueDate
          ? midnight(new Date(instance.dueDate)).toISOString()
          : id
        const isNowDone = instance.status !== ActivityStatus.COMPLETED

        set(s => {
          const masters = s.masters.map(m => {
            if (m.id !== groupId) return m
            const next = { ...(m.completedStatuses ?? {}) }
            if (isNowDone) {
              next[dateKey] = { status: ActivityStatus.COMPLETED, completedAt: new Date().toISOString() }
            } else {
              delete next[dateKey]
            }
            return { ...m, completedStatuses: next, updatedAt: new Date() }
          })
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      rescheduleInstance: (id, newDate) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return id

        if (!instance.recurringGroupId) {
          get().updateActivity(id, { dueDate: newDate })
          return id
        }

        const groupId = instance.recurringGroupId
        const oldDate = instance.dueDate ? midnight(new Date(instance.dueDate)) : null
        if (!oldDate) return id

        const cloneId = uid()

        set(s => {
          const masters = s.masters.map(m => {
            if (m.id !== groupId) return m
            const exceptions = [...(m.exceptDates ?? []), oldDate]
            const instanceOverrides = { ...(m.instanceOverrides ?? {}) }
            delete instanceOverrides[oldDate.toISOString()]
            return { ...m, exceptDates: exceptions, instanceOverrides, updatedAt: new Date() }
          })

          const sourceMaster = s.masters.find(m => m.id === groupId)
          if (!sourceMaster) return { masters, activities: rebuildFromMasters(masters) }

          const clone: Activity = {
            ...sourceMaster,
            id:                cloneId,
            dueDate:           midnight(new Date(newDate)),
            recurrence:        undefined,
            recurringGroupId:  undefined,
            recurringIndex:    undefined,
            exceptDates:       undefined,
            instanceOverrides: undefined,
            createdAt:         sourceMaster.createdAt,
            updatedAt:         new Date(),
          }

          const allMasters = [...masters, clone]
          return { masters: allMasters, activities: rebuildFromMasters(allMasters) }
        })

        return cloneId
      },

      startTimer: (id) => {
        set({ timer: { activityId: id, startedAt: Date.now() } })
      },

      stopTimer: () => {
        const current = get().timer
        set({ timer: null })
        return current
      },

      logTime: (id, log) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance) return

        const prevLogs   = instance.timeLogs ?? []
        const prevActual = instance.actualHours ?? 0
        const updates: InstanceOverride = {
          timeLogs:    [...prevLogs, log],
          actualHours: Math.round((prevActual + log.duration) * 100) / 100,
        }

        if (instance.recurringGroupId) {
          get().updateInstanceInPlace(id, updates)
        } else {
          get().updateActivity(id, updates)
        }
      },

      // Toggle a step. For recurring instances, writes into instanceOverrides so
      // the change is per-occurrence and the instance stays in the series.
      toggleStep: (id, stepId) => {
        const instance = get().activities.find(a => a.id === id)
        if (!instance || !instance.steps) return

        const newSteps = instance.steps.map(s =>
          s.id === stepId ? { ...s, done: !s.done } : s
        )
        const allDone = newSteps.length > 0 && newSteps.every(s => s.done)

        if (instance.recurringGroupId) {
          get().updateInstanceInPlace(id, { steps: newSteps })
          if (allDone && instance.status !== ActivityStatus.COMPLETED) {
            get().toggleInstanceStatus(id)
          }
        } else {
          get().updateActivity(id, {
            steps: newSteps,
            ...(allDone && instance.status !== ActivityStatus.COMPLETED
              ? { status: ActivityStatus.COMPLETED, completedAt: new Date() }
              : {}),
          })
        }
      },

      clearCourse: (courseId) => {
        set(s => {
          const masters = s.masters.map(m =>
            m.courseId === courseId ? { ...m, courseId: undefined, updatedAt: new Date() } : m
          )
          return { masters, activities: rebuildFromMasters(masters) }
        })
      },

      getActivity: (id) => get().activities.find(a => a.id === id),
      setError:    (error) => set({ error }),
    }),
    {
      name:    'activity-store-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ masters: s.masters }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.masters    = state.masters.map(reviveDates)
          state.activities = rebuildFromMasters(state.masters)
        }
      },
    }
  )
)
