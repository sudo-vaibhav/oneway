import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { getAllChats } from '../../db/chats';
import { getLastSentMessage } from '../../db/messages';

interface Chat {
  id: string;
  name: string;
  is_group: number;
  last_message_time: number;
}

interface ChatWithPreview extends Chat {
  lastSentPreview: string;
}

interface ContactListProps {
  onSelect: (chat: { id: string; name: string }) => void;
  onBack: () => void;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

export default function ContactList({ onSelect, onBack }: ContactListProps): React.ReactElement {
  const [chats, setChats] = useState<ChatWithPreview[]>([]);
  const [filter, setFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = (): void => {
    const results = getAllChats() as Chat[];
    // Add last sent message preview for each chat
    const chatsWithPreview: ChatWithPreview[] = results.map((chat) => {
      const lastMsg = getLastSentMessage(chat.name);
      const preview = lastMsg?.body ? truncate(lastMsg.body.replace(/\n/g, ' '), 30) : '';
      return { ...chat, lastSentPreview: preview };
    });
    setChats(chatsWithPreview);
  };

  useInput((input, key) => {
    if (key.escape) {
      if (showFilter) {
        setShowFilter(false);
        setFilter('');
      } else {
        onBack();
      }
    }
    if (input === '/' && !showFilter) {
      setShowFilter(true);
    }
  });

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(filter.toLowerCase())
  );

  const items = filteredChats.map((chat) => {
    const icon = chat.is_group ? '[G]' : '[C]';
    const preview = chat.lastSentPreview ? ` - ${chat.lastSentPreview}` : '';
    return {
      label: `${icon} ${chat.name}${preview}`,
      value: chat.id,
    };
  });

  const handleSelect = (item: { label: string; value: string }): void => {
    const selectedChat = filteredChats.find((c) => c.id === item.value);
    if (selectedChat) {
      onSelect({ id: selectedChat.id, name: selectedChat.name });
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Select Contact / Group
      </Text>
      <Box marginTop={1}>
        <Text dimColor>Press / to filter, Esc to go back</Text>
      </Box>

      {showFilter && (
        <Box marginTop={1}>
          <Text>Filter: </Text>
          <TextInput value={filter} onChange={setFilter} />
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        {items.length > 0 ? (
          <SelectInput items={items} onSelect={handleSelect} limit={15} />
        ) : (
          <Text color="yellow">No chats found</Text>
        )}
      </Box>
    </Box>
  );
}
