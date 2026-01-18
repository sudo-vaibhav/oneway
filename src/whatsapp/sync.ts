import { getClient } from './client';
import { upsertChat } from '../db/chats';
import { insertMessage, getLatestMessageTimestamp } from '../db/messages';
import chalk from 'chalk';

const SYNC_DAYS_LIMIT = 30;

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'done' | 'error';
  currentChat: number;
  totalChats: number;
  messageCount: number;
  chatName?: string;
  error?: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

function clearLine(): void {
  process.stdout.write('\r\x1b[K');
}

function updateProgress(current: number, total: number, chatName: string, msgCount: number): void {
  clearLine();
  const truncatedName = chatName.length > 25 ? chatName.substring(0, 22) + '...' : chatName;
  process.stdout.write(
    chalk.cyan(`  [${current}/${total}] `) +
    chalk.white(truncatedName.padEnd(25)) +
    chalk.gray(` | ${msgCount} messages`)
  );
}

export async function syncMessages(): Promise<{ chatCount: number; messageCount: number }> {
  console.log(chalk.cyan('\nSyncing messages and chats...'));
  const client = getClient();
  const chats = await client.getChats();

  // Check if we have existing messages - use latest timestamp as cutoff
  const latestTimestamp = getLatestMessageTimestamp();
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (SYNC_DAYS_LIMIT * 24 * 60 * 60);

  // Use the more recent of: latest synced message or 30 days ago
  const cutoffTimestamp = latestTimestamp && latestTimestamp > thirtyDaysAgo
    ? latestTimestamp
    : thirtyDaysAgo;

  const syncMode = latestTimestamp && latestTimestamp > thirtyDaysAgo
    ? `since last sync (${new Date(latestTimestamp * 1000).toLocaleDateString()})`
    : `last ${SYNC_DAYS_LIMIT} days`;

  console.log(chalk.gray(`  Found ${chats.length} chats (syncing ${syncMode})\n`));

  let totalSynced = 0;
  let chatIndex = 0;

  for (const chat of chats) {
    chatIndex++;

    // Skip chats without names (status broadcasts, etc.)
    const chatName = chat.name || chat.id._serialized;
    if (!chatName) continue;

    updateProgress(chatIndex, chats.length, chatName, totalSynced);

    // Save/update chat in chats table
    upsertChat({
      id: chat.id._serialized,
      name: chatName,
      is_group: chat.isGroup ? 1 : 0,
      last_message_time: chat.timestamp || 0,
    });

    // Fetch last 100 messages per chat
    try {
      const messages = await chat.fetchMessages({ limit: 100 });
      let chatMsgCount = 0;

      for (const msg of messages) {
        // Skip messages older than cutoff
        if (msg.timestamp < cutoffTimestamp) continue;

        insertMessage({
          id: msg.id._serialized,
          chat_id: msg.from,
          chat_name: chatName,
          body: msg.body || '',
          timestamp: msg.timestamp,
          from_me: msg.fromMe ? 1 : 0,
          is_group: chat.isGroup ? 1 : 0,
        });
        totalSynced++;
        chatMsgCount++;
      }

      updateProgress(chatIndex, chats.length, chatName, totalSynced);
    } catch (err) {
      // Some chats may fail to fetch messages (e.g., archived), skip them
      clearLine();
      console.log(chalk.yellow(`  Skipped: ${chatName}`));
    }
  }

  clearLine();
  console.log(chalk.green(`\n  Synced ${totalSynced} messages from ${chats.length} chats\n`));

  return { chatCount: chats.length, messageCount: totalSynced };
}

/**
 * Background sync that reports progress via callback (non-blocking)
 */
export async function syncMessagesBackground(
  onProgress?: SyncProgressCallback
): Promise<{ chatCount: number; messageCount: number }> {
  const reportProgress = (progress: SyncProgress) => {
    if (onProgress) {
      onProgress(progress);
    }
  };

  reportProgress({
    status: 'syncing',
    currentChat: 0,
    totalChats: 0,
    messageCount: 0,
  });

  try {
    const client = getClient();
    const chats = await client.getChats();

    const latestTimestamp = getLatestMessageTimestamp();
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (SYNC_DAYS_LIMIT * 24 * 60 * 60);
    const cutoffTimestamp = latestTimestamp && latestTimestamp > thirtyDaysAgo
      ? latestTimestamp
      : thirtyDaysAgo;

    let totalSynced = 0;
    let chatIndex = 0;

    for (const chat of chats) {
      chatIndex++;

      const chatName = chat.name || chat.id._serialized;
      if (!chatName) continue;

      reportProgress({
        status: 'syncing',
        currentChat: chatIndex,
        totalChats: chats.length,
        messageCount: totalSynced,
        chatName,
      });

      upsertChat({
        id: chat.id._serialized,
        name: chatName,
        is_group: chat.isGroup ? 1 : 0,
        last_message_time: chat.timestamp || 0,
      });

      try {
        const messages = await chat.fetchMessages({ limit: 100 });

        for (const msg of messages) {
          if (msg.timestamp < cutoffTimestamp) continue;

          insertMessage({
            id: msg.id._serialized,
            chat_id: msg.from,
            chat_name: chatName,
            body: msg.body || '',
            timestamp: msg.timestamp,
            from_me: msg.fromMe ? 1 : 0,
            is_group: chat.isGroup ? 1 : 0,
          });
          totalSynced++;
        }
      } catch {
        // Skip chats that fail to fetch
      }
    }

    reportProgress({
      status: 'done',
      currentChat: chats.length,
      totalChats: chats.length,
      messageCount: totalSynced,
    });

    return { chatCount: chats.length, messageCount: totalSynced };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    reportProgress({
      status: 'error',
      currentChat: 0,
      totalChats: 0,
      messageCount: 0,
      error: errorMsg,
    });
    throw error;
  }
}
