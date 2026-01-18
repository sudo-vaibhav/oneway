import { getClient } from '../whatsapp/client';
import { getChatByName } from '../db/chats';
import { applyMessageSuffix } from '../utils/config';

interface SendResult {
  success: boolean;
  recipient: string;
  chatId: string;
  message: string;
}

export async function sendMessage(recipient: string, message: string): Promise<SendResult> {
  const client = getClient();

  let chatId: string;

  // If recipient looks like a WhatsApp ID (contains @), use it directly
  if (recipient.includes('@')) {
    chatId = recipient;
  } else {
    // Check if recipient is a group name (search in synced chats)
    const groupChat = getChatByName(recipient, true);

    if (groupChat) {
      chatId = groupChat.id;
      console.log(`Found group: ${recipient} -> ${chatId}`);
    } else {
      // Check if it's in chats as individual
      const individualChat = getChatByName(recipient, false);

      if (individualChat) {
        chatId = individualChat.id;
        console.log(`Found contact: ${recipient} -> ${chatId}`);
      } else {
        // Fallback: treat as phone number - use getNumberId to validate
        const formatted = formatPhoneNumber(recipient);
        const numberDetails = await client.getNumberId(formatted);

        if (numberDetails) {
          chatId = numberDetails._serialized;
          console.log(`Validated phone: ${recipient} -> ${chatId}`);
        } else {
          throw new Error(`Phone number ${recipient} is not registered on WhatsApp`);
        }
      }
    }
  }

  console.log(`Sending to chatId: ${chatId}`);

  // Apply message suffix from config
  const messageWithSuffix = applyMessageSuffix(message);

  try {
    // Use sendSeen: false to avoid markedUnread error
    const sentMsg = await client.sendMessage(chatId, messageWithSuffix, {
      sendSeen: false,
    });

    // Wait for message to be acknowledged by server
    const msgId = sentMsg.id._serialized;
    console.log(`Message queued, ID: ${msgId}`);

    // Small delay to ensure message propagates
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Message sent successfully, ID: ${msgId}`);
    return { success: true, recipient, chatId, message };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`Send failed: ${errorMsg}`);
    throw new Error(`Failed to send message: ${errorMsg}`);
  }
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
