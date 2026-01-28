/**
 * AgentLoopManager - Manages agentic loop state and helper methods
 *
 * Extracted from chat-view.ts to reduce complexity.
 * Handles loop state, action hashing, result formatting, and step history.
 */

import { t } from './i18n';
import type { VaultAction, ActionResult } from './vault-actions';
import type { TokenUsage } from './token-tracker';

/**
 * Manages agentic loop state and provides helper methods
 */
export class AgentLoopManager {
  private agentLoopActive: boolean = false;
  private agentLoopHistory: string[] = [];
  private agentLoopCancelled: boolean = false;
  private agentLoopTokens: { input: number; output: number } = { input: 0, output: 0 };
  private agentLoopContainer: HTMLElement | null = null;

  readonly MAX_LOOP_COUNT: number = 5;

  /**
   * Check if loop is currently active
   */
  isActive(): boolean {
    return this.agentLoopActive;
  }

  /**
   * Check if loop was cancelled
   */
  isCancelled(): boolean {
    return this.agentLoopCancelled;
  }

  /**
   * Cancel the current loop
   */
  cancel(): void {
    this.agentLoopCancelled = true;
  }

  /**
   * Get the current loop container
   */
  getContainer(): HTMLElement | null {
    return this.agentLoopContainer;
  }

  /**
   * Set the loop container
   */
  setContainer(container: HTMLElement | null): void {
    this.agentLoopContainer = container;
  }

  /**
   * Get current token counts
   */
  getTokens(): { input: number; output: number } {
    return { ...this.agentLoopTokens };
  }

  /**
   * Add tokens to the running total
   */
  addTokens(usage: TokenUsage): void {
    this.agentLoopTokens.input += usage.inputTokens;
    this.agentLoopTokens.output += usage.outputTokens;
  }

  /**
   * Get the action history hashes
   */
  getHistory(): string[] {
    return [...this.agentLoopHistory];
  }

  /**
   * Add a hash to the history
   */
  addToHistory(hash: string): void {
    this.agentLoopHistory.push(hash);
  }

  /**
   * Check if a hash already exists in history (infinite loop detection)
   */
  hasInHistory(hash: string): boolean {
    return this.agentLoopHistory.includes(hash);
  }

  /**
   * Start a new agentic loop session
   */
  start(): void {
    this.agentLoopActive = true;
    this.agentLoopHistory = [];
    this.agentLoopCancelled = false;
    this.agentLoopTokens = { input: 0, output: 0 };
    this.agentLoopContainer = null;
  }

  /**
   * End the agentic loop and reset state
   * Returns token summary if tokens were tracked
   */
  end(): { input: number; output: number } | null {
    const hadTokens = this.agentLoopTokens.input > 0 || this.agentLoopTokens.output > 0;
    const tokenSummary = hadTokens ? { ...this.agentLoopTokens } : null;

    this.agentLoopActive = false;
    this.agentLoopHistory = [];
    this.agentLoopCancelled = false;
    this.agentLoopTokens = { input: 0, output: 0 };
    this.agentLoopContainer = null;

    return tokenSummary;
  }

  /**
   * Generate a hash of actions to detect repeated loops
   */
  hashActions(actions: VaultAction[]): string {
    return actions.map(a => `${a.action}:${JSON.stringify(a.params)}`).sort().join('|');
  }

  /**
   * Format token count for display
   */
  formatTokenCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return String(count);
  }

  /**
   * Format action results for sending back to Claude in the agentic loop
   * This allows Claude to see what happened and continue with informed decisions
   */
  formatResultsForAgent(results: ActionResult[], getActionDescription: (action: VaultAction) => string): string {
    const formattedResults = results.map(r => {
      const actionDesc = getActionDescription(r.action);
      if (r.success) {
        // Format the result data appropriately
        let resultStr = '';
        if (r.result !== undefined && r.result !== null) {
          if (Array.isArray(r.result)) {
            // For list-folder and similar actions that return arrays
            resultStr = `\n  Resultado: ${JSON.stringify(r.result, null, 2)}`;
          } else if (typeof r.result === 'object') {
            resultStr = `\n  Resultado: ${JSON.stringify(r.result, null, 2)}`;
          } else if (typeof r.result === 'string' && r.result.length > 200) {
            // Truncate long content (like read-note)
            resultStr = `\n  Resultado: "${r.result.substring(0, 200)}..." (${r.result.length} caracteres)`;
          } else if (r.result !== true && (typeof r.result === 'string' || typeof r.result === 'number' || typeof r.result === 'boolean')) {
            resultStr = `\n  Resultado: ${r.result}`;
          }
        }
        return `✓ ${actionDesc}${resultStr}`;
      } else {
        return `✗ ${actionDesc}\n  Error: ${r.error}`;
      }
    }).join('\n\n');

    return `[RESULTADOS]\n${formattedResults}\n\nContinúa o finaliza.`;
  }

  /**
   * Add a step to the visual loop history
   */
  addLoopStepToHistory(
    stepNumber: number,
    message: string,
    results: ActionResult[],
    isFinal: boolean = false,
    scrollToBottom: () => void
  ): void {
    if (!this.agentLoopContainer) return;

    const stepEl = this.agentLoopContainer.createDiv({
      cls: `agent-loop-step ${isFinal ? 'final' : ''}`
    });

    // Step header with number and status
    const headerEl = stepEl.createDiv({ cls: 'agent-loop-step-header' });
    const stepBadge = headerEl.createSpan({ cls: 'step-badge' });
    stepBadge.setText(isFinal ? '✓' : String(stepNumber));

    const stepTitle = headerEl.createSpan({ cls: 'step-title' });
    stepTitle.setText(isFinal ? t('agent.loopStepFinal') : t('agent.loopStep', { step: String(stepNumber) }));

    // Action summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (results.length > 0) {
      const statsEl = headerEl.createSpan({ cls: 'step-stats' });
      if (failCount === 0) {
        statsEl.addClass('all-success');
        statsEl.setText(`${successCount} ✓`);
      } else {
        statsEl.addClass('has-errors');
        statsEl.setText(`${successCount} ✓ / ${failCount} ✗`);
      }
    }

    // Message content (collapsible for intermediate steps)
    const contentEl = stepEl.createDiv({ cls: 'agent-loop-step-content' });

    // Show a truncated version of the message
    const truncatedMessage = message.length > 150
      ? message.substring(0, 150) + '...'
      : message;
    contentEl.setText(truncatedMessage);

    // If message is long, add expand toggle
    if (message.length > 150) {
      const expandToggle = stepEl.createDiv({ cls: 'step-expand-toggle' });
      expandToggle.setText(t('agent.loopExpandStep'));
      let expanded = false;
      expandToggle.onclick = () => {
        expanded = !expanded;
        contentEl.setText(expanded ? message : truncatedMessage);
        expandToggle.setText(expanded ? t('agent.loopCollapseStep') : t('agent.loopExpandStep'));
      };
    }

    scrollToBottom();
  }

  /**
   * Show token summary in container if tokens were tracked
   */
  showTokenSummary(): void {
    if (this.agentLoopContainer && (this.agentLoopTokens.input > 0 || this.agentLoopTokens.output > 0)) {
      const tokenSummary = this.agentLoopContainer.createDiv({ cls: 'agent-loop-token-summary' });
      tokenSummary.setText(t('agent.loopTokenSummary', {
        input: this.formatTokenCount(this.agentLoopTokens.input),
        output: this.formatTokenCount(this.agentLoopTokens.output)
      }));
    }
  }
}
