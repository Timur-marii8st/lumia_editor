import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBlockStore } from "../store/blockStore";
import { Block } from "./Block";
import { SlashMenu } from "./SlashMenu";
import { EditorToolbar } from "./EditorToolbar";
import { SearchBar } from "./SearchBar";
import { StatsBar } from "./StatsBar";
import { KeyboardShortcutsPanel } from "./KeyboardShortcutsPanel";
import { MetadataPanel } from "./MetadataPanel";
import { useHistory } from "../hooks/useHistory";
import { useAutoSave } from "../hooks/useAutoSave";
import { nanoid } from "nanoid";
import type { Block as BlockType } from "../types";
import "../styles/block-editor.css";

interface BlockEditorProps {
  initialBlocks?: BlockType[];
  onChange?: (blocks: BlockType[]) => void;
  onSave?: (blocks: BlockType[]) => Promise<void>;
  autoSave?: boolean;
  autoSaveInterval?: number;
  metadata?: {
    title?: string;
    author?: string;
    tags: string[];
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
  };
  onMetadataChange?: (metadata: any) => void;
  className?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialBlocks = [],
  onChange,
  onSave,
  autoSave = false,
  autoSaveInterval = 5000,
  metadata = { tags: [], createdAt: new Date(), updatedAt: new Date() },
  onMetadataChange,
  className = "",
}) => {
  const {
    blocks,
    addBlock,
    moveBlock,
    slashMenuOpen,
    closeSlashMenu,
    selectedBlockIds,
    clearSelection,
  } = useBlockStore();

  const editorRef = useRef<HTMLDivElement>(null);

  // Auto-save hook
  const { lastSaved, isSaving, saveError } = useAutoSave({
    enabled: autoSave,
    interval: autoSaveInterval,
    onSave,
  });

  // History hook for undo/redo
  useHistory();

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(active.id as string, newIndex);
      }
    }
  };

  // Initialize with blocks or create empty paragraph
  useEffect(() => {
    if (initialBlocks.length > 0) {
      useBlockStore.setState({ blocks: initialBlocks });
    } else if (blocks.length === 0) {
      addBlock({
        id: nanoid(),
        type: "paragraph",
        content: "",
        properties: {},
      });
    }
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  // Handle click outside to close slash menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (slashMenuOpen && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        closeSlashMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [slashMenuOpen, closeSlashMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useBlockStore.getState();
      const { selectedBlockIds, blocks } = state;

      // Cmd/Ctrl + A - Select all blocks
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        state.selectBlocks(blocks.map(b => b.id));
        return;
      }

      // Escape - Clear selection and close menus
      if (e.key === "Escape") {
        state.clearSelection();
        closeSlashMenu();
        return;
      }

      // Delete - Delete selected blocks
      if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockIds.length > 0) {
        const activeElement = document.activeElement;
        // Only delete if not typing in an input
        if (activeElement?.tagName !== "INPUT" && 
            activeElement?.tagName !== "TEXTAREA" && 
            !activeElement?.hasAttribute("contenteditable")) {
          e.preventDefault();
          state.deleteSelectedBlocks();
        }
        return;
      }

      // Cmd/Ctrl + D - Duplicate selected blocks
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedBlockIds.length > 0) {
        e.preventDefault();
        state.duplicateSelectedBlocks();
        return;
      }

      // Cmd/Ctrl + Shift + Up - Move selected blocks up
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "ArrowUp" && selectedBlockIds.length > 0) {
        e.preventDefault();
        const firstSelectedIndex = blocks.findIndex(b => selectedBlockIds.includes(b.id));
        if (firstSelectedIndex > 0) {
          selectedBlockIds.forEach(id => {
            const currentIndex = blocks.findIndex(b => b.id === id);
            if (currentIndex > 0) {
              state.moveBlock(id, currentIndex - 1);
            }
          });
        }
        return;
      }

      // Cmd/Ctrl + Shift + Down - Move selected blocks down
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "ArrowDown" && selectedBlockIds.length > 0) {
        e.preventDefault();
        const lastSelectedIndex = blocks.findIndex(b => selectedBlockIds[selectedBlockIds.length - 1] === b.id);
        if (lastSelectedIndex < blocks.length - 1) {
          [...selectedBlockIds].reverse().forEach(id => {
            const currentIndex = blocks.findIndex(b => b.id === id);
            if (currentIndex < blocks.length - 1) {
              state.moveBlock(id, currentIndex + 1);
            }
          });
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [blocks, closeSlashMenu]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Editor Toolbar */}
      <EditorToolbar />

      {/* Metadata Panel */}
      {onMetadataChange && (
        <MetadataPanel
          metadata={metadata}
          onChange={onMetadataChange}
        />
      )}

      <div
        ref={editorRef}
        className={`block-editor relative min-h-screen p-8 ${className}`}
      >
        {/* Selection toolbar */}
        <AnimatePresence>
          {selectedBlockIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3"
            >
              <span className="font-medium">
                {selectedBlockIds.length} block{selectedBlockIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => {
                  useBlockStore.getState().duplicateSelectedBlocks();
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => {
                  useBlockStore.getState().deleteSelectedBlocks();
                }}
                className="px-3 py-1 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-2xl mx-auto">
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {blocks.map((block, index) => (
                <Block
                  key={block.id}
                  block={block}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </SortableContext>

          {/* Empty state */}
          {blocks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-neutral-400 dark:text-neutral-600"
            >
              <p className="text-lg">Start typing or press "/" for commands</p>
            </motion.div>
          )}
        </div>

        {/* Slash menu */}
        <AnimatePresence>
          {slashMenuOpen && <SlashMenu />}
        </AnimatePresence>

        {/* Search bar */}
        <SearchBar />

        {/* Stats bar */}
        <StatsBar 
          isSaving={isSaving}
          lastSaved={lastSaved}
          saveError={saveError}
        />

        {/* Keyboard shortcuts panel */}
        <KeyboardShortcutsPanel />
      </div>
    </DndContext>
  );
};
