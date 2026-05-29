<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useCronStore } from '../stores/cron'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'

const store = useCronStore()
const { stats, jobs } = storeToRefs(store)

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  store.loadStats()
  store.loadJobs()
  
  // 初始化图表
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    updateChart()
  }
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
})

function updateChart() {
  if (!chart) return

  const option = {
    title: {
      text: '任务执行统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: stats.value?.enabledJobs || 0, name: '启用中', itemStyle: { color: '#10b981' } },
          { value: (stats.value?.totalJobs || 0) - (stats.value?.enabledJobs || 0), name: '已禁用', itemStyle: { color: '#6b7280' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

function formatTime(timestamp?: number) {
  if (!timestamp) return '未执行'
  return new Date(timestamp).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">📈 统计分析</h2>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="text-sm text-gray-500">总任务数</div>
        <div class="text-3xl font-bold text-purple-600">
          {{ stats?.totalJobs || 0 }}
        </div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">启用中</div>
        <div class="text-3xl font-bold text-green-600">
          {{ stats?.enabledJobs || 0 }}
        </div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">成功率</div>
        <div class="text-3xl font-bold text-blue-600">
          {{ stats?.successRate || '0' }}%
        </div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">最近执行</div>
        <div class="text-lg font-medium text-indigo-600">
          {{ stats?.recentRuns && stats.recentRuns.length > 0 ? formatTime(new Date(stats.recentRuns[0].started_at).getTime()) : '无' }}
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="card">
      <div ref="chartRef" class="w-full h-80"></div>
    </div>

    <!-- 最近执行记录 -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📜 最近执行记录</h3>
      <div v-if="stats?.recentRuns && stats.recentRuns.length > 0" class="space-y-3">
        <div 
          v-for="run in stats.recentRuns" 
          :key="run.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div :class="run.status === 'ok' ? 'text-green-600' : 'text-red-600'">
              {{ run.status === 'ok' ? '✅' : '❌' }}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">
                任务 ID: {{ run.job_id }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatTime(new Date(run.started_at).getTime()) }}
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            {{ run.duration_ms ? `${run.duration_ms}ms` : '-' }}
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        暂无执行记录
      </div>
    </div>
  </div>
</template>
