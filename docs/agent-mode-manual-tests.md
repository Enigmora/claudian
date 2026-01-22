# Agent Mode Manual Test Cases

Manual test cases for all 52 agent actions. Execute these tests with Agent Mode enabled.

## Test Setup

1. Enable Agent Mode in the chat header
2. Have a test vault or test folder ready
3. For Canvas tests: create a `.canvas` file first
4. For Internal Plugins tests: ensure Daily Notes, Templates, and Bookmarks are enabled

---

## 1. Folder Management (3 actions)

### create-folder
```
Test 1.1: "Create a folder called TestFolder"
Expected: Folder TestFolder created at vault root

Test 1.2: "Create nested folders TestFolder/SubA/SubB"
Expected: Full folder hierarchy created

Test 1.3: "Create a folder called TestFolder" (already exists)
Expected: Returns created: false, no error
```

### delete-folder
```
Test 1.4: "Delete the folder TestFolder/SubA/SubB"
Expected: Empty folder deleted

Test 1.5: "Delete TestFolder/SubA" (contains SubB)
Expected: Error - folder not empty

Test 1.6: "Delete the folder .obsidian/test"
Expected: Error - protected folder
```

### list-folder
```
Test 1.7: "List what's in TestFolder"
Expected: Shows files and folders in TestFolder

Test 1.8: "List all files in TestFolder recursively"
Expected: Shows all nested contents

Test 1.9: "What's at the root of my vault?"
Expected: Lists root folder contents
```

---

## 2. Note Management (7 actions)

### create-note
```
Test 2.1: "Create a note called test-note in TestFolder"
Expected: TestFolder/test-note.md created

Test 2.2: "Create a note called meeting with content '# Meeting Notes\n\n- Item 1'"
Expected: Note created with content

Test 2.3: "Create a note called tagged-note with tags project, important"
Expected: Note created with YAML frontmatter containing tags

Test 2.4: "Create a note called test-note in TestFolder" (already exists)
Expected: Error - file exists, suggests overwrite
```

### read-note
```
Test 2.5: "Show me the contents of TestFolder/test-note"
Expected: Returns full content and frontmatter

Test 2.6: "Read the note nonexistent-note"
Expected: Error - note not found
```

### delete-note
```
Test 2.7: "Delete TestFolder/test-note"
Expected: Confirmation requested, then deleted

Test 2.8: "Delete .obsidian/workspace.json"
Expected: Error - protected path
```

### rename-note
```
Test 2.9: "Rename TestFolder/test-note to TestFolder/renamed-note"
Expected: File renamed, links updated

Test 2.10: "Rename nonexistent to something"
Expected: Error - source not found
```

### move-note
```
Test 2.11: "Move TestFolder/renamed-note to TestFolder/SubA/moved-note"
Expected: File moved to new location

Test 2.12: "Move note to .obsidian/test"
Expected: Error - protected destination
```

### copy-note
```
Test 2.13: "Copy TestFolder/SubA/moved-note to TestFolder/copied-note"
Expected: Exact copy created, original unchanged

Test 2.14: "Duplicate my template note to new-from-template"
Expected: Exact content preserved
```

### get-note-info
```
Test 2.15: "What tags does TestFolder/tagged-note have?"
Expected: Returns path, title, size, created, modified, frontmatter, tags, links

Test 2.16: "Get info about nonexistent-note"
Expected: Error - note not found
```

---

## 3. Content Modification (4 actions)

### append-content
```
Test 3.1: "Add '## New Section\nContent here' to the end of TestFolder/test-note"
Expected: Content added at end of file

Test 3.2: "Append a todo list to my test note"
Expected: AI-generated content appended
```

### prepend-content
```
Test 3.3: "Add 'DRAFT' at the beginning of TestFolder/test-note"
Expected: Content added after frontmatter (if exists) or at start

Test 3.4: "Add a disclaimer at the top of my document"
Expected: Content prepended correctly
```

### replace-content
```
Test 3.5: "Replace the content of TestFolder/test-note with '# Replaced\n\nNew content'"
Expected: Confirmation requested, content replaced

Test 3.6: "Overwrite test-note with a summary"
Expected: Full content replacement
```

### update-frontmatter
```
Test 3.7: "Set status to 'draft' in TestFolder/test-note"
Expected: Frontmatter updated/created with status field

Test 3.8: "Add tags 'review', 'urgent' to my note"
Expected: Tags array updated in frontmatter

Test 3.9: "Set priority to 1 and category to 'work' in test-note"
Expected: Multiple fields updated
```

---

## 4. Search Actions (3 actions)

### search-notes
```
Test 4.1: "Find all notes with 'test' in the title"
Expected: List of matching notes by title

Test 4.2: "Search for notes containing 'meeting' in content"
Expected: Notes with 'meeting' in body

Test 4.3: "Find notes tagged 'important'"
Expected: Notes with #important tag or tags: [important]

Test 4.4: "Search for 'project' in the Projects folder"
Expected: Scoped search results
```

### find-links
```
Test 4.5: "Which notes link to TestFolder/test-note?"
Expected: List of backlinks

Test 4.6: "Find all notes linking to 'Python basics'"
Expected: Notes containing [[Python basics]]
```

---

## 5. Editor API (10 actions)

> **Prerequisite:** Open a markdown file in the editor before each test.

### editor-get-content
```
Test 5.1: "Get the current editor content"
Expected: Full text of active note returned
```

### editor-set-content
```
Test 5.2: "Set the editor content to '# New Title\n\nReplaced content'"
Expected: Confirmation requested, editor content replaced
```

### editor-get-selection
```
Test 5.3: Select some text, then: "What text do I have selected?"
Expected: Returns selected text

Test 5.4: With no selection: "Get selected text"
Expected: Returns empty selection, hasSelection: false
```

### editor-replace-selection
```
Test 5.5: Select text, then: "Replace selection with 'REPLACED'"
Expected: Selected text replaced

Test 5.6: No selection: "Replace selection with 'inserted'"
Expected: Text inserted at cursor (empty selection)
```

### editor-insert-at-cursor
```
Test 5.7: "Insert '---' at cursor"
Expected: Text inserted at cursor position

Test 5.8: "Insert a checkbox at cursor"
Expected: '- [ ] ' inserted at cursor
```

### editor-get-line
```
Test 5.9: "Get line 0"
Expected: First line content returned

Test 5.10: "Show me line 5"
Expected: Line 5 content (or empty if doesn't exist)
```

### editor-set-line
```
Test 5.11: "Set line 0 to '# Updated Heading'"
Expected: First line replaced

Test 5.12: "Change line 3 to '- Modified item'"
Expected: Line 3 content updated
```

### editor-go-to-line
```
Test 5.13: "Go to line 10"
Expected: Cursor moves to line 10

Test 5.14: "Navigate to the beginning of the file"
Expected: Cursor at line 0
```

### editor-undo
```
Test 5.15: Make a change, then: "Undo"
Expected: Last change reverted
```

### editor-redo
```
Test 5.16: After undo: "Redo"
Expected: Undone change restored
```

---

## 6. Commands API (3 actions)

### execute-command
```
Test 6.1: "Execute the toggle-bold command"
Expected: editor:toggle-bold executed (text becomes bold if selected)

Test 6.2: "Run the command to open settings"
Expected: Settings opened

Test 6.3: "Execute command nonexistent:command"
Expected: Error - command not found
```

### list-commands
```
Test 6.4: "List all available commands"
Expected: Full list of command IDs and names

Test 6.5: "List commands that contain 'editor'"
Expected: Filtered list of editor commands

Test 6.6: "What commands are available for formatting?"
Expected: Formatting-related commands
```

### get-command-info
```
Test 6.7: "Get info about the toggle-bold command"
Expected: ID, name, hotkeys returned

Test 6.8: "What does editor:toggle-heading do?"
Expected: Command details
```

---

## 7. Daily Notes (2 actions)

> **Prerequisite:** Enable Daily Notes core plugin.

### open-daily-note
```
Test 7.1: "Open today's daily note"
Expected: Today's note opened (created if doesn't exist)

Test 7.2: "Open my daily note"
Expected: Same as above
```

### create-daily-note
```
Test 7.3: "Create daily note for 2024-01-15"
Expected: Note created for that date

Test 7.4: "Create yesterday's daily note"
Expected: Note for previous day created

Test 7.5: "Create daily note for today" (already exists)
Expected: Returns created: false
```

---

## 8. Templates (2 actions)

> **Prerequisite:** Enable Templates core plugin, have templates in configured folder.

### insert-template
```
Test 8.1: "Insert the meeting template"
Expected: Template content inserted at cursor

Test 8.2: "Insert a template" (no name specified)
Expected: Template picker opens

Test 8.3: "Insert template nonexistent-template"
Expected: Error - template not found
```

### list-templates
```
Test 8.4: "List my templates"
Expected: List of available template names

Test 8.5: "What templates do I have?"
Expected: Template list with folder location
```

---

## 9. Bookmarks (3 actions)

> **Prerequisite:** Enable Bookmarks core plugin.

### add-bookmark
```
Test 9.1: "Bookmark TestFolder/test-note"
Expected: Note added to bookmarks

Test 9.2: "Add a bookmark for nonexistent-note"
Expected: Error - file not found
```

### remove-bookmark
```
Test 9.3: "Remove bookmark for TestFolder/test-note"
Expected: Bookmark removed

Test 9.4: "Remove bookmark for non-bookmarked-note"
Expected: Error - bookmark not found
```

### list-bookmarks
```
Test 9.5: "Show my bookmarks"
Expected: List of all bookmarks with types

Test 9.6: "List all bookmarked notes"
Expected: Same as above
```

---

## 10. Canvas API (7 actions)

> **Prerequisite:** Open a `.canvas` file before each test.

### canvas-create-text-node
```
Test 10.1: "Add a text card saying 'My Idea'"
Expected: Text node created on canvas

Test 10.2: "Create a text node 'Todo' at position 200, 300"
Expected: Node created at specified coordinates
```

### canvas-create-file-node
```
Test 10.3: "Add my test-note to the canvas"
Expected: File node linked to TestFolder/test-note

Test 10.4: "Add nonexistent-note to canvas"
Expected: Error - file not found
```

### canvas-create-link-node
```
Test 10.5: "Add a link to https://obsidian.md on the canvas"
Expected: Link node created with URL

Test 10.6: "Create a web link node for github.com"
Expected: Link node created
```

### canvas-create-group
```
Test 10.7: "Create a group called 'Ideas'"
Expected: Group created with label

Test 10.8: "Add an empty group to the canvas"
Expected: Unlabeled group created
```

### canvas-add-edge
```
Test 10.9: Create two nodes, note their IDs, then: "Connect node [id1] to [id2]"
Expected: Edge created between nodes

Test 10.10: "Add edge from nonexistent to another"
Expected: Error - node not found
```

### canvas-select-all
```
Test 10.11: "Select all nodes on the canvas"
Expected: All nodes selected, count returned
```

### canvas-zoom-to-fit
```
Test 10.12: "Zoom to fit the canvas"
Expected: View adjusted to show all content
```

---

## 11. Enhanced Search (4 actions)

### search-by-heading
```
Test 11.1: "Find notes with heading 'Introduction'"
Expected: Notes containing ## Introduction or similar

Test 11.2: "Search for 'Setup' heading in the docs folder"
Expected: Scoped heading search
```

### search-by-block
```
Test 11.3: Create a block ^test123, then: "Find the note with block test123"
Expected: Note path returned

Test 11.4: "Search for block nonexistent123"
Expected: found: false
```

### get-all-tags
```
Test 11.5: "What tags exist in my vault?"
Expected: Complete list of all tags

Test 11.6: "List all tags"
Expected: Tags sorted alphabetically with count
```

### open-search
```
Test 11.7: "Search for tag:#project in the global search"
Expected: Search pane opens with query

Test 11.8: "Open search for 'meeting notes'"
Expected: Global search UI with query
```

---

## 12. Workspace (5 actions)

### open-file
```
Test 12.1: "Open TestFolder/test-note"
Expected: File opened in editor

Test 12.2: "Open readme in preview mode"
Expected: File opened in preview/reading mode

Test 12.3: "Open test-note in source mode"
Expected: File opened in source/editing mode
```

### reveal-in-explorer
```
Test 12.4: "Show TestFolder/test-note in the file explorer"
Expected: File highlighted in explorer pane

Test 12.5: "Reveal nonexistent-note in explorer"
Expected: Error - file not found
```

### get-active-file
```
Test 12.6: "What file am I editing?"
Expected: Path, title, isMarkdown returned

Test 12.7: With no file open: "Get active file"
Expected: path: null, title: null
```

### close-active-leaf
```
Test 12.8: "Close this tab"
Expected: Current tab closed

Test 12.9: With no tabs: "Close active tab"
Expected: closed: false
```

### split-leaf
```
Test 12.10: "Split the view vertically"
Expected: New pane created to the right

Test 12.11: "Split horizontally"
Expected: New pane created below
```

---

## Error Handling Tests

### Protected Paths
```
Test E.1: "Create a note in .obsidian/"
Expected: Error - protected folder

Test E.2: "Delete templates/default"
Expected: Error - protected folder
```

### Missing Prerequisites
```
Test E.3: Without editor open: "Insert at cursor"
Expected: Error - no active editor

Test E.4: Without canvas open: "Add a text node"
Expected: Error - no active canvas

Test E.5: With Daily Notes disabled: "Open daily note"
Expected: Error - plugin not enabled
```

### Invalid Parameters
```
Test E.6: "Create a note called" (incomplete)
Expected: AI asks for clarification or error

Test E.7: "Move note from to" (missing paths)
Expected: Error - missing parameters
```

---

## Bulk Operation Tests

### Multiple Actions
```
Test B.1: "Create a folder 'Project', then create notes 'readme', 'todo', 'notes' inside it"
Expected: 4 actions executed (1 folder + 3 notes)

Test B.2: "Copy all notes from TestFolder to BackupFolder"
Expected: Multiple copy-note actions

Test B.3: "Add tag 'archived' to all notes in old-projects folder"
Expected: Multiple update-frontmatter actions
```

---

## Cleanup

After testing, clean up:
```
"Delete the folder TestFolder and all its contents"
```

Note: This will require confirmation for each delete operation.
