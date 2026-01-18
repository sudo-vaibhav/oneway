import { test, expect, describe } from 'bun:test';
import {
  validatePhoneNumber,
  validateMessage,
  formatChatId,
} from '../../src/utils/validators';
import { searchMessages } from '../../src/commands/search';

describe('CLI E2E Tests', () => {
  describe('argument validation', () => {
    test('validates phone numbers correctly', () => {
      expect(validatePhoneNumber('9876543210')).toBe(true);
      expect(validatePhoneNumber('919876543210')).toBe(true);
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
    });

    test('validates message content', () => {
      expect(validateMessage('Hello')).toBe(true);
      expect(validateMessage('')).toBe(false);
      expect(validateMessage('   ')).toBe(false);
    });

    test('formats chat IDs correctly', () => {
      expect(formatChatId('9876543210')).toBe('919876543210@c.us');
      expect(formatChatId('919876543210')).toBe('919876543210@c.us');
    });
  });

  describe('search functionality', () => {
    test('returns array for search results', () => {
      // Search with no matching results should return empty array
      const results = searchMessages('xyznonexistentquery12345', 10);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
