import { db } from './schema';

interface Message {
  id: string;
  chat_id: string;
  chat_name: string;
  body: string;
  timestamp: number;
  from_me: number;
  is_group: number;
}

export function insertMessage(message: Message): void {
  db.run(
    `INSERT OR IGNORE INTO messages (id, chat_id, chat_name, body, timestamp, from_me, is_group)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      message.id,
      message.chat_id,
      message.chat_name,
      message.body,
      message.timestamp,
      message.from_me,
      message.is_group,
    ]
  );
}

export function getMessagesByChatId(chatId: string, limit = 100): Message[] {
  return db
    .query(
      `SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?`
    )
    .all(chatId, limit) as Message[];
}

export function getMessagesByQuery(query: string, limit = 20): Message[] {
  return db
    .query(
      `SELECT chat_name, body, timestamp
       FROM messages
       WHERE body LIKE ?
       ORDER BY timestamp DESC
       LIMIT ?`
    )
    .all(`%${query}%`, limit) as Message[];
}

export function getMessageCount(): number {
  const result = db.query(`SELECT COUNT(*) as count FROM messages`).get() as { count: number };
  return result.count;
}

export function getLastSentMessage(chatName: string): Message | null {
  const result = db
    .query(
      `SELECT * FROM messages
       WHERE chat_name = ? AND from_me = 1
       ORDER BY timestamp DESC
       LIMIT 1`
    )
    .get(chatName) as Message | null;
  return result;
}

export function getLatestMessageTimestamp(): number | null {
  const result = db
    .query(`SELECT MAX(timestamp) as latest FROM messages`)
    .get() as { latest: number | null };
  return result.latest;
}
