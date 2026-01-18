import { db } from './schema';

interface Chat {
  id: string;
  name: string;
  is_group: number;
  last_message_time: number;
  unread_count: number;
}

export function upsertChat(chat: Omit<Chat, 'unread_count'>): void {
  db.run(
    `INSERT OR REPLACE INTO chats (id, name, is_group, last_message_time)
     VALUES (?, ?, ?, ?)`,
    [chat.id, chat.name, chat.is_group, chat.last_message_time]
  );
}

export function getAllChats(): Chat[] {
  return db
    .query(`SELECT id, name, is_group, last_message_time, unread_count FROM chats ORDER BY last_message_time DESC`)
    .all() as Chat[];
}

export function getChatByName(name: string, isGroup: boolean): Chat | undefined {
  return db
    .query(
      `SELECT DISTINCT id, name, is_group, last_message_time, unread_count
       FROM chats
       WHERE name = ? AND is_group = ?
       LIMIT 1`
    )
    .get(name, isGroup ? 1 : 0) as Chat | undefined;
}

export function getChatById(id: string): Chat | undefined {
  return db
    .query(`SELECT id, name, is_group, last_message_time, unread_count FROM chats WHERE id = ?`)
    .get(id) as Chat | undefined;
}

export function searchChats(query: string): Chat[] {
  return db
    .query(
      `SELECT id, name, is_group, last_message_time, unread_count
       FROM chats
       WHERE name LIKE ?
       ORDER BY last_message_time DESC`
    )
    .all(`%${query}%`) as Chat[];
}

export function getChatCount(): number {
  const result = db.query(`SELECT COUNT(*) as count FROM chats`).get() as { count: number };
  return result.count;
}
