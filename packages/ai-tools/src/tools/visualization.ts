import { z } from "zod";
import type { ToolDefinition } from "../types";

/**
 * Create a 2D graph visualization from description
 */
export const createGraphTool: ToolDefinition = {
  name: "create_graph",
  description: "Create a 2D graph visualization with nodes and edges. Use this to visualize relationships, mind maps, or network diagrams",
  parameters: z.object({
    nodes: z.array(
      z.object({
        id: z.string().describe("Unique node identifier"),
        label: z.string().describe("Node label/text"),
        x: z.number().optional().describe("X position (auto-layout if not provided)"),
        y: z.number().optional().describe("Y position (auto-layout if not provided)"),
        shape: z.enum(["square", "circle"]).default("square").describe("Node shape"),
        color: z.string().default("#FFFFFF").describe("Node fill color (hex)"),
      })
    ).describe("List of nodes in the graph"),
    edges: z.array(
      z.object({
        from: z.string().describe("Source node ID"),
        to: z.string().describe("Target node ID"),
      })
    ).describe("List of edges connecting nodes"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      // Auto-layout nodes if positions not provided
      const layoutNodes = params.nodes.map((node: any, index: number) => {
        if (node.x === undefined || node.y === undefined) {
          // Simple circular layout
          const angle = (index / params.nodes.length) * 2 * Math.PI;
          const radius = 200;
          return {
            ...node,
            x: 400 + radius * Math.cos(angle),
            y: 300 + radius * Math.sin(angle),
          };
        }
        return node;
      });

      // Create graph data structure
      const graphData = {
        nodes: layoutNodes.map((node: any) => ({
          id: node.id,
          x: node.x!,
          y: node.y!,
          shape: node.shape,
          color: node.color,
          borderWidth: 2,
          borderColor: "#F9E1E6",
          text: node.label,
          fontSize: 16,
        })),
        edges: params.edges,
      };

      // Insert as JSON that can be loaded by the graph component
      const jsonString = JSON.stringify(graphData, null, 2);
      
      context.editor
        .chain()
        .focus()
        .insertContent(`\n\n**[2D Graph Visualization]**\n\`\`\`json\n${jsonString}\n\`\`\`\n\n`)
        .run();

      return {
        success: true,
        message: `Created graph with ${params.nodes.length} nodes and ${params.edges.length} edges`,
        data: graphData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create graph",
      };
    }
  },
};

/**
 * Create a table visualization from data
 */
export const createTableVisualizationTool: ToolDefinition = {
  name: "create_table_visualization",
  description: "Create a structured table from data. Use this for organizing information in rows and columns",
  parameters: z.object({
    headers: z.array(z.string()).describe("Column headers"),
    rows: z.array(z.array(z.string())).describe("Table rows (each row is an array of cell values)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      // Validate data
      if (params.headers.length === 0) {
        return { success: false, error: "Headers cannot be empty" };
      }

      const cols = params.headers.length;
      const rows = params.rows.length + 1; // +1 for header

      // Insert table
      (context.editor.chain().focus() as any)
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();

      // Fill headers
      params.headers.forEach((header: string, colIndex: number) => {
        (context.editor?.chain().focus() as any)
          .setCellSelection({ anchorCell: colIndex, headCell: colIndex })
          .insertContent(header)
          .run();
      });

      // Fill data rows
      params.rows.forEach((row: string[], rowIndex: number) => {
        row.forEach((cell: string, colIndex: number) => {
          const cellPosition = (rowIndex + 1) * cols + colIndex;
          (context.editor?.chain().focus() as any)
            .setCellSelection({ anchorCell: cellPosition, headCell: cellPosition })
            .insertContent(cell)
            .run();
        });
      });

      return {
        success: true,
        message: `Created table with ${params.headers.length} columns and ${params.rows.length} rows`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create table",
      };
    }
  },
};

/**
 * Create a Life Balance Circle visualization
 */
export const createLifeBalanceTool: ToolDefinition = {
  name: "create_life_balance",
  description: "Create a Life Balance Circle to visualize different life areas and their satisfaction levels (0-10)",
  parameters: z.object({
    areas: z.array(
      z.object({
        name: z.string().describe("Life area name (e.g., Health, Career, Relationships)"),
        value: z.number().min(0).max(10).describe("Satisfaction level (0-10)"),
      })
    ).min(3).max(12).describe("Life areas to visualize (3-12 areas)"),
  }),
  execute: async (params, context) => {
    if (!context.editor) {
      return { success: false, error: "Editor not available" };
    }

    try {
      const lifeBalanceData = {
        areas: params.areas,
        createdAt: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(lifeBalanceData, null, 2);
      
      context.editor
        .chain()
        .focus()
        .insertContent(`\n\n**[Life Balance Circle]**\n\`\`\`json\n${jsonString}\n\`\`\`\n\n`)
        .run();

      return {
        success: true,
        message: `Created Life Balance Circle with ${params.areas.length} areas`,
        data: lifeBalanceData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create life balance visualization",
      };
    }
  },
};
