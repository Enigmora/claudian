import Anthropic from '@anthropic-ai/sdk';
import { ClaudeCompanionSettings } from './settings';
import { VaultContext } from './vault-indexer';
import { ExtractionTemplate } from './extraction-templates';
import { t } from './i18n';
import type { TokenUsage, UsageMethod } from './token-tracker';
import type { ContextManager } from './context-manager';
import type { ModelId } from './model-orchestrator';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
  onUsage?: (usage: TokenUsage) => void;
}

export interface AtomicConcept {
  title: string;
  summary: string;
  content: string;
}

export interface WikilinkSuggestion {
  text: string;
  target: string;
  context: string;
}

export interface NoteSuggestions {
  tags: string[];
  wikilinks: WikilinkSuggestion[];
  atomicConcepts: AtomicConcept[];
  reasoning: string;
}

export class ClaudeClient {
  private client: Anthropic | null = null;
  private settings: ClaudeCompanionSettings;
  private conversationHistory: Message[] = [];
  private currentStream: ReturnType<Anthropic['messages']['stream']> | null = null;
  private abortController: AbortController | null = null;

  // Phase 6: Context Management integration
  private contextManager: ContextManager | null = null;
  private contextManagementEnabled: boolean = false;

  constructor(settings: ClaudeCompanionSettings) {
    this.settings = settings;
    this.initClient();
  }

  /**
   * Phase 6: Set the context manager for automatic summarization
   */
  setContextManager(manager: ContextManager | null, enabled: boolean = true): void {
    this.contextManager = manager;
    this.contextManagementEnabled = enabled;
  }

  /**
   * Phase 6: Check if context management is enabled and active
   */
  isContextManagementActive(): boolean {
    return this.contextManagementEnabled && this.contextManager !== null;
  }

  /**
   * Phase 6: Get the context manager reference
   */
  getContextManager(): ContextManager | null {
    return this.contextManager;
  }

  /**
   * Abort any currently running stream
   */
  abortStream(): void {
    if (this.currentStream) {
      try {
        this.currentStream.abort();
      } catch (e) {
        // Stream may already be closed
      }
      this.currentStream = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if a stream is currently running
   */
  isStreaming(): boolean {
    return this.currentStream !== null;
  }

  private initClient(): void {
    if (this.settings.apiKey) {
      this.client = new Anthropic({
        apiKey: this.settings.apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  updateSettings(settings: ClaudeCompanionSettings): void {
    this.settings = settings;
    this.initClient();
  }

  /**
   * Classify a task using Haiku for intelligent routing
   * Used by ModelOrchestrator to determine which model should handle a request
   */
  async classifyTask(message: string): Promise<{ complexity: string; reasoning: string } | null> {
    if (!this.client) {
      return null;
    }

    // Minimal prompt for fast, cheap classification
    const classificationPrompt = `Classify task complexity. Reply ONLY: {"c":"simple|moderate|complex|deep","k":"keyword"}

simple=file ops, list, copy, move, delete, placeholder content
moderate=write content, summarize, translate, explain
complex=multi-file ops, batch, refactor
deep=analysis, planning, synthesis, concept maps

Task: ${message}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{ role: 'user', content: classificationPrompt }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return null;
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      // Map compact keys to full names
      return {
        complexity: parsed.c || parsed.complexity,
        reasoning: parsed.k || parsed.reasoning || ''
      };
    } catch (error) {
      console.warn('[ClaudeClient] Task classification failed:', error);
      return null;
    }
  }

  /**
   * Build the complete system prompt for chat mode.
   * Combines: base identity + chat mode instructions + custom instructions
   */
  private buildChatSystemPrompt(): string {
    const parts = [
      t('prompt.baseIdentity'),
      t('prompt.chatMode')
    ];

    if (this.settings.customInstructions?.trim()) {
      parts.push(`\nUSER CUSTOM INSTRUCTIONS:\n${this.settings.customInstructions.trim()}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Clear conversation history
   * Now async to support context manager cleanup
   */
  async clearHistory(): Promise<void> {
    this.conversationHistory = [];

    // Phase 6: Also clear context manager if active
    if (this.contextManagementEnabled && this.contextManager) {
      await this.contextManager.clearMessages();
    }
  }

  /**
   * Get conversation history
   * Returns from context manager if active, otherwise from local history
   */
  getHistory(): Message[] {
    // Phase 6: Use context manager if active
    if (this.contextManagementEnabled && this.contextManager?.isReady()) {
      return this.contextManager.getActiveMessages();
    }
    return [...this.conversationHistory];
  }

  /**
   * Phase 6: Add message to history and sync with context manager
   */
  private async addMessageToHistory(message: Message): Promise<void> {
    this.conversationHistory.push(message);

    // Sync with context manager if active
    if (this.contextManagementEnabled && this.contextManager) {
      await this.contextManager.addMessage(message);
    }
  }

  /**
   * Phase 6: Check if summarization is needed and perform it
   * Returns true if summarization was performed
   */
  async checkAndSummarize(
    generateSummary: (messages: Message[]) => Promise<string>
  ): Promise<boolean> {
    if (!this.contextManagementEnabled || !this.contextManager) {
      return false;
    }

    if (this.contextManager.shouldSummarize()) {
      const summary = await this.contextManager.summarizeAndOffload(generateSummary);
      if (summary) {
        // Update local history to match context manager's active messages
        this.conversationHistory = this.contextManager.getActiveMessages();
        return true;
      }
    }

    return false;
  }

  /**
   * Phase 6: Get summary context to include in system prompt
   */
  getSummaryContext(): string | null {
    if (!this.contextManagementEnabled || !this.contextManager) {
      return null;
    }
    return this.contextManager.getSummaryContext();
  }

  async sendMessageStream(
    userMessage: string,
    callbacks: StreamCallbacks,
    modelOverride?: ModelId
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    // Add user message to history
    await this.addMessageToHistory({
      role: 'user',
      content: userMessage
    });

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      this.abortController = new AbortController();

      // Phase 6: Build system prompt with summary context if available
      let systemPrompt = this.buildChatSystemPrompt();
      const summaryContext = this.getSummaryContext();
      if (summaryContext) {
        systemPrompt = `${summaryContext}\n\n${systemPrompt}`;
      }

      // Phase 6: Get messages from the appropriate source
      const messages = this.getHistory();

      const modelToUse = modelOverride || this.settings.model;

      const stream = this.client.messages.stream({
        model: modelToUse,
        max_tokens: this.settings.maxTokens,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      this.currentStream = stream;

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      const finalMessage = await stream.finalMessage();

      this.currentStream = null;
      this.abortController = null;

      // Extract usage from final message
      if (finalMessage.usage && callbacks.onUsage) {
        callbacks.onUsage({
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          timestamp: Date.now(),
          method: 'chat',
          model: modelToUse
        });
      }

      // Add response to history
      await this.addMessageToHistory({
        role: 'assistant',
        content: fullResponse
      });

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.currentStream = null;
      this.abortController = null;

      // Check if aborted by user
      if (error instanceof Error && error.message.includes('aborted')) {
        if (fullResponse) {
          await this.addMessageToHistory({
            role: 'assistant',
            content: fullResponse + '\n\n[Response stopped by user]'
          });
        }
        callbacks.onError?.(new Error(t('chat.streamStopped')));
        return;
      }

      // Remove user message if error (from local history)
      this.conversationHistory.pop();

      if (error instanceof Error) {
        // Improve common error messages
        if (error.message.includes('401')) {
          callbacks.onError?.(new Error(t('error.apiKeyInvalid')));
        } else if (error.message.includes('429')) {
          // Check for quota exhaustion vs rate limit
          if (error.message.toLowerCase().includes('quota') ||
              error.message.toLowerCase().includes('exceeded')) {
            callbacks.onError?.(new Error(t('error.quotaExhausted')));
          } else {
            callbacks.onError?.(new Error(t('error.rateLimit')));
          }
        } else if (error.message.includes('400') &&
                   (error.message.toLowerCase().includes('billing') ||
                    error.message.toLowerCase().includes('payment'))) {
          callbacks.onError?.(new Error(t('error.billingIssue')));
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          callbacks.onError?.(new Error(t('error.connection')));
        } else {
          callbacks.onError?.(error);
        }
      } else {
        callbacks.onError?.(new Error(t('error.unknown')));
      }
    }
  }

  async processNoteStream(
    noteContent: string,
    noteTitle: string,
    vaultContext: VaultContext,
    callbacks: StreamCallbacks,
    modelOverride?: ModelId
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    const systemPrompt = this.buildProcessingSystemPrompt(vaultContext);
    const userMessage = this.buildProcessingUserMessage(noteContent, noteTitle);

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      const modelToUse = modelOverride || this.settings.model;

      const stream = this.client.messages.stream({
        model: modelToUse,
        max_tokens: this.settings.maxTokens,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      const finalMessage = await stream.finalMessage();

      // Extract usage from final message
      if (finalMessage.usage && callbacks.onUsage) {
        callbacks.onUsage({
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          timestamp: Date.now(),
          method: 'process',
          model: modelToUse
        });
      }

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.handleErrorWithQuota(error, callbacks);
    }
  }

  private buildProcessingSystemPrompt(vaultContext: VaultContext): string {
    return t('prompt.noteProcessor', {
      noteCount: String(vaultContext.noteCount),
      noteTitles: vaultContext.noteTitles.join(', '),
      allTags: vaultContext.allTags.map(tag => '#' + tag).join(', ')
    });
  }

  private buildProcessingUserMessage(noteContent: string, noteTitle: string): string {
    return `Analyze the following note and provide suggestions:

TITLE: ${noteTitle}

CONTENT:
${noteContent}`;
  }

  async processWithTemplate(
    prompt: string,
    template: ExtractionTemplate,
    callbacks: StreamCallbacks,
    modelOverride?: ModelId
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    const jsonInstructions = template.outputFormat === 'json'
      ? 'IMPORTANT: Respond ONLY with valid JSON.'
      : 'Use Markdown format for your response.';

    const systemPrompt = t('prompt.templateProcessor', { jsonInstructions });

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      const modelToUse = modelOverride || this.settings.model;

      const stream = this.client.messages.stream({
        model: modelToUse,
        max_tokens: this.settings.maxTokens,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      const finalMessage = await stream.finalMessage();

      // Extract usage from final message
      if (finalMessage.usage && callbacks.onUsage) {
        callbacks.onUsage({
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          timestamp: Date.now(),
          method: 'template',
          model: modelToUse
        });
      }

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.handleErrorWithQuota(error, callbacks);
    }
  }

  async generateConceptMap(
    prompt: string,
    callbacks: StreamCallbacks,
    modelOverride?: ModelId
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    const systemPrompt = t('prompt.conceptMapGenerator');

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      const modelToUse = modelOverride || this.settings.model;

      const stream = this.client.messages.stream({
        model: modelToUse,
        max_tokens: this.settings.maxTokens,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      const finalMessage = await stream.finalMessage();

      // Extract usage from final message
      if (finalMessage.usage && callbacks.onUsage) {
        callbacks.onUsage({
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          timestamp: Date.now(),
          method: 'conceptMap',
          model: modelToUse
        });
      }

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.handleErrorWithQuota(error, callbacks);
    }
  }

  async sendAgentMessageStream(
    userMessage: string,
    agentSystemPrompt: string,
    callbacks: StreamCallbacks,
    modelOverride?: ModelId
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    // Add user message to history
    await this.addMessageToHistory({
      role: 'user',
      content: userMessage
    });

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      this.abortController = new AbortController();

      // Phase 6: Include summary context in agent system prompt if available
      let systemPrompt = agentSystemPrompt;
      const summaryContext = this.getSummaryContext();
      if (summaryContext) {
        systemPrompt = `${summaryContext}\n\n${systemPrompt}`;
      }

      // Phase 6: Get messages from the appropriate source
      const messages = this.getHistory();
      const modelToUse = modelOverride || this.settings.model;

      const stream = this.client.messages.stream({
        model: modelToUse,
        max_tokens: this.settings.maxTokens,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      this.currentStream = stream;

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      const finalMessage = await stream.finalMessage();

      this.currentStream = null;
      this.abortController = null;

      // Extract usage from final message
      if (finalMessage.usage && callbacks.onUsage) {
        callbacks.onUsage({
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          timestamp: Date.now(),
          method: 'agent',
          model: modelToUse
        });
      }

      // Add response to history
      await this.addMessageToHistory({
        role: 'assistant',
        content: fullResponse
      });

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.currentStream = null;
      this.abortController = null;

      // Remove user message if error (unless aborted)
      if (error instanceof Error && error.message.includes('aborted')) {
        // Stream was aborted by user, keep partial response
        if (fullResponse) {
          await this.addMessageToHistory({
            role: 'assistant',
            content: fullResponse + '\n\n[Response stopped by user]'
          });
        }
        callbacks.onError?.(new Error(t('chat.streamStopped')));
      } else {
        this.conversationHistory.pop();
        this.handleErrorWithQuota(error, callbacks);
      }
    }
  }

  private handleError(error: unknown, callbacks: StreamCallbacks): void {
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        callbacks.onError?.(new Error(t('error.apiKeyInvalid')));
      } else if (error.message.includes('429')) {
        callbacks.onError?.(new Error(t('error.rateLimit')));
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        callbacks.onError?.(new Error(t('error.connection')));
      } else {
        callbacks.onError?.(error);
      }
    } else {
      callbacks.onError?.(new Error(t('error.unknown')));
    }
  }

  /**
   * Enhanced error handling with structured JSON parsing from Anthropic API
   */
  private handleErrorWithQuota(error: unknown, callbacks: StreamCallbacks): void {
    // Log original error for debugging
    console.error('[ClaudeClient] API Error:', error);

    if (error instanceof Error) {
      // Try to extract structured error from Anthropic API JSON response
      const apiError = this.parseAnthropicError(error.message);

      if (apiError) {
        // Use the structured error message from Anthropic
        callbacks.onError?.(new Error(`Error: ${apiError.message}`));
        return;
      }

      // Fallback to pattern-based detection for non-JSON errors
      const errorMsg = error.message.toLowerCase();

      if (error.message.includes('401')) {
        callbacks.onError?.(new Error(t('error.apiKeyInvalid')));
      } else if (error.message.includes('429')) {
        if (errorMsg.includes('quota') || errorMsg.includes('exceeded') || errorMsg.includes('limit')) {
          callbacks.onError?.(new Error(t('error.quotaExhausted')));
        } else {
          callbacks.onError?.(new Error(t('error.rateLimit')));
        }
      } else if (error.message.includes('400') &&
                 (errorMsg.includes('billing') || errorMsg.includes('payment') || errorMsg.includes('credit'))) {
        callbacks.onError?.(new Error(t('error.billingIssue')));
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        callbacks.onError?.(new Error(t('error.connection')));
      } else {
        callbacks.onError?.(error);
      }
    } else {
      callbacks.onError?.(new Error(t('error.unknown')));
    }
  }

  /**
   * Parse structured error from Anthropic API response
   * Extracts error details from JSON format: {"type":"error","error":{"type":"...","message":"..."}}
   */
  private parseAnthropicError(errorString: string): { type: string; message: string } | null {
    try {
      // Find JSON object in the error string (may be prefixed with "X: " or "SSE Error: ")
      const jsonMatch = errorString.match(/\{[\s\S]*"type"\s*:\s*"error"[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.type === 'error' && parsed.error?.message) {
        return {
          type: parsed.error.type || 'unknown_error',
          message: parsed.error.message,
        };
      }
    } catch {
      // JSON parsing failed, return null to use fallback
    }
    return null;
  }
}
