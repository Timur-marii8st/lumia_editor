import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useBlockStore } from "../store/blockStore";

export const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const { blocks, focusBlock } = useBlockStore();

  // Find matching blocks
  const matches = blocks.filter((block) =>
    block.content?.toLowerCase().includes(query.toLowerCase())
  );

  // Navigate to match
  const goToMatch = (index: number) => {
    if (matches[index]) {
      focusBlock(matches[index].id);
      setCurrentMatch(index);
      
      // Scroll to block
      const element = document.querySelector(`[data-block-id="${matches[index].id}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + F - Open search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape - Close search
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
        setCurrentMatch(0);
      }

      // Enter - Next match
      if (e.key === "Enter" && isOpen && matches.length > 0) {
        e.preventDefault();
        const nextIndex = (currentMatch + 1) % matches.length;
        goToMatch(nextIndex);
      }

      // Shift + Enter - Previous match
      if (e.key === "Enter" && e.shiftKey && isOpen && matches.length > 0) {
        e.preventDefault();
        const prevIndex = (currentMatch - 1 + matches.length) % matches.length;
        goToMatch(prevIndex);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, matches, currentMatch]);

  // Reset current match when query changes
  useEffect(() => {
    setCurrentMatch(0);
    if (matches.length > 0 && query) {
      goToMatch(0);
    }
  }, [query]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all"
        title="Search (Cmd+F)"
      >
        <Search className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-40 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-xl p-4 w-80"
    >
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks..."
          className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-100"
          autoFocus
        />
        <button
          onClick={() => {
            setIsOpen(false);
            setQuery("");
            setCurrentMatch(0);
          }}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {query && (
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            {matches.length > 0
              ? `${currentMatch + 1} of ${matches.length}`
              : "No matches"}
          </span>

          {matches.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const prevIndex = (currentMatch - 1 + matches.length) % matches.length;
                  goToMatch(prevIndex);
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                title="Previous (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const nextIndex = (currentMatch + 1) % matches.length;
                  goToMatch(nextIndex);
                }}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                title="Next (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
