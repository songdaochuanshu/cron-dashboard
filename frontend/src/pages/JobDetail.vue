<template>
  <div>
    <div class="card">
      <h3>📊 任务详情</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="job">
        <div class="job-header">
          <div>
            <h2>{{ job.name }}</h2>
            <p class="job-id">ID: {{ job.id }}</p>
          </div>
          <div class="job-actions">
            <button @click="toggle()" :class="job.enabled ? 'btn-warning' : 'btn-success'">
              {{ job.enabled ? '⏸️ 禁用' : '▶️ 启用' }}
            </button>
            <button @click="trigger()" class="btn-primary">🚀 触发</button>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">状态</div>
            <div :class="job.enabled ? 'status-ok' : 'status-error'">
              {{ job.enabled ? '✅ 启用中' : '⏸️ 已禁用' }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">调度</div>
            <div>{{ job.schedule.expr }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">时区</div>
            <div>{{ job.schedule.tz }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchJobs, toggleJob, triggerJob } from '../api/cron'
import type { CronJob } from '../api/cron'

const route = useRoute()
const job = ref<CronJob | null>(null)
const loading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  try {
    const jobs = await fetchJobs()
    job.value = jobs.find(j => j.id === id) || null
  } catch (error) {
    console.error('加载任务详情失败:', error)
  } finally {
    loading.value = false
  }
})

async function toggle() {
  if (job.value) {
    await toggleJob(job.value.id, !job.value.enabled)
    job.value.enabled = !job.value.enabled
  }
}

async function trigger() {
  if (job.value) {
    await triggerJob(job.value.id)
    alert('任务已触发！')
  }
}
</script>

<style scoped>
.job-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.job-id { color: #6b7280; font-size: 0.875rem; font-family: monospace; margin-top: 0.5rem; }
.job-actions { display: flex; gap: 0.5rem; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.info-item { background: #f9fafb; padding: 1.5rem; border-radius: 0.5rem; }
.info-label { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem; }
.status-ok { color: #10b981; font-weight: 500; }
.status-error { color: #ef4444; font-weight: 500; }
.btn-warning { background: #f59e0b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.btn-success { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
.btn-primary { background: #7c3aed; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
h3 { margin-bottom: 1rem; }
</style>
