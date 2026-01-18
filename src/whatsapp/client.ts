import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

let client: Client | null = null;
let isReady = false;

// Get auth path from environment or use default
const getAuthPath = (): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const envPath = process.env.ONEWAY_AUTH_PATH;

  if (envPath) {
    return envPath;
  }

  // Production: use home directory
  if (isProduction) {
    const home = process.env.HOME || process.env.USERPROFILE || '~';
    return `${home}/.oneway/.wwebjs_auth`;
  }

  // Development: use local directory
  return './data/.wwebjs_auth';
};

export async function initClient(): Promise<Client> {
  if (client && isReady) return client;

  const authPath = getAuthPath();

  // Ensure auth directory exists
  const authDir = dirname(authPath);
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
  }

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
  });

  return new Promise((resolve, reject) => {
    let qrAttempts = 0;
    const MAX_QR_ATTEMPTS = 3;

    client!.on('qr', (qr) => {
      qrAttempts++;
      if (qrAttempts > MAX_QR_ATTEMPTS) {
        console.log(chalk.red('Too many QR attempts. Please restart.'));
        reject(new Error('QR scan timeout'));
        return;
      }

      console.log(chalk.cyan('\nScan this QR code with WhatsApp:\n'));
      qrcode.generate(qr, { small: true });
      console.log(chalk.yellow(`\nAttempt ${qrAttempts}/${MAX_QR_ATTEMPTS}`));
      console.log(chalk.gray('Waiting for authentication...\n'));
    });

    client!.on('authenticated', () => {
      console.log(chalk.green('Authenticated successfully'));
    });

    client!.on('ready', () => {
      isReady = true;
      console.log(chalk.green('WhatsApp client ready!\n'));
      resolve(client!);
    });

    client!.on('auth_failure', (msg) => {
      console.log(chalk.red('Authentication failure:', msg));
      reject(new Error('Authentication failed'));
    });

    client!.on('disconnected', (reason) => {
      console.log(chalk.yellow('Disconnected:', reason));
      isReady = false;
    });

    // CRITICAL: No message event listeners to avoid distractions
    // client.on('message', ...) deliberately omitted

    console.log(chalk.cyan('Initializing WhatsApp client...'));
    client!.initialize().catch(reject);
  });
}

export function getClient(): Client {
  if (!client || !isReady) {
    throw new Error('Client not initialized. Call initClient() first.');
  }
  return client;
}

export function isClientReady(): boolean {
  return isReady;
}

export async function closeClient(): Promise<void> {
  if (client) {
    await client.destroy();
    client = null;
    isReady = false;
  }
}
