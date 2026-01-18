import React, { useState } from 'react';
import { Box, Text } from 'ink';
import Home from './screens/Home';
import ContactList from './screens/ContactList';
import Compose from './screens/Compose';
import Search from './screens/Search';
import type { SyncProgress } from '../whatsapp/sync';

type Screen = 'home' | 'contacts' | 'compose' | 'search';

interface AppProps {
  onExit: () => void;
  syncProgress?: SyncProgress;
}

function SyncStatusBar({ progress }: { progress?: SyncProgress }): React.ReactElement | null {
  if (!progress || progress.status === 'idle') {
    return null;
  }

  if (progress.status === 'done') {
    return (
      <Box paddingX={1} marginBottom={1}>
        <Text color="green">Synced {progress.messageCount} messages</Text>
      </Box>
    );
  }

  if (progress.status === 'error') {
    return (
      <Box paddingX={1} marginBottom={1}>
        <Text color="red">Sync error: {progress.error}</Text>
      </Box>
    );
  }

  // Syncing in progress
  const percent = progress.totalChats > 0
    ? Math.round((progress.currentChat / progress.totalChats) * 100)
    : 0;
  const chatName = progress.chatName
    ? (progress.chatName.length > 20 ? progress.chatName.slice(0, 17) + '...' : progress.chatName)
    : '';

  return (
    <Box paddingX={1} marginBottom={1}>
      <Text color="cyan">
        Syncing [{progress.currentChat}/{progress.totalChats}] {percent}% {chatName}
      </Text>
      <Text dimColor> | {progress.messageCount} msgs</Text>
    </Box>
  );
}

export default function App({ onExit, syncProgress }: AppProps): React.ReactElement {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedChat, setSelectedChat] = useState<{ id: string; name: string } | null>(null);

  const handleNavigate = (screen: 'contacts' | 'search'): void => {
    setCurrentScreen(screen);
  };

  const handleChatSelect = (chat: { id: string; name: string }): void => {
    setSelectedChat(chat);
    setCurrentScreen('compose');
  };

  const handleBack = (): void => {
    if (currentScreen === 'compose') {
      setCurrentScreen('contacts');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleSent = (): void => {
    setSelectedChat(null);
    setCurrentScreen('home');
  };

  return (
    <Box flexDirection="column">
      <SyncStatusBar progress={syncProgress} />
      {currentScreen === 'home' && <Home onNavigate={handleNavigate} onExit={onExit} />}
      {currentScreen === 'contacts' && (
        <ContactList onSelect={handleChatSelect} onBack={handleBack} />
      )}
      {currentScreen === 'compose' && selectedChat && (
        <Compose chat={selectedChat} onBack={handleBack} onSent={handleSent} />
      )}
      {currentScreen === 'search' && <Search onBack={handleBack} />}
    </Box>
  );
}
