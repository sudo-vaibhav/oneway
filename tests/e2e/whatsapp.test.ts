import { test, expect, describe, beforeAll, afterAll } from 'bun:test';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { initClient, closeClient, getClient } from '../../src/whatsapp/client';
import { syncMessages } from '../../src/whatsapp/sync';
import { sendMessage } from '../../src/commands/send';
import { searchMessages } from '../../src/commands/search';
import { applyMessageSuffix, clearConfigCache } from '../../src/utils/config';

const AUTH_PATH = join(homedir(), '.oneway', '.wwebjs_auth', 'session');
const SKIP_E2E = process.env.SKIP_E2E === 'true';

// Check authentication before running
if (!SKIP_E2E && !existsSync(AUTH_PATH)) {
  console.error(`
E2E tests require WhatsApp authentication first!
Run: bun run src/index.tsx
Scan QR, then exit and run tests.
Or skip: SKIP_E2E=true bun test
`);
  process.exit(1);
}

describe.skipIf(SKIP_E2E)('WhatsApp E2E Tests', () => {
  beforeAll(async () => {
    await initClient();
    await syncMessages();
  }, 60000);

  afterAll(async () => {
    // Wait for any pending messages to fully propagate before closing
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await closeClient();
  }, 15000);

  test('search messages returns results', async () => {
    const results = searchMessages('test', 10);
    expect(Array.isArray(results)).toBe(true);
  });

  test('send message to contact', async () => {
    const result = await sendMessage('+91 92203 92556', 'E2E test from OneWay');
    expect(result.success).toBe(true);
    expect(result.chatId).toContain('9220392556');
  }, 30000);

  test('send message to test group', async () => {
    const result = await sendMessage('test group', 'E2E test from OneWay to group');
    expect(result.success).toBe(true);
  }, 30000);

  test('message suffix is applied before sending', async () => {
    // Verify that applyMessageSuffix is working correctly
    // This ensures the suffix gets added even when user doesn't include it
    clearConfigCache();

    const userMessage = 'E2E suffix test';
    const messageWithSuffix = applyMessageSuffix(userMessage);

    // Suffix should be automatically appended
    expect(messageWithSuffix).toContain(userMessage);
    expect(messageWithSuffix).toContain('sent via https://oneway.sudomakes.art');
    expect(messageWithSuffix.length).toBeGreaterThan(userMessage.length);

    // The actual send uses applyMessageSuffix internally
    const result = await sendMessage('+91 92203 92556', 'E2E suffix verification');
    expect(result.success).toBe(true);
    // The original message is returned (before suffix was applied)
    expect(result.message).toBe('E2E suffix verification');
  }, 30000);
});
