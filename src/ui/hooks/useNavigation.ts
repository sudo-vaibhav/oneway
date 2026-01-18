import { useState, useCallback } from 'react';

export type Screen = 'home' | 'contacts' | 'compose' | 'search';

interface NavigationState {
  currentScreen: Screen;
  selectedChat: { id: string; name: string } | null;
}

interface UseNavigationReturn {
  currentScreen: Screen;
  selectedChat: { id: string; name: string } | null;
  navigateTo: (screen: Screen) => void;
  selectChat: (chat: { id: string; name: string }) => void;
  goBack: () => void;
  goHome: () => void;
}

export function useNavigation(): UseNavigationReturn {
  const [state, setState] = useState<NavigationState>({
    currentScreen: 'home',
    selectedChat: null,
  });

  const navigateTo = useCallback((screen: Screen) => {
    setState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const selectChat = useCallback((chat: { id: string; name: string }) => {
    setState((prev) => ({
      ...prev,
      selectedChat: chat,
      currentScreen: 'compose',
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentScreen === 'compose') {
        return { ...prev, currentScreen: 'contacts' };
      }
      return { ...prev, currentScreen: 'home', selectedChat: null };
    });
  }, []);

  const goHome = useCallback(() => {
    setState({ currentScreen: 'home', selectedChat: null });
  }, []);

  return {
    currentScreen: state.currentScreen,
    selectedChat: state.selectedChat,
    navigateTo,
    selectChat,
    goBack,
    goHome,
  };
}
