import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchJob, toggleJob, triggerJob } from '../api/cron'
import type { CronJob } from '../types'
import dayjs from 'dayjs'

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<CronJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadJob(id)
  }, [id])

  async function loadJob(jobId: string) {
    setLoading(true)
    try {
      const data = await fetchJob(jobId)
      setJob(data)
    } catch (error) {
      console.error('加载任务详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(timestamp?: number) {
    if (!timestamp) return '未执行'
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }

  function formatDuration(ms?: number) {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  async function handleToggle() {
    if (job && id) {
      await toggleJob(id, !job.enabled)
      setJob({ ...job, enabled: !job.enabled })
    }
  }

  async function handleTrigger() {
    if (id) {
      await triggerJob(id)
      alert('任务已触发！')
      loadJob(id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">任务不存在</h2>
        <Link to="/jobs" className="btn-primary mt-4 inline-block">
          返回任务列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/jobs" className="btn-secondary">
          ← 返回列表
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">📊 任务详情</h2>
      </div>

      {/* 任务基本信息 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{job.name}</h3>
            <p className="text-sm text-gray-500 font-mono mt-1">ID: {job.id}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleToggle()}
              className={job.enabled ? 'btn-warning' : 'btn-success'}
            >
              {job.enabled ? '⏸️ 禁用' : '▶️ 启用'}
            </button>
            <button onClick={handleTrigger} className="btn-primary">
              🚀 手动触发
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="text-sm text-purple-600 mb-1">状态</div>
            <div className={`text-lg font-medium ${job.enabled ? 'text-green-600' : 'text-red-600'}`}>
              {job.enabled ? '✅ 启用中' : '⏸️ 已禁用'}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="text-sm text-blue-600 mb-1">调度类型</div>
            <div className="text-lg font-medium text-blue-900">
              {job.schedule.kind === 'cron' ? '定时任务' : '间隔任务'}
            </div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl">
            <div className="text-sm text-indigo-600 mb-1">调度表达式</div>
            <div className="text-lg font-medium text-indigo-900">
              {job.schedule.expr || `${job.schedule.everyMs}ms`}
            </div>
          </div>
          <div className="bg-violet-50 p-4 rounded-xl">
            <div className="text-sm text-violet-600 mb-1">时区</div>
            <div className="text-lg font-medium text-violet-900">
              {job.schedule.tz || '未设置'}
            </div>
          </div>
        </div>
      </div>

      {/* 执行状态 */}
      <div className="card">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">⏰ 执行状态</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="text-sm text-green-600 mb-1">上次执行</div>
            <div className="text-lg font-medium text-green-900">
              {formatTime(job.state?.lastRunAtMs)}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="text-sm text-blue-600 mb-1">执行状态</div>
            <div className={`text-lg font-medium ${job.state?.lastRunStatus === 'ok' ? 'text-green-900' : 'text-red-900'}`}>
              {job.state?.lastRunStatus === 'ok' ? '✅ 成功' : '❌ 失败'}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="text-sm text-purple-600 mb-1">下次执行</div>
            <div className="text-lg font-medium text-purple-900">
              {formatTime(job.state?.nextRunAtMs)}
            </div>
          </div>
        </div>
      </div>

      {/* 任务内容 */}
      <div className="card">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📝 任务内容</h4>
        <div className="bg-gray-50 p-4 rounded-xl">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {job.payload?.message || '无内容'}
          </pre>
        </div>
      </div>

      {/* 执行历史 */}
      <div className="card">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">📜 执行历史</h4>
        {job.runs && job.runs.length > 0 ? (
          <div className="space-y-3">
            {job.runs.map(run => (
              <div 
                key={run.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-xl ${run.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                    {run.status === 'ok' ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(new Date(run.started_at).getTime())}
                    </div>
                    <div className="text-xs text-gray-500">
                      耗时: {formatDuration(run.duration_ms)}
                    </div>
                  </div>
                </div>
                {run.error_message && (
                  <div className="text-sm text-red-600 max-w-xs truncate">
                    {run.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无执行记录
          </div>
        )}
      </div>
    </div>
  )
}
