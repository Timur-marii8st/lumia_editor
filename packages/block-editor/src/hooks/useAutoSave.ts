import { useEffect, useRef, useState } from "react";
import { useBlockStore } from "../store/blockStore";
import type { Block } from "../types";

interface AutoSaveOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: (blocks: Block[]) => Promise<void>;
}

export const useAutoSave = (options: AutoSaveOptions = {}) => {
  const {
    enabled = true,
    interval = 5000, // 5 seconds
    onSave,
  } = options;

  const blocks = useBlockStore((state) => state.blocks);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !onSave) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setSaveError(null);
        await onSave(blocks);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveError(error instanceof Error ? error.message : "Save failed");
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [blocks, enabled, interval, onSave]);

  const saveNow = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      await onSave(blocks);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Manual save failed:", error);
      setSaveError(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    lastSaved,
    isSaving,
    saveError,
    saveNow,
  };
};
