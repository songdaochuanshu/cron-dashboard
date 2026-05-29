import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchJobs, fetchStats } from '../api/cron'
import type { CronJob, Stats } from '../types'
import dayjs from 'dayjs'

export default function Dashboard() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [jobsData, statsData] = await Promise.all([
        fetchJobs(),
        fetchStats()
      ])
      setJobs(jobsData)
      setStats(statsData)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(timestamp?: number) {
    if (!timestamp) return '未执行'
    return dayjs(timestamp).format('MM-DD HH:mm')
  }

  function getStatusColor(status?: string) {
    return status === 'ok' ? 'text-green-600' : 'text-red-600'
  }

  function getStatusText(status?: string) {
    return status === 'ok' ? '✅ 成功' : '❌ 失败'
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
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">🐾 欢迎使用小爪定时任务管理平台</h2>
        <p className="text-purple-100 text-lg">管理和监控你的所有定时任务</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">总任务数</div>
          <div className="text-4xl font-bold text-purple-600">
            {stats?.totalJobs || jobs.length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">启用中</div>
          <div className="text-4xl font-bold text-green-600">
            {stats?.enabledJobs || jobs.filter(j => j.enabled).length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">成功率</div>
          <div className="text-4xl font-bold text-blue-600">
            {stats?.successRate || '100'}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">下次执行</div>
          <div className="text-xl font-medium text-indigo-600">
            {jobs.length > 0 ? formatTime(jobs[0].state?.nextRunAtMs) : '无'}
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">📋 任务概览</h3>
          <button onClick={loadData} className="btn-secondary text-sm">
            🔄 刷新
          </button>
        </div>
        
        <div className="space-y-4">
          {jobs.map(job => (
            <div 
              key={job.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">
                  {job.enabled ? '✅' : '⏸️'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">{job.name}</h4>
                  <p className="text-sm text-gray-500">
                    {job.schedule.kind === 'cron' ? `定时: ${job.schedule.expr}` : `间隔: ${job.schedule.everyMs}ms`}
                    {job.schedule.tz ? ` (${job.schedule.tz})` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-xs text-gray-500">上次执行</div>
                  <div className={`font-medium ${getStatusColor(job.state?.lastRunStatus)}`}>
                    {getStatusText(job.state?.lastRunStatus)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">下次执行</div>
                  <div className="text-sm text-gray-900">
                    {formatTime(job.state?.nextRunAtMs)}
                  </div>
                </div>
                <Link 
                  to={`/jobs/${job.id}`}
                  className="btn-primary text-sm"
                >
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
