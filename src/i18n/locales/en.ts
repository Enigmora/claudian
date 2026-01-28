import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian',
  'settings.description': 'Obsidian plugin for Claude AI integration developed by Enigmora. Chat with Claude, process notes for smart tag and wikilink suggestions, and manage your vault with natural language using agent mode. Privacy-first: API key stored locally.',
  'settings.language.name': 'Language',
  'settings.language.desc': 'Plugin interface language. Auto detects from Obsidian settings.',
  'settings.language.auto': 'Auto (detect from Obsidian)',
  'settings.apiKey.name': 'API key',
  'settings.apiKey.descPart1': 'Get your Anthropic API key at ',
  'settings.apiKey.descPart2': '. Stored locally in your vault.',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'Model',
  'settings.model.desc': 'Select the Claude model to use.',
  'settings.model.sonnet4': 'Claude Sonnet 4 (recommended)',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku45': 'Claude Haiku 4.5 (fast)',
  // Execution Mode (Model Orchestrator)
  'settings.executionMode.name': 'Execution mode',
  'settings.executionMode.desc': 'How Claude selects models for your tasks.',
  'settings.executionMode.automatic': 'Automatic (recommended)',
  'settings.executionMode.automaticDesc': 'Smart routing: simple tasks to Haiku, complex to Sonnet, deep analysis to Opus.',
  'settings.executionMode.economic': 'Economic',
  'settings.executionMode.economicDesc': 'All tasks use Haiku. Fastest and most affordable.',
  'settings.executionMode.maxQuality': 'Maximum quality',
  'settings.executionMode.maxQualityDesc': 'All tasks use Opus. Best for complex analysis and writing.',
  'settings.executionMode.currentModel': 'Using: {{model}}',
  'settings.folder.name': 'Notes folder',
  'settings.folder.desc': 'Folder where notes generated from chat will be saved.',
  'settings.folder.placeholder': 'Claudian',
  'settings.maxTokens.name': 'Max tokens',
  'settings.maxTokens.desc': 'Maximum number of tokens in responses (1000-8192).',
  'settings.customInstructions.name': 'Custom instructions',
  'settings.customInstructions.desc': 'Additional instructions to personalize Claude\'s behavior. These are added to the base instructions (not replaced).',
  'settings.customInstructions.placeholder': 'e.g.: Always respond in formal English, use bullet points...',
  'settings.customInstructions.clear': 'Clear',
  'settings.customInstructions.cleared': 'Custom instructions cleared',
  'settings.section.noteProcessing': 'Note processing',
  'settings.maxNotesContext.name': 'Max notes in context',
  'settings.maxNotesContext.desc': 'Maximum number of note titles to include when processing (10-500).',
  'settings.maxTagsContext.name': 'Max tags in context',
  'settings.maxTagsContext.desc': 'Maximum number of existing tags to include when processing (10-200).',
  'settings.section.agentMode': 'Agent mode',
  'settings.agentEnabled.name': 'Enable agent mode by default',
  'settings.agentEnabled.desc': 'Agent mode allows Claude to execute actions on your vault.',
  'settings.confirmDestructive.name': 'Confirm destructive actions',
  'settings.confirmDestructive.desc': 'Request confirmation before deleting files or replacing content.',
  'settings.protectedFolders.name': 'Protected folders',
  'settings.protectedFolders.desc': 'Folders the agent cannot modify (comma-separated).',
  'settings.protectedFolders.placeholder': 'templates, private',
  'settings.maxActions.name': 'Max actions per message',
  'settings.maxActions.desc': 'Limit of actions Claude can execute in a single message (1-20).',
  'settings.footer.license': 'Licensed under MIT license',
  'settings.footer.developedBy': 'Developed by',
  'settings.footer.sourceCode': 'Source code',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': 'Type your message...',
  'chat.send': 'Send',
  'chat.clearLabel': 'Clear chat',
  'chat.cleared': 'Chat cleared',
  'chat.agentLabel': 'Agent',
  'chat.agentEnabled': 'Agent mode enabled',
  'chat.agentDisabled': 'Agent mode disabled',
  'chat.copyLabel': 'Copy',
  'chat.copied': 'Copied to clipboard',
  'chat.createNoteLabel': 'Create note',
  'chat.actionsExecuted': '{{count}} action(s) executed',
  'chat.actionsPartial': '{{success}} successful, {{failed}} failed',
  'chat.actionsCancelled': 'Actions cancelled by user.',
  'chat.error': 'Error: {{message}}',
  'chat.errorUnknown': 'Unknown error',
  'chat.stop': 'Stop',
  'chat.streamStopped': 'Response stopped by user',

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'API key not configured. Go to settings.',
  'error.apiKeyInvalid': 'Invalid API key. Check your key in settings.',
  'error.rateLimit': 'Rate limit exceeded. Try again in a few seconds.',
  'error.connection': 'Connection error. Check your internet connection.',
  'error.unknown': 'Unknown error communicating with Claude.',
  'error.noActiveNote': 'No active markdown note.',
  'error.parseJson': 'No valid JSON found in response.',
  'error.parseResponse': 'Error parsing suggestion JSON.',
  'error.tooManyActions': 'Too many actions ({{count}}). Maximum allowed: {{max}}',
  // Vault action errors
  'error.protectedPath': 'Protected path: {{path}}',
  'error.folderNotFound': 'Folder not found: {{path}}',
  'error.folderNotEmpty': 'Folder is not empty: {{path}}',
  'error.fileAlreadyExists': 'File already exists: {{path}}. Use overwrite: true to overwrite.',
  'error.noteNotFound': 'Note not found: {{path}}',
  'error.sourceNoteNotFound': 'Source note not found: {{path}}',
  'error.fileNotFound': 'File not found: {{path}}',
  'error.momentNotAvailable': 'Moment.js not available',
  'error.noActiveLeafToSplit': 'No active leaf to split',
  'error.unknownError': 'Unknown error',
  // Concept map errors
  'error.conceptMapParse': 'Error parsing concept map',
  'error.noValidJsonInResponse': 'No valid JSON found in response',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': 'Create note from chat',
  'noteCreator.preview': 'Preview',
  'noteCreator.titleField.name': 'Title',
  'noteCreator.titleField.desc': 'File name (without .md extension)',
  'noteCreator.tags.name': 'Tags',
  'noteCreator.tags.desc': 'Comma-separated',
  'noteCreator.tags.placeholder': 'tag1, tag2, tag3',
  'noteCreator.folder.name': 'Folder',
  'noteCreator.folder.desc': 'Destination folder for the note',
  'noteCreator.cancel': 'Cancel',
  'noteCreator.create': 'Create note',
  'noteCreator.titleRequired': 'Title is required',
  'noteCreator.fileExists': 'A file with this name already exists: {{name}}',
  'noteCreator.created': 'Note created: {{path}}',
  'noteCreator.error': 'Error creating note: {{message}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': 'Batch processing',
  'batch.titleConceptMap': 'Generate concept map',
  'batch.selectNotes': 'Select notes',
  'batch.selectFolder': 'Select folder',
  'batch.selectAll': 'Select all',
  'batch.clear': 'Clear',
  'batch.counter': '{{count}} notes selected',
  'batch.noNotes': 'No notes in vault',
  'batch.rootFolder': 'Root',
  'batch.selectTemplate': 'Select template',
  'batch.mapOptions': 'Map options',
  'batch.mapTitle': 'Map title:',
  'batch.mapTitlePlaceholder': 'My concept map',
  'batch.cancel': 'Cancel',
  'batch.processNotes': 'Process notes',
  'batch.generateMap': 'Generate map',
  'batch.selectAtLeastOne': 'Select at least one note',
  'batch.selectTemplateRequired': 'Select a template',
  'batch.starting': 'Starting processing...',
  'batch.processing': 'Processing {{current}}/{{total}}: {{note}}',
  'batch.completed': 'Completed: {{success}} successful, {{errors}} errors',
  'batch.savedTo': 'Results saved to: {{path}}',
  'batch.analyzing': 'Analyzing notes...',
  'batch.saving': 'Saving map...',
  'batch.mapGenerated': 'Map generated successfully',
  'batch.errorProcessing': 'Error during processing',
  'batch.errorGenerating': 'Error generating map',
  'batch.folderPrompt': 'Enter folder name:',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': 'Confirm actions',
  'confirmation.description': 'The following actions require confirmation:',
  'confirmation.warning': 'This action cannot be undone.',
  'confirmation.cancel': 'Cancel',
  'confirmation.confirm': 'Confirm',
  'confirmation.deleteNote': 'Delete note: {{path}}',
  'confirmation.deleteFolder': 'Delete folder: {{path}}',
  'confirmation.replaceContent': 'Replace content of: {{path}}',
  'confirmation.overwriteNote': 'Overwrite existing file: {{path}}',
  'confirmation.moveNote': 'Move: {{from}} → {{to}}',
  'confirmation.renameNote': 'Rename: {{from}} → {{to}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': 'Suggestions for note',
  'suggestions.tags': 'Suggested tags',
  'suggestions.tagsEmpty': 'No tag suggestions.',
  'suggestions.selectAll': 'Select all',
  'suggestions.applySelected': 'Apply selected',
  'suggestions.wikilinks': 'Suggested wikilinks',
  'suggestions.wikilinksEmpty': 'No wikilink suggestions.',
  'suggestions.badgeExists': 'exists',
  'suggestions.badgeNew': 'new',
  'suggestions.selectExisting': 'Select existing',
  'suggestions.insertSelected': 'Insert selected',
  'suggestions.atomicConcepts': 'Atomic concepts',
  'suggestions.atomicConceptsEmpty': 'No atomic concepts suggested.',
  'suggestions.viewContent': 'View content',
  'suggestions.createNote': 'Create note',
  'suggestions.noteCreated': 'Created',
  'suggestions.tagsApplied': '{{count}} tag(s) applied.',
  'suggestions.wikilinksInserted': '{{count}} wikilink(s) inserted.',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': 'Open chat with Claude',
  'command.processNote': 'Process active note with Claude',
  'command.batchProcess': 'Batch process notes',
  'command.generateMap': 'Generate concept map',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': 'Reading note content...',
  'processor.analyzing': 'Analyzing with Claude...',
  'processor.processing': 'Processing note with Claude...',
  'processor.relatedLinks': 'Related links',

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': 'Actions executed',
  'agent.noActions': 'Could not execute actions:',
  'agent.actionsFailed': '{{count}} action(s) failed.',
  'agent.partialSuccess': 'Results:',
  'agent.loopLimitReached': 'Loop limit reached. Please continue manually.',
  'agent.processingResults': 'Processing results (step {{step}})...',
  'agent.createFolder': 'Create folder: {{path}}',
  'agent.deleteFolder': 'Delete folder: {{path}}',
  'agent.listFolder': 'List folder: {{path}}',
  'agent.createNote': 'Create note: {{path}}',
  'agent.readNote': 'Read note: {{path}}',
  'agent.deleteNote': 'Delete note: {{path}}',
  'agent.renameNote': 'Rename: {{from}} → {{to}}',
  'agent.moveNote': 'Move: {{from}} → {{to}}',
  'agent.copyNote': 'Copy: {{from}} → {{to}}',
  'agent.appendContent': 'Append content to: {{path}}',
  'agent.prependContent': 'Prepend content to: {{path}}',
  'agent.replaceContent': 'Replace content of: {{path}}',
  'agent.updateFrontmatter': 'Update frontmatter: {{path}}',
  'agent.searchNotes': 'Search notes: "{{query}}"',
  'agent.getNoteInfo': 'Get info: {{path}}',
  'agent.findLinks': 'Find links to: {{target}}',
  // Editor API actions
  'agent.editorGetContent': 'Get editor content',
  'agent.editorSetContent': 'Set editor content',
  'agent.editorGetSelection': 'Get selected text',
  'agent.editorReplaceSelection': 'Replace selection with: {{text}}',
  'agent.editorInsertAtCursor': 'Insert at cursor: {{text}}',
  'agent.editorGetLine': 'Get line {{line}}',
  'agent.editorSetLine': 'Set line {{line}}',
  'agent.editorGoToLine': 'Go to line {{line}}',
  'agent.editorUndo': 'Undo',
  'agent.editorRedo': 'Redo',
  // Commands API actions
  'agent.executeCommand': 'Execute command: {{commandId}}',
  'agent.listCommands': 'List commands',
  'agent.getCommandInfo': 'Get command info: {{commandId}}',
  // Daily Notes actions
  'agent.openDailyNote': 'Open daily note',
  'agent.createDailyNote': 'Create daily note: {{date}}',
  // Templates actions
  'agent.insertTemplate': 'Insert template: {{templateName}}',
  'agent.listTemplates': 'List templates',
  // Bookmarks actions
  'agent.addBookmark': 'Add bookmark: {{path}}',
  'agent.removeBookmark': 'Remove bookmark: {{path}}',
  'agent.listBookmarks': 'List bookmarks',
  // Canvas API actions
  'agent.canvasCreateTextNode': 'Create text node: {{text}}',
  'agent.canvasCreateFileNode': 'Create file node: {{file}}',
  'agent.canvasCreateLinkNode': 'Create link node: {{url}}',
  'agent.canvasCreateGroup': 'Create group: {{label}}',
  'agent.canvasAddEdge': 'Add edge: {{fromNode}} → {{toNode}}',
  'agent.canvasSelectAll': 'Select all canvas nodes',
  'agent.canvasZoomToFit': 'Zoom to fit canvas',
  // Enhanced Search actions
  'agent.searchByHeading': 'Search by heading: {{heading}}',
  'agent.searchByBlock': 'Search by block ID: {{blockId}}',
  'agent.getAllTags': 'Get all tags',
  'agent.openSearch': 'Open search: {{query}}',
  // Workspace actions
  'agent.openFile': 'Open file: {{path}}',
  'agent.revealInExplorer': 'Reveal in explorer: {{path}}',
  'agent.getActiveFile': 'Get active file info',
  'agent.closeActiveLeaf': 'Close active tab',
  'agent.splitLeaf': 'Split view: {{direction}}',
  // Error messages for new actions
  'error.noActiveEditor': 'No active editor. Open a markdown file first.',
  'error.noActiveCanvas': 'No active canvas. Open a canvas file first.',
  'error.pluginNotEnabled': 'Plugin "{{plugin}}" is not enabled.',
  'error.commandNotFound': 'Command not found: {{commandId}}',
  'error.templateNotFound': 'Template not found: {{templateName}}',
  'error.bookmarkNotFound': 'Bookmark not found: {{path}}',
  'error.canvasNodeNotFound': 'Canvas node not found: {{nodeId}}',
  'error.headingNotFound': 'No notes found with heading: {{heading}}',
  'error.blockNotFound': 'Block not found: {{blockId}}',
  'agent.genericAction': 'Action: {{action}}',
  'agent.progressStarting': 'Starting execution...',
  'agent.progressStatus': 'Executing {{current}}/{{total}}',
  'agent.generatingResponse': 'Generating response...',
  'agent.streamingChars': 'Characters: ',
  'agent.streamingActions': 'Actions detected: ',
  'agent.showRawResponse': '▶ show raw response',
  'agent.hideRawResponse': '▼ hide raw response',
  'agent.warningTitle': 'Agent mode required',
  'agent.warningDescription': 'It looks like you want to create, modify, or organize files in your vault. This requires agent mode to be enabled.',
  'agent.enableAgentMode': 'Enable agent mode',
  'agent.continueAnyway': 'Continue without it',
  'agent.continuing': 'Continuing response...',
  'agent.retryWithJson': 'Retry with JSON format',
  'agent.planningTask': 'Planning complex task...',
  'agent.executingSubtask': 'Executing {{current}}/{{total}}: {{description}}',
  'agent.subtask.preparation': 'Prepare structure',
  'agent.subtask.execution': 'Execute main task',
  'agent.planSummary.header': 'Task completed: {{completed}}/{{total}} subtasks',
  'agent.planSummary.successful': '**successful:**',
  'agent.planSummary.failed': '**failed:**',
  'agent.planningPrompt': `Break down this complex task into subtasks that can each be completed with at most {{maxActions}} actions.

TASK: {{request}}

Estimated total actions needed: {{estimatedActions}}
Maximum subtasks allowed: {{maxSubtasks}}

Respond with JSON:
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "Brief description of what this subtask does",
      "prompt": "Specific instruction to execute this subtask",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": number
}

IMPORTANT:
- Each subtask should be independent or have clear dependencies
- Order subtasks logically (e.g., create folders before creating files in them)
- Keep prompts specific and actionable`,
  'agent.reinforcement.reminder': 'You are in agent mode. Use JSON format for vault actions.',
  'agent.reinforcement.canPerformActions': 'You can create, modify, and delete files in this vault. Do not say you cannot - use the actions system.',
  'agent.reinforcement.useJsonFormat': 'When the user requests vault actions, respond with JSON containing "actions" array.',
  'agent.reinforcement.dontForget': 'Remember: you have full capability to manage this Obsidian vault through the actions system.',
  'agent.reinforcement.recoveryPrompt': `The user asked: "{{message}}"

You are in agent mode and can perform vault actions. Please respond with the appropriate JSON format:
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': 'You are able to create and modify files in this vault. Please provide the actions in JSON format as specified in your instructions.',
  'agent.retryPrompt.missingJson': `You described actions but didn't provide the JSON format. Based on what you said: "{{context}}..."

Please provide the EXACT actions as JSON:
{
  "actions": [{"action": "action-name", "params": {...}}],
  "message": "Description of what will be done",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': 'Your response was cut off. Please continue and complete the JSON structure.',
  'agent.retryPrompt.generic': 'Please provide vault actions in the required JSON format with "actions", "message", and "requiresConfirmation" fields.',
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': 'Agentic loop cancelled by user.',
  'agent.cancelLoop': 'Cancel',
  'agent.allActionsFailed': 'All actions failed. Loop stopped to prevent further errors.',
  'agent.infiniteLoopDetected': 'Infinite loop detected (repeated actions). Operation stopped.',
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': 'Step {{current}} of max {{max}}',
  'agent.loopTokens': '↑{{input}} ↓{{output}}',
  'agent.loopTokenSummary': 'Tokens used: ↑{{input}} input, ↓{{output}} output',
  'agent.loopStep': 'Step {{step}}',
  'agent.loopStepFinal': 'Completed',
  'agent.loopExpandStep': 'Show more...',
  'agent.loopCollapseStep': 'Show less',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': 'The model seems confused about its capabilities. It can perform vault actions in agent mode.',
  'warning.actionClaimsNoJson': 'The response claims to have performed actions but no executable actions were found.',
  'warning.emptyActionsArray': 'The response contains an empty actions array.',
  'warning.incompleteJson': 'The JSON response appears to be incomplete or truncated.',
  'warning.actionMismatch': 'Claimed actions don\'t match provided actions: {{mismatches}}',
  'suggestion.remindAgentMode': 'Try reminding the model that agent mode is active.',
  'suggestion.requestJsonFormat': 'Request the response in proper JSON format.',
  'suggestion.requestContinuation': 'Request the model to continue and complete its response.',
  'validation.valid': 'Response validated successfully.',
  'validation.validWithNotes': 'Response valid with minor notes.',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': 'Advanced agent options',
  'settings.autoContinue.name': 'Auto-continue truncated responses',
  'settings.autoContinue.desc': 'Automatically request continuation when a response appears cut off.',
  'settings.autoPlan.name': 'Auto-plan complex tasks',
  'settings.autoPlan.desc': 'Automatically break down complex tasks into smaller subtasks.',
  'settings.contextReinforce.name': 'Reinforce agent context',
  'settings.contextReinforce.desc': 'Add reminders to prevent the model from forgetting agent mode in long conversations.',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': 'Extract key ideas',
  'template.keyIdeas.desc': 'Identifies and summarizes the main ideas from the content',
  'template.summary.name': 'Executive summary',
  'template.summary.desc': 'Generates a concise summary for quick reading',
  'template.questions.name': 'Identify open questions',
  'template.questions.desc': 'Detects unresolved questions or areas for exploration',
  'template.actions.name': 'Extract actions',
  'template.actions.desc': 'Identifies tasks and actions mentioned in the content',
  'template.concepts.name': 'Concepts and definitions',
  'template.concepts.desc': 'Extracts important terms and their definitions',
  'template.connections.name': 'Connections and relationships',
  'template.connections.desc': 'Identifies relationships between concepts for creating links',

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': `Claude integrated in Obsidian via Claudian (by Enigmora). Use Markdown and wikilinks ([[Note]]) when appropriate. Be concise.`,

  'prompt.chatMode': `Important - agent mode:
If the user asks you to perform actions on the vault (create, move, delete, rename notes or folders, modify content, etc.), and agent mode is not currently enabled, you must inform them:
"To perform actions on your vault, please enable **agent mode** using the toggle in the chat header."
Do not attempt to describe or simulate vault actions without agent mode enabled.`,

  'prompt.noteProcessor': `You are an assistant specialized in knowledge organization for Obsidian. Your task is to analyze notes and suggest improvements to better integrate them into the user's vault.

VAULT CONTEXT:
- Total notes: {{noteCount}}
- Existing notes: {{noteTitles}}
- Existing tags: {{allTags}}

INSTRUCTIONS:
1. Analyze the content of the provided note
2. Suggest relevant tags (preferably from existing ones, but you can propose new ones)
3. Identify concepts that could link to existing notes (wikilinks)
4. Detect atomic concepts that deserve their own note
5. Briefly explain your reasoning

RESPOND ONLY with a valid JSON object with this exact structure:
{
  "tags": ["tag1", "tag2"],
  "wikilinks": [
    {
      "text": "text to convert to link",
      "target": "Target note title",
      "context": "Brief explanation of why to link"
    }
  ],
  "atomicConcepts": [
    {
      "title": "Title for new note",
      "summary": "1-2 sentence summary",
      "content": "Suggested content for the note (in Markdown)"
    }
  ],
  "reasoning": "Brief explanation of your analysis"
}

IMPORTANT:
- Only suggest wikilinks to notes that exist in the vault
- Tags should not include the # symbol
- Atomic concepts should be ideas that deserve their own development
- Keep suggestions relevant and useful, don't fill with unnecessary links`,

  'prompt.templateProcessor': `You are an assistant specialized in analyzing and extracting information from texts.
Respond in a structured and clear manner according to the provided instructions.
{{jsonInstructions}}`,

  'prompt.conceptMapGenerator': `You are an assistant specialized in knowledge analysis and concept map creation.
Your task is to identify concepts, relationships, and cross-cutting themes in sets of notes.
Important: respond only with valid JSON according to the requested format.`,

  'prompt.agentMode': `Obsidian vault assistant. Execute actions via JSON responses.

⚠️ CRITICAL: For folder operations, ALWAYS use list-folder FIRST to get real file names.

ACTIONS ({{maxActions}} max per message):
Files: create-note{path,content,frontmatter?}, read-note{path}, delete-note{path}, rename-note{from,to}, move-note{from,to}, copy-note{from,to}
Folders: create-folder{path}, delete-folder{path}, list-folder{path,recursive?}
Content: append-content{path,content}, prepend-content{path,content}, replace-content{path,content}, update-frontmatter{path,fields}
Search: search-notes{query,field?,folder?}, get-note-info{path}, find-links{target}, search-by-heading{heading,folder?}, search-by-block{blockId}, get-all-tags{}, open-search{query}
Editor: editor-get-content{}, editor-set-content{content}, editor-get-selection{}, editor-replace-selection{text}, editor-insert-at-cursor{text}, editor-get-line{line}, editor-set-line{line,text}, editor-go-to-line{line}, editor-undo{}, editor-redo{}
Commands: execute-command{commandId}, list-commands{filter?}, get-command-info{commandId}
Daily/Templates: open-daily-note{}, create-daily-note{date?}, insert-template{templateName?}, list-templates{}
Bookmarks: add-bookmark{path}, remove-bookmark{path}, list-bookmarks{}
Canvas: canvas-create-text-node{text,x?,y?}, canvas-create-file-node{file,x?,y?}, canvas-create-link-node{url,x?,y?}, canvas-create-group{label?}, canvas-add-edge{fromNode,toNode}, canvas-select-all{}, canvas-zoom-to-fit{}
Workspace: open-file{path,mode?}, reveal-in-explorer{path}, get-active-file{}, close-active-leaf{}, split-leaf{direction}

⚠️ CONTENT RULE: When creating notes, ALWAYS include full content in the "content" param. Never describe content in "message" - put actual text in params.

RESPONSE FORMAT (compact, no extra fields):
{"actions":[{"action":"name","params":{...}}],"message":"Brief desc"}

awaitResults=true: Use when you need results before continuing (list-folder, read-note, search). You'll receive results, then generate next actions.
requiresConfirmation=true: Use for destructive actions (delete, replace-content).

EXAMPLE - Create note with content:
{"actions":[{"action":"create-note","params":{"path":"Notes/topic.md","content":"# Topic\\n\\nFirst paragraph here.\\n\\nSecond paragraph."}}],"message":"Created note"}

EXAMPLE - Copy files (2 steps):
1: {"actions":[{"action":"list-folder","params":{"path":"Src"}},{"action":"create-folder","params":{"path":"Dst"}}],"message":"Listing","awaitResults":true}
2: {"actions":[{"action":"copy-note","params":{"from":"Src/a.md","to":"Dst/a.md"}},{"action":"copy-note","params":{"from":"Src/b.md","to":"Dst/b.md"}}],"message":"Done"}

RULES:
- copy-note preserves exact content; never use read+create for copying
- Include ALL actions in ONE response; minimize API calls
- After list-folder, execute ALL copies in next response (no intermediate steps)
- Paths without leading/trailing slashes
- For conversation without vault actions, respond normally (no JSON)

VAULT: {{noteCount}} notes | Folders: {{folders}} | Tags: {{tags}}`,

  // Haiku-optimized agent prompt (more verbose and explicit)
  'prompt.agentModeHaiku': `You are an Obsidian vault assistant. Your job is to execute actions on the user's vault by responding with JSON.

CRITICAL RULE: For any folder operations, you MUST use list-folder FIRST to see actual file names before copying, moving, or deleting files.

AVAILABLE ACTIONS (maximum {{maxActions}} per message):

FILE OPERATIONS:
- create-note: Create a new note. Parameters: {path: "folder/name.md", content: "full text content", frontmatter?: {key: value}}
  IMPORTANT: Always include complete content in the "content" parameter. Never describe content in "message".
- read-note: Read note content. Parameters: {path: "folder/name.md"}
- delete-note: Delete a note. Parameters: {path: "folder/name.md"}
- rename-note: Rename a note. Parameters: {from: "old/path.md", to: "new/path.md"}
- move-note: Move a note. Parameters: {from: "source/path.md", to: "dest/path.md"}
- copy-note: Copy a note. Parameters: {from: "source/path.md", to: "dest/path.md"}

FOLDER OPERATIONS:
- create-folder: Create a folder. Parameters: {path: "folder/name"}
- delete-folder: Delete a folder. Parameters: {path: "folder/name"}
- list-folder: List folder contents. Parameters: {path: "folder/name", recursive?: boolean}

CONTENT OPERATIONS:
- append-content: Add content to end. Parameters: {path: "file.md", content: "text"}
- prepend-content: Add content to start. Parameters: {path: "file.md", content: "text"}
- replace-content: Replace all content. Parameters: {path: "file.md", content: "text"}
- update-frontmatter: Update YAML frontmatter. Parameters: {path: "file.md", fields: {key: value}}

SEARCH OPERATIONS:
- search-notes: Search notes. Parameters: {query: "text", field?: "title|content|tags", folder?: "path"}
- get-note-info: Get note metadata. Parameters: {path: "file.md"}
- find-links: Find notes linking to target. Parameters: {target: "Note Name"}

RESPONSE FORMAT:
Always respond with a JSON object like this:
{
  "actions": [
    {"action": "action-name", "params": {...}}
  ],
  "message": "Brief description of what will be done"
}

SPECIAL FLAGS:
- Add "awaitResults": true when you need to see action results before continuing (e.g., after list-folder)
- Add "requiresConfirmation": true for destructive actions (delete, replace-content)

EXAMPLE - Create a note with content:
{
  "actions": [
    {"action": "create-note", "params": {"path": "Notes/my-note.md", "content": "# My Note\\n\\nThis is the first paragraph with actual content.\\n\\nThis is another paragraph.", "frontmatter": {"tags": ["example"]}}}
  ],
  "message": "Created note with content"
}

EXAMPLE - Copy all files from Source to Dest folder:
Step 1: First list the source folder and create destination
{
  "actions": [
    {"action": "list-folder", "params": {"path": "Source"}},
    {"action": "create-folder", "params": {"path": "Dest"}}
  ],
  "message": "Listing source folder and creating destination",
  "awaitResults": true
}

Step 2: After receiving the file list, copy each file
{
  "actions": [
    {"action": "copy-note", "params": {"from": "Source/file1.md", "to": "Dest/file1.md"}},
    {"action": "copy-note", "params": {"from": "Source/file2.md", "to": "Dest/file2.md"}}
  ],
  "message": "Copying all files to destination"
}

RULES:
1. Use copy-note to copy files - do NOT use read-note + create-note
2. Include ALL actions in ONE response when possible
3. After list-folder, execute ALL operations in the next response
4. Paths should NOT have leading or trailing slashes
5. For normal conversation (not vault actions), respond without JSON

VAULT CONTEXT:
- Total notes: {{noteCount}}
- Existing folders: {{folders}}
- Existing tags: {{tags}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': '{{count}} tokens',
  'tokens.tooltip': 'Input: {{input}} | Output: {{output}} | Calls: {{calls}}',
  'tokens.modelLabel': 'Model',
  'tokens.inputLabel': 'Input',
  'tokens.outputLabel': 'Output',
  'tokens.callsLabel': 'Calls',
  'tokens.totalLabel': 'Total',
  'tokens.today': 'Today: {{count}}',
  'tokens.week': 'This week: {{count}}',
  'tokens.month': 'This month: {{count}}',
  'tokens.allTime': 'All time: {{count}}',
  'tokens.historyLink': 'Usage history',
  'tokens.historyTitle': 'Token usage history',
  'tokens.sessionTitle': 'Current session',
  'tokens.closeButton': 'Close',
  'tokens.byModelTitle': 'Usage by model',
  'tokens.noModelData': 'No model data recorded yet',
  'status.processing': 'Processing...',
  'status.classifying': 'Classifying task...',
  'status.executingActions': 'Executing actions...',
  'status.waitingResponse': 'Waiting for response...',
  'settings.showTokens.name': 'Show token indicator',
  'settings.showTokens.desc': 'Display token usage in the chat footer.',
  'settings.section.tokenTracking': 'Token tracking',
  'error.quotaExhausted': 'API quota exhausted. Check your usage limits at console.anthropic.com.',
  'error.billingIssue': 'Billing issue detected. Check your account at console.anthropic.com.',
  'error.contentFiltered': 'Response blocked by content filter. Try rephrasing your request or breaking it into smaller tasks.',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': 'Context management',
  'settings.autoContextManagement.name': 'Automatic context management',
  'settings.autoContextManagement.desc': 'Automatically summarize conversation history when it gets long to reduce token usage.',
  'settings.messageSummarizeThreshold.name': 'Summarize after messages',
  'settings.messageSummarizeThreshold.desc': 'Number of messages before triggering automatic summarization (10-50).',
  'settings.maxActiveContextMessages.name': 'Max active messages',
  'settings.maxActiveContextMessages.desc': 'Maximum messages to keep in active context after summarization (20-100).',
  'context.summarizing': 'Summarizing conversation history...',
  'context.summarized': 'Conversation history summarized',
  'context.sessionStarted': 'Context session started',
  'context.sessionEnded': 'Context session ended',
  'context.summaryPrompt': `Summarize the following conversation between a user and an AI assistant. Focus on:
1. Key topics discussed
2. Important decisions or conclusions
3. Any pending tasks or follow-ups
4. Context that would be important for continuing the conversation

Respond in JSON format:
{
  "keyTopics": ["topic1", "topic2"],
  "lastActions": ["action1", "action2"],
  "summary": "Brief summary of the conversation"
}

CONVERSATION:
{{conversation}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': 'Claudian',
  'welcome.developedBy': 'developed by Enigmora',
  'welcome.greeting': 'How can I help you today?',
  'welcome.examplesHeader': 'Examples of what I can do:',
  'welcome.example1': '"what notes do I have about artificial intelligence?"',
  'welcome.example2': '"create a note with a summary of this week\'s meetings"',
  'welcome.example3': '"read my Ideas.md note and suggest wikilinks to related notes"',
  'welcome.example4': '"find all notes with the #project tag and generate a concept map with their connections"',
  'welcome.example5': '"organize my productivity notes into folders by topic and create a linked index"',
  'welcome.agentModeHint': 'Enable agent mode to create, modify and organize notes automatically.',
  // Personalized example templates
  'welcome.template.search': '"What notes do I have about {{topic}}?"',
  'welcome.template.read': '"Read my "{{noteName}}" note and summarize it"',
  'welcome.template.create': '"Create a note with ideas about {{topic}}"',
  'welcome.template.analyze': '"Find notes with the #{{tag}} tag and suggest connections between them"',
  'welcome.template.organize': '"Organize my notes about {{topic}} into folders by subtopic and create an index"'
};

export default translations;
