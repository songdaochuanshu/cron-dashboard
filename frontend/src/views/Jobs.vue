<script setup lang="ts">
import { onMounted } from 'vue'
import { useCronStore } from '../stores/cron'
import { storeToRefs } from 'pinia'

const store = useCronStore()
const { jobs, loading } = storeToRefs(store)

onMounted(() => {
  store.loadJobs()
})

function formatTime(timestamp?: number) {
  if (!timestamp) return '未执行'
  return new Date(timestamp).toLocaleString('zh-CN')
}

async function toggleJob(jobId: string, currentStatus: boolean) {
  await store.toggleJobStatus(jobId, !currentStatus)
}

async function triggerJob(jobId: string) {
  await store.triggerJobExecution(jobId)
  alert('任务已触发！')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">📋 任务列表</h2>
      <button @click="store.loadJobs()" class="btn-secondary">
        🔄 刷新
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">加载中...</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="job in jobs" 
        :key="job.id"
        class="card"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-3xl">
              {{ job.enabled ? '✅' : '⏸️' }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ job.name }}</h3>
              <p class="text-sm text-gray-500">
                ID: {{ job.id }}
              </p>
              <p class="text-sm text-gray-500">
                调度: 
                <span v-if="job.schedule.kind === 'cron'">
                  {{ job.schedule.expr }} ({{ job.schedule.tz }})
                </span>
                <span v-else>
                  每 {{ job.schedule.everyMs }} 毫秒
                </span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <button 
              @click="toggleJob(job.id, job.enabled)"
              :class="job.enabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'"
              class="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {{ job.enabled ? '⏸️ 禁用' : '▶️ 启用' }}
            </button>
            
            <button 
              @click="triggerJob(job.id)"
              class="btn-primary"
            >
              🚀 触发
            </button>
            
            <router-link 
              :to="`/jobs/${job.id}`"
              class="btn-secondary"
            >
              📊 详情
            </router-link>
          </div>
        </div>

        <!-- 任务状态信息 -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-500">上次执行:</span>
              <span class="ml-2 font-medium">
                {{ formatTime(job.state?.lastRunAtMs) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">状态:</span>
              <span :class="job.state?.lastRunStatus === 'ok' ? 'text-green-600' : 'text-red-600'" class="ml-2 font-medium">
                {{ job.state?.lastRunStatus === 'ok' ? '✅ 成功' : '❌ 失败' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">下次执行:</span>
              <span class="ml-2 font-medium">
                {{ formatTime(job.state?.nextRunAtMs) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
