# 🐾 小爪定时任务管理平台

一个漂亮的定时任务管理平台，用于可视化管理 OpenClaw 定时任务。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- React Router 路由
- Recharts 图表
- Axios HTTP 客户端

### 后端
- Cloudflare Workers
- TypeScript

## 部署

### 前端（Cloudflare Pages）

1. 连接 GitHub 仓库 `songdaochuanshu/cron-dashboard`
2. 构建设置：
   - **构建命令：** `cd frontend && npm install && npm run build`
   - **输出目录：** `frontend/dist`

### 后端（Cloudflare Workers）

1. 安装 Wrangler CLI：
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare：
   ```bash
   wrangler login
   ```

3. 配置环境变量（wrangler.toml）：
   ```toml
   [vars]
   OPENCLAW_GATEWAY_URL = "http://your-server-ip:18789"
   OPENCLAW_TOKEN = "your-openclaw-token"
   ```

4. 部署：
   ```bash
   cd workers
   npm install
   npm run deploy
   ```

## 功能

- 📊 仪表盘 - 任务概览和统计
- 📋 任务列表 - 查看/启用/禁用/触发任务
- 📊 任务详情 - 执行历史和状态
- 📈 统计分析 - 图表展示任务执行情况

## 项目结构

```
cron-dashboard/
├── frontend/          # React 前端
├── workers/           # Cloudflare Workers 后端
├── backend/           # Node.js 后端（备用）
└── README.md
```
