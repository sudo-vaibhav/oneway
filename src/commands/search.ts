import { searchMessages as dbSearchMessages, searchMessagesByChat } from '../db/search';

interface SearchResult {
  chat_name: string;
  body: string;
  timestamp: number;
}

export function searchMessages(query: string, limit = 20): SearchResult[] {
  return dbSearchMessages(query, limit);
}

export function searchMessagesInChat(query: string, chatName: string, limit = 20): SearchResult[] {
  return searchMessagesByChat(query, chatName, limit);
}

export function formatSearchResult(result: SearchResult): string {
  const date = new Date(result.timestamp * 1000).toLocaleString();
  const preview = result.body.length > 100 ? `${result.body.substring(0, 100)}...` : result.body;
  return `[${date}] ${result.chat_name}\n  ${preview}`;
}

export function highlightSearchTerm(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '**$1**');
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
