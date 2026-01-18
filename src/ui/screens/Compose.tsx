import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { sendMessage } from '../../commands/send';

interface ComposeProps {
  chat: { id: string; name: string };
  onBack: () => void;
  onSent: () => void;
}

export default function Compose({ chat, onBack, onSent }: ComposeProps): React.ReactElement {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useInput((input, key) => {
    if (key.escape && !sending) {
      onBack();
    }
  });

  const handleSubmit = async (): Promise<void> => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await sendMessage(chat.id, message);
      setSuccess(true);
      setTimeout(() => {
        onSent();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setSending(false);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Send to: {chat.name}
      </Text>
      <Box marginTop={1}>
        <Text dimColor>Type your message and press Enter. Esc to cancel.</Text>
      </Box>

      <Box marginTop={1}>
        <Text>Message: </Text>
        <TextInput
          value={message}
          onChange={setMessage}
          onSubmit={handleSubmit}
          focus={!sending}
        />
      </Box>

      {sending && !success && (
        <Box marginTop={1}>
          <Text color="yellow">
            <Spinner type="dots" /> Sending...
          </Text>
        </Box>
      )}

      {success && (
        <Box marginTop={1}>
          <Text color="green">Message sent successfully!</Text>
        </Box>
      )}

      {error && (
        <Box marginTop={1}>
          <Text color="red">Error: {error}</Text>
        </Box>
      )}
    </Box>
  );
}
