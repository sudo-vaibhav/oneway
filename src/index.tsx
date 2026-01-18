import React, { useState, useEffect } from 'react';
import { render } from 'ink';
import App from './ui/App';
import { initClient, closeClient } from './whatsapp/client';
import { syncMessagesBackground, type SyncProgress } from './whatsapp/sync';
import chalk from 'chalk';

// Wrapper component to handle sync progress state
function AppWithSync({ onExit }: { onExit: () => void }): React.ReactElement {
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    currentChat: 0,
    totalChats: 0,
    messageCount: 0,
  });

  useEffect(() => {
    // Start background sync when component mounts
    syncMessagesBackground(setSyncProgress).catch((err) => {
      console.error('Background sync failed:', err);
    });
  }, []);

  return <App onExit={onExit} syncProgress={syncProgress} />;
}

async function main(): Promise<void> {
  try {
    // STEP 1: Authenticate BEFORE launching TUI
    // This shows QR code in plain terminal if needed
    console.log(chalk.cyan('Starting OneWay...\n'));
    await initClient();

    // STEP 2: Clear console and launch TUI immediately
    // Sync happens in background - no blocking!
    console.clear();

    const { waitUntilExit } = render(
      <AppWithSync
        onExit={async () => {
          await closeClient();
          process.exit(0);
        }}
      />
    );

    await waitUntilExit();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('Fatal error:', errorMessage));

    if (errorMessage.includes('Authentication failed')) {
      console.log(chalk.yellow('\nTry running again and scan the QR code with your WhatsApp app.'));
    }

    await closeClient();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(chalk.cyan('\n\nGoodbye!'));
  await closeClient();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeClient();
  process.exit(0);
});

main();
