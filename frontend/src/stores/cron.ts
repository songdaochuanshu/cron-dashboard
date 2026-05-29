import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchJobs, fetchJob, toggleJob, triggerJob, fetchStats } from '../api/cron'
import type { CronJob, Stats } from '../api/cron'

export const useCronStore = defineStore('cron', () => {
  const jobs = ref<CronJob[]>([])
  const currentJob = ref<CronJob | null>(null)
  const stats = ref<Stats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeJobs = computed(() => jobs.value.filter(job => job.enabled))
  const inactiveJobs = computed(() => jobs.value.filter(job => !job.enabled))

  // 获取所有任务
  async function loadJobs() {
    loading.value = true
    error.value = null
    try {
      jobs.value = await fetchJobs()
    } catch (err) {
      error.value = '获取任务列表失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 获取单个任务详情
  async function loadJob(id: string) {
    loading.value = true
    error.value = null
    try {
      currentJob.value = await fetchJob(id)
    } catch (err) {
      error.value = '获取任务详情失败'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 切换任务状态
  async function toggleJobStatus(id: string, enabled: boolean) {
    try {
      const success = await toggleJob(id, enabled)
      if (success) {
        // 更新本地状态
        const job = jobs.value.find(j => j.id === id)
        if (job) {
          job.enabled = enabled
        }
        if (currentJob.value?.id === id) {
          currentJob.value.enabled = enabled
        }
      }
      return success
    } catch (err) {
      error.value = '切换任务状态失败'
      console.error(err)
      return false
    }
  }

  // 手动触发任务
  async function triggerJobExecution(id: string) {
    try {
      return await triggerJob(id)
    } catch (err) {
      error.value = '触发任务失败'
      console.error(err)
      return false
    }
  }

  // 获取统计信息
  async function loadStats() {
    try {
      stats.value = await fetchStats()
    } catch (err) {
      console.error('获取统计信息失败:', err)
    }
  }

  return {
    jobs,
    currentJob,
    stats,
    loading,
    error,
    activeJobs,
    inactiveJobs,
    loadJobs,
    loadJob,
    toggleJobStatus,
    triggerJobExecution,
    loadStats
  }
})
