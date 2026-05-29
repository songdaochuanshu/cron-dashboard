import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/cron.db');

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!db) {
    const SQL = await initSqlJs();
    
    // 尝试加载现有数据库
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  
  // 创建任务表
  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      schedule_kind TEXT NOT NULL,
      schedule_expr TEXT,
      schedule_every_ms INTEGER,
      schedule_tz TEXT DEFAULT 'Asia/Shanghai',
      payload_kind TEXT,
      payload_message TEXT,
      delivery_mode TEXT DEFAULT 'none',
      delivery_channel TEXT,
      delivery_to TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建执行记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      duration_ms INTEGER,
      error_message TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id)
    )
  `);

  // 保存数据库到文件
  saveDatabase();
  
  console.log('📦 数据库初始化完成');
}

export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}
