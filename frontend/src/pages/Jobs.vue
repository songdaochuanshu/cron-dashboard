<template>
  <div>
    <div class="card">
      <h3>📋 任务列表</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="job-list">
        <div v-for="job in jobs" :key="job.id" class="job-item">
          <div class="job-info">
            <span class="job-icon">{{ job.enabled ? '✅' : '⏸️' }}</span>
            <div>
              <div class="job-name">{{ job.name }}</div>
              <div class="job-id">{{ job.id }}</div>
              <div class="job-schedule">{{ job.schedule.expr }} ({{ job.schedule.tz }})</div>
            </div>
          </div>
          <div class="job-actions">
            <button @click="toggle(job.id, job.enabled)" :class="job.enabled ? 'btn-warning' : 'btn-success'">
              {{ job.enabled ? '⏸️ 禁用' : '▶️ 启用' }}
            </button>
            <button @click="trigger(job.id)" class="btn-primary">🚀 触发</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchJobs, toggleJob, triggerJob } from '../api/cron'
import type { CronJob } from '../api/cron'

const jobs = ref<CronJob[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    jobs.value = await fetchJobs()
  } catch (error) {
    console.error('加载任务失败:', error)
  } finally {
    loading.value = false
  }
})

async function toggle(id: string, enabled: boolean) {
  try {
    await toggleJob(id, !enabled)
    jobs.value = jobs.value.map(j => j.id === id ? { ...j, enabled: !enabled } : j)
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

async function trigger(id: string) {
  try {
    await triggerJob(id)
    alert('任务已触发！')
  } catch (error) {
    console.error('触发任务失败:', error)
  }
}
</script>

<style scoped>
.job-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.job-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: #f9fafb; border-radius: 0.5rem; }
.job-info { display: flex; align-items: center; gap: 1rem; }
.job-icon { font-size: 2rem; }
.job-name { font-weight: 600; font-size: 1.1rem; }
.job-id { color: #6b7280; font-size: 0.75rem; font-family: monospace; }
.job-schedule { color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem; }
.job-actions { display: flex; gap: 0.5rem; }
.btn-warning { background: #f59e0b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.btn-success { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.btn-primary { background: #7c3aed; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
h3 { margin-bottom: 1rem; }
</style>
