import { test, expect, describe } from 'bun:test';
import {
  formatTimestamp,
  truncateText,
  formatMessagePreview,
} from '../../src/utils/formatters';

describe('formatTimestamp', () => {
  test('formats unix timestamp to locale string', () => {
    // Using a fixed timestamp for consistent testing
    const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
    const result = formatTimestamp(timestamp);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('truncateText', () => {
  test('returns original text if shorter than max length', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  test('truncates long text with ellipsis', () => {
    expect(truncateText('Hello World', 8)).toBe('Hello...');
  });

  test('handles exact length text', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});

describe('formatMessagePreview', () => {
  test('removes newlines and truncates', () => {
    const message = 'Hello\nWorld\nHow are you?';
    const preview = formatMessagePreview(message, 20);
    expect(preview).not.toContain('\n');
    expect(preview.length).toBeLessThanOrEqual(20);
  });

  test('handles short messages', () => {
    expect(formatMessagePreview('Hi')).toBe('Hi');
  });
});
