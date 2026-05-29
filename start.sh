#!/bin/bash

# 启动定时任务管理平台

echo "🐾 启动小爪定时任务管理平台..."

# 启动后端
echo "🚀 启动后端服务器..."
cd backend
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端开发服务器..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 启动完成！"
echo ""
echo "📡 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务器"

# 等待用户中断
wait $FRONTEND_PID $BACKEND_PID
