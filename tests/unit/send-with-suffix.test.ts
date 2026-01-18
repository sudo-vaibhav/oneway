import { test, expect, describe, beforeEach, afterEach, mock } from 'bun:test';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { clearConfigCache, applyMessageSuffix } from '../../src/utils/config';

const TEST_CONFIG_PATH = join(process.cwd(), 'oneway.jsonc');
const BACKUP_CONFIG_PATH = join(process.cwd(), 'oneway.jsonc.backup');

describe('send message with suffix integration', () => {
  let originalConfigExists: boolean;

  beforeEach(() => {
    clearConfigCache();
    originalConfigExists = existsSync(TEST_CONFIG_PATH);
    if (originalConfigExists) {
      const content = require('fs').readFileSync(TEST_CONFIG_PATH, 'utf-8');
      writeFileSync(BACKUP_CONFIG_PATH, content);
    }
  });

  afterEach(() => {
    clearConfigCache();
    if (originalConfigExists && existsSync(BACKUP_CONFIG_PATH)) {
      const backup = require('fs').readFileSync(BACKUP_CONFIG_PATH, 'utf-8');
      writeFileSync(TEST_CONFIG_PATH, backup);
      unlinkSync(BACKUP_CONFIG_PATH);
    } else if (!originalConfigExists && existsSync(TEST_CONFIG_PATH)) {
      // Clean up test config if original didn't exist
      unlinkSync(TEST_CONFIG_PATH);
    }
  });

  test('user message gets suffix appended automatically', () => {
    // Use default config (no custom config file)
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
    clearConfigCache();

    // Simulate what happens when user types a message
    const userMessage = 'Hey, quick question about the project';

    // This is what gets called internally before sending
    const messageToSend = applyMessageSuffix(userMessage);

    // Verify suffix was appended
    expect(messageToSend).toContain(userMessage);
    expect(messageToSend).toContain('sent via https://oneway.sudomakes.art');
    expect(messageToSend).toBe('Hey, quick question about the project\n\n- sent via https://oneway.sudomakes.art');
  });

  test('suffix is added even for short messages', () => {
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
    clearConfigCache();

    const shortMessage = 'OK';
    const result = applyMessageSuffix(shortMessage);

    expect(result).toBe('OK\n\n- sent via https://oneway.sudomakes.art');
  });

  test('suffix is added to messages with special characters', () => {
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
    clearConfigCache();

    const specialMessage = 'Price is $100! Deal? 😊';
    const result = applyMessageSuffix(specialMessage);

    expect(result).toContain(specialMessage);
    expect(result).toContain('sent via https://oneway.sudomakes.art');
  });

  test('suffix respects custom config', () => {
    writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
      messageSuffix: '\n\n[Sent from OneWay CLI]',
    }));
    clearConfigCache();

    const message = 'Meeting at 3pm?';
    const result = applyMessageSuffix(message);

    expect(result).toBe('Meeting at 3pm?\n\n[Sent from OneWay CLI]');
    expect(result).not.toContain('https://oneway.sudomakes.art');
  });

  test('no suffix when config sets empty string', () => {
    writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
      messageSuffix: '',
    }));
    clearConfigCache();

    const message = 'Plain message, no footer';
    const result = applyMessageSuffix(message);

    expect(result).toBe(message);
    expect(result).not.toContain('sent via');
  });

  test('multiline user message preserves formatting with suffix', () => {
    if (existsSync(TEST_CONFIG_PATH)) {
      unlinkSync(TEST_CONFIG_PATH);
    }
    clearConfigCache();

    const multilineMessage = `Hi team,

Here's the update:
- Task 1 done
- Task 2 in progress

Thanks!`;

    const result = applyMessageSuffix(multilineMessage);

    // Original message should be preserved exactly
    expect(result.startsWith(multilineMessage)).toBe(true);
    // Suffix should be at the end
    expect(result.endsWith('- sent via https://oneway.sudomakes.art')).toBe(true);
    // Should have separator between message and suffix
    expect(result).toContain('Thanks!\n\n- sent via');
  });
});
