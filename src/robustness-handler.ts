/**
 * RobustnessHandler - Handles truncation recovery and validation retries
 *
 * Extracted from chat-view.ts to reduce complexity.
 * Manages auto-continue on truncation and validation retry logic.
 */

import { MarkdownRenderer, App, Component } from 'obsidian';
import { t } from './i18n';
import type { ClaudeClient } from './claude-client';
import type { AgentMode, AgentResponse } from './agent-mode';
import type { ContextManager } from './context-manager';
import type { ClaudianSettings } from './settings';
import type { TokenUsage } from './token-tracker';
import type { ModelId, RouteResult } from './model-orchestrator';
import type { StreamingUIManager } from './streaming-ui-manager';
import { TruncationDetector, TruncationDetectionResult } from './truncation-detector';
import { ResponseValidator, ValidationResult } from './response-validator';

/**
 * Callbacks for UI interactions during robustness handling
 */
export interface RobustnessCallbacks {
  trackTokenUsage: (usage: TokenUsage) => void;
  scrollToBottom: () => void;
  resetButton: () => void;
  getRouteResult: () => RouteResult | null;
  handleAgentResponse: (response: string, responseEl: HTMLElement, contentEl: HTMLElement) => Promise<void>;
  addMessageActions: (responseEl: HTMLElement, content: string) => void;
  createStreamingIndicator: (container: HTMLElement) => HTMLElement;
  updateStreamingIndicator: (indicator: HTMLElement | null, response: string) => void;
}

/**
 * Handles truncation recovery and validation retries for robust agent responses
 */
export class RobustnessHandler {
  private autoContinueCount: number = 0;
  private currentPartialId: string | null = null;
  readonly MAX_AUTO_CONTINUES: number = 5;

  constructor(
    private app: App,
    private client: ClaudeClient,
    private agentMode: AgentMode,
    private getContextManager: () => ContextManager | null,
    private settings: ClaudianSettings
  ) {}

  /**
   * Get current auto-continue count
   */
  getAutoContinueCount(): number {
    return this.autoContinueCount;
  }

  /**
   * Increment auto-continue count
   */
  incrementAutoContinueCount(): void {
    this.autoContinueCount++;
  }

  /**
   * Reset counters after successful completion or error
   */
  resetCounters(): void {
    this.autoContinueCount = 0;
    this.currentPartialId = null;
  }

  /**
   * Delay helper to avoid rate limits
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle truncated response with auto-continue
   * Uses context manager to persist partial responses
   */
  async handleTruncatedResponse(
    partialResponse: string,
    truncationResult: TruncationDetectionResult,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    callbacks: RobustnessCallbacks,
    component: Component
  ): Promise<void> {
    const contextManager = this.getContextManager();

    // Save partial response to temp storage on first truncation
    if (!this.currentPartialId && contextManager) {
      this.currentPartialId = await contextManager.savePartialResponse(partialResponse);
    } else if (this.currentPartialId && contextManager) {
      // Append to existing partial
      await contextManager.appendToPartialResponse(this.currentPartialId, '');
    }

    // Show continuation indicator with attempt number
    const indicator = contentEl.createDiv({ cls: 'claudian-auto-continue' });
    indicator.setText(`${t('agent.continuing')} (${this.autoContinueCount}/${this.MAX_AUTO_CONTINUES})`);

    // Add delay to avoid rate limits (increases with each retry)
    const delayMs = 2000 * this.autoContinueCount;
    await this.delay(delayMs);

    // Generate continuation prompt
    const continuePrompt = truncationResult.suggestedContinuation || t('agent.retryWithJson');

    // Create new cursor for continuation
    const cursorEl = contentEl.createSpan({ cls: 'claudian-cursor' });

    let continuationResponse = '';
    // Use the model from the last route result (if available)
    const selectedModel = callbacks.getRouteResult()?.model;
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel);

    // Show indicator for entire streaming duration
    cursorEl.remove();
    contentEl.empty();
    const streamingIndicator = callbacks.createStreamingIndicator(contentEl);

    await this.client.sendAgentMessageStream(continuePrompt, agentSystemPrompt, {
      onStart: () => {},
      onUsage: (usage) => {
        callbacks.trackTokenUsage(usage);
      },
      onToken: (token) => {
        continuationResponse += token;
        callbacks.updateStreamingIndicator(streamingIndicator, continuationResponse);
        callbacks.scrollToBottom();
      },
      onComplete: async (response) => {
        cursorEl.remove();
        indicator.remove();

        // Merge and process complete response
        const fullResponse = TruncationDetector.mergeResponses(partialResponse, response);
        contentEl.empty();

        // Update partial in storage
        if (this.currentPartialId && contextManager) {
          await contextManager.appendToPartialResponse(this.currentPartialId, response);
        }

        // Check if still truncated
        const newTruncation = TruncationDetector.detect({
          response: fullResponse,
          isAgentMode: true,
          history: this.client.getHistory()
        });

        if (newTruncation.isTruncated && this.autoContinueCount < this.MAX_AUTO_CONTINUES) {
          this.autoContinueCount++;
          await this.handleTruncatedResponse(fullResponse, newTruncation, responseEl, contentEl, callbacks, component);
          return;
        }

        // Complete partial and clean up
        if (this.currentPartialId && contextManager) {
          try {
            await contextManager.completePartialResponse(this.currentPartialId);
          } finally {
            this.currentPartialId = null;
          }
        }

        // Process complete response
        if (this.agentMode.isAgentResponse(fullResponse)) {
          await callbacks.handleAgentResponse(fullResponse, responseEl, contentEl);
        } else {
          MarkdownRenderer.render(this.app, fullResponse, contentEl, '', component);
          callbacks.addMessageActions(responseEl, fullResponse);
        }

        this.autoContinueCount = 0;
        callbacks.resetButton();
        callbacks.scrollToBottom();
      },
      onError: async (error) => {
        cursorEl.remove();

        // Clean up partial on error
        if (this.currentPartialId && contextManager) {
          try {
            await contextManager.completePartialResponse(this.currentPartialId);
          } finally {
            this.currentPartialId = null;
          }
        }

        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });
        this.autoContinueCount = 0;
        callbacks.resetButton();
      }
    }, selectedModel);
  }

  /**
   * Handle validation retry when model shows confusion
   */
  async handleValidationRetry(
    originalResponse: string,
    validation: ValidationResult,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    callbacks: RobustnessCallbacks,
    component: Component
  ): Promise<void> {
    // Show retry indicator
    const indicator = contentEl.createDiv({ cls: 'claudian-validation-retry' });
    indicator.setText(`${t('agent.retryWithJson')} (${this.autoContinueCount}/${this.MAX_AUTO_CONTINUES})`);

    // Add delay to avoid rate limits
    const delayMs = 2000 * this.autoContinueCount;
    await this.delay(delayMs);

    // Generate retry prompt
    const retryPrompt = ResponseValidator.generateRetryPrompt(originalResponse, validation);

    // Create cursor for retry response
    const cursorEl = contentEl.createSpan({ cls: 'claudian-cursor' });

    let retryResponse = '';
    // Use the model from the last route result (if available)
    const selectedModel = callbacks.getRouteResult()?.model;
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel) +
      '\n\n' + t('agent.reinforcement.reminder');

    // Show indicator for entire streaming duration
    cursorEl.remove();
    contentEl.empty();
    const streamingIndicator = callbacks.createStreamingIndicator(contentEl);

    await this.client.sendAgentMessageStream(retryPrompt, agentSystemPrompt, {
      onStart: () => {},
      onUsage: (usage) => {
        callbacks.trackTokenUsage(usage);
      },
      onToken: (token) => {
        retryResponse += token;
        callbacks.updateStreamingIndicator(streamingIndicator, retryResponse);
        callbacks.scrollToBottom();
      },
      onComplete: async (response) => {
        cursorEl.remove();
        indicator.remove();
        contentEl.empty();

        // Validate retry response
        const retryParsed = this.agentMode.parseAgentResponse(response);
        const retryValidation = ResponseValidator.validate(response, retryParsed);

        if (!retryValidation.isValid && ResponseValidator.shouldRetry(retryValidation) &&
            this.autoContinueCount < this.MAX_AUTO_CONTINUES) {
          this.autoContinueCount++;
          await this.handleValidationRetry(response, retryValidation, responseEl, contentEl, callbacks, component);
          return;
        }

        // Process response
        if (this.agentMode.isAgentResponse(response)) {
          await callbacks.handleAgentResponse(response, responseEl, contentEl);
        } else {
          MarkdownRenderer.render(this.app, response, contentEl, '', component);
          callbacks.addMessageActions(responseEl, response);
        }

        this.autoContinueCount = 0;
        callbacks.resetButton();
        callbacks.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.empty();
        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });
        this.autoContinueCount = 0;
        callbacks.resetButton();
      }
    }, selectedModel);
  }
}
