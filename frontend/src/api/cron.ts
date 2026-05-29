import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: {
    kind: string
    expr?: string
    everyMs?: number
    tz?: string
  }
  state?: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    consecutiveErrors: number
  }
  payload?: {
    kind: string
    message?: string
  }
  runs?: Run[]
}

export interface Run {
  id: number
  job_id: string
  status: string
  started_at: string
  finished_at?: string
  duration_ms?: number
  error_message?: string
}

export interface Stats {
  totalJobs: number
  enabledJobs: number
  recentRuns: Run[]
  successRate: string
}

// 获取所有任务
export async function fetchJobs(): Promise<CronJob[]> {
  const response = await api.get('/cron/jobs')
  return response.data.data
}

// 获取单个任务详情
export async function fetchJob(id: string): Promise<CronJob> {
  const response = await api.get(`/cron/jobs/${id}`)
  return response.data.data
}

// 切换任务状态
export async function toggleJob(id: string, enabled: boolean): Promise<boolean> {
  const response = await api.patch(`/cron/jobs/${id}/toggle`, { enabled })
  return response.data.success
}

// 手动触发任务
export async function triggerJob(id: string): Promise<boolean> {
  const response = await api.post(`/cron/jobs/${id}/trigger`)
  return response.data.success
}

// 获取统计信息
export async function fetchStats(): Promise<Stats> {
  const response = await api.get('/cron/stats')
  return response.data.data
}
