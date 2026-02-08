import type { Block } from "../types";

/**
 * Convert blocks to Markdown
 */
export const blocksToMarkdown = (blocks: Block[]): string => {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return block.content || "";

        case "heading1":
          return `# ${block.content || ""}`;

        case "heading2":
          return `## ${block.content || ""}`;

        case "heading3":
          return `### ${block.content || ""}`;

        case "bulletList":
          return `- ${block.content || ""}`;

        case "numberedList":
          return `1. ${block.content || ""}`;

        case "todo":
          const checked = block.properties.checked ? "x" : " ";
          return `- [${checked}] ${block.content || ""}`;

        case "quote":
          return `> ${block.content || ""}`;

        case "code":
          const lang = block.properties.language || "";
          return `\`\`\`${lang}\n${block.content || ""}\n\`\`\``;

        case "callout":
          const icon = block.properties.icon || "info";
          return `> **${icon.toUpperCase()}**: ${block.content || ""}`;

        case "toggle":
          const childContent = block.children?.[0]?.content || "";
          return `<details>\n<summary>${block.content || ""}</summary>\n\n${childContent}\n</details>`;

        case "divider":
          return "---";

        default:
          return block.content || "";
      }
    })
    .join("\n\n");
};

/**
 * Convert Markdown to blocks
 */
export const markdownToBlocks = (markdown: string): Block[] => {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let currentCodeBlock: { lang: string; content: string[] } | null = null;
  let currentToggle: { title: string; content: string[] } | null = null;
  let inToggle = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith("```")) {
      if (currentCodeBlock) {
        // End code block
        blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          type: "code",
          content: currentCodeBlock.content.join("\n"),
          properties: { language: currentCodeBlock.lang },
        });
        currentCodeBlock = null;
      } else {
        // Start code block
        const lang = line.slice(3).trim();
        currentCodeBlock = { lang, content: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.content.push(line);
      continue;
    }

    // Handle toggle blocks
    if (line.startsWith("<details>")) {
      inToggle = true;
      continue;
    }

    if (line.startsWith("<summary>")) {
      const title = line.replace("<summary>", "").replace("</summary>", "").trim();
      currentToggle = { title, content: [] };
      continue;
    }

    if (line.startsWith("</details>")) {
      if (currentToggle) {
        blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          type: "toggle",
          content: currentToggle.title,
          properties: {},
          children: [
            {
              id: `block-${Date.now()}-${Math.random()}-child`,
              type: "paragraph",
              content: currentToggle.content.join("\n"),
              properties: {},
            },
          ],
        });
        currentToggle = null;
      }
      inToggle = false;
      continue;
    }

    if (inToggle && currentToggle && line.trim()) {
      currentToggle.content.push(line);
      continue;
    }

    // Skip empty lines
    if (!line.trim()) continue;

    // Heading 1
    if (line.startsWith("# ")) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "heading1",
        content: line.slice(2),
        properties: {},
      });
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "heading2",
        content: line.slice(3),
        properties: {},
      });
      continue;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "heading3",
        content: line.slice(4),
        properties: {},
      });
      continue;
    }

    // Todo
    if (line.match(/^- \[(x| )\] /)) {
      const checked = line.includes("[x]");
      const content = line.replace(/^- \[(x| )\] /, "");
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "todo",
        content,
        properties: { checked },
      });
      continue;
    }

    // Bullet list
    if (line.startsWith("- ")) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "bulletList",
        content: line.slice(2),
        properties: {},
      });
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "numberedList",
        content: line.replace(/^\d+\. /, ""),
        properties: {},
      });
      continue;
    }

    // Quote or Callout
    if (line.startsWith("> ")) {
      const content = line.slice(2);
      // Check if it's a callout
      const calloutMatch = content.match(/^\*\*(\w+)\*\*: (.+)$/);
      if (calloutMatch) {
        const icon = calloutMatch[1].toLowerCase();
        blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          type: "callout",
          content: calloutMatch[2],
          properties: { icon },
        });
      } else {
        blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          type: "quote",
          content,
          properties: {},
        });
      }
      continue;
    }

    // Divider
    if (line === "---" || line === "***" || line === "___") {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: "divider",
        content: "",
        properties: {},
      });
      continue;
    }

    // Default to paragraph
    blocks.push({
      id: `block-${Date.now()}-${Math.random()}`,
      type: "paragraph",
      content: line,
      properties: {},
    });
  }

  return blocks;
};

/**
 * Convert blocks to HTML
 */
export const blocksToHTML = (blocks: Block[]): string => {
  return blocks
    .map((block) => {
      const content = block.content || "";

      switch (block.type) {
        case "paragraph":
          return `<p>${escapeHTML(content)}</p>`;

        case "heading1":
          return `<h1>${escapeHTML(content)}</h1>`;

        case "heading2":
          return `<h2>${escapeHTML(content)}</h2>`;

        case "heading3":
          return `<h3>${escapeHTML(content)}</h3>`;

        case "bulletList":
          return `<ul><li>${escapeHTML(content)}</li></ul>`;

        case "numberedList":
          return `<ol><li>${escapeHTML(content)}</li></ol>`;

        case "todo":
          const checked = block.properties.checked ? "checked" : "";
          return `<div class="todo"><input type="checkbox" ${checked} disabled> ${escapeHTML(content)}</div>`;

        case "quote":
          return `<blockquote>${escapeHTML(content)}</blockquote>`;

        case "code":
          const lang = block.properties.language || "";
          return `<pre><code class="language-${lang}">${escapeHTML(content)}</code></pre>`;

        case "callout":
          const icon = block.properties.icon || "info";
          return `<div class="callout callout-${icon}">${escapeHTML(content)}</div>`;

        case "toggle":
          const childContent = block.children?.[0]?.content || "";
          return `<details><summary>${escapeHTML(content)}</summary><p>${escapeHTML(childContent)}</p></details>`;

        case "divider":
          return "<hr>";

        default:
          return `<p>${escapeHTML(content)}</p>`;
      }
    })
    .join("\n");
};

/**
 * Escape HTML special characters
 */
const escapeHTML = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Copy blocks to clipboard as Markdown
 */
export const copyBlocksToClipboard = async (blocks: Block[]): Promise<void> => {
  const markdown = blocksToMarkdown(blocks);
  await navigator.clipboard.writeText(markdown);
};

/**
 * Paste blocks from clipboard
 */
export const pasteBlocksFromClipboard = async (): Promise<Block[]> => {
  const text = await navigator.clipboard.readText();
  return markdownToBlocks(text);
};
