/**
 * Supported locales for Claudian
 * Phase 1: en, es
 * Phase 2: zh, de (planned)
 * Phase 3: fr, ja (planned)
 */
export type Locale = 'en' | 'es';

/**
 * Translation dictionary type
 */
export type Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': string;
  'settings.description': string;
  'settings.language.name': string;
  'settings.language.desc': string;
  'settings.language.auto': string;
  'settings.apiKey.name': string;
  'settings.apiKey.descPart1': string;
  'settings.apiKey.descPart2': string;
  'settings.apiKey.placeholder': string;
  'settings.model.name': string;
  'settings.model.desc': string;
  'settings.model.sonnet4': string;
  'settings.model.opus4': string;
  'settings.model.sonnet35': string;
  'settings.model.haiku45': string;
  // Execution Mode (Model Orchestrator)
  'settings.executionMode.name': string;
  'settings.executionMode.desc': string;
  'settings.executionMode.automatic': string;
  'settings.executionMode.automaticDesc': string;
  'settings.executionMode.economic': string;
  'settings.executionMode.economicDesc': string;
  'settings.executionMode.maxQuality': string;
  'settings.executionMode.maxQualityDesc': string;
  'settings.executionMode.currentModel': string;
  'settings.folder.name': string;
  'settings.folder.desc': string;
  'settings.folder.placeholder': string;
  'settings.maxTokens.name': string;
  'settings.maxTokens.desc': string;
  'settings.customInstructions.name': string;
  'settings.customInstructions.desc': string;
  'settings.customInstructions.placeholder': string;
  'settings.customInstructions.clear': string;
  'settings.customInstructions.cleared': string;
  'settings.section.noteProcessing': string;
  'settings.maxNotesContext.name': string;
  'settings.maxNotesContext.desc': string;
  'settings.maxTagsContext.name': string;
  'settings.maxTagsContext.desc': string;
  'settings.section.agentMode': string;
  'settings.agentEnabled.name': string;
  'settings.agentEnabled.desc': string;
  'settings.confirmDestructive.name': string;
  'settings.confirmDestructive.desc': string;
  'settings.protectedFolders.name': string;
  'settings.protectedFolders.desc': string;
  'settings.protectedFolders.placeholder': string;
  'settings.maxActions.name': string;
  'settings.maxActions.desc': string;
  'settings.footer.license': string;
  'settings.footer.developedBy': string;
  'settings.footer.sourceCode': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': string;
  'chat.send': string;
  'chat.clearLabel': string;
  'chat.cleared': string;
  'chat.agentLabel': string;
  'chat.agentEnabled': string;
  'chat.agentDisabled': string;
  'chat.copyLabel': string;
  'chat.copied': string;
  'chat.createNoteLabel': string;
  'chat.actionsExecuted': string;
  'chat.actionsPartial': string;
  'chat.actionsCancelled': string;
  'chat.error': string;
  'chat.errorUnknown': string;
  'chat.stop': string;
  'chat.streamStopped': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': string;
  'error.apiKeyInvalid': string;
  'error.rateLimit': string;
  'error.connection': string;
  'error.unknown': string;
  'error.noActiveNote': string;
  'error.parseJson': string;
  'error.parseResponse': string;
  'error.tooManyActions': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': string;
  'noteCreator.preview': string;
  'noteCreator.titleField.name': string;
  'noteCreator.titleField.desc': string;
  'noteCreator.tags.name': string;
  'noteCreator.tags.desc': string;
  'noteCreator.tags.placeholder': string;
  'noteCreator.folder.name': string;
  'noteCreator.folder.desc': string;
  'noteCreator.cancel': string;
  'noteCreator.create': string;
  'noteCreator.titleRequired': string;
  'noteCreator.fileExists': string;
  'noteCreator.created': string;
  'noteCreator.error': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': string;
  'batch.titleConceptMap': string;
  'batch.selectNotes': string;
  'batch.selectFolder': string;
  'batch.selectAll': string;
  'batch.clear': string;
  'batch.counter': string;
  'batch.noNotes': string;
  'batch.rootFolder': string;
  'batch.selectTemplate': string;
  'batch.mapOptions': string;
  'batch.mapTitle': string;
  'batch.mapTitlePlaceholder': string;
  'batch.cancel': string;
  'batch.processNotes': string;
  'batch.generateMap': string;
  'batch.selectAtLeastOne': string;
  'batch.selectTemplateRequired': string;
  'batch.starting': string;
  'batch.processing': string;
  'batch.completed': string;
  'batch.savedTo': string;
  'batch.analyzing': string;
  'batch.saving': string;
  'batch.mapGenerated': string;
  'batch.errorProcessing': string;
  'batch.errorGenerating': string;
  'batch.folderPrompt': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': string;
  'confirmation.description': string;
  'confirmation.warning': string;
  'confirmation.cancel': string;
  'confirmation.confirm': string;
  'confirmation.deleteNote': string;
  'confirmation.deleteFolder': string;
  'confirmation.replaceContent': string;
  'confirmation.overwriteNote': string;
  'confirmation.moveNote': string;
  'confirmation.renameNote': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': string;
  'suggestions.tags': string;
  'suggestions.tagsEmpty': string;
  'suggestions.selectAll': string;
  'suggestions.applySelected': string;
  'suggestions.wikilinks': string;
  'suggestions.wikilinksEmpty': string;
  'suggestions.badgeExists': string;
  'suggestions.badgeNew': string;
  'suggestions.selectExisting': string;
  'suggestions.insertSelected': string;
  'suggestions.atomicConcepts': string;
  'suggestions.atomicConceptsEmpty': string;
  'suggestions.viewContent': string;
  'suggestions.createNote': string;
  'suggestions.noteCreated': string;
  'suggestions.tagsApplied': string;
  'suggestions.wikilinksInserted': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': string;
  'command.processNote': string;
  'command.batchProcess': string;
  'command.generateMap': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': string;
  'processor.analyzing': string;
  'processor.processing': string;
  'processor.relatedLinks': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': string;
  'agent.noActions': string;
  'agent.actionsFailed': string;
  'agent.partialSuccess': string;
  'agent.loopLimitReached': string;
  'agent.processingResults': string;
  'agent.createFolder': string;
  'agent.deleteFolder': string;
  'agent.listFolder': string;
  'agent.createNote': string;
  'agent.readNote': string;
  'agent.deleteNote': string;
  'agent.renameNote': string;
  'agent.moveNote': string;
  'agent.copyNote': string;
  'agent.appendContent': string;
  'agent.prependContent': string;
  'agent.replaceContent': string;
  'agent.updateFrontmatter': string;
  'agent.searchNotes': string;
  'agent.getNoteInfo': string;
  'agent.findLinks': string;
  // Editor API actions
  'agent.editorGetContent': string;
  'agent.editorSetContent': string;
  'agent.editorGetSelection': string;
  'agent.editorReplaceSelection': string;
  'agent.editorInsertAtCursor': string;
  'agent.editorGetLine': string;
  'agent.editorSetLine': string;
  'agent.editorGoToLine': string;
  'agent.editorUndo': string;
  'agent.editorRedo': string;
  // Commands API actions
  'agent.executeCommand': string;
  'agent.listCommands': string;
  'agent.getCommandInfo': string;
  // Daily Notes actions
  'agent.openDailyNote': string;
  'agent.createDailyNote': string;
  // Templates actions
  'agent.insertTemplate': string;
  'agent.listTemplates': string;
  // Bookmarks actions
  'agent.addBookmark': string;
  'agent.removeBookmark': string;
  'agent.listBookmarks': string;
  // Canvas API actions
  'agent.canvasCreateTextNode': string;
  'agent.canvasCreateFileNode': string;
  'agent.canvasCreateLinkNode': string;
  'agent.canvasCreateGroup': string;
  'agent.canvasAddEdge': string;
  'agent.canvasSelectAll': string;
  'agent.canvasZoomToFit': string;
  // Enhanced Search actions
  'agent.searchByHeading': string;
  'agent.searchByBlock': string;
  'agent.getAllTags': string;
  'agent.openSearch': string;
  // Workspace actions
  'agent.openFile': string;
  'agent.revealInExplorer': string;
  'agent.getActiveFile': string;
  'agent.closeActiveLeaf': string;
  'agent.splitLeaf': string;
  // Error messages for new actions
  'error.noActiveEditor': string;
  'error.noActiveCanvas': string;
  'error.pluginNotEnabled': string;
  'error.commandNotFound': string;
  'error.templateNotFound': string;
  'error.bookmarkNotFound': string;
  'error.canvasNodeNotFound': string;
  'error.headingNotFound': string;
  'error.blockNotFound': string;
  'agent.genericAction': string;
  'agent.progressStarting': string;
  'agent.progressStatus': string;
  'agent.generatingResponse': string;
  'agent.streamingChars': string;
  'agent.streamingActions': string;
  'agent.showRawResponse': string;
  'agent.hideRawResponse': string;
  'agent.warningTitle': string;
  'agent.warningDescription': string;
  'agent.enableAgentMode': string;
  'agent.continueAnyway': string;
  'agent.continuing': string;
  'agent.retryWithJson': string;
  'agent.planningTask': string;
  'agent.executingSubtask': string;
  'agent.subtask.preparation': string;
  'agent.subtask.execution': string;
  'agent.planSummary.header': string;
  'agent.planSummary.successful': string;
  'agent.planSummary.failed': string;
  'agent.planningPrompt': string;
  'agent.reinforcement.reminder': string;
  'agent.reinforcement.canPerformActions': string;
  'agent.reinforcement.useJsonFormat': string;
  'agent.reinforcement.dontForget': string;
  'agent.reinforcement.recoveryPrompt': string;
  'agent.retryPrompt.confusion': string;
  'agent.retryPrompt.missingJson': string;
  'agent.retryPrompt.incompleteJson': string;
  'agent.retryPrompt.generic': string;
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': string;
  'agent.cancelLoop': string;
  'agent.allActionsFailed': string;
  'agent.infiniteLoopDetected': string;
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': string;
  'agent.loopTokens': string;
  'agent.loopTokenSummary': string;
  'agent.loopStep': string;
  'agent.loopStepFinal': string;
  'agent.loopExpandStep': string;
  'agent.loopCollapseStep': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': string;
  'warning.actionClaimsNoJson': string;
  'warning.emptyActionsArray': string;
  'warning.incompleteJson': string;
  'warning.actionMismatch': string;
  'suggestion.remindAgentMode': string;
  'suggestion.requestJsonFormat': string;
  'suggestion.requestContinuation': string;
  'validation.valid': string;
  'validation.validWithNotes': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': string;
  'settings.autoContinue.name': string;
  'settings.autoContinue.desc': string;
  'settings.autoPlan.name': string;
  'settings.autoPlan.desc': string;
  'settings.contextReinforce.name': string;
  'settings.contextReinforce.desc': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': string;
  'template.keyIdeas.desc': string;
  'template.summary.name': string;
  'template.summary.desc': string;
  'template.questions.name': string;
  'template.questions.desc': string;
  'template.actions.name': string;
  'template.actions.desc': string;
  'template.concepts.name': string;
  'template.concepts.desc': string;
  'template.connections.name': string;
  'template.connections.desc': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': string;
  'prompt.chatMode': string;
  'prompt.noteProcessor': string;
  'prompt.templateProcessor': string;
  'prompt.conceptMapGenerator': string;
  'prompt.agentMode': string;
  'prompt.agentModeHaiku': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': string;
  'tokens.tooltip': string;
  'tokens.modelLabel': string;
  'tokens.inputLabel': string;
  'tokens.outputLabel': string;
  'tokens.callsLabel': string;
  'tokens.totalLabel': string;
  'tokens.today': string;
  'tokens.week': string;
  'tokens.month': string;
  'tokens.allTime': string;
  'tokens.historyLink': string;
  'tokens.historyTitle': string;
  'tokens.sessionTitle': string;
  'tokens.closeButton': string;
  'tokens.byModelTitle': string;
  'tokens.noModelData': string;
  'status.processing': string;
  'status.classifying': string;
  'status.executingActions': string;
  'status.waitingResponse': string;
  'settings.showTokens.name': string;
  'settings.showTokens.desc': string;
  'settings.section.tokenTracking': string;
  'error.quotaExhausted': string;
  'error.billingIssue': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': string;
  'settings.autoContextManagement.name': string;
  'settings.autoContextManagement.desc': string;
  'settings.messageSummarizeThreshold.name': string;
  'settings.messageSummarizeThreshold.desc': string;
  'settings.maxActiveContextMessages.name': string;
  'settings.maxActiveContextMessages.desc': string;
  'context.summarizing': string;
  'context.summarized': string;
  'context.sessionStarted': string;
  'context.sessionEnded': string;
  'context.summaryPrompt': string;

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': string;
  'welcome.developedBy': string;
  'welcome.greeting': string;
  'welcome.examplesHeader': string;
  'welcome.example1': string;
  'welcome.example2': string;
  'welcome.example3': string;
  'welcome.example4': string;
  'welcome.example5': string;
  'welcome.agentModeHint': string;
};

/**
 * Translation key type for type-safe access
 */
export type TranslationKey = keyof Translations;
