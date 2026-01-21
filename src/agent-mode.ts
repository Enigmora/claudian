import { Notice } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { VaultActionExecutor, VaultAction, ActionResult, ProgressCallback } from './vault-actions';
import { VaultIndexer } from './vault-indexer';
import { t } from './i18n';

export interface AgentResponse {
  thinking?: string;
  actions: VaultAction[];
  message: string;
  requiresConfirmation?: boolean;
}

export interface AgentExecutionResult {
  response: AgentResponse;
  results: ActionResult[];
  summary: string;
}

export class AgentMode {
  private plugin: ClaudeCompanionPlugin;
  private executor: VaultActionExecutor;
  private indexer: VaultIndexer;

  constructor(
    plugin: ClaudeCompanionPlugin,
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
        requiresConfirmation: jsonObj.requiresConfirmation || false
      };
    } catch (error) {
      console.error('Error parsing agent response:', error);
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

    // Try to extract JSON by finding balanced braces
    const startIndex = content.indexOf('{');
    if (startIndex === -1) {
      return null;
    }

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
      case 'create-folder':
        return t('agent.createFolder', { path: params.path });
      case 'delete-folder':
        return t('agent.deleteFolder', { path: params.path });
      case 'list-folder':
        return t('agent.listFolder', { path: params.path || '/' });
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
      case 'append-content':
        return t('agent.appendContent', { path: params.path });
      case 'prepend-content':
        return t('agent.prependContent', { path: params.path });
      case 'replace-content':
        return t('agent.replaceContent', { path: params.path });
      case 'update-frontmatter':
        return t('agent.updateFrontmatter', { path: params.path });
      case 'search-notes':
        return t('agent.searchNotes', { query: params.query });
      case 'get-note-info':
        return t('agent.getNoteInfo', { path: params.path });
      case 'find-links':
        return t('agent.findLinks', { target: params.target });
      default:
        return t('agent.genericAction', { action: action.action });
    }
  }

  getSystemPrompt(): string {
    const vaultContext = this.indexer.getVaultContext();

    // Get folder list
    const folders = new Set<string>();
    this.plugin.app.vault.getMarkdownFiles().forEach(f => {
      if (f.parent && f.parent.path !== '/') {
        folders.add(f.parent.path);
      }
    });
    const folderList = Array.from(folders).slice(0, 30).join(', ') || '(none)';

    return t('prompt.agentMode', {
      maxActions: String(this.plugin.settings.maxActionsPerMessage || 10),
      noteCount: String(vaultContext.noteCount),
      folders: folderList,
      tags: vaultContext.allTags.slice(0, 20).map(tag => '#' + tag).join(', ') || '(none)',
      noteTitles: vaultContext.noteTitles.slice(0, 15).join(', ')
    });
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
