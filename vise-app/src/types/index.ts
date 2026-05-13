export interface Workout {
  id: number
  title: string
  description: string
  date: string
  start_time: string | null
  duration_minutes: number
  category: 'strength' | 'cardio' | 'yoga' | 'other'
  completed: number // 0 or 1
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: number
  workout_id: number
  name: string
  sets: number
  reps: number
  weight_kg: number
  notes: string
  sort_order: number
}

export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[]
}

export interface Memo {
  id: number
  title: string
  content: string
  date: string
  tag: 'nutrition' | 'goal' | 'injury' | 'general'
  created_at: string
  updated_at: string
}

export type CalendarDay = {
  workouts: Workout[]
  memos: Memo[]
}
