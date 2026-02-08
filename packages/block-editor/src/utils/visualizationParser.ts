import type { Block } from "../types";
import { nanoid } from "nanoid";

/**
 * Parse natural language to create visualizations
 */
export const parseVisualizationCommand = async (
  text: string,
  ollamaUrl: string,
  model: string
): Promise<Block | null> => {
  // Check if text contains visualization keywords
  const keywords = {
    table: ["table", "таблица", "spreadsheet", "grid"],
    graph: ["graph", "граф", "network", "nodes", "connections", "связи"],
    lifeBalance: ["life balance", "баланс жизни", "wheel", "колесо"],
  };

  let visualizationType: "table" | "graph" | "lifeBalance" | null = null;

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some((word) => text.toLowerCase().includes(word))) {
      visualizationType = type as any;
      break;
    }
  }

  if (!visualizationType) return null;

  // Use AI to generate visualization config
  const prompt = `Based on this text, generate a JSON configuration for a ${visualizationType}:

Text: "${text}"

Generate ONLY valid JSON, no explanations. Format:
${getFormatExample(visualizationType)}`;

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error("AI request failed");

    const data = await response.json();
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error("No JSON found in response");

    const config = JSON.parse(jsonMatch[0]);

    // Create visualization block
    return {
      id: nanoid(),
      type: visualizationType as any,
      content: JSON.stringify(config),
      properties: {
        visualizationType,
        generatedByAI: true,
      },
    };
  } catch (error) {
    console.error("Failed to parse visualization:", error);
    return null;
  }
};

function getFormatExample(type: string): string {
  switch (type) {
    case "table":
      return `{
  "headers": ["Column 1", "Column 2"],
  "rows": [
    ["Value 1", "Value 2"],
    ["Value 3", "Value 4"]
  ]
}`;

    case "graph":
      return `{
  "nodes": [
    {"id": "1", "label": "Node 1", "x": 100, "y": 100},
    {"id": "2", "label": "Node 2", "x": 300, "y": 100}
  ],
  "edges": [
    {"from": "1", "to": "2", "label": "connects"}
  ]
}`;

    case "lifeBalance":
      return `{
  "categories": [
    {"name": "Health", "value": 8},
    {"name": "Career", "value": 7},
    {"name": "Relationships", "value": 6},
    {"name": "Finance", "value": 5},
    {"name": "Personal Growth", "value": 7},
    {"name": "Fun", "value": 6}
  ]
}`;

    default:
      return "{}";
  }
}

/**
 * Detect if text describes a visualization
 */
export const detectVisualization = (text: string): boolean => {
  const patterns = [
    /create\s+(a\s+)?(table|graph|chart|diagram)/i,
    /make\s+(a\s+)?(table|graph|chart|diagram)/i,
    /show\s+(a\s+)?(table|graph|chart|diagram)/i,
    /visualize/i,
    /таблиц/i,
    /граф/i,
    /диаграмм/i,
    /визуализ/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
};
