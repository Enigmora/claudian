/**
 * ContextSessionManager - Manages context sessions and summarization
 *
 * Extracted from chat-view.ts to reduce complexity.
 * Handles context session lifecycle and automatic summarization.
 */

import { t } from './i18n';
import { logger } from './logger';
import type ClaudianPlugin from './main';
import type { ClaudeClient, Message } from './claude-client';

/**
 * Manages context sessions and automatic summarization
 */
export class ContextSessionManager {
  constructor(
    private plugin: ClaudianPlugin,
    private client: ClaudeClient
  ) {}

  /**
   * Initialize context session when chat view opens
   */
  async initialize(): Promise<void> {
    const contextManager = this.plugin.contextManager;
    const settings = this.plugin.settings;

    if (!settings.autoContextManagement || !contextManager) {
      return;
    }

    try {
      // Update thresholds from settings
      contextManager.updateThresholds({
        summarizeThreshold: settings.messageSummarizeThreshold,
        maxMessagesInContext: settings.maxActiveContextMessages
      });

      // Connect context manager to client
      this.client.setContextManager(contextManager, true);

      // Start or resume session
      const existingSessionId = contextManager.getCurrentSessionId();
      if (existingSessionId) {
        await contextManager.resumeSession(existingSessionId);
      } else {
        await contextManager.startSession();
      }

      // Sync existing client history to context manager if needed
      const clientHistory = this.client.getHistory();
      if (clientHistory.length > 0 && !contextManager.isReady()) {
        await contextManager.syncFromHistory(clientHistory);
      }

      logger.debug('Context session initialized');
    } catch (error) {
      logger.error('Failed to initialize context session:', error);
      // Disable context management on error to allow chat to work
      this.client.setContextManager(null, false);
    }
  }

  /**
   * End context session when chat view closes
   */
  async end(): Promise<void> {
    const contextManager = this.plugin.contextManager;

    if (!contextManager) {
      return;
    }

    try {
      // Disconnect from client
      this.client.setContextManager(null, false);

      // Note: We don't end the session here to preserve history across view reopens
      // Session is only ended explicitly by clearing the chat
      logger.debug('Context session paused');
    } catch (error) {
      logger.error('Error ending context session:', error);
    }
  }

  /**
   * Check if summarization is needed and perform it
   * Called before sending messages to the API
   */
  async checkAndSummarize(): Promise<boolean> {
    const settings = this.plugin.settings;

    if (!settings.autoContextManagement) {
      return false;
    }

    try {
      const summarized = await this.client.checkAndSummarize(
        (messages) => this.generateSummary(messages)
      );

      if (summarized) {
        logger.debug('Conversation history summarized');
      }

      return summarized;
    } catch (error) {
      logger.error('Error during summarization:', error);
      return false;
    }
  }

  /**
   * Generate a summary of messages using Claude
   */
  private async generateSummary(messages: Message[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // Format conversation for summarization
      const conversation = messages.map(m =>
        `${m.role.toUpperCase()}: ${m.content}`
      ).join('\n\n');

      const prompt = t('context.summaryPrompt', { conversation });

      // Create a temporary client for summarization
      const tempSettings = { ...this.plugin.settings, maxTokens: 1024 };
      const { ClaudeClient } = require('./claude-client');
      const summaryClient = new ClaudeClient(tempSettings);

      let summary = '';

      summaryClient.sendMessageStream(prompt, {
        onToken: (token: string) => {
          summary += token;
        },
        onComplete: () => {
          resolve(summary);
        },
        onError: (error: Error) => {
          // Fallback to simple summary on error
          const fallback = JSON.stringify({
            keyTopics: [],
            lastActions: [],
            summary: `Previous conversation with ${messages.length} messages.`
          });
          resolve(fallback);
        }
      });
    });
  }
}
