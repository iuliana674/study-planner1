import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Course } from '../types/activity'

const uid = () => crypto.randomUUID()

// ─── Palette ──────────────────────────────────────────────────────────────────
// Muted, earthy tones — all pass WCAG AA against white text
// Chosen to complement the app's cream/terracotta base palette

export const COURSE_COLORS = [
  '#3D5A8A', // Ink Blue    — deep, like old ink on paper
  '#6B4FA0', // Plum        — rich violet, editorial
  '#A3476F', // Dusty Rose  — antique, not bubblegum
  '#C4522A', // Terracotta  — the app accent, deep rust
  '#7A5800', // Ochre       — aged gold, warm
  '#2E6B4F', // Forest      — earthy, grounded green
  '#1F6B78', // Teal        — like aged copper patina
  '#4A5C2E', // Olive       — warm yellow-green earth
]

// ─── Store interface ──────────────────────────────────────────────────────────

interface CourseState {
  courses:      Course[]
  addCourse:    (name: string, color: string) => Course
  updateCourse: (id: string, name: string, color: string) => void
  deleteCourse: (id: string) => void
  getCourse:    (id: string) => Course | undefined
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: [],

      addCourse: (name, color) => {
        const course: Course = { id: uid(), name: name.trim(), color }
        set(s => ({ courses: [...s.courses, course] }))
        return course
      },

      updateCourse: (id, name, color) => {
        set(s => ({
          courses: s.courses.map(c =>
            c.id === id ? { ...c, name: name.trim(), color } : c
          ),
        }))
      },

      deleteCourse: (id) => {
        set(s => ({ courses: s.courses.filter(c => c.id !== id) }))
      },

      getCourse: (id) => get().courses.find(c => c.id === id),
    }),
    {
      name:    'course-store-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
