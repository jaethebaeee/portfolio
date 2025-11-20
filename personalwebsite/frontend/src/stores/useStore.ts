import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatMessage, AppState } from '@/types';

interface StoreActions {
  // Chat actions
  addMessage: (_message: ChatMessage) => void;
  setLoading: (_loading: boolean) => void;
  setTyping: (_typing: boolean) => void;
  setSessionId: (_sessionId: string) => void;
  setChatError: (_error: string | null) => void;
  setConnected: (_connected: boolean) => void;
  clearMessages: () => void;

  // UI actions
  toggleChat: () => void;
  setChatOpen: (_open: boolean) => void;
  toggleDarkMode: () => void;
  toggleMenu: () => void;
  setMenuOpen: (_open: boolean) => void;
}

const useStore = create<AppState & StoreActions>()(
  devtools(
    (set) => ({
      // Initial state
      chat: {
        messages: [],
        isLoading: false,
        isTyping: false,
        sessionId: null,
        error: null,
        isConnected: false,
      },
      ui: {
        isChatOpen: false,
        isDarkMode: false,
        isMenuOpen: false,
      },

      // Chat actions
      addMessage: (message: ChatMessage) =>
        set((state) => ({
          chat: {
            ...state.chat,
            messages: [...state.chat.messages, message],
          },
        })),

      setLoading: (loading: boolean) =>
        set((state) => ({
          chat: {
            ...state.chat,
            isLoading: loading,
          },
        })),

      setTyping: (typing: boolean) =>
        set((state) => ({
          chat: {
            ...state.chat,
            isTyping: typing,
          },
        })),

      setSessionId: (sessionId: string) =>
        set((state) => ({
          chat: {
            ...state.chat,
            sessionId,
          },
        })),

      setChatError: (error: string | null) =>
        set((state) => ({
          chat: {
            ...state.chat,
            error,
          },
        })),

      setConnected: (connected: boolean) =>
        set((state) => ({
          chat: {
            ...state.chat,
            isConnected: connected,
          },
        })),

      clearMessages: () =>
        set((state) => ({
          chat: {
            ...state.chat,
            messages: [],
            error: null,
          },
        })),

      // UI actions
      toggleChat: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            isChatOpen: !state.ui.isChatOpen,
          },
        })),

      setChatOpen: (open: boolean) =>
        set((state) => ({
          ui: {
            ...state.ui,
            isChatOpen: open,
          },
        })),

      toggleDarkMode: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            isDarkMode: !state.ui.isDarkMode,
          },
        })),

      toggleMenu: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            isMenuOpen: !state.ui.isMenuOpen,
          },
        })),

      setMenuOpen: (open: boolean) =>
        set((state) => ({
          ui: {
            ...state.ui,
            isMenuOpen: open,
          },
        })),
    }),
    { name: 'personal-website-store' }
  )
);

export default useStore;
