import { Router, Request, Response } from 'express';
import { fetchCronJobs, fetchCronJob, toggleCronJob, triggerCronJob } from '../services/openclaw';
import { getDatabase, saveDatabase } from '../models/database';

export const cronRoutes = Router();

// 获取所有任务
cronRoutes.get('/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await fetchCronJobs();
    
    // 保存到本地数据库
    const db = await getDatabase();
    
    for (const job of jobs) {
      db.run(`
        INSERT OR REPLACE INTO jobs (id, name, enabled, schedule_kind, schedule_expr, schedule_every_ms, schedule_tz, payload_kind, payload_message, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        job.id,
        job.name,
        job.enabled ? 1 : 0,
        job.schedule.kind,
        job.schedule.expr || null,
        job.schedule.everyMs || null,
        job.schedule.tz || 'Asia/Shanghai',
        job.payload?.kind || null,
        job.payload?.message || null
      ]);
    }
    
    saveDatabase();

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取任务列表失败' });
  }
});

// 获取单个任务详情
cronRoutes.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await fetchCronJob(id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }

    // 获取执行记录
    const db = await getDatabase();
    const stmt = db.prepare('SELECT * FROM runs WHERE job_id = ? ORDER BY started_at DESC LIMIT 10');
    stmt.bind([id]);
    const runs: any[] = [];
    while (stmt.step()) {
      runs.push(stmt.getAsObject());
    }
    stmt.free();

    res.json({ success: true, data: { ...job, runs } });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取任务详情失败' });
  }
});

// 切换任务状态（启用/禁用）
cronRoutes.patch('/jobs/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const success = await toggleCronJob(id, enabled);
    
    if (success) {
      // 更新本地数据库
      const db = await getDatabase();
      db.run('UPDATE jobs SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [enabled ? 1 : 0, id]);
      saveDatabase();
    }

    res.json({ success });
  } catch (error) {
    res.status(500).json({ success: false, error: '切换任务状态失败' });
  }
});

// 手动触发任务
cronRoutes.post('/jobs/:id/trigger', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await triggerCronJob(id);
    
    if (success) {
      // 记录执行
      const db = await getDatabase();
      db.run('INSERT INTO runs (job_id, status, started_at) VALUES (?, ?, CURRENT_TIMESTAMP)', [id, 'triggered']);
      saveDatabase();
    }

    res.json({ success });
  } catch (error) {
    res.status(500).json({ success: false, error: '触发任务失败' });
  }
});

// 获取任务统计
cronRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    
    const totalJobsResult = db.exec('SELECT COUNT(*) as count FROM jobs');
    const enabledJobsResult = db.exec('SELECT COUNT(*) as count FROM jobs WHERE enabled = 1');
    const recentRunsResult = db.exec('SELECT * FROM runs ORDER BY started_at DESC LIMIT 10');
    
    const successRateResult = db.exec(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ok' THEN 1 ELSE 0 END) as success
      FROM runs 
      WHERE started_at > datetime('now', '-7 days')
    `);

    const totalJobs = totalJobsResult[0]?.values[0]?.[0] || 0;
    const enabledJobs = enabledJobsResult[0]?.values[0]?.[0] || 0;
    const recentRuns = recentRunsResult[0]?.values || [];
    
    let successRate = '0';
    if (successRateResult[0]?.values[0]) {
      const total = Number(successRateResult[0].values[0][0]) || 0;
      const success = Number(successRateResult[0].values[0][1]) || 0;
      if (total > 0) {
        successRate = ((success / total) * 100).toFixed(1);
      }
    }

    res.json({
      success: true,
      data: {
        totalJobs,
        enabledJobs,
        recentRuns,
        successRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取统计信息失败' });
  }
});
