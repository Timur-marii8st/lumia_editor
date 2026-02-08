# 📝 Lumia Editor

> A modern, AI-powered note-taking and visualization app built with Tauri, React, and TypeScript.

## ✨ Features

### 🎨 Block-Based Editor
- **9 Block Types**: Paragraph, headings, lists, quotes, code, todo, callout, toggle, divider
- **Drag & Drop**: Smooth reordering with keyboard support
- **Slash Commands**: 17 commands for quick block creation
- **AI Integration**: Generate, improve, and continue writing with Ollama
- **Multi-select**: Select multiple blocks with Shift/Ctrl
- **Undo/Redo**: Full history with 50 states
- **Search**: Find any block with Cmd+F
- **Auto-save**: Configurable auto-save with status
- **Export/Import**: JSON, Markdown, HTML formats
- **Statistics**: Real-time word count and reading time
- **Dark Mode**: Beautiful dark theme support

### 🤖 AI-Powered Writing
- **Generate Content**: Create blocks from prompts
- **Improve Text**: Enhance quality while keeping meaning
- **Continue Writing**: Generate continuations automatically
- **Local AI**: Privacy-focused with Ollama integration

### 🎭 Visual Space
Create visualizations in various forms:
1. **Simple Tables** - Organize data
2. **2D Graphs** - Visualize connections
3. **Life Balance Circle** - Track life areas
4. **Board** - Sketch and paint

### 💬 AI Chat
- Chat with Mia, your AI assistant
- Powered by Ollama (local AI)
- Multiple model support
- Conversation history

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Rust and Tauri CLI
- Ollama (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lumia-editor.git
cd lumia-editor

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build
```

### Setting Up Ollama

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama2`
3. Start Ollama (it runs automatically on install)
4. Launch Lumia and click the Ollama button to verify

## 📚 Documentation

- [Block Editor Guide](BLOCK_EDITOR_GUIDE.md) - Complete user guide
- [Block Editor Complete](BLOCK_EDITOR_COMPLETE.md) - Feature documentation
- [Phase 2 Summary](PHASE_2_SUMMARY.md) - Implementation details
- [Ollama Integration](OLLAMA_INTEGRATION.md) - AI setup guide
- [Quick Start](QUICK_START.md) - Getting started

## 🏗️ Project Structure

```
lumia-editor/
├── app/                      # Main Tauri application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── lib/ai/          # AI integration
│   │   ├── store/           # State management
│   │   └── routes/          # App routes
│   └── src-tauri/           # Rust backend
├── packages/
│   ├── ai-tools/            # AI tool definitions
│   ├── block-editor/        # Block editor package
│   ├── editor/              # Rich text editor
│   ├── functions/           # Shared functions
│   └── ui/                  # UI components
└── docs/                    # Documentation
```

## 🎯 Key Features

### Block Editor
- **Notion-like UX**: Familiar and intuitive
- **Keyboard-first**: Efficient shortcuts
- **AI-powered**: Smart content generation
- **Extensible**: Easy to add new block types

### AI Integration
- **Local Processing**: Privacy-focused
- **Multiple Models**: Choose your preferred model
- **Fast Inference**: Optimized for speed
- **Tool Calling**: Structured AI interactions

### Visual Tools
- **Interactive**: Real-time editing
- **Exportable**: Save and share
- **Customizable**: Adapt to your needs

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **@dnd-kit** - Drag & drop

### Backend
- **Tauri** - Desktop framework
- **Rust** - System integration
- **Ollama** - Local AI

### Build Tools
- **Vite** - Fast build tool
- **tsup** - TypeScript bundler
- **pnpm** - Package manager
- **Turbo** - Monorepo management

## 📦 Packages

### @lumia/block-editor
Notion-like block editor with AI integration.

### @lumia/ai-tools
AI tool definitions for document manipulation.

### @lumia/editor
Rich text editor with Tiptap.

### @lumia/ui
Shared UI components library.

### @lumia/functions
Shared utility functions.

## 🎨 Screenshots

*Coming soon!*

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Based on [typethings](https://github.com/pheralb/typethings)
- Powered by [Ollama](https://ollama.ai)
- Built with [Tauri](https://tauri.app)


**Made with ❤️**
