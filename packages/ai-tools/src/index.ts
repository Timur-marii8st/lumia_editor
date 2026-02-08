// Types
export * from "./types";

// Registry
export { ToolRegistry, toolRegistry } from "./registry";

// Tools
export * from "./tools/text-editing";
export * from "./tools/content-insertion";
export * from "./tools/document-analysis";
export * from "./tools/visualization";

// Register all tools
import { toolRegistry } from "./registry";
import {
  insertTextTool,
  replaceTextTool,
  deleteTextTool,
  formatTextTool,
} from "./tools/text-editing";
import {
  insertTableTool,
  insertListTool,
  insertHeadingTool,
  insertDividerTool,
} from "./tools/content-insertion";
import {
  getDocumentContentTool,
  getSelectedTextTool,
  searchDocumentTool,
} from "./tools/document-analysis";
import {
  createGraphTool,
  createTableVisualizationTool,
  createLifeBalanceTool,
} from "./tools/visualization";

// Auto-register all tools
toolRegistry.register(insertTextTool);
toolRegistry.register(replaceTextTool);
toolRegistry.register(deleteTextTool);
toolRegistry.register(formatTextTool);
toolRegistry.register(insertTableTool);
toolRegistry.register(insertListTool);
toolRegistry.register(insertHeadingTool);
toolRegistry.register(insertDividerTool);
toolRegistry.register(getDocumentContentTool);
toolRegistry.register(getSelectedTextTool);
toolRegistry.register(searchDocumentTool);
toolRegistry.register(createGraphTool);
toolRegistry.register(createTableVisualizationTool);
toolRegistry.register(createLifeBalanceTool);
