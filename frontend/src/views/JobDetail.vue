<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCronStore } from '../stores/cron'
import { storeToRefs } from 'pinia'

const route = useRoute()
const store = useCronStore()
const { currentJob, loading } = storeToRefs(store)

const jobId = route.params.id as string

onMounted(() => {
  store.loadJob(jobId)
})

function formatTime(timestamp?: number) {
  if (!timestamp) return '未执行'
  return new Date(timestamp).toLocaleString('zh-CN')
}

function formatDuration(ms?: number) {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

async function toggleJob() {
  if (currentJob.value) {
    await store.toggleJobStatus(jobId, !currentJob.value.enabled)
  }
}

async function triggerJob() {
  await store.triggerJobExecution(jobId)
  alert('任务已触发！')
  // 刷新任务详情
  store.loadJob(jobId)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center space-x-4">
      <router-link to="/jobs" class="btn-secondary">
        ← 返回列表
      </router-link>
      <h2 class="text-2xl font-bold text-gray-900">📊 任务详情</h2>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      <p class="mt-2 text-gray-500">加载中...</p>
    </div>

    <div v-else-if="currentJob" class="space-y-6">
      <!-- 任务基本信息 -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{{ currentJob.name }}</h3>
            <p class="text-sm text-gray-500">ID: {{ currentJob.id }}</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="toggleJob()"
              :class="currentJob.enabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'"
              class="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {{ currentJob.enabled ? '⏸️ 禁用' : '▶️ 启用' }}
            </button>
            <button @click="triggerJob()" class="btn-primary">
              🚀 手动触发
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-sm text-gray-500">状态</div>
            <div class="text-lg font-medium" :class="currentJob.enabled ? 'text-green-600' : 'text-red-600'">
              {{ currentJob.enabled ? '✅ 启用中' : '⏸️ 已禁用' }}
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-sm text-gray-500">调度类型</div>
            <div class="text-lg font-medium text-gray-900">
              {{ currentJob.schedule.kind === 'cron' ? '定时任务' : '间隔任务' }}
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-sm text-gray-500">调度表达式</div>
            <div class="text-lg font-medium text-gray-900">
              {{ currentJob.schedule.expr || `${currentJob.schedule.everyMs}ms` }}
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-sm text-gray-500">时区</div>
            <div class="text-lg font-medium text-gray-900">
              {{ currentJob.schedule.tz || '未设置' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 执行状态 -->
      <div class="card">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">⏰ 执行状态</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-sm text-blue-600">上次执行</div>
            <div class="text-lg font-medium text-blue-900">
              {{ formatTime(currentJob.state?.lastRunAtMs) }}
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-sm text-green-600">执行状态</div>
            <div class="text-lg font-medium" :class="currentJob.state?.lastRunStatus === 'ok' ? 'text-green-900' : 'text-red-900'">
              {{ currentJob.state?.lastRunStatus === 'ok' ? '✅ 成功' : '❌ 失败' }}
            </div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-sm text-purple-600">下次执行</div>
            <div class="text-lg font-medium text-purple-900">
              {{ formatTime(currentJob.state?.nextRunAtMs) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 任务内容 -->
      <div class="card">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">📝 任务内容</h4>
        <div class="bg-gray-50 p-4 rounded-lg">
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ currentJob.payload?.message || '无内容' }}</pre>
        </div>
      </div>

      <!-- 执行历史 -->
      <div class="card">
        <h4 class="text-lg font-semibold text-gray-900 mb-4">📜 执行历史</h4>
        <div v-if="currentJob.runs && currentJob.runs.length > 0" class="space-y-3">
          <div 
            v-for="run in currentJob.runs" 
            :key="run.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div :class="run.status === 'ok' ? 'text-green-600' : 'text-red-600'">
                {{ run.status === 'ok' ? '✅' : '❌' }}
              </div>
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ formatTime(new Date(run.started_at).getTime()) }}
                </div>
                <div class="text-xs text-gray-500">
                  耗时: {{ formatDuration(run.duration_ms) }}
                </div>
              </div>
            </div>
            <div v-if="run.error_message" class="text-sm text-red-600">
              {{ run.error_message }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          暂无执行记录
        </div>
      </div>
    </div>
  </div>
</template>
