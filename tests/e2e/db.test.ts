import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { unlinkSync, existsSync } from 'node:fs';

const TEST_DB_PATH = './data/test-e2e.db';

describe('Database E2E Tests', () => {
  let db: Database;

  beforeEach(() => {
    // Clean up any existing test database
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
    db = new Database(TEST_DB_PATH);
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        chat_name TEXT NOT NULL,
        body TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        from_me INTEGER DEFAULT 0,
        is_group INTEGER DEFAULT 0
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        is_group INTEGER DEFAULT 0,
        last_message_time INTEGER DEFAULT 0
      )
    `);
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
  });

  test('can insert and retrieve messages', () => {
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO messages (id, chat_id, chat_name, body, timestamp, from_me, is_group)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run('msg1', 'chat1@c.us', 'Test User', 'Hello World', 1704067200, 1, 0);

    const result = db.query('SELECT * FROM messages WHERE id = ?').get('msg1') as any;
    expect(result.body).toBe('Hello World');
    expect(result.chat_name).toBe('Test User');
  });

  test('can search messages by content', () => {
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO messages (id, chat_id, chat_name, body, timestamp, from_me, is_group)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run('msg2', 'chat1@c.us', 'Test User', 'Hello World', 1704067200, 1, 0);
    insertStmt.run('msg3', 'chat1@c.us', 'Test User', 'Goodbye World', 1704067201, 1, 0);

    const results = db.query('SELECT * FROM messages WHERE body LIKE ?').all('%Hello%');
    expect(results.length).toBe(1);
  });

  test('can insert and retrieve chats', () => {
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO chats (id, name, is_group, last_message_time)
      VALUES (?, ?, ?, ?)
    `);

    insertStmt.run('chat1@c.us', 'Test Chat', 0, 1704067200);

    const result = db.query('SELECT * FROM chats WHERE id = ?').get('chat1@c.us') as any;
    expect(result.name).toBe('Test Chat');
    expect(result.is_group).toBe(0);
  });

  test('retrieves chats ordered by last message time', () => {
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO chats (id, name, is_group, last_message_time)
      VALUES (?, ?, ?, ?)
    `);

    insertStmt.run('chat1@c.us', 'Old Chat', 0, 1704067100);
    insertStmt.run('chat2@c.us', 'New Chat', 0, 1704067200);

    const results = db.query('SELECT * FROM chats ORDER BY last_message_time DESC').all() as any[];
    expect(results[0].name).toBe('New Chat');
    expect(results[1].name).toBe('Old Chat');
  });
});
