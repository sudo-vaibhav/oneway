import { db } from './schema';

interface SearchResult {
  chat_name: string;
  body: string;
  timestamp: number;
}

export function searchMessages(query: string, limit = 20): SearchResult[] {
  return db
    .query(
      `SELECT chat_name, body, timestamp
       FROM messages
       WHERE body LIKE ?
       ORDER BY timestamp DESC
       LIMIT ?`
    )
    .all(`%${query}%`, limit) as SearchResult[];
}

export function searchMessagesByChat(query: string, chatName: string, limit = 20): SearchResult[] {
  return db
    .query(
      `SELECT chat_name, body, timestamp
       FROM messages
       WHERE body LIKE ? AND chat_name = ?
       ORDER BY timestamp DESC
       LIMIT ?`
    )
    .all(`%${query}%`, chatName, limit) as SearchResult[];
}
