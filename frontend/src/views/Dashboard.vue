<script setup lang="ts">
import { onMounted } from 'vue'
import { useCronStore } from '../stores/cron'
import { storeToRefs } from 'pinia'

const store = useCronStore()
const { jobs, stats, loading } = storeToRefs(store)

onMounted(async () => {
  await store.loadJobs()
  await store.loadStats()
})

function formatTime(timestamp?: number) {
  if (!timestamp) return '未执行'
  return new Date(timestamp).toLocaleString('zh-CN')
}

function getStatusColor(status?: string) {
  return status === 'ok' ? 'text-green-600' : 'text-red-600'
}

function getStatusText(status?: string) {
  return status === 'ok' ? '✅ 成功' : '❌ 失败'
}
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎区域 -->
    <div class="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <h2 class="text-2xl font-bold mb-2">🐾 欢迎使用小爪定时任务管理平台</h2>
      <p class="text-purple-100">管理和监控你的所有定时任务</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="card">
        <div class="text-sm text-gray-500">总任务数</div>
        <div class="text-3xl font-bold text-purple-600">
          {{ stats?.totalJobs || jobs.length }}
        </div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">启用中</div>
        <div class="text-3xl font-bold text-green-600">
          {{ stats?.enabledJobs || jobs.filter(j => j.enabled).length }}
        </div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">成功率</div>
        <div class="text-3xl font-bold text-blue-600">
          {{ stats?.successRate || '100' }}%
        </div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-500">下次执行</div>
        <div class="text-lg font-medium text-indigo-600">
          {{ jobs.length > 0 ? formatTime(jobs[0].state?.nextRunAtMs) : '无' }}
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 任务概览</h3>
      
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">加载中...</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="job in jobs" 
          :key="job.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="text-2xl">
              {{ job.enabled ? '✅' : '⏸️' }}
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ job.name }}</h4>
              <p class="text-sm text-gray-500">
                {{ job.schedule.kind === 'cron' ? `定时: ${job.schedule.expr}` : `间隔: ${job.schedule.everyMs}ms` }}
                {{ job.schedule.tz ? `(${job.schedule.tz})` : '' }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm text-gray-500">上次执行</div>
              <div :class="getStatusColor(job.state?.lastRunStatus)">
                {{ getStatusText(job.state?.lastRunStatus) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">下次执行</div>
              <div class="text-sm text-gray-900">
                {{ formatTime(job.state?.nextRunAtMs) }}
              </div>
            </div>
            <router-link 
              :to="`/jobs/${job.id}`"
              class="btn-primary text-sm"
            >
              查看详情
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
