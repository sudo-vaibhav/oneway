import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import {
  applyMessageSuffix,
  loadConfigSync,
  clearConfigCache,
} from '../../src/utils/config';

const TEST_CONFIG_PATH = join(process.cwd(), 'oneway.jsonc');
const BACKUP_CONFIG_PATH = join(process.cwd(), 'oneway.jsonc.backup');

describe('config', () => {
  let originalConfigExists: boolean;
  let originalConfigContent: string = '';

  beforeEach(() => {
    clearConfigCache();
    // Backup existing config if present
    originalConfigExists = existsSync(TEST_CONFIG_PATH);
    if (originalConfigExists) {
      originalConfigContent = require('fs').readFileSync(TEST_CONFIG_PATH, 'utf-8') as string;
      writeFileSync(BACKUP_CONFIG_PATH, originalConfigContent);
    }
  });

  afterEach(() => {
    clearConfigCache();
    // Restore original config
    if (originalConfigExists && existsSync(BACKUP_CONFIG_PATH)) {
      const backup = require('fs').readFileSync(BACKUP_CONFIG_PATH, 'utf-8');
      writeFileSync(TEST_CONFIG_PATH, backup);
      unlinkSync(BACKUP_CONFIG_PATH);
    }
  });

  describe('loadConfigSync', () => {
    test('loads config from oneway.jsonc', () => {
      const config = loadConfigSync();
      expect(config).toBeDefined();
      expect(typeof config.messageSuffix).toBe('string');
    });

    test('returns default config when file not found', () => {
      // Temporarily remove config file
      if (existsSync(TEST_CONFIG_PATH)) {
        unlinkSync(TEST_CONFIG_PATH);
      }
      clearConfigCache();

      const config = loadConfigSync();
      expect(config.messageSuffix).toBe('\n\n- sent via https://oneway.sudomakes.art');
    });

    test('parses JSONC with comments correctly', () => {
      const configWithComments = `{
        // This is a comment
        "messageSuffix": "\\n\\n- custom suffix"
        /* Multi-line
           comment */
      }`;
      writeFileSync(TEST_CONFIG_PATH, configWithComments);
      clearConfigCache();

      const config = loadConfigSync();
      expect(config.messageSuffix).toBe('\n\n- custom suffix');
    });
  });

  describe('applyMessageSuffix', () => {
    test('appends default suffix to message', () => {
      // Ensure default config is used
      if (existsSync(TEST_CONFIG_PATH)) {
        unlinkSync(TEST_CONFIG_PATH);
      }
      clearConfigCache();

      const message = 'Hello World';
      const result = applyMessageSuffix(message);

      expect(result).toBe('Hello World\n\n- sent via https://oneway.sudomakes.art');
    });

    test('appends suffix even when user message has no trailing newline', () => {
      if (existsSync(TEST_CONFIG_PATH)) {
        unlinkSync(TEST_CONFIG_PATH);
      }
      clearConfigCache();

      const message = 'Just a simple message';
      const result = applyMessageSuffix(message);

      expect(result).toContain('Just a simple message');
      expect(result).toContain('sent via https://oneway.sudomakes.art');
      expect(result).not.toBe(message); // Suffix was added
    });

    test('uses custom suffix from config', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        messageSuffix: '\n-- Custom Footer',
      }));
      clearConfigCache();

      const message = 'Test message';
      const result = applyMessageSuffix(message);

      expect(result).toBe('Test message\n-- Custom Footer');
    });

    test('returns original message when suffix is empty', () => {
      writeFileSync(TEST_CONFIG_PATH, JSON.stringify({
        messageSuffix: '',
      }));
      clearConfigCache();

      const message = 'No suffix message';
      const result = applyMessageSuffix(message);

      expect(result).toBe('No suffix message');
    });

    test('handles multiline messages correctly', () => {
      if (existsSync(TEST_CONFIG_PATH)) {
        unlinkSync(TEST_CONFIG_PATH);
      }
      clearConfigCache();

      const message = 'Line 1\nLine 2\nLine 3';
      const result = applyMessageSuffix(message);

      expect(result).toBe('Line 1\nLine 2\nLine 3\n\n- sent via https://oneway.sudomakes.art');
    });

    test('suffix is always on new line(s)', () => {
      if (existsSync(TEST_CONFIG_PATH)) {
        unlinkSync(TEST_CONFIG_PATH);
      }
      clearConfigCache();

      const message = 'Any message here';
      const result = applyMessageSuffix(message);

      // The default suffix starts with \n\n, so it should be on a new line
      expect(result).toMatch(/Any message here\n\n- sent via/);
    });
  });
});
