<template>
  <div>
    <div class="welcome-card">
      <h2>🐾 欢迎使用小爪定时任务管理平台</h2>
      <p>管理和监控你的所有定时任务</p>
    </div>

    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">总任务数</div>
        <div class="stat-value purple">{{ stats?.totalJobs || jobs.length }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">启用中</div>
        <div class="stat-value green">{{ stats?.enabledJobs || jobs.filter(j => j.enabled).length }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">成功率</div>
        <div class="stat-value blue">{{ stats?.successRate || '100' }}%</div>
      </div>
    </div>

    <div class="card">
      <h3>📋 任务概览</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="job-list">
        <div v-for="job in jobs" :key="job.id" class="job-item">
          <div class="job-info">
            <span class="job-icon">{{ job.enabled ? '✅' : '⏸️' }}</span>
            <div>
              <div class="job-name">{{ job.name }}</div>
              <div class="job-schedule">{{ job.schedule.expr }}</div>
            </div>
          </div>
          <div class="job-status">
            <span :class="job.state?.lastRunStatus === 'ok' ? 'status-ok' : 'status-error'">
              {{ job.state?.lastRunStatus === 'ok' ? '✅ 成功' : '❌ 失败' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchJobs, fetchStats } from '../api/cron'
import type { CronJob, Stats } from '../api/cron'

const jobs = ref<CronJob[]>([])
const stats = ref<Stats | null>(null)
const loading = ref(true)

onMounted(async () => {
  console.log('Dashboard mounted')
  try {
    const [jobsData, statsData] = await Promise.all([
      fetchJobs(),
      fetchStats()
    ])
    jobs.value = jobsData
    stats.value = statsData
    console.log('Jobs loaded:', jobsData)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.welcome-card { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 1.5rem; }
.welcome-card h2 { margin-bottom: 0.5rem; }
.welcome-card p { opacity: 0.9; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { text-align: center; }
.stat-label { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: bold; }
.stat-value.purple { color: #7c3aed; }
.stat-value.green { color: #10b981; }
.stat-value.blue { color: #3b82f6; }
.job-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.job-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
.job-info { display: flex; align-items: center; gap: 1rem; }
.job-icon { font-size: 1.5rem; }
.job-name { font-weight: 500; }
.job-schedule { color: #6b7280; font-size: 0.875rem; }
.status-ok { color: #10b981; }
.status-error { color: #ef4444; }
h3 { margin-bottom: 1rem; }
</style>
