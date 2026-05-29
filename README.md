# 🐾 小爪定时任务管理平台

一个漂亮的定时任务管理平台，用于可视化管理 OpenClaw 定时任务。

## 功能特性

- 📊 **仪表盘** - 任务概览和统计信息
- 📋 **任务列表** - 查看和管理所有定时任务
- 📊 **任务详情** - 查看任务详细信息和执行历史
- 📈 **统计分析** - 图表展示任务执行情况
- 🔄 **实时状态** - 实时显示任务运行状态
- ⚡ **手动触发** - 支持手动触发任务执行

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite 构建工具
- Pinia 状态管理
- Vue Router 路由
- ECharts 图表
- Tailwind CSS 样式

### 后端
- Node.js + Express
- TypeScript
- better-sqlite3 数据库
- OpenClaw Cron API 集成

## 快速开始

### 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 启动开发服务器

```bash
# 启动后端
cd backend
npm run dev

# 启动前端
cd frontend
npm run dev
```

访问 http://localhost:3000 查看应用

## 项目结构

```
cron-dashboard/
├── frontend/              # Vue3 前端
│   ├── src/
│   │   ├── api/          # API 请求
│   │   ├── components/   # 组件
│   │   ├── router/       # 路由
│   │   ├── stores/       # 状态管理
│   │   ├── views/        # 页面
│   │   └── types/        # TypeScript 类型
│   └── package.json
├── backend/               # Node.js 后端
│   ├── src/
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── models/       # 数据模型
│   │   └── utils/        # 工具函数
│   └── package.json
└── README.md
```

## 功能说明

### 仪表盘
- 显示任务总数、启用数、成功率
- 展示所有任务概览
- 快速查看任务状态

### 任务列表
- 查看所有定时任务
- 启用/禁用任务
- 手动触发任务执行
- 查看任务详情

### 任务详情
- 查看任务详细信息
- 查看执行历史记录
- 查看任务状态

### 统计分析
- 任务状态分布图表
- 执行成功率统计
- 最近执行记录

## API 接口

- `GET /api/cron/jobs` - 获取所有任务
- `GET /api/cron/jobs/:id` - 获取任务详情
- `PATCH /api/cron/jobs/:id/toggle` - 切换任务状态
- `POST /api/cron/jobs/:id/trigger` - 触发任务执行
- `GET /api/cron/stats` - 获取统计信息

## 开发计划

- [x] 基础项目框架
- [ ] 完善任务管理功能
- [ ] 添加任务编辑功能
- [ ] 添加任务创建功能
- [ ] WebSocket 实时更新
- [ ] 告警通知功能
