import { test, expect, describe } from 'bun:test';
import {
  validatePhoneNumber,
  formatPhoneNumber,
  formatChatId,
  validateMessage,
  sanitizeMessage,
} from '../../src/utils/validators';

describe('validatePhoneNumber', () => {
  test('validates 10-digit Indian phone number', () => {
    expect(validatePhoneNumber('9876543210')).toBe(true);
  });

  test('validates phone number with country code', () => {
    expect(validatePhoneNumber('919876543210')).toBe(true);
  });

  test('validates phone number with formatting', () => {
    expect(validatePhoneNumber('+91 92203 92556')).toBe(true);
  });

  test('rejects too short phone number', () => {
    expect(validatePhoneNumber('123456')).toBe(false);
  });
});

describe('formatPhoneNumber', () => {
  test('adds 91 prefix to 10-digit number', () => {
    expect(formatPhoneNumber('9876543210')).toBe('919876543210');
  });

  test('keeps number with country code as-is', () => {
    expect(formatPhoneNumber('919876543210')).toBe('919876543210');
  });

  test('strips non-numeric characters', () => {
    expect(formatPhoneNumber('+91 92203 92556')).toBe('919220392556');
  });
});

describe('formatChatId', () => {
  test('formats phone number as WhatsApp chat ID', () => {
    expect(formatChatId('9876543210')).toBe('919876543210@c.us');
  });

  test('formats phone with country code correctly', () => {
    expect(formatChatId('919876543210')).toBe('919876543210@c.us');
  });
});

describe('validateMessage', () => {
  test('validates non-empty message', () => {
    expect(validateMessage('Hello')).toBe(true);
  });

  test('rejects empty message', () => {
    expect(validateMessage('')).toBe(false);
  });

  test('rejects whitespace-only message', () => {
    expect(validateMessage('   ')).toBe(false);
  });
});

describe('sanitizeMessage', () => {
  test('trims whitespace from message', () => {
    expect(sanitizeMessage('  Hello  ')).toBe('Hello');
  });

  test('handles message with no whitespace', () => {
    expect(sanitizeMessage('Hello')).toBe('Hello');
  });
});
