import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBlockStore } from "../store/blockStore";
import { BlockMenu } from "./BlockMenu";
import { BlockActions } from "./BlockActions";
import type { Block as BlockType } from "../types";

// Import block type components
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ListBlock } from "./blocks/ListBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { TodoBlock } from "./blocks/TodoBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { ToggleBlock } from "./blocks/ToggleBlock";

interface BlockProps {
  block: BlockType;
  index: number;
}

export const Block: React.FC<BlockProps> = ({ block, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const { selectedBlockIds, focusedBlockId } = useBlockStore();
  
  const isSelected = selectedBlockIds.includes(block.id);
  const isFocused = focusedBlockId === block.id;

  // Sortable hook for drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Render appropriate block component based on type
  const renderBlockContent = () => {
    switch (block.type) {
      case "paragraph":
        return <ParagraphBlock block={block} />;
      case "heading1":
      case "heading2":
      case "heading3":
        return <HeadingBlock block={block} />;
      case "bulletList":
      case "numberedList":
        return <ListBlock block={block} />;
      case "quote":
        return <QuoteBlock block={block} />;
      case "divider":
        return <DividerBlock block={block} />;
      case "todo":
        return <TodoBlock block={block} />;
      case "code":
        return <CodeBlock block={block} />;
      case "callout":
        return <CalloutBlock block={block} />;
      case "toggle":
        return <ToggleBlock block={block} />;
      // TODO: Add more block types (table, image, graph, lifeBalance)
      default:
        return <ParagraphBlock block={block} />;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      data-block-id={block.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group
        ${isSelected ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 dark:ring-blue-600" : ""}
        ${isFocused ? "ring-2 ring-blue-500" : ""}
        ${isDragging ? "z-50" : ""}
        rounded-lg
      `}
      onClick={(e) => {
        // Handle multi-select with Shift/Ctrl
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          e.preventDefault();
          const { selectBlock } = useBlockStore.getState();
          selectBlock(block.id, true);
        }
      }}
    >
      {/* Block Menu (left side) */}
      {isHovered && (
        <BlockMenu
          blockId={block.id}
          dragHandleProps={{ ...attributes, ...listeners }}
          onMenuInteraction={() => setIsHovered(true)}
        />
      )}

      {/* Block Content */}
      <div className="px-8 py-1">
        {renderBlockContent()}
      </div>

      {/* Block Actions (right side) */}
      {isHovered && <BlockActions blockId={block.id} index={index} />}
    </motion.div>
  );
};
