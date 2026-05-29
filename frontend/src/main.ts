import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Dashboard.vue') },
    { path: '/jobs', component: () => import('./pages/Jobs.vue') },
    { path: '/jobs/:id', component: () => import('./pages/JobDetail.vue') },
    { path: '/stats', component: () => import('./pages/Stats.vue') }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
