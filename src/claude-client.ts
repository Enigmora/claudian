import Anthropic from '@anthropic-ai/sdk';
import { ClaudeCompanionSettings } from './settings';
import { VaultContext } from './vault-indexer';

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

  async processNoteStream(
    noteContent: string,
    noteTitle: string,
    vaultContext: VaultContext,
    callbacks: StreamCallbacks
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new Error('API key no configurada. Ve a Settings > Claude Companion.'));
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

  private buildProcessingSystemPrompt(vaultContext: VaultContext): string {
    return `Eres un asistente especializado en organización de conocimiento para Obsidian. Tu tarea es analizar notas y sugerir mejoras para integrarlas mejor en la bóveda del usuario.

CONTEXTO DE LA BÓVEDA:
- Total de notas: ${vaultContext.noteCount}
- Notas existentes: ${vaultContext.noteTitles.join(', ')}
- Tags existentes: ${vaultContext.allTags.map(t => '#' + t).join(', ')}

INSTRUCCIONES:
1. Analiza el contenido de la nota proporcionada
2. Sugiere tags relevantes (preferiblemente de los existentes, pero puedes proponer nuevos)
3. Identifica conceptos que podrían enlazarse a notas existentes (wikilinks)
4. Detecta conceptos atómicos que merecerían su propia nota
5. Explica brevemente tu razonamiento

RESPONDE ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "tags": ["tag1", "tag2"],
  "wikilinks": [
    {
      "text": "texto a convertir en link",
      "target": "Título de nota destino",
      "context": "Breve explicación de por qué enlazar"
    }
  ],
  "atomicConcepts": [
    {
      "title": "Título para nueva nota",
      "summary": "Resumen de 1-2 oraciones",
      "content": "Contenido sugerido para la nota (en Markdown)"
    }
  ],
  "reasoning": "Explicación breve de tu análisis"
}

IMPORTANTE:
- Solo sugiere wikilinks a notas que existan en la bóveda
- Los tags no deben incluir el símbolo #
- Los conceptos atómicos deben ser ideas que merezcan desarrollo propio
- Mantén las sugerencias relevantes y útiles, no llenes de links innecesarios`;
  }

  private buildProcessingUserMessage(noteContent: string, noteTitle: string): string {
    return `Analiza la siguiente nota y proporciona sugerencias:

TÍTULO: ${noteTitle}

CONTENIDO:
${noteContent}`;
  }
}
