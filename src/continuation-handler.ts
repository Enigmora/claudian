/**
 * ContinuationHandler - Handles continuation commands and prompt building
 *
 * Extracted from chat-view.ts to reduce complexity.
 * Detects when users request continuation ("continúa", "continue", etc.)
 * and builds enhanced prompts with proper context.
 */

import type { AgentMode } from './agent-mode';
import type { Message } from './claude-client';

/**
 * Handles continuation detection and prompt building for multi-step tasks
 */
export class ContinuationHandler {
  constructor(private agentMode: AgentMode) {}

  /**
   * Detect if the user message is a continuation command
   * These are short messages like "continúa", "sigue", "continue", etc.
   */
  isContinuationCommand(message: string): boolean {
    const normalized = message.toLowerCase().trim();

    // Must be a short message (continuation commands are typically brief)
    if (normalized.length > 50) {
      return false;
    }

    // Common continuation patterns in Spanish and English
    // NOTE: When adding new locales, add corresponding patterns here
    // See CLAUDE.md "Multilingual regex patterns" section
    const continuationPatterns = [
      /^contin[uú]a?r?$/i,
      /^sigue$/i,
      /^sigue adelante$/i,
      /^continua$/i,
      /^continue$/i,
      /^go on$/i,
      /^proceed$/i,
      /^keep going$/i,
      /^next$/i,
      /^más$/i,
      /^y\?$/i,
      /^dale$/i,
      /^ok,?\s*contin[uú]a$/i,
      /^termina$/i,
      /^completa$/i,
    ];

    return continuationPatterns.some(pattern => pattern.test(normalized));
  }

  /**
   * Build an enhanced continuation prompt that provides clear context
   * to avoid the model getting confused with partial history
   */
  buildContinuationPrompt(originalMessage: string, history: Message[]): string {
    if (history.length < 2) {
      return originalMessage;
    }

    // Find the last assistant response and the original user request
    let lastAssistantResponse = '';
    let originalRequest = '';

    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant' && !lastAssistantResponse) {
        lastAssistantResponse = history[i].content;
      }
      if (history[i].role === 'user' && lastAssistantResponse && !originalRequest) {
        // Skip if this is also a continuation command
        if (!this.isContinuationCommand(history[i].content)) {
          originalRequest = history[i].content;
          break;
        }
      }
    }

    if (!originalRequest || !lastAssistantResponse) {
      return originalMessage;
    }

    // Try to extract what was completed from the last response
    const parsedResponse = this.agentMode.parseAgentResponse(lastAssistantResponse);

    let completedActions = '';
    if (parsedResponse && parsedResponse.actions.length > 0) {
      const actionDescriptions = parsedResponse.actions.map(a =>
        a.description || `${a.action}: ${JSON.stringify(a.params)}`
      );
      completedActions = actionDescriptions.join(', ');
    }

    // Build a structured continuation prompt
    const continuationPrompt = `CONTINUACIÓN DE TAREA PENDIENTE

SOLICITUD ORIGINAL DEL USUARIO:
"${originalRequest}"

${completedActions ? `ACCIONES YA COMPLETADAS:
${completedActions}

` : ''}INSTRUCCIONES CRÍTICAS:
1. PRIMERO usa list-folder para obtener los nombres REALES de archivos en la carpeta de origen
2. NO asumas que los archivos del contexto de la bóveda están en esa carpeta
3. Usa SOLO los nombres que devuelva list-folder para las operaciones de copia/movimiento
4. NO repitas acciones ya ejecutadas
5. Genera el JSON con TODAS las acciones restantes`;

    return continuationPrompt;
  }
}
