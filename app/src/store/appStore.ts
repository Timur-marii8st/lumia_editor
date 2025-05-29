import { create } from "zustand";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
}

interface AppStore {
  openDrawer: boolean;
  toggleDrawer: () => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  openDrawer: true,
  toggleDrawer: () => set((state) => ({ openDrawer: !state.openDrawer })),
  events: [],
  setEvents: (events) => set({ events }),
}));
