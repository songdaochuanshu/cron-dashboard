<template>
  <div>
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">总任务数</div>
        <div class="stat-value purple">{{ stats?.totalJobs || 0 }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">启用中</div>
        <div class="stat-value green">{{ stats?.enabledJobs || 0 }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">成功率</div>
        <div class="stat-value blue">{{ stats?.successRate || '0' }}%</div>
      </div>
    </div>

    <div class="card">
      <h3>📈 统计分析</h3>
      <div class="chart-container">
        <div class="chart-item">
          <div class="chart-label">启用</div>
          <div class="chart-bar" :style="{ width: enabledPercent + '%' }"></div>
          <div class="chart-value">{{ stats?.enabledJobs || 0 }}</div>
        </div>
        <div class="chart-item">
          <div class="chart-label">禁用</div>
          <div class="chart-bar disabled" :style="{ width: disabledPercent + '%' }"></div>
          <div class="chart-value">{{ disabledCount }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchStats } from '../api/cron'
import type { Stats as StatsType } from '../api/cron'

const stats = ref<StatsType | null>(null)

onMounted(async () => {
  try {
    stats.value = await fetchStats()
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
})

const disabledCount = computed(() => (stats.value?.totalJobs || 0) - (stats.value?.enabledJobs || 0))
const enabledPercent = computed(() => stats.value ? (stats.value.enabledJobs / stats.value.totalJobs * 100) : 0)
const disabledPercent = computed(() => stats.value ? (disabledCount.value / stats.value.totalJobs * 100) : 0)
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { text-align: center; }
.stat-label { color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: bold; }
.stat-value.purple { color: #7c3aed; }
.stat-value.green { color: #10b981; }
.stat-value.blue { color: #3b82f6; }
.chart-container { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.chart-item { display: flex; align-items: center; gap: 1rem; }
.chart-label { width: 3rem; }
.chart-bar { height: 2rem; background: #10b981; border-radius: 0.25rem; min-width: 2rem; }
.chart-bar.disabled { background: #6b7280; }
.chart-value { font-weight: 500; }
h3 { margin-bottom: 1rem; }
</style>
