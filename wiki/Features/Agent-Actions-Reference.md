# Agent Actions Reference

Complete reference for all actions available in Agent Mode. This page documents the full set of 52 actions across 8 categories.

---

## Action Categories

| Category | Count | Description |
|----------|-------|-------------|
| [File & Folder Management](#file--folder-management) | 16 | Core vault operations |
| [Editor API](#editor-api) | 10 | Real-time text manipulation |
| [Commands API](#commands-api) | 3 | Execute Obsidian commands |
| [Daily Notes](#daily-notes) | 2 | Daily note management |
| [Templates](#templates) | 2 | Template insertion |
| [Bookmarks](#bookmarks) | 3 | Bookmark management |
| [Canvas API](#canvas-api) | 7 | Canvas manipulation |
| [Enhanced Search](#enhanced-search) | 4 | Advanced search capabilities |
| [Workspace](#workspace) | 5 | Navigation and view control |

---

## File & Folder Management

### Folder Operations

#### create-folder
Creates a new folder in the vault.

```json
{ "action": "create-folder", "params": { "path": "Projects/2024" } }
```

**Natural language:** "Create a folder called Projects/2024"

#### delete-folder
Deletes an empty folder.

```json
{ "action": "delete-folder", "params": { "path": "old-drafts" } }
```

**Natural language:** "Delete the old-drafts folder"

#### list-folder
Lists contents of a folder.

```json
{ "action": "list-folder", "params": { "path": "Projects", "recursive": true } }
```

**Natural language:** "What's in my Projects folder?" or "List all files in Projects recursively"

### Note Operations

#### create-note
Creates a new note with optional content and frontmatter.

```json
{
  "action": "create-note",
  "params": {
    "path": "Meetings/standup",
    "content": "# Daily Standup\n\n- Progress\n- Blockers",
    "frontmatter": { "tags": ["meeting", "daily"] }
  }
}
```

**Natural language:** "Create a meeting note in Meetings folder"

#### read-note
Reads the content of a note.

```json
{ "action": "read-note", "params": { "path": "todo" } }
```

**Natural language:** "Show me my todo note"

#### delete-note
Deletes a note (requires confirmation).

```json
{ "action": "delete-note", "params": { "path": "drafts/old-draft" } }
```

**Natural language:** "Delete old-draft.md from drafts"

#### rename-note
Renames a note.

```json
{ "action": "rename-note", "params": { "from": "draft", "to": "final-report" } }
```

**Natural language:** "Rename draft to final-report"

#### move-note
Moves a note to a different location.

```json
{ "action": "move-note", "params": { "from": "inbox/note", "to": "archive/note" } }
```

**Natural language:** "Move note from inbox to archive"

#### copy-note
Copies a note preserving exact content.

```json
{ "action": "copy-note", "params": { "from": "template", "to": "new-project" } }
```

**Natural language:** "Copy template to new-project"

### Content Modification

#### append-content
Adds content to the end of a note.

```json
{ "action": "append-content", "params": { "path": "log", "content": "\n## New Entry\nContent here" } }
```

**Natural language:** "Add a new section to my log"

#### prepend-content
Adds content to the beginning of a note (after frontmatter).

```json
{ "action": "prepend-content", "params": { "path": "readme", "content": "**Updated!**\n\n" } }
```

**Natural language:** "Add an update notice at the top of readme"

#### replace-content
Replaces entire note content (requires confirmation).

```json
{ "action": "replace-content", "params": { "path": "draft", "content": "New content" } }
```

**Natural language:** "Replace the content of draft with..."

#### update-frontmatter
Updates YAML frontmatter fields.

```json
{ "action": "update-frontmatter", "params": { "path": "project", "fields": { "status": "active", "priority": 1 } } }
```

**Natural language:** "Set status to active in project note"

### Search & Query

#### search-notes
Searches notes by title, content, or tags.

```json
{ "action": "search-notes", "params": { "query": "javascript", "field": "content", "folder": "tutorials" } }
```

**Natural language:** "Find notes about javascript in tutorials"

#### get-note-info
Gets metadata about a note.

```json
{ "action": "get-note-info", "params": { "path": "project" } }
```

**Natural language:** "What tags does project note have?"

#### find-links
Finds notes that link to a target.

```json
{ "action": "find-links", "params": { "target": "Python basics" } }
```

**Natural language:** "Which notes link to Python basics?"

---

## Editor API

Real-time manipulation of the currently active editor.

> **Note:** These actions require an open markdown file in the editor.

#### editor-get-content
Gets the full content of the active editor.

```json
{ "action": "editor-get-content", "params": {} }
```

**Natural language:** "Get the current editor content"

#### editor-set-content
Sets the full content of the active editor (requires confirmation).

```json
{ "action": "editor-set-content", "params": { "content": "# New Content\n\nText here" } }
```

**Natural language:** "Replace editor content with..."

#### editor-get-selection
Gets the currently selected text.

```json
{ "action": "editor-get-selection", "params": {} }
```

**Natural language:** "What text is selected?"

#### editor-replace-selection
Replaces the selected text.

```json
{ "action": "editor-replace-selection", "params": { "text": "replacement text" } }
```

**Natural language:** "Replace selection with 'replacement text'"

#### editor-insert-at-cursor
Inserts text at the current cursor position.

```json
{ "action": "editor-insert-at-cursor", "params": { "text": "inserted text" } }
```

**Natural language:** "Insert 'hello' at cursor"

#### editor-get-line
Gets a specific line by number (0-indexed).

```json
{ "action": "editor-get-line", "params": { "line": 5 } }
```

**Natural language:** "Get line 5"

#### editor-set-line
Sets the content of a specific line.

```json
{ "action": "editor-set-line", "params": { "line": 5, "text": "new line content" } }
```

**Natural language:** "Set line 5 to 'new line content'"

#### editor-go-to-line
Navigates to a specific line.

```json
{ "action": "editor-go-to-line", "params": { "line": 10 } }
```

**Natural language:** "Go to line 10"

#### editor-undo
Undoes the last change.

```json
{ "action": "editor-undo", "params": {} }
```

**Natural language:** "Undo"

#### editor-redo
Redoes the last undone change.

```json
{ "action": "editor-redo", "params": {} }
```

**Natural language:** "Redo"

---

## Commands API

Execute any Obsidian command programmatically.

#### execute-command
Executes a command by its ID.

```json
{ "action": "execute-command", "params": { "commandId": "editor:toggle-bold" } }
```

**Natural language:** "Toggle bold" or "Execute the toggle-bold command"

#### list-commands
Lists available commands with optional filter.

```json
{ "action": "list-commands", "params": { "filter": "editor" } }
```

**Natural language:** "List editor commands"

#### get-command-info
Gets details about a specific command.

```json
{ "action": "get-command-info", "params": { "commandId": "editor:toggle-bold" } }
```

**Natural language:** "What does the toggle-bold command do?"

---

## Daily Notes

Integration with the built-in Daily Notes plugin.

> **Note:** The Daily Notes plugin must be enabled.

#### open-daily-note
Opens today's daily note (creates if doesn't exist).

```json
{ "action": "open-daily-note", "params": {} }
```

**Natural language:** "Open today's daily note"

#### create-daily-note
Creates a daily note for a specific date.

```json
{ "action": "create-daily-note", "params": { "date": "2024-01-15" } }
```

**Natural language:** "Create daily note for January 15, 2024"

---

## Templates

Integration with the built-in Templates plugin.

> **Note:** The Templates plugin must be enabled.

#### insert-template
Inserts a template at the cursor position.

```json
{ "action": "insert-template", "params": { "templateName": "meeting" } }
```

**Natural language:** "Insert the meeting template"

Without `templateName`, opens the template picker:
```json
{ "action": "insert-template", "params": {} }
```

**Natural language:** "Insert a template"

#### list-templates
Lists all available templates.

```json
{ "action": "list-templates", "params": {} }
```

**Natural language:** "What templates do I have?"

---

## Bookmarks

Integration with the built-in Bookmarks plugin.

> **Note:** The Bookmarks plugin must be enabled.

#### add-bookmark
Bookmarks a note.

```json
{ "action": "add-bookmark", "params": { "path": "important-note" } }
```

**Natural language:** "Bookmark important-note"

#### remove-bookmark
Removes a bookmark.

```json
{ "action": "remove-bookmark", "params": { "path": "old-bookmark" } }
```

**Natural language:** "Remove bookmark for old-bookmark"

#### list-bookmarks
Lists all bookmarks.

```json
{ "action": "list-bookmarks", "params": {} }
```

**Natural language:** "Show my bookmarks"

---

## Canvas API

Manipulation of Canvas files when a canvas is active.

> **Note:** These actions require an open canvas file.

#### canvas-create-text-node
Creates a text node on the canvas.

```json
{ "action": "canvas-create-text-node", "params": { "text": "My idea", "x": 100, "y": 200 } }
```

**Natural language:** "Add a text card saying 'My idea'"

#### canvas-create-file-node
Creates a node linked to a file.

```json
{ "action": "canvas-create-file-node", "params": { "file": "notes/reference", "x": 300, "y": 200 } }
```

**Natural language:** "Add my reference note to the canvas"

#### canvas-create-link-node
Creates a node with a web link.

```json
{ "action": "canvas-create-link-node", "params": { "url": "https://obsidian.md", "x": 500, "y": 200 } }
```

**Natural language:** "Add a link to obsidian.md on the canvas"

#### canvas-create-group
Creates a group on the canvas.

```json
{ "action": "canvas-create-group", "params": { "label": "Ideas" } }
```

**Natural language:** "Create a group called 'Ideas'"

#### canvas-add-edge
Adds an edge (connection) between two nodes.

```json
{ "action": "canvas-add-edge", "params": { "fromNode": "node1-id", "toNode": "node2-id" } }
```

**Natural language:** "Connect node1 to node2"

#### canvas-select-all
Selects all nodes on the canvas.

```json
{ "action": "canvas-select-all", "params": {} }
```

**Natural language:** "Select all nodes"

#### canvas-zoom-to-fit
Zooms to fit all content.

```json
{ "action": "canvas-zoom-to-fit", "params": {} }
```

**Natural language:** "Zoom to fit"

---

## Enhanced Search

Advanced search capabilities beyond basic note search.

#### search-by-heading
Finds notes containing a specific heading.

```json
{ "action": "search-by-heading", "params": { "heading": "Introduction", "folder": "docs" } }
```

**Natural language:** "Find notes with 'Introduction' heading in docs"

#### search-by-block
Finds the note containing a block ID.

```json
{ "action": "search-by-block", "params": { "blockId": "abc123" } }
```

**Natural language:** "Find the note with block ^abc123"

#### get-all-tags
Gets all tags used in the vault.

```json
{ "action": "get-all-tags", "params": {} }
```

**Natural language:** "What tags exist in my vault?"

#### open-search
Opens the global search UI with a query.

```json
{ "action": "open-search", "params": { "query": "tag:#important" } }
```

**Natural language:** "Search for notes tagged important"

---

## Workspace

Navigation and view control.

#### open-file
Opens a file in the editor.

```json
{ "action": "open-file", "params": { "path": "readme", "mode": "preview" } }
```

**Natural language:** "Open readme in preview mode"

#### reveal-in-explorer
Reveals a file in the file explorer.

```json
{ "action": "reveal-in-explorer", "params": { "path": "hidden/note" } }
```

**Natural language:** "Show hidden/note in the file explorer"

#### get-active-file
Gets info about the currently active file.

```json
{ "action": "get-active-file", "params": {} }
```

**Natural language:** "What file am I editing?"

#### close-active-leaf
Closes the current tab.

```json
{ "action": "close-active-leaf", "params": {} }
```

**Natural language:** "Close this tab"

#### split-leaf
Splits the current view.

```json
{ "action": "split-leaf", "params": { "direction": "vertical" } }
```

**Natural language:** "Split view vertically"

---

## Action Response Format

All actions return structured results:

```json
{
  "actions": [
    { "action": "create-note", "params": { "path": "new-note" } }
  ],
  "message": "Created new-note.md",
  "requiresConfirmation": false
}
```

### Confirmation Required

Destructive actions require confirmation:
- `delete-note`
- `delete-folder`
- `replace-content`
- `editor-set-content`

---

## Related Pages

- [Agent Mode](Features-Agent-Mode) - Overview and usage
- [Configuration](Configuration) - Agent settings
- [Troubleshooting](Troubleshooting) - Common issues
