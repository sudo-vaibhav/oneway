import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface MessageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function MessageInput({
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
}: MessageInputProps): React.ReactElement {
  return (
    <Box>
      <Text>{label}: </Text>
      <TextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
      />
    </Box>
  );
}
