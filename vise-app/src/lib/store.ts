import AsyncStorage from '@react-native-async-storage/async-storage'

const WORKOUTS_KEY = 'visefit_workouts'
const MEMOS_KEY = 'visefit_memos'

export interface Workout {
  id: string
  title: string
  date: string
  startTime?: string
  durationMinutes: number
  category: 'strength' | 'cardio' | 'yoga' | 'other'
  completed: boolean
  createdAt: string
}

export interface Memo {
  id: string
  title: string
  content: string
  date: string
  tag: 'nutrition' | 'goal' | 'injury' | 'general'
  createdAt: string
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

async function load<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key)
  return raw ? JSON.parse(raw) : []
}

async function save<T>(key: string, data: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(data))
}

// Workouts
export async function getWorkouts(date?: string): Promise<Workout[]> {
  const all = await load<Workout>(WORKOUTS_KEY)
  if (date) return all.filter(w => w.date === date)
  return all.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getMonthData(ym: string): Promise<Record<string, { workouts: Workout[]; memos: Memo[] }>> {
  const [workouts, memos] = await Promise.all([
    load<Workout>(WORKOUTS_KEY),
    load<Memo>(MEMOS_KEY),
  ])
  const wMonth = workouts.filter(w => w.date.startsWith(ym))
  const mMonth = memos.filter(m => m.date.startsWith(ym))

  const map: Record<string, { workouts: Workout[]; memos: Memo[] }> = {}
  for (const w of wMonth) {
    if (!map[w.date]) map[w.date] = { workouts: [], memos: [] }
    map[w.date].workouts.push(w)
  }
  for (const m of mMonth) {
    if (!map[m.date]) map[m.date] = { workouts: [], memos: [] }
    map[m.date].memos.push(m)
  }
  return map
}

export async function addWorkout(data: Omit<Workout, 'id' | 'createdAt' | 'completed'>): Promise<Workout> {
  const all = await load<Workout>(WORKOUTS_KEY)
  const workout: Workout = { ...data, id: uid(), completed: false, createdAt: new Date().toISOString() }
  all.push(workout)
  await save(WORKOUTS_KEY, all)
  return workout
}

export async function updateWorkout(id: string, patch: Partial<Workout>) {
  const all = await load<Workout>(WORKOUTS_KEY)
  const idx = all.findIndex(w => w.id === id)
  if (idx !== -1) { all[idx] = { ...all[idx], ...patch }; await save(WORKOUTS_KEY, all) }
}

export async function removeWorkout(id: string) {
  const all = await load<Workout>(WORKOUTS_KEY)
  await save(WORKOUTS_KEY, all.filter(w => w.id !== id))
}

// Memos
export async function getMemos(tag?: string): Promise<Memo[]> {
  const all = await load<Memo>(MEMOS_KEY)
  if (tag) return all.filter(m => m.tag === tag)
  return all.sort((a, b) => b.date.localeCompare(a.date))
}

export async function addMemo(data: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> {
  const all = await load<Memo>(MEMOS_KEY)
  const memo: Memo = { ...data, id: uid(), createdAt: new Date().toISOString() }
  all.push(memo)
  await save(MEMOS_KEY, all)
  return memo
}

export async function removeMemo(id: string) {
  const all = await load<Memo>(MEMOS_KEY)
  await save(MEMOS_KEY, all.filter(m => m.id !== id))
}
