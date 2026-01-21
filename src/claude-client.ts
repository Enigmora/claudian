import Anthropic from '@anthropic-ai/sdk';
import { ClaudeCompanionSettings } from './settings';

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
      callbacks.onError?.(new Error('API key no configurada. Ve a Settings > Claude Companion.'));
      return;
    }

    // Agregar mensaje del usuario al historial
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

      // Agregar respuesta al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: fullResponse
      });

      callbacks.onComplete?.(fullResponse);

    } catch (error) {
      // Remover el mensaje del usuario si hubo error
      this.conversationHistory.pop();

      if (error instanceof Error) {
        // Mejorar mensajes de error comunes
        if (error.message.includes('401')) {
          callbacks.onError?.(new Error('API key inválida. Verifica tu clave en Settings.'));
        } else if (error.message.includes('429')) {
          callbacks.onError?.(new Error('Límite de requests excedido. Intenta en unos segundos.'));
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          callbacks.onError?.(new Error('Error de conexión. Verifica tu conexión a internet.'));
        } else {
          callbacks.onError?.(error);
        }
      } else {
        callbacks.onError?.(new Error('Error desconocido al comunicarse con Claude.'));
      }
    }
  }
}
