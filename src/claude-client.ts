import Anthropic from '@anthropic-ai/sdk';
import { ClaudeCompanionSettings } from './settings';
import { VaultContext } from './vault-indexer';
import { ExtractionTemplate } from './extraction-templates';
import { t } from './i18n';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
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

  constructor(settings: ClaudeCompanionSettings) {
    this.settings = settings;
    this.initClient();
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
      const stream = this.client.messages.stream({
        model: this.settings.model,
        max_tokens: this.settings.maxTokens,
        system: this.settings.systemPrompt,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      await stream.finalMessage();

      // Add response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      // Remove user message if error
      this.conversationHistory.pop();

      if (error instanceof Error) {
        // Improve common error messages
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

      await stream.finalMessage();
      callbacks.onComplete?.(fullResponse);

    } catch (error) {
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

      await stream.finalMessage();
      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.handleError(error, callbacks);
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

      await stream.finalMessage();
      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      this.handleError(error, callbacks);
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
      const stream = this.client.messages.stream({
        model: this.settings.model,
        max_tokens: this.settings.maxTokens,
        system: agentSystemPrompt,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      stream.on('text', (text) => {
        fullResponse += text;
        callbacks.onToken?.(text);
      });

      await stream.finalMessage();

      // Add response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      // Remove user message if error
      this.conversationHistory.pop();
      this.handleError(error, callbacks);
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
}
