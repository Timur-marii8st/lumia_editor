import React from "react";
import { FileText, Type, Clock, Check, Loader2, AlertCircle } from "lucide-react";
import { useBlockStore } from "../store/blockStore";

interface StatsBarProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: string | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ isSaving, lastSaved, saveError }) => {
  const blocks = useBlockStore((state) => state.blocks);

  // Calculate statistics
  const blockCount = blocks.length;
  
  const wordCount = blocks.reduce((total, block) => {
    if (!block.content) return total;
    const words = block.content.trim().split(/\s+/).filter(Boolean);
    return total + words.length;
  }, 0);

  const charCount = blocks.reduce((total, block) => {
    return total + (block.content?.length || 0);
  }, 0);

  // Estimate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm px-4 py-2 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
      {/* Save status */}
      {(isSaving || lastSaved || saveError) && (
        <>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-blue-500">Saving...</span>
              </>
            ) : saveError ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Save failed</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Saved {formatLastSaved(lastSaved)}</span>
              </>
            ) : null}
          </div>
          <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
        </>
      )}

      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span>{blockCount} blocks</span>
      </div>
      
      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
      
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4" />
        <span>{wordCount} words</span>
      </div>
      
      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
      
      <div className="flex items-center gap-2">
        <span>{charCount} characters</span>
      </div>
      
      {readingTime > 0 && (
        <>
          <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min read</span>
          </div>
        </>
      )}
    </div>
  );
};
