export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Valid if 10 digits (local) or 12+ digits (with country code)
  return cleaned.length >= 10;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  // If it's a 10-digit number, assume Indian and add 91
  return cleaned.length === 10 ? `91${cleaned}` : cleaned;
}

export function formatChatId(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  return `${formatted}@c.us`;
}

export function validateMessage(message: string): boolean {
  return message.trim().length > 0;
}

export function sanitizeMessage(message: string): string {
  return message.trim();
}
