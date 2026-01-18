import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Get database path from environment or use default
const getDbPath = (): string => {
  const path = process.env.ONEWAY_DB_PATH || './data/whatsapp.db';
  // Ensure directory exists
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return path;
};

const dbPath = getDbPath();
const db = new Database(dbPath);

// Messages table
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    chat_name TEXT,
    body TEXT,
    timestamp INTEGER,
    from_me INTEGER,
    is_group INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

// Chats table (for contact/group list)
db.run(`
  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_group INTEGER,
    last_message_time INTEGER,
    unread_count INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )
`);

// Indexes for fast queries
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_body ON messages(body)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chat_name ON messages(chat_name)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_chats_name ON chats(name)`);

export { db };
