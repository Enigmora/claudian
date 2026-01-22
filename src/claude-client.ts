import Anthropic from '@anthropic-ai/sdk';
import { ClaudeCompanionSettings } from './settings';
import { VaultContext } from './vault-indexer';
import { ExtractionTemplate } from './extraction-templates';
import { t } from './i18n';
import type { TokenUsage, UsageMethod } from './token-tracker';

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

  constructor(settings: ClaudeCompanionSettings) {
    this.settings = settings;
    this.initClient();
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

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  async sendMessageStream(
    userMessage: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      this.abortController = new AbortController();

      const stream = this.client.messages.stream({
        model: this.settings.model,
        max_tokens: this.settings.maxTokens,
        system: this.buildChatSystemPrompt(),
        messages: this.conversationHistory.map(msg => ({
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
          method: 'chat'
        });
      }

      // Add response to history
      this.conversationHistory.push({
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
          this.conversationHistory.push({
            role: 'assistant',
            content: fullResponse + '\n\n[Response stopped by user]'
          });
        }
        callbacks.onError?.(new Error(t('chat.streamStopped')));
        return;
      }

      // Remove user message if error
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
    callbacks: StreamCallbacks
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
      const stream = this.client.messages.stream({
        model: this.settings.model,
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
          method: 'process'
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
    callbacks: StreamCallbacks
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
      const stream = this.client.messages.stream({
        model: this.settings.model,
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
          method: 'template'
        });
      }

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.handleErrorWithQuota(error, callbacks);
    }
  }

  async generateConceptMap(
    prompt: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    const systemPrompt = t('prompt.conceptMapGenerator');

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      const stream = this.client.messages.stream({
        model: this.settings.model,
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
          method: 'conceptMap'
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
    callbacks: StreamCallbacks
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error(t('error.apiKeyMissing')));
      return;
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    callbacks.onStart?.();

    let fullResponse = '';

    try {
      this.abortController = new AbortController();

      const stream = this.client.messages.stream({
        model: this.settings.model,
        max_tokens: this.settings.maxTokens,
        system: agentSystemPrompt,
        messages: this.conversationHistory.map(msg => ({
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
          method: 'agent'
        });
      }

      // Add response to history
      this.conversationHistory.push({
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
          this.conversationHistory.push({
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
   * Enhanced error handling with quota and billing detection
   */
  private handleErrorWithQuota(error: unknown, callbacks: StreamCallbacks): void {
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();

      if (error.message.includes('401')) {
        callbacks.onError?.(new Error(t('error.apiKeyInvalid')));
      } else if (error.message.includes('429')) {
        // Check for quota exhaustion vs rate limit
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
}
