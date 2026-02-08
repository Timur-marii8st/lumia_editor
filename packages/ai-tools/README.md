# @lumia/ai-tools

AI Tool Calling system for Lumia Editor - enables LLM to directly interact with and modify documents.

## Features

- **Type-safe tool definitions** using Zod schemas
- **OpenAI-compatible function calling** format
- **Extensible architecture** - easy to add new tools
- **Editor integration** - direct access to Tiptap editor
- **Comprehensive tool set** for document manipulation

## Available Tools

### Text Editing
- `insert_text` - Insert text at cursor position
- `replace_text` - Replace selected or specified text
- `delete_text` - Delete text from document
- `format_text` - Apply formatting (bold, italic, headings, etc.)

### Content Insertion
- `insert_table` - Create tables with specified rows/columns
- `insert_list` - Create bullet or numbered lists
- `insert_heading` - Insert headings (H1-H6)
- `insert_divider` - Insert horizontal divider

### Document Analysis
- `get_document_content` - Get full document content
- `get_selected_text` - Get currently selected text
- `search_document` - Search for text in document

### Visualizations
- `create_graph` - Create 2D graph visualizations with nodes and edges
- `create_table_visualization` - Create structured tables from data
- `create_life_balance` - Create life balance circle diagrams

## Usage

```typescript
import { toolRegistry, aiToolExecutor } from "@lumia/ai-tools";
import type { Editor } from "@tiptap/core";

// Set editor context
aiToolExecutor.setEditor(editor);

// Get tools for LLM
const tools = aiToolExecutor.getAvailableTools();

// Execute tool call from LLM
const result = await aiToolExecutor.executeTool({
  id: "call_123",
  name: "insert_text",
  parameters: { text: "Hello, world!" }
});
```

## Architecture

```
packages/ai-tools/
├── src/
│   ├── types.ts              # Core type definitions
│   ├── registry.ts           # Tool registry and executor
│   ├── tools/
│   │   ├── text-editing.ts   # Text manipulation tools
│   │   ├── content-insertion.ts  # Content creation tools
│   │   ├── document-analysis.ts  # Document reading tools
│   │   └── visualization.ts  # Visualization creation tools
│   └── index.ts              # Main export
└── package.json
```

## Adding New Tools

```typescript
import { z } from "zod";
import type { ToolDefinition } from "@lumia/ai-tools";

export const myCustomTool: ToolDefinition = {
  name: "my_custom_tool",
  description: "Description for LLM",
  parameters: z.object({
    param1: z.string().describe("Parameter description"),
    param2: z.number().optional(),
  }),
  execute: async (params, context) => {
    // Access editor: context.editor
    // Implement tool logic
    return {
      success: true,
      message: "Tool executed successfully",
      data: { /* optional data */ }
    };
  },
};

// Register tool
import { toolRegistry } from "@lumia/ai-tools";
toolRegistry.register(myCustomTool);
```

## Integration with LM Studio

The tools are automatically converted to OpenAI function calling format:

```typescript
import { LMStudioClient } from "@/lib/ai/lm-studio-client";
import { aiToolExecutor } from "@lumia/ai-tools";

const client = new LMStudioClient({
  url: "http://localhost:1234/v1/chat/completions",
  model: "your-model"
});

const tools = aiToolExecutor.getAvailableTools();

// Stream with tools
for await (const chunk of client.streamChat(messages, tools)) {
  if (chunk.type === "tool_call") {
    // Execute tools
    const responses = await aiToolExecutor.executeTools(
      chunk.toolCalls.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        parameters: JSON.parse(tc.function.arguments)
      }))
    );
  }
}
```

## License

MIT
