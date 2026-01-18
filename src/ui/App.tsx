import React, { useState } from 'react';
import { Box } from 'ink';
import Home from './screens/Home';
import ContactList from './screens/ContactList';
import Compose from './screens/Compose';
import Search from './screens/Search';

type Screen = 'home' | 'contacts' | 'compose' | 'search';

interface AppProps {
  onExit: () => void;
}

export default function App({ onExit }: AppProps): React.ReactElement {
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
