import axios from 'axios';

const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || '';

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
    everyMs?: number;
    tz?: string;
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastRunStatus?: string;
    consecutiveErrors: number;
  };
  payload?: {
    kind: string;
    message?: string;
  };
}

interface CronJobsResponse {
  jobs: CronJob[];
  total: number;
}

export async function fetchCronJobs(): Promise<CronJob[]> {
  try {
    const response = await axios.get<CronJobsResponse>(`${OPENCLAW_GATEWAY_URL}/api/cron/jobs`, {
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.jobs || [];
  } catch (error) {
    console.error('获取定时任务失败:', error);
    // 返回模拟数据用于开发
    return getMockJobs();
  }
}

export async function fetchCronJob(jobId: string): Promise<CronJob | null> {
  try {
    const response = await axios.get<CronJob>(`${OPENCLAW_GATEWAY_URL}/api/cron/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取任务详情失败:', error);
    return null;
  }
}

export async function toggleCronJob(jobId: string, enabled: boolean): Promise<boolean> {
  try {
    await axios.patch(`${OPENCLAW_GATEWAY_URL}/api/cron/jobs/${jobId}`, 
      { enabled },
      {
        headers: {
          'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('切换任务状态失败:', error);
    return false;
  }
}

export async function triggerCronJob(jobId: string): Promise<boolean> {
  try {
    await axios.post(`${OPENCLAW_GATEWAY_URL}/api/cron/jobs/${jobId}/run`, {}, {
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return true;
  } catch (error) {
    console.error('触发任务执行失败:', error);
    return false;
  }
}

// 模拟数据（开发用）
function getMockJobs(): CronJob[] {
  return [
    {
      id: '146661b1-5689-45df-87bc-fcae735ded24',
      name: 'GitHub Trending 每日邮件',
      enabled: true,
      schedule: {
        kind: 'cron',
        expr: '30 7 * * *',
        tz: 'Asia/Shanghai'
      },
      state: {
        nextRunAtMs: Date.now() + 3600000,
        lastRunAtMs: Date.now() - 86400000,
        lastRunStatus: 'ok',
        consecutiveErrors: 0
      },
      payload: {
        kind: 'agentTurn',
        message: '发送GitHub Trending邮件'
      }
    },
    {
      id: '2ce1c893-fa50-4bf4-b68a-9720f935b564',
      name: '小爪秘密基地每日更新',
      enabled: true,
      schedule: {
        kind: 'cron',
        expr: '0 22 * * *',
        tz: 'Asia/Shanghai'
      },
      state: {
        nextRunAtMs: Date.now() + 7200000,
        lastRunAtMs: Date.now() - 43200000,
        lastRunStatus: 'ok',
        consecutiveErrors: 0
      },
      payload: {
        kind: 'agentTurn',
        message: '更新小爪的秘密基地'
      }
    }
  ];
}
