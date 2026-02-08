import { z } from "zod";
import type { ToolDefinition } from "../types";

/**
 * Insert text at current cursor position
 */
export const insertTextTool: ToolDefinition = {
  name: "insert_text",
  description: "Insert text at the current cursor position in the document",
  parameters: z.object({
    text: z.string().describe("The text to insert"),
    position: z.number().optional().describe("Optional position to insert at (default: current cursor)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      if (params.position !== undefined) {
        context.editor.chain().focus().insertContentAt(params.position, params.text).run();
      } else {
        context.editor.chain().focus().insertContent(params.text).run();
      }

      return {
        success: true,
        message: `Inserted text: "${params.text.substring(0, 50)}${params.text.length > 50 ? '...' : ''}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert text",
      };
    }
  },
};

/**
 * Replace selected text or text at range
 */
export const replaceTextTool: ToolDefinition = {
  name: "replace_text",
  description: "Replace text in the document. Can replace selected text or text at specific range",
  parameters: z.object({
    newText: z.string().describe("The new text to insert"),
    from: z.number().optional().describe("Start position (if not provided, uses selection)"),
    to: z.number().optional().describe("End position (if not provided, uses selection)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const { from, to } = context.editor.state.selection;
      const startPos = params.from ?? from;
      const endPos = params.to ?? to;

      context.editor
        .chain()
        .focus()
        .deleteRange({ from: startPos, to: endPos })
        .insertContentAt(startPos, params.newText)
        .run();

      return {
        success: true,
        message: `Replaced text with: "${params.newText.substring(0, 50)}${params.newText.length > 50 ? '...' : ''}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to replace text",
      };
    }
  },
};

/**
 * Delete text at range
 */
export const deleteTextTool: ToolDefinition = {
  name: "delete_text",
  description: "Delete text from the document at specified range or current selection",
  parameters: z.object({
    from: z.number().optional().describe("Start position (if not provided, uses selection)"),
    to: z.number().optional().describe("End position (if not provided, uses selection)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const { from, to } = context.editor.state.selection;
      const startPos = params.from ?? from;
      const endPos = params.to ?? to;

      context.editor.chain().focus().deleteRange({ from: startPos, to: endPos }).run();

      return {
        success: true,
        message: `Deleted text from position ${startPos} to ${endPos}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete text",
      };
    }
  },
};

/**
 * Apply formatting to text
 */
export const formatTextTool: ToolDefinition = {
  name: "format_text",
  description: "Apply formatting (bold, italic, underline, etc.) to selected text or text at range",
  parameters: z.object({
    format: z.enum(["bold", "italic", "strike", "code", "heading1", "heading2", "heading3"]).describe("Format to apply"),
    from: z.number().optional().describe("Start position (if not provided, uses selection)"),
    to: z.number().optional().describe("End position (if not provided, uses selection)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const { from, to } = context.editor.state.selection;
      const startPos = params.from ?? from;
      const endPos = params.to ?? to;

      // Select range first
      context.editor.chain().focus().setTextSelection({ from: startPos, to: endPos });

      // Apply formatting
      switch (params.format) {
        case "bold":
          (context.editor.chain().focus() as any).toggleBold().run();
          break;
        case "italic":
          (context.editor.chain().focus() as any).toggleItalic().run();
          break;
        case "strike":
          (context.editor.chain().focus() as any).toggleStrike().run();
          break;
        case "code":
          (context.editor.chain().focus() as any).toggleCode().run();
          break;
        case "heading1":
          (context.editor.chain().focus() as any).toggleHeading({ level: 1 }).run();
          break;
        case "heading2":
          (context.editor.chain().focus() as any).toggleHeading({ level: 2 }).run();
          break;
        case "heading3":
          (context.editor.chain().focus() as any).toggleHeading({ level: 3 }).run();
          break;
      }

      return {
        success: true,
        message: `Applied ${params.format} formatting`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to format text",
      };
    }
  },
};
