import type { Editor } from "@tiptap/core";

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "todo"
  | "quote"
  | "code"
  | "divider"
  | "table"
  | "image"
  | "graph"
  | "lifeBalance"
  | "callout"
  | "toggle";

export interface BlockProperties {
  color?: string;
  backgroundColor?: string;
  align?: "left" | "center" | "right";
  indent?: number;
  checked?: boolean; // for todo
  language?: string; // for code
  icon?: string; // for callout
  collapsed?: boolean; // for toggle
  visualizationType?: string; // for visualizations
  generatedByAI?: boolean; // AI-generated flag
}

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  properties: BlockProperties;
  children?: Block[];
}

export interface BlockEditorState {
  blocks: Block[];
  selectedBlockIds: string[];
  focusedBlockId: string | null;
  draggedBlockId: string | null;
  slashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;
  slashMenuFilter: string;
}

export interface BlockEditorActions {
  // Block operations
  addBlock: (block: Block, position?: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, newPosition: number) => void;
  duplicateBlock: (id: string) => void;
  
  // Selection
  selectBlock: (id: string, multi?: boolean) => void;
  selectBlocks: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Focus
  focusBlock: (id: string) => void;
  clearFocus: () => void;
  
  // Drag & drop
  startDrag: (id: string) => void;
  endDrag: () => void;
  
  // Slash menu
  openSlashMenu: (position: { x: number; y: number }, filter?: string) => void;
  closeSlashMenu: () => void;
  setSlashMenuFilter: (filter: string) => void;
  
  // Bulk operations
  deleteSelectedBlocks: () => void;
  duplicateSelectedBlocks: () => void;
  
  // Serialization
  toJSON: () => string;
  fromJSON: (json: string) => void;
  toMarkdown: () => string;
  fromMarkdown: (markdown: string) => void;
  toHTML: () => string;
}

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  aliases: string[];
  icon: React.ReactNode;
  blockType: BlockType;
  action: (editor: Editor | null) => void;
}

export interface BlockMenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (blockId: string) => void;
  shortcut?: string;
}
