import axios from 'axios'

// 从环境变量读取 API 地址，如果没有则使用默认值
const API_URL = import.meta.env.VITE_API_URL || 'https://cron-dashboard.songdaochuanshu.workers.dev'

console.log('API URL:', API_URL) // 调试用

const api = axios.create({
  baseURL: API_URL,
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
}

export interface Stats {
  totalJobs: number
  enabledJobs: number
  recentRuns: any[]
  successRate: string
}

// 获取所有任务
export async function fetchJobs(): Promise<CronJob[]> {
  console.log('Fetching jobs from:', API_URL + '/api/cron/jobs')
  const response = await api.get('/api/cron/jobs')
  console.log('Jobs response:', response.data)
  return response.data.data
}

// 获取统计信息
export async function fetchStats(): Promise<Stats> {
  const response = await api.get('/api/cron/stats')
  return response.data.data
}

// 切换任务状态
export async function toggleJob(id: string, enabled: boolean): Promise<boolean> {
  const response = await api.patch(`/api/cron/jobs/${id}/toggle`, { enabled })
  return response.data.success
}

// 触发任务执行
export async function triggerJob(id: string): Promise<boolean> {
  const response = await api.post(`/api/cron/jobs/${id}/trigger`)
  return response.data.success
}
