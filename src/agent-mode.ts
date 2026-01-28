import { Notice } from 'obsidian';
import ClaudianPlugin from './main';
import { VaultActionExecutor, VaultAction, ActionResult, ProgressCallback } from './vault-actions';
import { VaultIndexer } from './vault-indexer';
import { t } from './i18n';
import { logger } from './logger';
import type { ModelId } from './model-orchestrator';
import { MODELS } from './model-orchestrator';

export interface AgentResponse {
  thinking?: string;
  actions: VaultAction[];
  message: string;
  requiresConfirmation?: boolean;
  awaitResults?: boolean;  // When true, Claude wants to see action results before continuing
}

export interface AgentExecutionResult {
  response: AgentResponse;
  results: ActionResult[];
  summary: string;
}

export class AgentMode {
  private plugin: ClaudianPlugin;
  private executor: VaultActionExecutor;
  private indexer: VaultIndexer;

  constructor(
    plugin: ClaudianPlugin,
    executor: VaultActionExecutor,
    indexer: VaultIndexer
  ) {
    this.plugin = plugin;
    this.executor = executor;
    this.indexer = indexer;
  }

  isAgentResponse(content: string): boolean {
    // Detect if response contains JSON with actions
    const trimmed = content.trim();

    // Quick check first
    if (!trimmed.includes('"actions"') || !trimmed.includes('[')) {
      return false;
    }

    // Try to extract valid JSON
    const jsonObj = this.extractFirstValidJson(content);
    return jsonObj !== null && Array.isArray(jsonObj.actions);
  }

  parseAgentResponse(content: string): AgentResponse | null {
    try {
      // Try to extract and parse the first valid JSON object with "actions"
      const jsonObj = this.extractFirstValidJson(content);
      if (!jsonObj) {
        return null;
      }

      return {
        thinking: jsonObj.thinking,
        actions: Array.isArray(jsonObj.actions) ? jsonObj.actions : [],
        message: jsonObj.message || t('agent.actionsExecuted'),
        requiresConfirmation: jsonObj.requiresConfirmation || false,
        awaitResults: jsonObj.awaitResults || false
      };
    } catch (error) {
      logger.error('Error parsing agent response:', error);
      return null;
    }
  }

  /**
   * Extract the first valid JSON object from a string that may contain
   * multiple JSONs or markdown code blocks with JSON
   */
  private extractFirstValidJson(content: string): any | null {
    // First, try to find JSON in markdown code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (parsed.actions) {
          return parsed;
        }
      } catch {
        // Continue to other methods
      }
    }

    // Check for concatenated JSONs pattern (truncation followed by new response)
    // This happens when: ...truncated content{ "thinking": "new response..."
    const concatenatedPattern = /\}\s*\{\s*"thinking"/g;
    let match;
    while ((match = concatenatedPattern.exec(content)) !== null) {
      // Found potential concatenation point - try to parse the second JSON
      const secondJsonStart = match.index + 1;
      const secondJson = this.extractJsonFromPosition(content, secondJsonStart);
      if (secondJson && secondJson.actions && Array.isArray(secondJson.actions)) {
        logger.debug('Detected concatenated JSONs - using the second (complete) one');
        return secondJson;
      }
    }

    // Try to extract JSON by finding balanced braces
    const startIndex = content.indexOf('{');
    if (startIndex === -1) {
      return null;
    }

    return this.extractJsonFromPosition(content, startIndex);
  }

  /**
   * Extract a JSON object starting from a specific position
   */
  private extractJsonFromPosition(content: string, startIndex: number): any | null {
    // Find the matching closing brace by counting
    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\' && inString) {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            // Found complete JSON object
            const jsonStr = content.substring(startIndex, i + 1);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.actions) {
                return parsed;
              }
            } catch {
              // Invalid JSON, try to find next one
              const remaining = content.substring(i + 1);
              return this.extractFirstValidJson(remaining);
            }
          }
        }
      }
    }

    // If we didn't find a complete JSON, try to recover from truncated one
    if (depth > 0) {
      const truncatedJson = content.substring(startIndex);
      const recovered = this.attemptTruncatedJsonRecovery(truncatedJson);
      if (recovered) {
        return recovered;
      }
    }

    return null;
  }

  /**
   * Attempt to recover a valid response from truncated JSON
   * by extracting complete actions
   */
  private attemptTruncatedJsonRecovery(truncated: string): any | null {
    try {
      // Try to find complete actions within the truncated JSON
      const actionsMatch = truncated.match(/"actions"\s*:\s*\[/);
      if (!actionsMatch) return null;

      const actionsStart = actionsMatch.index! + actionsMatch[0].length;
      const completeActions: any[] = [];

      let depth = 1; // Inside actions array
      let actionStart = actionsStart;
      let inString = false;
      let escapeNext = false;
      let bracketDepth = 0;

      for (let i = actionsStart; i < truncated.length; i++) {
        const char = truncated[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\' && inString) {
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (inString) continue;

        if (char === '{') {
          if (depth === 1 && bracketDepth === 0) {
            actionStart = i;
          }
          depth++;
          bracketDepth++;
        } else if (char === '}') {
          depth--;
          bracketDepth--;
          if (depth === 1 && bracketDepth === 0) {
            // Completed an action object
            const actionStr = truncated.substring(actionStart, i + 1);
            try {
              const action = JSON.parse(actionStr);
              if (action.action && action.params) {
                completeActions.push(action);
              }
            } catch {
              // Skip invalid action
            }
          }
        } else if (char === '[') {
          depth++;
        } else if (char === ']') {
          depth--;
          if (depth === 0) break; // End of actions array
        }
      }

      if (completeActions.length > 0) {
        // Extract thinking if present
        const thinkingMatch = truncated.match(/"thinking"\s*:\s*"([^"]*)"/);
        const thinking = thinkingMatch ? thinkingMatch[1] : '';

        logger.debug(`Recovered ${completeActions.length} complete actions from truncated JSON`);

        return {
          thinking,
          actions: completeActions,
          message: '[Respuesta parcialmente recuperada de JSON truncado]',
          requiresConfirmation: false,
          awaitResults: false
        };
      }
    } catch (e) {
      logger.error('Failed to recover from truncated JSON:', e);
    }

    return null;
  }

  async executeActions(actions: VaultAction[], onProgress?: ProgressCallback): Promise<ActionResult[]> {
    const maxActions = this.plugin.settings.maxActionsPerMessage || 10;

    if (actions.length > maxActions) {
      throw new Error(t('error.tooManyActions', { count: String(actions.length), max: String(maxActions) }));
    }

    return this.executor.executeAll(actions, onProgress);
  }

  hasDestructiveActions(actions: VaultAction[]): boolean {
    return actions.some(action => this.executor.isDestructiveAction(action));
  }

  getDestructiveActions(actions: VaultAction[]): VaultAction[] {
    return actions.filter(action => this.executor.isDestructiveAction(action));
  }

  formatResults(results: ActionResult[]): string {
    const lines: string[] = [];

    for (const result of results) {
      const icon = result.success ? '✓' : '✗';
      const description = result.action.description ||
        this.getActionDescription(result.action);

      if (result.success) {
        lines.push(`${icon} ${description}`);
      } else {
        lines.push(`${icon} ${description}: ${result.error}`);
      }
    }

    return lines.join('\n');
  }

  private getActionDescription(action: VaultAction): string {
    const { params } = action;

    switch (action.action) {
      // Folder actions
      case 'create-folder':
        return t('agent.createFolder', { path: params.path });
      case 'delete-folder':
        return t('agent.deleteFolder', { path: params.path });
      case 'list-folder':
        return t('agent.listFolder', { path: params.path || '/' });

      // Note actions
      case 'create-note':
        return t('agent.createNote', { path: params.path });
      case 'read-note':
        return t('agent.readNote', { path: params.path });
      case 'delete-note':
        return t('agent.deleteNote', { path: params.path });
      case 'rename-note':
        return t('agent.renameNote', { from: params.from, to: params.to });
      case 'move-note':
        return t('agent.moveNote', { from: params.from, to: params.to });
      case 'copy-note':
        return t('agent.copyNote', { from: params.from, to: params.to });

      // Content actions
      case 'append-content':
        return t('agent.appendContent', { path: params.path });
      case 'prepend-content':
        return t('agent.prependContent', { path: params.path });
      case 'replace-content':
        return t('agent.replaceContent', { path: params.path });
      case 'update-frontmatter':
        return t('agent.updateFrontmatter', { path: params.path });

      // Search actions
      case 'search-notes':
        return t('agent.searchNotes', { query: params.query });
      case 'get-note-info':
        return t('agent.getNoteInfo', { path: params.path });
      case 'find-links':
        return t('agent.findLinks', { target: params.target });

      // Editor API actions
      case 'editor-get-content':
        return t('agent.editorGetContent');
      case 'editor-set-content':
        return t('agent.editorSetContent');
      case 'editor-get-selection':
        return t('agent.editorGetSelection');
      case 'editor-replace-selection':
        return t('agent.editorReplaceSelection', { text: params.text?.substring(0, 30) + '...' });
      case 'editor-insert-at-cursor':
        return t('agent.editorInsertAtCursor', { text: params.text?.substring(0, 30) + '...' });
      case 'editor-get-line':
        return t('agent.editorGetLine', { line: params.line });
      case 'editor-set-line':
        return t('agent.editorSetLine', { line: params.line });
      case 'editor-go-to-line':
        return t('agent.editorGoToLine', { line: params.line });
      case 'editor-undo':
        return t('agent.editorUndo');
      case 'editor-redo':
        return t('agent.editorRedo');

      // Commands API actions
      case 'execute-command':
        return t('agent.executeCommand', { commandId: params.commandId });
      case 'list-commands':
        return t('agent.listCommands');
      case 'get-command-info':
        return t('agent.getCommandInfo', { commandId: params.commandId });

      // Daily Notes actions
      case 'open-daily-note':
        return t('agent.openDailyNote');
      case 'create-daily-note':
        return t('agent.createDailyNote', { date: params.date || 'today' });

      // Templates actions
      case 'insert-template':
        return t('agent.insertTemplate', { templateName: params.templateName || 'picker' });
      case 'list-templates':
        return t('agent.listTemplates');

      // Bookmarks actions
      case 'add-bookmark':
        return t('agent.addBookmark', { path: params.path });
      case 'remove-bookmark':
        return t('agent.removeBookmark', { path: params.path });
      case 'list-bookmarks':
        return t('agent.listBookmarks');

      // Canvas API actions
      case 'canvas-create-text-node':
        return t('agent.canvasCreateTextNode', { text: params.text?.substring(0, 30) + '...' });
      case 'canvas-create-file-node':
        return t('agent.canvasCreateFileNode', { file: params.file });
      case 'canvas-create-link-node':
        return t('agent.canvasCreateLinkNode', { url: params.url });
      case 'canvas-create-group':
        return t('agent.canvasCreateGroup', { label: params.label || '' });
      case 'canvas-add-edge':
        return t('agent.canvasAddEdge', { fromNode: params.fromNode, toNode: params.toNode });
      case 'canvas-select-all':
        return t('agent.canvasSelectAll');
      case 'canvas-zoom-to-fit':
        return t('agent.canvasZoomToFit');

      // Enhanced Search actions
      case 'search-by-heading':
        return t('agent.searchByHeading', { heading: params.heading });
      case 'search-by-block':
        return t('agent.searchByBlock', { blockId: params.blockId });
      case 'get-all-tags':
        return t('agent.getAllTags');
      case 'open-search':
        return t('agent.openSearch', { query: params.query });

      // Workspace actions
      case 'open-file':
        return t('agent.openFile', { path: params.path });
      case 'reveal-in-explorer':
        return t('agent.revealInExplorer', { path: params.path });
      case 'get-active-file':
        return t('agent.getActiveFile');
      case 'close-active-leaf':
        return t('agent.closeActiveLeaf');
      case 'split-leaf':
        return t('agent.splitLeaf', { direction: params.direction });

      default:
        return t('agent.genericAction', { action: action.action });
    }
  }

  /**
   * Get the system prompt for agent mode
   * @param model - Optional model ID. Haiku uses a more verbose prompt for better results.
   */
  getSystemPrompt(model?: ModelId): string {
    const vaultContext = this.indexer.getVaultContext();

    // Get folder list
    const folders = new Set<string>();
    this.plugin.app.vault.getMarkdownFiles().forEach(f => {
      if (f.parent && f.parent.path !== '/') {
        folders.add(f.parent.path);
      }
    });
    const folderList = Array.from(folders).slice(0, 30).join(', ') || '(none)';

    // Choose prompt key based on model
    // Haiku needs a more verbose, explicit prompt for better performance
    const promptKey = (model === MODELS.HAIKU) ? 'prompt.agentModeHaiku' : 'prompt.agentMode';

    // Build complete agent prompt: base identity + agent mode + custom instructions
    // NOTE: noteTitles removed from context to prevent confusion - titles don't include paths,
    // so the model would incorrectly assume files are in requested folders.
    // The agent should use list-folder to discover actual file locations.
    const parts = [
      t('prompt.baseIdentity'),
      t(promptKey, {
        maxActions: String(this.plugin.settings.maxActionsPerMessage || 10),
        noteCount: String(vaultContext.noteCount),
        folders: folderList,
        tags: vaultContext.allTags.slice(0, 20).map(tag => '#' + tag).join(', ') || '(none)',
        noteTitles: '(usa list-folder para ver contenido de carpetas)'
      })
    ];

    // Add custom instructions if present
    if (this.plugin.settings.customInstructions?.trim()) {
      parts.push(`\nUSER CUSTOM INSTRUCTIONS:\n${this.plugin.settings.customInstructions.trim()}`);
    }

    return parts.join('\n\n');
  }

  getSummaryMessage(results: ActionResult[], originalMessage: string): string {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    let summary = '';

    if (failed === 0) {
      summary = `${originalMessage}\n\n**${t('agent.actionsExecuted')}:**\n${this.formatResults(results)}`;
    } else if (successful === 0) {
      summary = `${t('agent.noActions')}\n${this.formatResults(results)}`;
    } else {
      summary = `${originalMessage}\n\n**${t('agent.partialSuccess')}**\n${this.formatResults(results)}\n\n⚠️ ${t('agent.actionsFailed', { count: String(failed) })}`;
    }

    return summary;
  }
}
