import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchJobs, toggleJob, triggerJob } from '../api/cron'
import type { CronJob } from '../types'
import dayjs from 'dayjs'

export default function Jobs() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setLoading(true)
    try {
      const data = await fetchJobs()
      setJobs(data)
    } catch (error) {
      console.error('加载任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(timestamp?: number) {
    if (!timestamp) return '未执行'
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }

  async function handleToggle(jobId: string, currentStatus: boolean) {
    try {
      await toggleJob(jobId, !currentStatus)
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, enabled: !currentStatus } : job
      ))
    } catch (error) {
      console.error('切换状态失败:', error)
    }
  }

  async function handleTrigger(jobId: string) {
    try {
      await triggerJob(jobId)
      alert('任务已触发！')
      loadJobs()
    } catch (error) {
      console.error('触发任务失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📋 任务列表</h2>
        <button onClick={loadJobs} className="btn-secondary">
          🔄 刷新
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {job.enabled ? '✅' : '⏸️'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{job.id}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    调度: 
                    <span className="ml-1">
                      {job.schedule.kind === 'cron' 
                        ? `${job.schedule.expr} (${job.schedule.tz})` 
                        : `每 ${job.schedule.everyMs} 毫秒`
                      }
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleToggle(job.id, job.enabled)}
                  className={job.enabled ? 'btn-warning' : 'btn-success'}
                >
                  {job.enabled ? '⏸️ 禁用' : '▶️ 启用'}
                </button>
                
                <button 
                  onClick={() => handleTrigger(job.id)}
                  className="btn-primary"
                >
                  🚀 触发
                </button>
                
                <Link 
                  to={`/jobs/${job.id}`}
                  className="btn-secondary"
                >
                  📊 详情
                </Link>
              </div>
            </div>

            {/* 任务状态信息 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">上次执行:</span>
                  <span className="ml-2 font-medium">
                    {formatTime(job.state?.lastRunAtMs)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">状态:</span>
                  <span className={`ml-2 font-medium ${job.state?.lastRunStatus === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                    {job.state?.lastRunStatus === 'ok' ? '✅ 成功' : '❌ 失败'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">下次执行:</span>
                  <span className="ml-2 font-medium">
                    {formatTime(job.state?.nextRunAtMs)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
