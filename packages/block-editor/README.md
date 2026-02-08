# @lumia/block-editor

A Notion-like block-based editor built with React, TypeScript, Zustand, and Framer Motion.

## Features

- 🎨 **9 Block Types**: Paragraph, headings, lists, quotes, code, todo, callout, toggle, divider
- ⌨️ **Slash Commands**: Type `/` to open command menu with 17 options
- 🎯 **Block Actions**: Hover menus for quick operations (delete, duplicate, move)
- 🎭 **Smooth Animations**: Framer Motion for all transitions
- 🌙 **Dark Mode**: Full dark mode support
- ⌨️ **Keyboard Shortcuts**: Cmd+A, Delete, Escape, and more
- 🎪 **Drag & Drop**: Reorder blocks with smooth animations
- 🤖 **AI Integration**: Generate, improve, and continue writing with Ollama
- 💾 **Serialization**: Export/import as JSON or Markdown

## Installation

```bash
pnpm add @lumia/block-editor
```

## Usage

```tsx
import { BlockEditor } from "@lumia/block-editor";

function App() {
  return (
    <BlockEditor
      initialBlocks={[]}
      onChange={(blocks) => {
        console.log("Blocks changed:", blocks);
      }}
      className="h-full"
    />
  );
}
```

## Block Types

### Basic Blocks
- **Paragraph**: Plain text with rich formatting
- **Heading 1-3**: Section headings
- **Bullet List**: Unordered list items
- **Numbered List**: Ordered list items
- **Quote**: Block quotes with left border
- **Divider**: Horizontal separator

### Advanced Blocks (Implemented!)
- **Todo**: Interactive checklist items with checkboxes
- **Code**: Syntax-highlighted code blocks with 12 languages
- **Callout**: Highlighted info boxes with 5 types (info, warning, error, tip, note)
- **Toggle**: Collapsible sections with smooth animations
- **Table**: Data tables (coming soon)
- **Image**: Image uploads (coming soon)
- **Graph**: 2D graph visualizations (coming soon)
- **Life Balance**: Life balance wheel (coming soon)

## Slash Commands

Type `/` in any paragraph to open the command menu:

- `/paragraph` or `/p` - Paragraph
- `/heading1` or `/h1` or `/#` - Heading 1
- `/heading2` or `/h2` or `/##` - Heading 2
- `/heading3` or `/h3` or `/###` - Heading 3
- `/bullet` or `/ul` or `/-` - Bullet list
- `/number` or `/ol` or `/1` - Numbered list
- `/todo` or `/checkbox` - To-do list
- `/quote` or `/>` - Quote
- `/code` or `/```` - Code block
- `/callout` - Callout box
- `/toggle` - Toggle section
- `/divider` or `/hr` or `/---` - Divider
- `/ai` - Ask AI to generate content ✨

## Keyboard Shortcuts

- **Cmd/Ctrl + A**: Select all blocks
- **Escape**: Clear selection and close menus
- **Delete/Backspace**: Delete selected blocks
- **Space** (on drag handle): Grab block for keyboard dragging
- **Arrow keys** (while grabbed): Move block up/down
- **Arrow Up/Down** (in slash menu): Navigate commands
- **Enter** (in slash menu): Select command

## Block Operations

### Drag & Drop
- Click and hold the drag handle (⋮⋮) on the left
- Drag blocks up or down to reorder
- Visual feedback while dragging
- Keyboard accessible (Space to grab, arrows to move)

### Hover Menus

**Left Menu (⋮⋮)**:
- Drag handle for reordering
- More actions dropdown:
  - Delete block
  - Duplicate block
  - Move up/down
  - **Improve with AI** ✨
  - **Continue writing** 🔄

**Right Menu (+)**:
- Add block below
- Quick block type selector

## AI Features

The editor integrates with Ollama for AI-powered features:

### Generate Content
Use `/ai` slash command to generate blocks from prompts:
```
/ai → "Write a paragraph about React hooks"
```

### Improve Text
Hover over any block and click "Improve with AI" to enhance the text while keeping the same meaning.

### Continue Writing
Click "Continue writing" to generate a continuation of your text in a new block below.

### Setup
Make sure Ollama is running and configured in your app settings. The editor will use your selected model automatically.

## State Management

The editor uses Zustand for state management:

```tsx
import { useBlockStore } from "@lumia/block-editor";

function MyComponent() {
  const blocks = useBlockStore((state) => state.blocks);
  const addBlock = useBlockStore((state) => state.addBlock);
  
  // Add a new block
  addBlock({
    id: nanoid(),
    type: "paragraph",
    content: "Hello world",
    properties: {},
  });
}
```

## Serialization

```tsx
import { useBlockStore } from "@lumia/block-editor";

// Export to JSON
const json = useBlockStore.getState().toJSON();

// Import from JSON
useBlockStore.getState().fromJSON(json);

// Export to Markdown (coming soon)
const markdown = useBlockStore.getState().toMarkdown();
```

## Styling

The editor includes default styles. Import the CSS:

```tsx
import "@lumia/block-editor/dist/index.css";
```

Or customize with Tailwind classes using the `className` prop.

## Development Status

**Current**: Stages 1-8 complete (80%)
- ✅ Basic structure
- ✅ Basic block types
- ✅ Block menus and actions
- ✅ Slash commands
- ✅ Drag & drop
- ✅ Advanced blocks (todo, code, callout, toggle)
- ✅ AI integration
- ⏳ Advanced selection
- ⏳ Full serialization
- ⏳ Polish and tests

See [BLOCK_EDITOR_COMPLETE.md](../../BLOCK_EDITOR_COMPLETE.md) for full details.

## License

MIT
