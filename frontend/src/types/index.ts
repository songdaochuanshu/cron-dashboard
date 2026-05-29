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
