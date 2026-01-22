# Phase 6: Extended Obsidian API Support

## Overview

This phase implements comprehensive Obsidian API support for the AI agent, enabling full control over Obsidian through natural language. This includes Editor API, Commands API, Internal Plugins (Daily Notes, Templates, Bookmarks), Canvas API, and enhanced Search capabilities.

**Excluded:** Graph View API (not officially documented)

## Goals

1. Expand agent capabilities with new action types
2. Create complete wiki documentation with examples (EN/ES)
3. Maintain backward compatibility with existing actions

---

## New Action Types

### Total Count

| Existing | New | Total |
|----------|-----|-------|
| 16 | 36 | 52 |

---

## Action Categories

### 1. Editor API Actions (10 actions)

Real-time text manipulation in the active editor.

| Action | Parameters | Description |
|--------|------------|-------------|
| `editor-get-content` | - | Get full content of active editor |
| `editor-set-content` | `content: string` | Set full content |
| `editor-get-selection` | - | Get selected text |
| `editor-replace-selection` | `text: string` | Replace selected text |
| `editor-insert-at-cursor` | `text: string` | Insert at cursor position |
| `editor-get-line` | `line: number` | Get specific line |
| `editor-set-line` | `line: number, text: string` | Set specific line |
| `editor-go-to-line` | `line: number` | Navigate to line |
| `editor-undo` | - | Undo last change |
| `editor-redo` | - | Redo last change |

**Access Pattern:**
```typescript
const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
const editor = view?.editor;
```

### 2. Commands API Actions (3 actions)

Execute built-in and plugin commands programmatically.

| Action | Parameters | Description |
|--------|------------|-------------|
| `execute-command` | `commandId: string` | Execute command by ID |
| `list-commands` | `filter?: string` | List available commands |
| `get-command-info` | `commandId: string` | Get command details |

**Access Pattern:**
```typescript
this.plugin.app.commands.executeCommandById(commandId);
this.plugin.app.commands.listCommands();
```

### 3. Daily Notes Actions (2 actions)

Integration with the built-in Daily Notes plugin.

| Action | Parameters | Description |
|--------|------------|-------------|
| `open-daily-note` | - | Open today's daily note |
| `create-daily-note` | `date?: string` | Create daily note for date |

**Access Pattern:**
```typescript
const dailyNotes = (this.plugin.app as any).internalPlugins?.plugins['daily-notes'];
if (dailyNotes?.enabled) {
  // Use dailyNotes.instance
}
```

### 4. Templates Actions (2 actions)

Integration with the built-in Templates plugin.

| Action | Parameters | Description |
|--------|------------|-------------|
| `insert-template` | `templateName?: string` | Insert template at cursor |
| `list-templates` | - | List available templates |

**Access Pattern:**
```typescript
const templates = (this.plugin.app as any).internalPlugins?.plugins['templates'];
if (templates?.enabled) {
  // Use templates.instance
}
```

### 5. Bookmarks Actions (3 actions)

Integration with the built-in Bookmarks plugin.

| Action | Parameters | Description |
|--------|------------|-------------|
| `add-bookmark` | `path: string` | Bookmark a note |
| `remove-bookmark` | `path: string` | Remove bookmark |
| `list-bookmarks` | - | List all bookmarks |

**Access Pattern:**
```typescript
const bookmarks = (this.plugin.app as any).internalPlugins?.plugins['bookmarks'];
if (bookmarks?.enabled) {
  // Use bookmarks.instance
}
```

### 6. Canvas API Actions (7 actions)

Manipulation of canvas files when a canvas is active.

| Action | Parameters | Description |
|--------|------------|-------------|
| `canvas-create-text-node` | `text: string, x?: number, y?: number` | Create text node |
| `canvas-create-file-node` | `file: string, x?: number, y?: number` | Create file node |
| `canvas-create-link-node` | `url: string, x?: number, y?: number` | Create link node |
| `canvas-create-group` | `label?: string` | Create group |
| `canvas-add-edge` | `fromNode: string, toNode: string` | Add edge between nodes |
| `canvas-select-all` | - | Select all nodes |
| `canvas-zoom-to-fit` | - | Zoom to fit all nodes |

**Access Pattern:**
```typescript
import { ItemView } from 'obsidian';
const canvasView = this.plugin.app.workspace.getActiveViewOfType(ItemView);
if (canvasView?.getViewType() === 'canvas') {
  const canvas = (canvasView as any).canvas;
}
```

### 7. Enhanced Search Actions (4 actions)

Improved search capabilities beyond basic note search.

| Action | Parameters | Description |
|--------|------------|-------------|
| `search-by-heading` | `heading: string, folder?: string` | Find notes with heading |
| `search-by-block` | `blockId: string` | Find note with block ID |
| `get-all-tags` | - | Get all vault tags |
| `open-search` | `query: string` | Open global search UI |

**Access Pattern:**
```typescript
// Heading search via MetadataCache
const files = this.plugin.app.vault.getMarkdownFiles();
for (const file of files) {
  const cache = this.plugin.app.metadataCache.getFileCache(file);
  cache?.headings?.forEach(h => /* check heading */);
}
```

### 8. Workspace Actions (5 actions)

Navigation and view control.

| Action | Parameters | Description |
|--------|------------|-------------|
| `open-file` | `path: string, mode?: 'source' \| 'preview'` | Open file in editor |
| `reveal-in-explorer` | `path: string` | Show in file explorer |
| `get-active-file` | - | Get active file info |
| `close-active-leaf` | - | Close current tab |
| `split-leaf` | `direction: 'horizontal' \| 'vertical'` | Split current view |

**Access Pattern:**
```typescript
await this.plugin.app.workspace.openLinkText(path, '', false);
this.plugin.app.workspace.revealLeaf(leaf);
```

---

## Complete ActionType Definition

```typescript
export type ActionType =
  // === Existing (16 actions) ===
  | 'create-folder' | 'delete-folder' | 'list-folder'
  | 'create-note' | 'read-note' | 'delete-note' | 'rename-note' | 'move-note' | 'copy-note'
  | 'append-content' | 'prepend-content' | 'replace-content' | 'update-frontmatter'
  | 'search-notes' | 'get-note-info' | 'find-links'
  // === Editor API (10 actions) ===
  | 'editor-get-content' | 'editor-set-content'
  | 'editor-get-selection' | 'editor-replace-selection' | 'editor-insert-at-cursor'
  | 'editor-get-line' | 'editor-set-line' | 'editor-go-to-line'
  | 'editor-undo' | 'editor-redo'
  // === Commands API (3 actions) ===
  | 'execute-command' | 'list-commands' | 'get-command-info'
  // === Daily Notes (2 actions) ===
  | 'open-daily-note' | 'create-daily-note'
  // === Templates (2 actions) ===
  | 'insert-template' | 'list-templates'
  // === Bookmarks (3 actions) ===
  | 'add-bookmark' | 'remove-bookmark' | 'list-bookmarks'
  // === Canvas API (7 actions) ===
  | 'canvas-create-text-node' | 'canvas-create-file-node' | 'canvas-create-link-node'
  | 'canvas-create-group' | 'canvas-add-edge' | 'canvas-select-all' | 'canvas-zoom-to-fit'
  // === Enhanced Search (4 actions) ===
  | 'search-by-heading' | 'search-by-block' | 'get-all-tags' | 'open-search'
  // === Workspace (5 actions) ===
  | 'open-file' | 'reveal-in-explorer' | 'get-active-file' | 'close-active-leaf' | 'split-leaf';
```

---

## Files to Modify

### Source Files

| File | Changes |
|------|---------|
| `src/vault-actions.ts` | Add 36 new action implementations |
| `src/agent-mode.ts` | Update descriptions and system prompt |
| `src/i18n/types.ts` | Add translation keys |
| `src/i18n/locales/en.ts` | Add English translations |
| `src/i18n/locales/es.ts` | Add Spanish translations |

### Wiki Documentation

| File | Purpose |
|------|---------|
| `wiki/Features/Agent-Actions-Reference.md` | Complete action catalog (EN) |
| `wiki/Features/Agent-Actions-Reference.es.md` | Complete action catalog (ES) |
| `wiki/Features/Agent-Mode.md` | Update with new overview |
| `wiki/Features/Agent-Mode.es.md` | Update Spanish version |
| `wiki/_Sidebar.md` | Add new page link |
| `wiki/_Sidebar.es.md` | Add Spanish link |

---

## Verification Plan

### Editor Actions
- Open a note, send "insert 'Hello' at cursor"
- Verify text appears at cursor position
- Test undo/redo commands

### Commands API
- Send "list available commands"
- Send "execute command editor:toggle-bold"

### Daily Notes
- Send "open today's daily note"
- Verify correct note opens or creates

### Templates
- Send "list my templates"
- Send "insert meeting template"

### Canvas
- Open a canvas, send "add a text card saying 'Ideas'"
- Verify node created

### Search
- Send "search for notes with heading 'Introduction'"
- Verify results returned

### Wiki Verification
- Check wiki pages render correctly in GitHub
- Verify all examples are accurate
- Test in both English and Spanish

---

## Implementation Order

1. Update i18n types and translations
2. Implement Editor API actions
3. Implement Commands API actions
4. Implement Internal Plugins actions (Daily Notes, Templates, Bookmarks)
5. Implement Canvas API actions
6. Implement Enhanced Search actions
7. Implement Workspace actions
8. Update agent-mode.ts system prompt
9. Create wiki documentation

---

## Summary

| Category | Actions | Complexity |
|----------|---------|------------|
| Editor API | 10 | Medium |
| Commands API | 3 | Low |
| Daily Notes | 2 | Low |
| Templates | 2 | Low |
| Bookmarks | 3 | Low |
| Canvas API | 7 | Medium |
| Enhanced Search | 4 | Low |
| Workspace | 5 | Low |
| **Total New** | **36** | - |
