import AsyncStorage from '@react-native-async-storage/async-storage'

let _baseUrl = ''

async function getBaseUrl(): Promise<string> {
  if (_baseUrl) return _baseUrl
  const stored = await AsyncStorage.getItem('api_url')
  _baseUrl = stored || 'http://localhost:8787/api'
  return _baseUrl
}

// Call this after changing the API URL in settings
export function resetBaseUrl() {
  _baseUrl = ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const base = await getBaseUrl()
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getMonth: (ym: string) =>
    request<{ month: string; days: Record<string, { workouts: any[]; memos: any[] }> }>(`/calendar/month/${ym}`),

  getWorkouts: (params?: { date?: string; month?: string }) => {
    const qs = new URLSearchParams()
    if (params?.date) qs.set('date', params.date)
    if (params?.month) qs.set('month', params.month)
    return request<any[]>(`/workouts?${qs}`)
  },

  getWorkout: (id: number) => request<any>(`/workouts/${id}`),

  createWorkout: (data: any) =>
    request<any>('/workouts', { method: 'POST', body: JSON.stringify(data) }),

  updateWorkout: (id: number, data: any) =>
    request<any>(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteWorkout: (id: number) =>
    request<any>(`/workouts/${id}`, { method: 'DELETE' }),

  getMemos: (params?: { date?: string; tag?: string }) => {
    const qs = new URLSearchParams()
    if (params?.date) qs.set('date', params.date)
    if (params?.tag) qs.set('tag', params.tag)
    return request<any[]>(`/memos?${qs}`)
  },

  getMemo: (id: number) => request<any>(`/memos/${id}`),

  createMemo: (data: any) =>
    request<any>('/memos', { method: 'POST', body: JSON.stringify(data) }),

  updateMemo: (id: number, data: any) =>
    request<any>(`/memos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteMemo: (id: number) =>
    request<any>(`/memos/${id}`, { method: 'DELETE' }),
}
