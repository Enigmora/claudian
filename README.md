<p align="center">
  <img src="logo-2.svg" alt="Claudian by Enigmora SC" width="400">
</p>

<p align="center">
  <strong>The ultimate Claude AI integration for Obsidian</strong><br>
  <em>Powered by Claude</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white" alt="Obsidian Plugin">
  <img src="https://img.shields.io/badge/Claude-AI-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

<p align="center">
  <a href="README_ES.md">Documentación en Español</a>
</p>

---

## About

Claudian is an Obsidian plugin that brings the power of Claude AI directly into your knowledge management workflow. Chat with Claude in a dedicated side panel, process your notes to get smart suggestions for tags and wikilinks, and use Agent Mode to manage your vault with natural language commands—all while keeping your API key stored locally for maximum privacy.

---

## Features

| Feature | Description |
|---------|-------------|
| **Integrated chat** | Side panel for conversing with Claude without leaving Obsidian |
| **Real-time streaming** | Responses are displayed as they are generated |
| **Stop & cancel** | Cancel any request in progress with the Stop button |
| **Note processing** | Analyzes active notes and suggests tags, wikilinks, and atomic concepts |
| **Note generation** | Converts chat responses into structured Markdown notes |
| **Agent Mode** | Manage your vault with natural language commands |
| **Visual progress** | Real-time indicators show agent actions as they execute |
| **Safe operations** | Confirmation prompts before overwriting existing files |
| **Vault context** | Indexes existing titles and tags for smart suggestions |
| **Native format** | Notes with YAML frontmatter, wikilinks, and tags |
| **Privacy** | Your API key is stored locally, never on external servers |
| **Open Source** | 100% auditable code |

---

## Installation

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create the folder `.obsidian/plugins/claudian/` in your vault
3. Copy the downloaded files to that folder
4. Restart Obsidian or reload (`Ctrl/Cmd + R`)
5. Go to **Settings > Community Plugins** and enable "Claudian"

---

## Configuration

1. Get your API key at [console.anthropic.com](https://console.anthropic.com/)
2. Open **Settings > Claudian**
3. Enter your API key
4. Select your preferred model (Claude Sonnet 4 by default)
5. Adjust context options according to your vault size

### Available Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| Language | Interface language (Auto/English/Spanish) | Auto |
| API Key | Your Anthropic API key | - |
| Model | Claude model to use | Claude Sonnet 4 |
| Notes folder | Destination for generated notes | `Claude Notes` |
| Max tokens | Token limit in responses | 4096 |
| Custom instructions | Additional instructions appended to system prompt | Empty |
| Notes in context | Titles to include when processing | 100 |
| Tags in context | Tags to include when processing | 50 |
| Max actions | Maximum vault actions per agent message | 25 |
| Auto-continue | Automatically continue truncated responses | Enabled |
| Auto-plan | Decompose complex tasks into steps | Enabled |
| Context reinforcement | Reinforce agent context in long conversations | Enabled |
| Show token indicator | Display token usage in chat footer | Enabled |

---

## Usage

### Chat with Claude

1. Open the panel with the command **"Open chat with Claude"** or from the ribbon
2. A welcome screen shows example prompts you can click to get started
3. Type your message and press `Enter`
4. Responses will appear in real-time with streaming

### Create notes from chat

1. Click **"Create note"** on any Claude response
2. Edit the suggested title and tags
3. The note will be saved with structured format

### Process active note

1. Open a note in your vault
2. Run the command **"Process active note with Claude"** (`Ctrl/Cmd + P`)
3. Claude will analyze the note considering your vault context
4. An interactive modal will appear with:
   - **Suggested tags** — Selectable chips to apply to frontmatter
   - **Suggested wikilinks** — Links to existing or new notes
   - **Atomic concepts** — Ideas that deserve their own note

### Batch processing

1. Run the command **"Batch process notes"** (`Ctrl/Cmd + P`)
2. Select notes to process (by folder or individually)
3. Choose an extraction template:
   - **Extract key ideas** — Summarizes main ideas
   - **Executive summary** — Generates concise summary
   - **Identify questions** — Detects open topics
   - **Extract actions** — Lists tasks and TODOs
   - **Concepts and definitions** — Creates glossary
   - **Connections** — Identifies relationships
4. Results are saved in a consolidated note

### Generate concept map

1. Run the command **"Generate concept map"** (`Ctrl/Cmd + P`)
2. Select notes to analyze
3. Enter a title for the map
4. Claude will analyze the notes and generate:
   - Main and secondary concepts
   - Relationships between concepts
   - Cross-cutting themes
   - Visual graph in Mermaid format

### Agent Mode (vault management)

1. Enable **agent mode** with the toggle in the chat header
2. Use natural language to manage your vault:
   - *"Create a Projects/2025 folder with subfolders for Docs and Code"*
   - *"Move all notes about Python to Programming/"*
   - *"Copy my meeting notes to Archive/2025/"*
   - *"Translate this note to English"*
   - *"Delete empty notes in Drafts/"*
   - *"Insert text at cursor"* or *"Go to line 10"*
   - *"Open today's daily note"* or *"Insert a template"*
   - *"Add a bookmark"* or *"Search by heading"*
3. Claude will interpret your request and execute the actions
4. Visual progress indicators show each action as it executes
5. Destructive actions and file overwrites require confirmation

**Available actions (52 total across 8 categories):**
- **File & Folder Management (16):** Create, move, rename, delete, copy notes and folders
- **Editor API (10):** Insert at cursor, replace selection, navigate lines, undo/redo
- **Commands API (3):** Execute any Obsidian command programmatically
- **Daily Notes (2):** Open or create daily notes
- **Templates (2):** Insert templates, list available templates
- **Bookmarks (3):** Add, remove, list bookmarks
- **Canvas API (7):** Create nodes, add edges, manage canvas elements
- **Enhanced Search (4):** Search by heading, block ID, get all tags

**File operations vs content transformation:**
- **File operations** (copy, move, backup): Preserve content exactly as-is
- **Content transformation** (translate, summarize): Only when explicitly requested

---

## Generated Note Format

```markdown
---
created: 2025-01-20
tags: [tag1, tag2]
source: claudian
status: draft
---

# Note Title

Response content...

## Related links

- [[Related note 1]]
- [[Related note 2]]
```

---

## Development

```bash
# Clone repository
git clone https://github.com/Enigmora/claudian.git
cd claudian

# Install dependencies
npm install

# Development build (with sourcemaps)
npm run dev

# Production build (minified)
npm run build

# Compile and deploy to vault
./deploy.sh . /path/to/vault/.obsidian/plugins/claudian/
```

### Project Structure

```
src/
├── main.ts                  # Entry point, commands, and views
├── settings.ts              # Plugin configuration
├── claude-client.ts         # Anthropic SDK client with streaming
├── chat-view.ts             # Chat side panel
├── note-creator.ts          # Modal for creating notes from chat
├── note-processor.ts        # Existing note processing
├── vault-indexer.ts         # Vault indexing
├── suggestions-modal.ts     # Interactive suggestions modal
├── extraction-templates.ts  # Predefined extraction templates
├── batch-processor.ts       # Batch note processing
├── batch-modal.ts           # Batch selection modal
├── concept-map-generator.ts # Concept map generator
├── vault-actions.ts         # Vault action executor
├── agent-mode.ts            # Agent mode management
├── confirmation-modal.ts    # Action confirmation modal
├── i18n/                    # Internationalization
│   ├── index.ts             # Public i18n API
│   ├── types.ts             # TypeScript types
│   ├── core.ts              # Runtime logic
│   └── locales/
│       ├── en.ts            # English translations
│       └── es.ts            # Spanish translations
└── templates/
    └── default.ts           # Note template
```

---

## Tech Stack

- **TypeScript** — Static typing
- **Obsidian API** — Native integration
- **Anthropic SDK** — Communication with Claude
- **esbuild** — Ultra-fast bundling

---

## Internationalization

Claudian supports multiple languages:

| Phase | Languages |
|-------|-----------|
| **Phase 1** (Current) | English (default), Spanish |
| **Phase 2** (Planned) | Chinese, German |
| **Phase 3** (Planned) | French, Japanese |

The plugin automatically detects Obsidian's language setting, or you can manually select a language in **Settings > Claudian > Language**.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <img src="logo.svg" alt="Claudian" width="80">
</p>

<p align="center">
  <strong>Claudian</strong><br>
  <em>The ultimate Claude AI integration for Obsidian</em>
</p>

<p align="center">
  Developed by <a href="https://github.com/Enigmora">Enigmora SC</a>
</p>

<p align="center">
  <sub>Powered by Claude</sub>
</p>
