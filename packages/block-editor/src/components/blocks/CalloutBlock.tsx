import React, { useRef, useEffect } from "react";
import { Info, AlertCircle, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import { useBlockStore } from "../../store/blockStore";
import type { Block } from "../../types";

interface CalloutBlockProps {
  block: Block;
}

type IconType = "info" | "warning" | "error" | "tip" | "note";
type ColorType = "blue" | "yellow" | "red" | "green" | "purple";

const iconOptions: Record<IconType, { icon: React.ComponentType<any>; color: ColorType }> = {
  info: { icon: Info, color: "blue" },
  warning: { icon: AlertTriangle, color: "yellow" },
  error: { icon: AlertCircle, color: "red" },
  tip: { icon: Lightbulb, color: "green" },
  note: { icon: Sparkles, color: "purple" },
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block }) => {
  const { updateBlock, focusBlock } = useBlockStore();
  const inputRef = useRef<HTMLDivElement>(null);

  // Set initial content only once
  useEffect(() => {
    if (inputRef.current && inputRef.current.textContent !== block.content) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;
      
      inputRef.current.textContent = block.content;
      
      // Restore cursor position
      if (range && startOffset !== undefined) {
        try {
          const newRange = document.createRange();
          const textNode = inputRef.current.firstChild;
          if (textNode) {
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0));
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        } catch (e) {
          // Ignore range errors
        }
      }
    }
  }, [block.content]);

  useEffect(() => {
    if (inputRef.current && !block.content) {
      inputRef.current.focus();
    }
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    updateBlock(block.id, { content });
  };

  const handleFocus = () => {
    focusBlock(block.id);
  };

  const iconType = (block.properties.icon as IconType) || "info";
  const { color } = iconOptions[iconType];

  const colorClasses: Record<ColorType, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${colorClasses[color]}`}>
      {/* Icon selector */}
      <div className="flex-shrink-0">
        <select
          value={iconType}
          onChange={(e) =>
            updateBlock(block.id, {
              properties: { ...block.properties, icon: e.target.value },
            })
          }
          className="appearance-none bg-transparent cursor-pointer"
          title="Change icon"
        >
          <option value="info">ℹ️</option>
          <option value="warning">⚠️</option>
          <option value="error">❌</option>
          <option value="tip">💡</option>
          <option value="note">✨</option>
        </select>
      </div>

      {/* Content */}
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        dir="ltr"
        className="flex-1 outline-none text-base text-neutral-900 dark:text-neutral-100 min-h-[1.5rem]"
        style={{
          direction: "ltr",
          unicodeBidi: "embed",
        }}
        data-placeholder="Callout text..."
      />
    </div>
  );
};
