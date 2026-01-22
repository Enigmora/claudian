# Obsidian API Research for AI Agent

This document analyzes the Obsidian APIs currently used by Claudian and identifies additional APIs that could enhance the AI agent's capabilities for controlling Obsidian through natural language instructions.

## Table of Contents

1. [APIs Currently Used](#apis-currently-used)
2. [APIs Not Used (Opportunities)](#apis-not-used-opportunities)
3. [Implementation Recommendations](#implementation-recommendations)
4. [Sources](#sources)

---

## APIs Currently Used

### 1. Plugin Management & Lifecycle

**Base Class:**
- `Plugin` - Base class extended by main.ts

**Lifecycle Methods:**
- `onload()` - Executes when plugin loads
- `onunload()` - Executes when plugin unloads

**Component Registration:**
- `registerView()` - Registers custom views (ChatView)
- `registerInterval()` - Registers periodic tasks
- `registerEvent()` - Registers event listeners with automatic cleanup
- `addRibbonIcon()` - Adds icon to sidebar
- `addSettingTab()` - Adds settings tab
- `addCommand()` - Registers custom commands

**Data Management:**
- `loadData()` - Loads persisted plugin data
- `saveData()` - Saves persisted plugin data

### 2. Vault API

**Location:** `app.vault`

**File Management:**
| Method | Description | Used In |
|--------|-------------|---------|
| `create(path, content)` | Creates a new file | vault-actions.ts, note-creator.ts |
| `read(file)` | Reads file content | vault-actions.ts |
| `modify(file, content)` | Modifies file content | vault-actions.ts |
| `delete(file)` | Deletes a file or folder | vault-actions.ts |
| `process(file, callback)` | Safely processes/modifies a file | note-processor.ts |
| `cachedRead(file)` | Reads files using cache | vault-indexer.ts |

**Folder Management:**
| Method | Description | Used In |
|--------|-------------|---------|
| `createFolder(path)` | Creates a new folder | vault-actions.ts |
| `getRoot()` | Gets vault root folder | batch-modal.ts |

**Queries:**
| Method | Description | Used In |
|--------|-------------|---------|
| `getAbstractFileByPath(path)` | Gets file/folder by path | vault-actions.ts |
| `getMarkdownFiles()` | Gets all markdown files | vault-indexer.ts, batch-modal.ts |

**Low-level Adapter:**
| Method | Description | Used In |
|--------|-------------|---------|
| `adapter.write(path, content)` | Low-level write | context-storage.ts |
| `adapter.read(path)` | Low-level read | context-storage.ts |
| `adapter.exists(path)` | Checks existence | context-storage.ts |
| `adapter.remove(path)` | Low-level delete | context-storage.ts |

**Events:**
| Event | Description | Used In |
|-------|-------------|---------|
| `on('create', callback)` | File created | vault-indexer.ts |
| `on('delete', callback)` | File deleted | vault-indexer.ts |
| `on('rename', callback)` | File renamed | vault-indexer.ts |

### 3. Workspace API

**Location:** `app.workspace`

| Method | Description | Used In |
|--------|-------------|---------|
| `getActiveFile()` | Gets currently active file | note-processor.ts |
| `getLeavesOfType(type)` | Gets all leaves of a type | settings.ts, main.ts |
| `getRightLeaf(create)` | Gets/creates right panel leaf | main.ts |
| `revealLeaf(leaf)` | Reveals a specific leaf | main.ts |
| `detachLeavesOfType(type)` | Detaches all leaves of a type | main.ts |
| `getLeaf(createNew)` | Gets or creates a leaf | note-creator.ts |

### 4. FileManager API

**Location:** `app.fileManager`

| Method | Description | Used In |
|--------|-------------|---------|
| `processFrontMatter(file, cb)` | Safely modifies YAML frontmatter | vault-actions.ts, note-processor.ts |
| `renameFile(file, newPath)` | Renames a file (updates links) | vault-actions.ts |

### 5. MetadataCache API

**Location:** `app.metadataCache`

| Method | Description | Used In |
|--------|-------------|---------|
| `getFileCache(file)` | Gets cached metadata | vault-actions.ts, vault-indexer.ts |

**Cached Data Available:**
- `frontmatter` - YAML frontmatter
- `tags` - Tags in content
- `links` - Internal links
- `headings` - Headings
- `embeds` - Embedded content
- `blocks` - Block references

**Events:**
| Event | Description | Used In |
|-------|-------------|---------|
| `on('changed', callback)` | Metadata changed | vault-indexer.ts |

### 6. UI Components

**Base Classes Extended:**
| Class | Purpose | Used In |
|-------|---------|---------|
| `Modal` | Dialog modals | note-creator.ts, batch-modal.ts, confirmation-modal.ts, suggestions-modal.ts, token-history-modal.ts |
| `PluginSettingTab` | Settings tab | settings.ts |
| `ItemView` | Custom views | chat-view.ts |

**Setting Component:**
- `setName()`, `setDesc()` - Configure name and description
- `addText()`, `addTextArea()`, `addSlider()`, `addToggle()`, `addDropdown()` - Add inputs
- `addButton()` - Add button
- `onChange()` - Change callback

**UI Utilities:**
| Function | Description | Used In |
|----------|-------------|---------|
| `MarkdownRenderer.render()` | Renders markdown to HTML | chat-view.ts |
| `setIcon(element, iconName)` | Sets an icon | confirmation-modal.ts |
| `addIcon(name, svg)` | Registers custom icon | main.ts |
| `Notice(message)` | Shows notifications | Multiple files |

### 7. File Types

| Type | Description |
|------|-------------|
| `TFile` | Represents a file (path, basename, extension, stat) |
| `TFolder` | Represents a folder (path, children) |
| `TAbstractFile` | Base class for files and folders |
| `WorkspaceLeaf` | Represents a pane in workspace |

---

## APIs Not Used (Opportunities)

### 1. Editor API - Real-time Text Manipulation

The Editor API provides direct manipulation of the active document's content.

```typescript
// Content access
editor.getValue(): string                    // Get full content
editor.setValue(content: string): void       // Set full content
editor.getLine(n: number): string            // Get specific line
editor.setLine(n: number, text: string): void // Set specific line
editor.lineCount(): number                   // Total line count
editor.lastLine(): number                    // Last line number

// Cursor and selection
editor.getCursor(anchor?: string): EditorPosition
editor.setCursor(pos: EditorPosition): void
editor.getSelection(): string                // Get selected text
editor.setSelection(anchor: EditorPosition, head?: EditorPosition): void
editor.listSelections(): EditorSelection[]  // Multiple selections

// Editing
editor.replaceSelection(text: string): void  // Replace selection
editor.replaceRange(text: string, from: EditorPosition, to?: EditorPosition): void
editor.wordAt(pos: EditorPosition): EditorRange | null

// Navigation
editor.scrollIntoView(range: EditorRange, center?: boolean): void
editor.posToOffset(pos: EditorPosition): number
editor.offsetToPos(offset: number): EditorPosition

// History
editor.undo(): void
editor.redo(): void
```

**Use Cases for Agent:**
- "Insert this text at my cursor"
- "Replace the selected text with..."
- "Go to line 50"
- "Select the word under cursor"
- "Undo my last change"

**Access Pattern:**
```typescript
// Via command callback
this.addCommand({
  id: 'my-command',
  name: 'My Command',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    // editor is available here
  }
});

// Via active view
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
if (view) {
  const editor = view.editor;
  // Use editor
}
```

### 2. Commands API - Execute Existing Commands

```typescript
// List all available commands
app.commands.listCommands(): Command[]

// Find a specific command
app.commands.findCommand(commandId: string): Command | null

// Execute a command by ID
app.commands.executeCommandById(commandId: string): boolean
```

**Use Cases for Agent:**
- "Open the command palette"
- "Execute the 'Toggle bold' command"
- "What commands are available?"
- "Run the daily notes command"

**Common Command IDs:**
- `app:go-back` - Navigate back
- `app:go-forward` - Navigate forward
- `app:open-settings` - Open settings
- `editor:toggle-bold` - Toggle bold
- `editor:toggle-italics` - Toggle italics
- `editor:toggle-code` - Toggle code
- `file-explorer:reveal-active-file` - Reveal in explorer

### 3. Hotkeys/Keymap API

```typescript
// Access keymap
app.keymap: Keymap

// Hotkey manager (internal but accessible)
app.hotkeyManager.getHotkeys(commandId: string): Hotkey[]
app.hotkeyManager.setHotkeys(commandId: string, hotkeys: Hotkey[]): void
app.hotkeyManager.getDefaultHotkeys(commandId: string): Hotkey[]
```

**Use Cases for Agent:**
- "What's the shortcut for X?"
- "Set Ctrl+K as shortcut for Y"
- "Show me all hotkeys"

### 4. Search API (Limited)

Obsidian does not expose a full search API, but there are workarounds:

```typescript
// Open global search UI with query (via internal plugin)
const searchPlugin = app.internalPlugins.plugins['global-search'];
if (searchPlugin?.enabled) {
  searchPlugin.instance.openGlobalSearch(query);
}

// Search via MetadataCache (structured data only)
const cache = app.metadataCache.getFileCache(file);
// Access: cache.links, cache.tags, cache.headings, cache.embeds, cache.blocks

// Get all tags in vault
import { getAllTags } from 'obsidian';
const allTags = getAllTags(app.metadataCache);

// Resolve link paths
import { getLinkpath } from 'obsidian';
const path = getLinkpath(linkText);
```

**Limitation:** No official API for full-text content search. Must read files manually.

**Use Cases for Agent:**
- "Find all notes with tag #project"
- "Search for notes linking to X"
- "Find notes with heading Y"

### 5. Internal Plugins API

Access to built-in Obsidian plugins:

```typescript
// Daily Notes
const dailyNotes = app.internalPlugins.plugins['daily-notes'];
if (dailyNotes?.enabled) {
  dailyNotes.instance.openDailyNote();  // Open today's note
  // Access settings: dailyNotes.instance.options
}

// Templates
const templates = app.internalPlugins.plugins['templates'];
if (templates?.enabled) {
  templates.instance.insertTemplate();  // Insert template
}

// Bookmarks/Starred
const bookmarks = app.internalPlugins.plugins['bookmarks'];
const starred = app.internalPlugins.plugins['starred'];

// Graph View
const graph = app.internalPlugins.plugins['graph'];

// Outline
const outline = app.internalPlugins.plugins['outline'];

// File Recovery
const fileRecovery = app.internalPlugins.plugins['file-recovery'];

// Word Count
const wordCount = app.internalPlugins.plugins['word-count'];
```

**Use Cases for Agent:**
- "Create today's daily note"
- "Apply my meeting template"
- "Add this note to bookmarks"
- "Open the graph view"

### 6. Canvas API

Obsidian Canvas has a separate API (`canvas.d.ts`):

```typescript
// Access canvas (when canvas file is open)
const canvasView = app.workspace.getActiveViewOfType(CanvasView);
const canvas = canvasView?.canvas;

// Create nodes
canvas.createTextNode(options);
canvas.createFileNode(options);
canvas.createLinkNode(options);
canvas.createGroupNode(options);

// Create edges
canvas.addEdge(edge);

// Manipulate canvas
canvas.selectAll();
canvas.deselectAll();
canvas.zoomToFit();
```

**Use Cases for Agent:**
- "Create a canvas with these notes"
- "Add a text card to the canvas"
- "Connect these two nodes"

### 7. Additional Workspace Events

Events not currently subscribed to:

```typescript
// Editor events
workspace.on('editor-change', (editor, info) => {});    // Content changed
workspace.on('editor-paste', (evt, editor, info) => {}); // Paste event
workspace.on('editor-menu', (menu, editor, info) => {}); // Context menu
workspace.on('editor-drop', (evt, editor, info) => {});  // Drop event

// Navigation events
workspace.on('file-open', (file) => {});                 // File opened
workspace.on('active-leaf-change', (leaf) => {});        // Active pane changed
workspace.on('layout-change', () => {});                 // Layout changed

// Window events
workspace.on('window-open', (win, window) => {});
workspace.on('window-close', (win, window) => {});
workspace.on('css-change', () => {});                    // Theme changed
workspace.on('quit', (tasks) => {});                     // App quitting
```

**Use Cases for Agent:**
- React to user opening files
- Track navigation history
- Respond to layout changes

### 8. View API Extensions

```typescript
// Get active view of specific type
app.workspace.getActiveViewOfType(MarkdownView): MarkdownView | null
app.workspace.getActiveViewOfType(CanvasView): CanvasView | null

// Iterate all markdown views
app.workspace.iterateAllLeaves((leaf) => {
  if (leaf.view instanceof MarkdownView) {
    // Access view.editor, view.file, etc.
  }
});

// Open file in specific mode
leaf.openFile(file, { state: { mode: 'source' } });  // Source mode
leaf.openFile(file, { state: { mode: 'preview' } }); // Preview mode
```

### 9. Suggest API

For creating autocomplete/suggestion interfaces:

```typescript
abstract class EditorSuggest<T> {
  abstract onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null;
  abstract getSuggestions(context: EditorSuggestContext): T[] | Promise<T[]>;
  abstract renderSuggestion(value: T, el: HTMLElement): void;
  abstract selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void;
}
```

**Use Cases for Agent:**
- Create smart autocomplete for wikilinks
- Suggest tags while typing
- AI-powered completions

---

## Implementation Recommendations

### Priority Matrix

| Capability | API | Priority | Complexity | Value for Agent |
|------------|-----|----------|------------|-----------------|
| Edit active note at cursor | Editor API | **High** | Low | High |
| Execute commands by name | Commands API | **High** | Low | High |
| Insert/replace selected text | Editor API | **High** | Low | High |
| Search notes by content | Manual + MetadataCache | **Medium** | Medium | High |
| Create daily note | Daily Notes API | **Medium** | Low | Medium |
| Apply templates | Templates API | **Medium** | Low | Medium |
| Navigate to specific line | Editor API | **Medium** | Low | Medium |
| Manage bookmarks | Bookmarks API | Low | Low | Low |
| Manipulate canvas | Canvas API | Low | Medium | Medium |
| Custom autocomplete | Suggest API | Low | High | Medium |

### Suggested New Agent Actions

Based on this research, here are recommended new actions for the vault-actions.ts:

```typescript
// Editor actions
'edit-at-cursor': { text: string }
'replace-selection': { text: string }
'select-line': { line: number }
'go-to-line': { line: number }
'insert-at-line': { line: number, text: string }

// Command actions
'execute-command': { commandId: string }
'list-commands': { filter?: string }

// Daily notes
'open-daily-note': {}
'create-daily-note': {}

// Templates
'apply-template': { templateName: string, targetPath: string }

// Search (enhanced)
'search-content': { query: string, folder?: string }
'find-by-tag': { tag: string }
'find-by-link': { linkTarget: string }
```

---

## Sources

### Official Documentation
- [Obsidian Developer Documentation - Vault](https://docs.obsidian.md/Plugins/Vault)
- [Obsidian Developer Documentation - Editor](https://docs.obsidian.md/Plugins/Editor/Editor)
- [FileManager API Reference](https://docs.obsidian.md/Reference/TypeScript+API/FileManager)

### API References
- [Obsidian API TypeScript Definitions](https://github.com/obsidianmd/obsidian-api)
- [DeepWiki - Obsidian API Reference](https://deepwiki.com/obsidianmd/obsidian-api/5-api-reference)

### Community Resources
- [Marcus Olsson's Plugin Docs](https://marcusolsson.github.io/obsidian-plugin-docs/vault)
- [Obsidian Query Language Plugin](https://github.com/jplattel/obsidian-query-language)
- [Dataview Plugin Documentation](https://blacksmithgu.github.io/obsidian-dataview/)

### Forum Discussions
- [Editor Text Selection](https://forum.obsidian.md/t/get-current-text-selection/23436)
- [Search API Discussion](https://forum.obsidian.md/t/api-endpoint-for-searching-file-content/11482)

---

*Last updated: January 2025*
*Research conducted for Claudian Phase 6 planning*
