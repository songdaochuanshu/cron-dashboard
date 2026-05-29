<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-lg border-b border-purple-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-purple-900">
                🐾 小爪定时任务管理平台
              </h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-purple-600 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              📊 仪表盘
            </router-link>
            <router-link 
              to="/jobs" 
              class="text-purple-600 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              📋 任务列表
            </router-link>
            <router-link 
              to="/stats" 
              class="text-purple-600 hover:text-purple-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              📈 统计分析
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>

<style>
body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
