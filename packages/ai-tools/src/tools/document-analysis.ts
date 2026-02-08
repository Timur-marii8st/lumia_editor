import { z } from "zod";
import type { ToolDefinition } from "../types";

/**
 * Get the current document content
 */
export const getDocumentContentTool: ToolDefinition = {
  name: "get_document_content",
  description: "Get the full content of the current document in markdown format",
  parameters: z.object({}),
  execute: async (_params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const content = context.editor.storage.markdown?.getMarkdown() || context.editor.getText();
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const charCount = content.length;

      return {
        success: true,
        message: `Retrieved document content (${wordCount} words, ${charCount} characters)`,
        data: {
          content,
          wordCount,
          charCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get document content",
      };
    }
  },
};

/**
 * Get selected text
 */
export const getSelectedTextTool: ToolDefinition = {
  name: "get_selected_text",
  description: "Get the currently selected text in the document",
  parameters: z.object({}),
  execute: async (_params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const { from, to } = context.editor.state.selection;
      const selectedText = context.editor.state.doc.textBetween(from, to);

      return {
        success: true,
        message: selectedText ? `Retrieved selected text (${selectedText.length} characters)` : "No text selected",
        data: {
          text: selectedText,
          from,
          to,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get selected text",
      };
    }
  },
};

/**
 * Search for text in document
 */
export const searchDocumentTool: ToolDefinition = {
  name: "search_document",
  description: "Search for specific text in the document and get its positions",
  parameters: z.object({
    query: z.string().describe("Text to search for"),
    caseSensitive: z.boolean().default(false).describe("Whether search should be case-sensitive"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const content = context.editor.getText();
      const searchText = params.caseSensitive ? params.query : params.query.toLowerCase();
      const searchContent = params.caseSensitive ? content : content.toLowerCase();

      const matches: Array<{ position: number; text: string }> = [];
      let position = 0;

      while ((position = searchContent.indexOf(searchText, position)) !== -1) {
        matches.push({
          position,
          text: content.substring(position, position + params.query.length),
        });
        position += searchText.length;
      }

      return {
        success: true,
        message: `Found ${matches.length} matches for "${params.query}"`,
        data: {
          query: params.query,
          matches,
          count: matches.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search document",
      };
    }
  },
};
