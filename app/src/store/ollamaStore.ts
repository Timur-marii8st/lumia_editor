import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OllamaStore {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
}

export const useOllamaStore = create(
  persist<OllamaStore>(
    (set) => ({
      selectedModel: "llama3.2",
      setSelectedModel: (model) => set({ selectedModel: model }),
      ollamaUrl: "http://localhost:11434",
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
    }),
    {
      name: "ollama-storage",
    }
  )
);
