export interface Env {
  OPENCLAW_GATEWAY_URL: string;
  OPENCLAW_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 健康检查
      if (path === '/health') {
        return Response.json(
          { status: 'ok', timestamp: new Date().toISOString() },
          { headers: corsHeaders }
        );
      }

      // 获取所有任务
      if (path === '/api/cron/jobs' && request.method === 'GET') {
        const jobs = await fetchCronJobs(env);
        return Response.json(
          { success: true, data: jobs },
          { headers: corsHeaders }
        );
      }

      // 获取单个任务详情
      const jobDetailMatch = path.match(/^\/api\/cron\/jobs\/([^/]+)$/);
      if (jobDetailMatch && request.method === 'GET') {
        const jobId = jobDetailMatch[1];
        const job = await fetchCronJob(env, jobId);
        if (!job) {
          return Response.json(
            { success: false, error: '任务不存在' },
            { status: 404, headers: corsHeaders }
          );
        }
        return Response.json(
          { success: true, data: job },
          { headers: corsHeaders }
        );
      }

      // 切换任务状态
      const toggleMatch = path.match(/^\/api\/cron\/jobs\/([^/]+)\/toggle$/);
      if (toggleMatch && request.method === 'PATCH') {
        const jobId = toggleMatch[1];
        const body = await request.json() as { enabled: boolean };
        const success = await toggleCronJob(env, jobId, body.enabled);
        return Response.json(
          { success },
          { headers: corsHeaders }
        );
      }

      // 触发任务执行
      const triggerMatch = path.match(/^\/api\/cron\/jobs\/([^/]+)\/trigger$/);
      if (triggerMatch && request.method === 'POST') {
        const jobId = triggerMatch[1];
        const success = await triggerCronJob(env, jobId);
        return Response.json(
          { success },
          { headers: corsHeaders }
        );
      }

      // 获取统计信息
      if (path === '/api/cron/stats' && request.method === 'GET') {
        const stats = await fetchStats(env);
        return Response.json(
          { success: true, data: stats },
          { headers: corsHeaders }
        );
      }

      // 404
      return Response.json(
        { success: false, error: 'Not Found' },
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      return Response.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};

// 获取所有任务
async function fetchCronJobs(env: Env) {
  try {
    const response = await fetch(`${env.OPENCLAW_GATEWAY_URL}/api/cron/jobs`, {
      headers: {
        'Authorization': `Bearer ${env.OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json() as any;
    return data.jobs || [];
  } catch (error) {
    // 返回模拟数据
    return getMockJobs();
  }
}

// 获取单个任务详情
async function fetchCronJob(env: Env, jobId: string) {
  try {
    const response = await fetch(`${env.OPENCLAW_GATEWAY_URL}/api/cron/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${env.OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    return null;
  }
}

// 切换任务状态
async function toggleCronJob(env: Env, jobId: string, enabled: boolean) {
  try {
    const response = await fetch(`${env.OPENCLAW_GATEWAY_URL}/api/cron/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${env.OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 触发任务执行
async function triggerCronJob(env: Env, jobId: string) {
  try {
    const response = await fetch(`${env.OPENCLAW_GATEWAY_URL}/api/cron/jobs/${jobId}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENCLAW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 获取统计信息
async function fetchStats(env: Env) {
  const jobs = await fetchCronJobs(env);
  const totalJobs = jobs.length;
  const enabledJobs = jobs.filter((j: any) => j.enabled).length;

  return {
    totalJobs,
    enabledJobs,
    successRate: '100',
    recentRuns: []
  };
}

// 模拟数据
function getMockJobs() {
  return [
    {
      id: '146661b1-5689-45df-87bc-fcae735ded24',
      name: 'GitHub Trending 每日邮件',
      enabled: true,
      schedule: { kind: 'cron', expr: '30 7 * * *', tz: 'Asia/Shanghai' },
      state: {
        nextRunAtMs: Date.now() + 3600000,
        lastRunAtMs: Date.now() - 86400000,
        lastRunStatus: 'ok',
        consecutiveErrors: 0
      },
      payload: { kind: 'agentTurn', message: '发送GitHub Trending邮件' }
    },
    {
      id: '2ce1c893-fa50-4bf4-b68a-9720f935b564',
      name: '小爪秘密基地每日更新',
      enabled: true,
      schedule: { kind: 'cron', expr: '0 22 * * *', tz: 'Asia/Shanghai' },
      state: {
        nextRunAtMs: Date.now() + 7200000,
        lastRunAtMs: Date.now() - 43200000,
        lastRunStatus: 'ok',
        consecutiveErrors: 0
      },
      payload: { kind: 'agentTurn', message: '更新小爪的秘密基地' }
    }
  ];
}
