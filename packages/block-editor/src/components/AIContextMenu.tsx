import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2, Languages, Lightbulb, MessageSquare, Zap } from "lucide-react";
import { useBlockStore } from "../store/blockStore";

interface AIContextMenuProps {
  blockId: string;
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const AIContextMenu: React.FC<AIContextMenuProps> = ({
  blockId,
  selectedText,
  position,
  onClose,
}) => {
  const { updateBlock, blocks } = useBlockStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const block = blocks.find((b) => b.id === blockId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".ai-context-menu")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAIAction = async (action: string) => {
    if (!block) return;

    setIsProcessing(true);
    try {
      const ollamaUrl = localStorage.getItem("ollama_url") || "http://localhost:11434";
      const selectedModel = localStorage.getItem("ollama_selected_model") || "llama2";

      let prompt = "";
      switch (action) {
        case "improve":
          prompt = `Improve this text while keeping the same meaning:\n\n${selectedText}\n\nRespond with ONLY the improved text, no explanations.`;
          break;
        case "simplify":
          prompt = `Simplify this text to make it easier to understand:\n\n${selectedText}\n\nRespond with ONLY the simplified text, no explanations.`;
          break;
        case "expand":
          prompt = `Expand on this text with more details:\n\n${selectedText}\n\nRespond with ONLY the expanded text, no explanations.`;
          break;
        case "summarize":
          prompt = `Summarize this text concisely:\n\n${selectedText}\n\nRespond with ONLY the summary, no explanations.`;
          break;
        case "translate":
          prompt = `Translate this text to English (if not English) or to Russian (if English):\n\n${selectedText}\n\nRespond with ONLY the translation, no explanations.`;
          break;
        case "explain":
          prompt = `Explain what this text means in simple terms:\n\n${selectedText}\n\nRespond with ONLY the explanation, no extra text.`;
          break;
      }

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) throw new Error("AI request failed");

      const data = await response.json();
      const result = data.response.trim();

      // Replace selected text with AI result
      const newContent = block.content.replace(selectedText, result);
      updateBlock(blockId, { content: newContent });

      onClose();
    } catch (error) {
      console.error("AI action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="ai-context-menu fixed z-50 w-64 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-2"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            AI Actions
          </div>
        </div>

        <div className="py-1">
          <button
            onClick={() => handleAIAction("improve")}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 text-sm disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4 text-blue-500" />
            <div>
              <div className="font-medium">Improve</div>
              <div className="text-xs text-neutral-500">Enhance quality</div>
            </div>
          </button>

          <button
            onClick={() => handleAIAction("simplify")}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 text-sm disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-green-500" />
            <div>
              <div className="font-medium">Simplify</div>
              <div className="text-xs text-neutral-500">Make it clearer</div>
            </div>
          </button>

          <button
            onClick={() => handleAIAction("expand")}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 text-sm disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <div>
              <div className="font-medium">Expand</div>
              <div className="text-xs text-neutral-500">Add more details</div>
            </div>
          </button>

          <button
            onClick={() => handleAIAction("summarize")}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 text-sm disabled:opacity-50"
          >
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="font-medium">Summarize</div>
              <div className="text-xs text-neutral-500">Make it shorter</div>
            </div>
          </button>

          <button
            onClick={() => handleAIAction("translate")}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 text-sm disabled:opacity-50"
          >
            <Languages className="w-4 h-4 text-purple-500" />
            <div>
              <div className="font-medium">Translate</div>
              <div className="text-xs text-neutral-500">EN ↔ RU</div>
            </div>
          </button>

          <button
            onClick={() => handleAIAction("explain")}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 text-sm disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="font-medium">Explain</div>
              <div className="text-xs text-neutral-500">What does it mean?</div>
            </div>
          </button>
        </div>

        {isProcessing && (
          <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
