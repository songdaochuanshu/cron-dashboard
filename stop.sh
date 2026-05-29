#!/bin/bash

# 停止定时任务管理平台

echo "🛑 停止小爪定时任务管理平台..."

# 停止后端
pkill -f "npm run dev" 2>/dev/null
pkill -f "tsx watch src/index.ts" 2>/dev/null

# 停止前端
pkill -f "vite" 2>/dev/null

echo "✅ 已停止所有服务"
