import { useState, useEffect } from 'react'
import { fetchJobs, fetchStats } from '../api/cron'
import type { CronJob, Stats as StatsType } from '../types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import dayjs from 'dayjs'

const COLORS = ['#10b981', '#6b7280']

export default function Stats() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [stats, setStats] = useState<StatsType | null>(null)
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

  const pieData = [
    { name: '启用中', value: stats?.enabledJobs || 0 },
    { name: '已禁用', value: (stats?.totalJobs || 0) - (stats?.enabledJobs || 0) }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">📈 统计分析</h2>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">总任务数</div>
          <div className="text-4xl font-bold text-purple-600">
            {stats?.totalJobs || 0}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">启用中</div>
          <div className="text-4xl font-bold text-green-600">
            {stats?.enabledJobs || 0}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">成功率</div>
          <div className="text-4xl font-bold text-blue-600">
            {stats?.successRate || '0'}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">最近执行</div>
          <div className="text-lg font-medium text-indigo-600">
            {stats?.recentRuns && stats.recentRuns.length > 0 
              ? formatTime(new Date(stats.recentRuns[0].started_at).getTime()) 
              : '无'
            }
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 任务状态分布</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 最近执行记录 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 最近执行记录</h3>
        {stats?.recentRuns && stats.recentRuns.length > 0 ? (
          <div className="space-y-3">
            {stats.recentRuns.map(run => (
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
                      任务 ID: {run.job_id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(new Date(run.started_at).getTime())}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {run.duration_ms ? `${run.duration_ms}ms` : '-'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无执行记录
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 所有任务</h3>
        <div className="space-y-3">
          {jobs.map(job => (
            <div 
              key={job.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="text-xl">
                  {job.enabled ? '✅' : '⏸️'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{job.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{job.id}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {job.schedule.kind === 'cron' ? job.schedule.expr : `每 ${job.schedule.everyMs}ms`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
