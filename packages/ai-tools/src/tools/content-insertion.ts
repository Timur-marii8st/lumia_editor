import { z } from "zod";
import type { ToolDefinition } from "../types";

/**
 * Insert a table into the document
 */
export const insertTableTool: ToolDefinition = {
  name: "insert_table",
  description: "Insert a table with specified rows and columns into the document",
  parameters: z.object({
    rows: z.number().min(1).max(20).describe("Number of rows (1-20)"),
    cols: z.number().min(1).max(10).describe("Number of columns (1-10)"),
    withHeader: z.boolean().default(true).describe("Whether to include a header row"),
    position: z.number().optional().describe("Position to insert at (default: current cursor)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const chain = context.editor.chain().focus();

      if (params.position !== undefined) {
        chain.insertContentAt(params.position, "");
      }

      (chain as any).insertTable({
        rows: params.rows,
        cols: params.cols,
        withHeaderRow: params.withHeader,
      }).run();

      return {
        success: true,
        message: `Inserted ${params.rows}x${params.cols} table${params.withHeader ? ' with header' : ''}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert table",
      };
    }
  },
};

/**
 * Insert a list (bullet or numbered)
 */
export const insertListTool: ToolDefinition = {
  name: "insert_list",
  description: "Insert a bullet list or numbered list into the document",
  parameters: z.object({
    type: z.enum(["bullet", "numbered"]).describe("Type of list"),
    items: z.array(z.string()).describe("List items"),
    position: z.number().optional().describe("Position to insert at (default: current cursor)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const chain = context.editor.chain().focus();

      if (params.position !== undefined) {
        chain.insertContentAt(params.position, "");
      }

      // Toggle list type
      if (params.type === "bullet") {
        (chain as any).toggleBulletList();
      } else {
        (chain as any).toggleOrderedList();
      }

      // Insert items
      params.items.forEach((item: string, index: number) => {
        if (index > 0) {
          (chain as any).splitListItem("listItem");
        }
        chain.insertContent(item);
      });

      chain.run();

      return {
        success: true,
        message: `Inserted ${params.type} list with ${params.items.length} items`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert list",
      };
    }
  },
};

/**
 * Insert a heading
 */
export const insertHeadingTool: ToolDefinition = {
  name: "insert_heading",
  description: "Insert a heading (H1-H6) into the document",
  parameters: z.object({
    level: z.number().min(1).max(6).describe("Heading level (1-6)"),
    text: z.string().describe("Heading text"),
    position: z.number().optional().describe("Position to insert at (default: current cursor)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const chain = context.editor.chain().focus();

      if (params.position !== undefined) {
        chain.insertContentAt(params.position, "");
      }

      (chain as any)
        .toggleHeading({ level: params.level as 1 | 2 | 3 | 4 | 5 | 6 })
        .insertContent(params.text)
        .run();

      return {
        success: true,
        message: `Inserted H${params.level}: "${params.text}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert heading",
      };
    }
  },
};

/**
 * Insert a horizontal rule
 */
export const insertDividerTool: ToolDefinition = {
  name: "insert_divider",
  description: "Insert a horizontal divider line into the document",
  parameters: z.object({
    position: z.number().optional().describe("Position to insert at (default: current cursor)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const chain = context.editor.chain().focus();

      if (params.position !== undefined) {
        chain.insertContentAt(params.position, "");
      }

      (chain as any).setHorizontalRule().run();

      return {
        success: true,
        message: "Inserted horizontal divider",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to insert divider",
      };
    }
  },
};
