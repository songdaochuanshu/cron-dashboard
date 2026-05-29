<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">
        <router-link to="/">🐾 小爪定时任务管理平台</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/">📊 仪表盘</router-link>
        <router-link to="/jobs">📋 任务列表</router-link>
        <router-link to="/stats">📈 统计分析</router-link>
      </div>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Noto Sans SC', sans-serif; background: linear-gradient(135deg, #f5f3ff, #ede9fe); min-height: 100vh; }
.app { min-height: 100vh; }
.navbar { background: #4c1d95; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
.nav-brand a { color: white; font-size: 1.25rem; font-weight: bold; text-decoration: none; }
.nav-links { display: flex; gap: 1rem; }
.nav-links a { color: #ddd6fe; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.5rem; }
.nav-links a:hover, .nav-links a.router-link-active { background: rgba(255,255,255,0.2); color: white; }
.main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.card { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; }
.btn-primary { background: #7c3aed; color: white; }
.btn-primary:hover { background: #6d28d9; }
.btn-success { background: #10b981; color: white; }
.btn-warning { background: #f59e0b; color: white; }
.loading { text-align: center; padding: 3rem; color: #6b7280; }
</style>
