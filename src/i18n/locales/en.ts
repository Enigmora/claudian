import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian - Settings',
  'settings.description': 'Obsidian plugin for Claude AI integration developed by Enigmora. Chat with Claude, process notes for smart tag and wikilink suggestions, and manage your vault with natural language using Agent Mode. Privacy-first: API key stored locally.',
  'settings.language.name': 'Language',
  'settings.language.desc': 'Plugin interface language. "Auto" detects from Obsidian settings.',
  'settings.language.auto': 'Auto (detect from Obsidian)',
  'settings.apiKey.name': 'API Key',
  'settings.apiKey.descPart1': 'Your Anthropic API key. Get your API key at ',
  'settings.apiKey.descPart2': '. Stored locally in your vault.',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'Model',
  'settings.model.desc': 'Select the Claude model to use.',
  'settings.model.sonnet4': 'Claude Sonnet 4 (Recommended)',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku35': 'Claude 3.5 Haiku (Fast)',
  'settings.folder.name': 'Notes folder',
  'settings.folder.desc': 'Folder where notes generated from chat will be saved.',
  'settings.folder.placeholder': 'Claude Notes',
  'settings.maxTokens.name': 'Max tokens',
  'settings.maxTokens.desc': 'Maximum number of tokens in responses (1000-8192).',
  'settings.systemPrompt.name': 'System prompt',
  'settings.systemPrompt.desc': 'Instructions that define Claude\'s behavior. Click "Restore default" to reset.',
  'settings.systemPrompt.placeholder': 'You are an assistant...',
  'settings.systemPrompt.restore': 'Restore default',
  'settings.systemPrompt.restored': 'System prompt restored to default',
  'settings.section.noteProcessing': 'Note Processing',
  'settings.maxNotesContext.name': 'Max notes in context',
  'settings.maxNotesContext.desc': 'Maximum number of note titles to include when processing (10-500).',
  'settings.maxTagsContext.name': 'Max tags in context',
  'settings.maxTagsContext.desc': 'Maximum number of existing tags to include when processing (10-200).',
  'settings.section.agentMode': 'Agent Mode',
  'settings.agentEnabled.name': 'Enable agent mode by default',
  'settings.agentEnabled.desc': 'Agent mode allows Claude to execute actions on your vault.',
  'settings.confirmDestructive.name': 'Confirm destructive actions',
  'settings.confirmDestructive.desc': 'Request confirmation before deleting files or replacing content.',
  'settings.protectedFolders.name': 'Protected folders',
  'settings.protectedFolders.desc': 'Folders the agent cannot modify (comma-separated).',
  'settings.protectedFolders.placeholder': '.obsidian, templates',
  'settings.maxActions.name': 'Max actions per message',
  'settings.maxActions.desc': 'Limit of actions Claude can execute in a single message (1-20).',
  'settings.footer.license': 'Licensed under MIT License',
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'API key not configured. Go to Settings > Claudian.',
  'error.apiKeyInvalid': 'Invalid API key. Check your key in Settings.',
  'error.rateLimit': 'Rate limit exceeded. Try again in a few seconds.',
  'error.connection': 'Connection error. Check your internet connection.',
  'error.unknown': 'Unknown error communicating with Claude.',
  'error.noActiveNote': 'No active markdown note.',
  'error.parseJson': 'No valid JSON found in response.',
  'error.parseResponse': 'Error parsing suggestion JSON.',
  'error.tooManyActions': 'Too many actions ({{count}}). Maximum allowed: {{max}}',

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
  'batch.titleExtraction': 'Batch Processing',
  'batch.titleConceptMap': 'Generate Concept Map',
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
  'agent.createFolder': 'Create folder: {{path}}',
  'agent.deleteFolder': 'Delete folder: {{path}}',
  'agent.listFolder': 'List folder: {{path}}',
  'agent.createNote': 'Create note: {{path}}',
  'agent.readNote': 'Read note: {{path}}',
  'agent.deleteNote': 'Delete note: {{path}}',
  'agent.renameNote': 'Rename: {{from}} → {{to}}',
  'agent.moveNote': 'Move: {{from}} → {{to}}',
  'agent.appendContent': 'Append content to: {{path}}',
  'agent.prependContent': 'Prepend content to: {{path}}',
  'agent.replaceContent': 'Replace content of: {{path}}',
  'agent.updateFrontmatter': 'Update frontmatter: {{path}}',
  'agent.searchNotes': 'Search notes: "{{query}}"',
  'agent.getNoteInfo': 'Get info: {{path}}',
  'agent.findLinks': 'Find links to: {{target}}',
  'agent.genericAction': 'Action: {{action}}',
  'agent.continuing': 'Continuing response...',
  'agent.retryWithJson': 'Retry with JSON format',
  'agent.planningTask': 'Planning complex task...',
  'agent.executingSubtask': 'Executing {{current}}/{{total}}: {{description}}',
  'agent.subtask.preparation': 'Prepare structure',
  'agent.subtask.execution': 'Execute main task',
  'agent.planSummary.header': 'Task completed: {{completed}}/{{total}} subtasks',
  'agent.planSummary.successful': '**Successful:**',
  'agent.planSummary.failed': '**Failed:**',
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
  'agent.reinforcement.reminder': 'You are in AGENT MODE. Use JSON format for vault actions.',
  'agent.reinforcement.canPerformActions': 'You CAN create, modify, and delete files in this vault. Do NOT say you cannot - use the actions system.',
  'agent.reinforcement.useJsonFormat': 'When the user requests vault actions, respond with JSON containing "actions" array.',
  'agent.reinforcement.dontForget': 'Remember: You have full capability to manage this Obsidian vault through the actions system.',
  'agent.reinforcement.recoveryPrompt': `The user asked: "{{message}}"

You are in AGENT MODE and CAN perform vault actions. Please respond with the appropriate JSON format:
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': 'You ARE able to create and modify files in this vault. Please provide the actions in JSON format as specified in your instructions.',
  'agent.retryPrompt.missingJson': `You described actions but didn't provide the JSON format. Based on what you said: "{{context}}..."

Please provide the EXACT actions as JSON:
{
  "actions": [{"action": "action-name", "params": {...}}],
  "message": "Description of what will be done",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': 'Your response was cut off. Please continue and complete the JSON structure.',
  'agent.retryPrompt.generic': 'Please provide vault actions in the required JSON format with "actions", "message", and "requiresConfirmation" fields.',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': 'The model seems confused about its capabilities. It can perform vault actions in Agent Mode.',
  'warning.actionClaimsNoJson': 'The response claims to have performed actions but no executable actions were found.',
  'warning.emptyActionsArray': 'The response contains an empty actions array.',
  'warning.incompleteJson': 'The JSON response appears to be incomplete or truncated.',
  'warning.actionMismatch': 'Claimed actions don\'t match provided actions: {{mismatches}}',
  'suggestion.remindAgentMode': 'Try reminding the model that Agent Mode is active.',
  'suggestion.requestJsonFormat': 'Request the response in proper JSON format.',
  'suggestion.requestContinuation': 'Request the model to continue and complete its response.',
  'validation.valid': 'Response validated successfully.',
  'validation.validWithNotes': 'Response valid with minor notes.',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': 'Advanced Agent Options',
  'settings.autoContinue.name': 'Auto-continue truncated responses',
  'settings.autoContinue.desc': 'Automatically request continuation when a response appears cut off.',
  'settings.autoPlan.name': 'Auto-plan complex tasks',
  'settings.autoPlan.desc': 'Automatically break down complex tasks into smaller subtasks.',
  'settings.contextReinforce.name': 'Reinforce agent context',
  'settings.contextReinforce.desc': 'Add reminders to prevent the model from forgetting Agent Mode in long conversations.',

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
  'prompt.default': `You are Claudian, an intelligent assistant integrated into Obsidian to help organize and manage notes. You were created by Enigmora.

GUIDELINES:
- Respond clearly and in a structured manner, using Markdown format when appropriate
- If asked to create content for a note, include relevant tag suggestions
- Use wikilinks ([[Note Name]]) when referencing concepts that could be separate notes
- Be concise but thorough

IMPORTANT - AGENT MODE:
If the user asks you to perform actions on the vault (create, move, delete, rename notes or folders, modify content, etc.), and Agent Mode is NOT currently enabled, you must inform them:
"To perform actions on your vault, please enable **Agent Mode** using the toggle in the chat header."
Do NOT attempt to describe or simulate vault actions without Agent Mode enabled.`,

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
IMPORTANT: Respond ONLY with valid JSON according to the requested format.`,

  'prompt.agentMode': `You are an assistant that helps manage an Obsidian vault. You can execute actions on files and folders.

CAPABILITIES:
- Create, move, rename, and delete notes and folders
- Read and modify note content
- Search notes by title, content, or tags
- Update frontmatter (YAML)

AVAILABLE ACTIONS:
- create-folder: { path }
- delete-folder: { path }
- list-folder: { path, recursive? }
- create-note: { path, content?, frontmatter? }
- read-note: { path }
- delete-note: { path }
- rename-note: { from, to }
- move-note: { from, to }
- append-content: { path, content }
- prepend-content: { path, content }
- replace-content: { path, content }
- update-frontmatter: { path, fields }
- search-notes: { query, field?, folder? }
- get-note-info: { path }
- find-links: { target }

RESPONSE FORMAT:
When the user requests an action on the vault, respond ONLY with valid JSON:
{
  "thinking": "Your internal reasoning (optional)",
  "actions": [
    { "action": "action-name", "params": { ... }, "description": "Human-readable description" }
  ],
  "message": "Message to the user explaining what you'll do",
  "requiresConfirmation": false
}

IMPORTANT RULES:
1. For destructive actions (delete-note, delete-folder, replace-content), use requiresConfirmation: true
2. Paths should not start or end with /
3. Notes are created with .md extension automatically
4. If unsure about user intent, ask before acting
5. For normal conversation (no vault actions), respond normally WITHOUT JSON format
6. Maximum {{maxActions}} actions per message

VAULT CONTEXT:
- Total notes: {{noteCount}}
- Existing folders: {{folders}}
- Existing tags: {{tags}}
- Some notes: {{noteTitles}}`
};

export default translations;
