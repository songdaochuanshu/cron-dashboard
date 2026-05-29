import express from 'express';
import cors from 'cors';
import { cronRoutes } from './routes/cron';
import { initDatabase, closeDatabase } from './models/database';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
initDatabase().then(() => {
  console.log('数据库初始化完成');
}).catch(err => {
  console.error('数据库初始化失败:', err);
});

// 路由
app.use('/api/cron', cronRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 定时任务管理平台后端已启动`);
  console.log(`📡 地址: http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('正在关闭服务器...');
  closeDatabase();
  process.exit(0);
});
