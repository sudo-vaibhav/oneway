import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

interface HomeProps {
  onNavigate: (screen: 'contacts' | 'search') => void;
  onExit: () => void;
}

interface MenuItem {
  label: string;
  value: string;
}

export default function Home({ onNavigate, onExit }: HomeProps): React.ReactElement {
  const items: MenuItem[] = [
    { label: '[>] Send Message', value: 'send' },
    { label: '[?] Search Messages', value: 'search' },
    { label: '[X] Exit', value: 'exit' },
  ];

  const handleSelect = (item: MenuItem): void => {
    if (item.value === 'send') {
      onNavigate('contacts');
    } else if (item.value === 'search') {
      onNavigate('search');
    } else if (item.value === 'exit') {
      onExit();
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        =======================================
      </Text>
      <Text bold color="cyan">
        {'  '}OneWay - One-Way WhatsApp
      </Text>
      <Text bold color="cyan">
        =======================================
      </Text>
      <Box marginTop={1}>
        <Text dimColor>Use arrows to navigate, Enter to select</Text>
      </Box>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
}
