import React from 'react';
import { Box, Text } from 'ink';
import { formatShortDate } from '../../utils/formatters';

interface ChatListItemProps {
  name: string;
  isGroup: boolean;
  lastMessageTime?: number;
  isSelected?: boolean;
}

export default function ChatListItem({
  name,
  isGroup,
  lastMessageTime,
  isSelected = false,
}: ChatListItemProps): React.ReactElement {
  const icon = isGroup ? 'G' : 'C';
  const timeStr = lastMessageTime ? formatShortDate(lastMessageTime) : '';

  return (
    <Box>
      <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
        {isSelected ? '> ' : '  '}
        [{icon}] {name}
        {timeStr && <Text dimColor> - {timeStr}</Text>}
      </Text>
    </Box>
  );
}
