import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  currentScreen: string;
  hint?: string;
}

export default function StatusBar({ currentScreen, hint }: StatusBarProps): React.ReactElement {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      marginTop={1}
      justifyContent="space-between"
    >
      <Text dimColor>Screen: {currentScreen}</Text>
      {hint && <Text dimColor>{hint}</Text>}
    </Box>
  );
}
