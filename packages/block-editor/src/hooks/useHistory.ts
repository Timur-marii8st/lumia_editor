import { useEffect, useCallback } from "react";
import { useBlockStore } from "../store/blockStore";
import type { Block } from "../types";

interface HistoryState {
  blocks: Block[];
  timestamp: number;
}

const MAX_HISTORY = 50;
let history: HistoryState[] = [];
let currentIndex = -1;
let isUndoRedo = false;

export const useHistory = () => {
  const blocks = useBlockStore((state) => state.blocks);

  // Save current state to history
  const saveState = useCallback(() => {
    if (isUndoRedo) return;

    const newState: HistoryState = {
      blocks: JSON.parse(JSON.stringify(blocks)),
      timestamp: Date.now(),
    };

    // Remove any states after current index
    history = history.slice(0, currentIndex + 1);

    // Add new state
    history.push(newState);

    // Limit history size
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    currentIndex = history.length - 1;
  }, [blocks]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedo = true;
      currentIndex--;
      const state = history[currentIndex];
      useBlockStore.setState({ blocks: state.blocks });
      setTimeout(() => {
        isUndoRedo = false;
      }, 100);
    }
  }, []);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedo = true;
      currentIndex++;
      const state = history[currentIndex];
      useBlockStore.setState({ blocks: state.blocks });
      setTimeout(() => {
        isUndoRedo = false;
      }, 100);
    }
  }, []);

  // Save state on blocks change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveState();
    }, 500);

    return () => clearTimeout(timer);
  }, [blocks, saveState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
};
