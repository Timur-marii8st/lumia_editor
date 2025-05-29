import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatSession, Message } from '@/components/miachat/chat';

interface ChatStore {
  sessions: ChatSession[];
  activeChatId: string | null;
  addSession: (session: ChatSession) => void;
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  deleteSession: (id: string) => void;
  setActiveChat: (id: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
}

export const useChatStore = create(
  persist<ChatStore>(
    (set) => ({
      sessions: [],
      activeChatId: null,
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),
      setActiveChat: (id) => set({ activeChatId: id }),
      addMessage: (chatId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === chatId
              ? { ...s, messages: [...s.messages, message] }
              : s
          ),
        })),
    }),
    {
      name: 'chat-storage',
    }
  )
);