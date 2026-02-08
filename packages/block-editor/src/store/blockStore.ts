import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Block, BlockEditorState, BlockEditorActions } from "../types";
import { blocksToMarkdown, markdownToBlocks, blocksToHTML } from "../utils/serialization";

type BlockStore = BlockEditorState & BlockEditorActions;

export const useBlockStore = create<BlockStore>((set, get) => ({
  // Initial state
  blocks: [],
  selectedBlockIds: [],
  focusedBlockId: null,
  draggedBlockId: null,
  slashMenuOpen: false,
  slashMenuPosition: null,
  slashMenuFilter: "",

  // Block operations
  addBlock: (block, position) => {
    set((state) => {
      const newBlocks = [...state.blocks];
      const insertPosition = position ?? newBlocks.length;
      newBlocks.splice(insertPosition, 0, block);
      return { blocks: newBlocks };
    });
  },

  updateBlock: (id, updates) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      ),
    }));
  },

  deleteBlock: (id) => {
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockIds: state.selectedBlockIds.filter((bid) => bid !== id),
      focusedBlockId: state.focusedBlockId === id ? null : state.focusedBlockId,
    }));
  },

  moveBlock: (id, newPosition) => {
    set((state) => {
      const blocks = [...state.blocks];
      const currentIndex = blocks.findIndex((b) => b.id === id);
      if (currentIndex === -1) return state;

      const [block] = blocks.splice(currentIndex, 1);
      blocks.splice(newPosition, 0, block);

      return { blocks };
    });
  },

  duplicateBlock: (id) => {
    set((state) => {
      const blockIndex = state.blocks.findIndex((b) => b.id === id);
      if (blockIndex === -1) return state;

      const originalBlock = state.blocks[blockIndex];
      const duplicatedBlock: Block = {
        ...originalBlock,
        id: nanoid(),
      };

      const newBlocks = [...state.blocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);

      return { blocks: newBlocks };
    });
  },

  // Selection
  selectBlock: (id, multi = false) => {
    set((state) => {
      if (multi) {
        const isSelected = state.selectedBlockIds.includes(id);
        return {
          selectedBlockIds: isSelected
            ? state.selectedBlockIds.filter((bid) => bid !== id)
            : [...state.selectedBlockIds, id],
        };
      }
      return { selectedBlockIds: [id] };
    });
  },

  selectBlocks: (ids) => {
    set({ selectedBlockIds: ids });
  },

  clearSelection: () => {
    set({ selectedBlockIds: [] });
  },

  // Focus
  focusBlock: (id) => {
    set({ focusedBlockId: id });
  },

  clearFocus: () => {
    set({ focusedBlockId: null });
  },

  // Drag & drop
  startDrag: (id) => {
    set({ draggedBlockId: id });
  },

  endDrag: () => {
    set({ draggedBlockId: null });
  },

  // Slash menu
  openSlashMenu: (position, filter = "") => {
    set({
      slashMenuOpen: true,
      slashMenuPosition: position,
      slashMenuFilter: filter,
    });
  },

  closeSlashMenu: () => {
    set({
      slashMenuOpen: false,
      slashMenuPosition: null,
      slashMenuFilter: "",
    });
  },

  setSlashMenuFilter: (filter) => {
    set({ slashMenuFilter: filter });
  },

  // Bulk operations
  deleteSelectedBlocks: () => {
    set((state) => ({
      blocks: state.blocks.filter((block) => !state.selectedBlockIds.includes(block.id)),
      selectedBlockIds: [],
    }));
  },

  duplicateSelectedBlocks: () => {
    set((state) => {
      const newBlocks = [...state.blocks];
      const selectedBlocks = state.blocks.filter((b) =>
        state.selectedBlockIds.includes(b.id)
      );

      selectedBlocks.forEach((block) => {
        const blockIndex = newBlocks.findIndex((b) => b.id === block.id);
        const duplicated: Block = {
          ...block,
          id: nanoid(),
        };
        newBlocks.splice(blockIndex + 1, 0, duplicated);
      });

      return { blocks: newBlocks, selectedBlockIds: [] };
    });
  },

  // Serialization
  toJSON: () => {
    return JSON.stringify(get().blocks, null, 2);
  },

  fromJSON: (json) => {
    try {
      const blocks = JSON.parse(json);
      set({ blocks });
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  },

  toMarkdown: () => {
    return blocksToMarkdown(get().blocks);
  },

  fromMarkdown: (markdown) => {
    try {
      const blocks = markdownToBlocks(markdown);
      set({ blocks });
    } catch (error) {
      console.error("Failed to parse Markdown:", error);
    }
  },

  toHTML: () => {
    return blocksToHTML(get().blocks);
  },
}));
