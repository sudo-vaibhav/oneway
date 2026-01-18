import React from 'react';
import { render } from 'ink';
import App from './ui/App';
import { initClient, closeClient } from './whatsapp/client';
import { syncMessages } from './whatsapp/sync';
import chalk from 'chalk';

async function main(): Promise<void> {
  try {
    // STEP 1: Authenticate BEFORE launching TUI
    // This shows QR code in plain terminal if needed
    console.log(chalk.cyan('Starting OneWay...\n'));
    await initClient();

    // STEP 2: Sync messages
    console.log('');
    await syncMessages();

    // STEP 3: Clear console and launch TUI
    console.clear();

    const { waitUntilExit } = render(
      <App
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
