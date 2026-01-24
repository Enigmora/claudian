/**
 * Context Reinforcer
 * Ensures the model doesn't "forget" it's in agent mode during long conversations
 * by injecting reminders and reinforcement into prompts.
 */

import { Message } from './claude-client';
import { t } from './i18n';

export interface ReinforcementConfig {
  /** Number of messages after which to start reinforcing */
  reinforceAfterMessages: number;
  /** Whether to inject inline reminders in user messages */
  injectInlineReminders: boolean;
  /** Whether to add reinforcement to system prompt */
  reinforceSystemPrompt: boolean;
}

export const DEFAULT_REINFORCEMENT_CONFIG: ReinforcementConfig = {
  reinforceAfterMessages: 6,
  injectInlineReminders: true,
  reinforceSystemPrompt: true
};

export interface ConversationAnalysis {
  messageCount: number;
  lastAgentActionIndex: number;
  hasRecentAgentAction: boolean;
  consecutiveNonActionResponses: number;
  agentModeConfusion: boolean;
}

export class ContextReinforcer {
  private config: ReinforcementConfig;

  constructor(config: Partial<ReinforcementConfig> = {}) {
    this.config = { ...DEFAULT_REINFORCEMENT_CONFIG, ...config };
  }

  /**
   * Analyze conversation history to determine reinforcement needs
   */
  analyzeConversation(history: Message[]): ConversationAnalysis {
    const messageCount = history.length;
    let lastAgentActionIndex = -1;
    let consecutiveNonActionResponses = 0;
    let agentModeConfusion = false;

    // Scan through assistant messages to find agent actions
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];

      if (msg.role === 'assistant') {
        const hasActions = this.hasAgentActions(msg.content);
        const claimsInability = this.claimsCannotDoActions(msg.content);

        if (hasActions) {
          if (lastAgentActionIndex === -1) {
            lastAgentActionIndex = i;
          }
          break;
        } else {
          consecutiveNonActionResponses++;

          if (claimsInability) {
            agentModeConfusion = true;
          }
        }
      }
    }

    const hasRecentAgentAction = lastAgentActionIndex >= 0 &&
      (history.length - lastAgentActionIndex) <= 4;

    return {
      messageCount,
      lastAgentActionIndex,
      hasRecentAgentAction,
      consecutiveNonActionResponses,
      agentModeConfusion
    };
  }

  /**
   * Check if a response contains agent actions (JSON format)
   */
  private hasAgentActions(content: string): boolean {
    return /"actions"\s*:\s*\[/.test(content) && /"action"\s*:/.test(content);
  }

  /**
   * Check if the model claims it cannot perform actions
   */
  private claimsCannotDoActions(content: string): boolean {
    const confusionPatterns = [
      // Spanish/English
      /(?:no puedo|cannot|can't|i'm unable to|no tengo la capacidad)/i,
      /(?:crear archivos|create files|write files|escribir archivos)/i,
      /(?:solo puedo|i can only|only able to)/i,
      /(?:como (?:un )?(?:modelo|asistente|ia)|as an? (?:ai|assistant|model))/i,
      // Chinese
      /(?:我不能|无法|我没有能力)/,
      /(?:创建文件|写文件|编写文件)/,
      /(?:我只能|只能够)/,
      /(?:作为[一个]?(?:模型|助手|AI))/,
      // German
      /(?:ich kann nicht|ich bin nicht in der lage)/i,
      /(?:dateien erstellen|dateien schreiben)/i,
      /(?:ich kann nur|nur in der lage)/i,
      /(?:als (?:ein )?(?:modell|assistent|ki))/i,
      // French
      /(?:je ne peux pas|je suis incapable de)/i,
      /(?:cr[ée]er des fichiers|[ée]crire des fichiers)/i,
      /(?:je peux seulement|je ne peux que)/i,
      /(?:en tant qu[e']?\s*(?:mod[èe]le|assistant|ia))/i,
      // Japanese
      /(?:できません|不可能です|無理です)/,
      /(?:ファイル(?:を)?(?:作成|書き込み|生成))/,
      /(?:のみ|だけ|しか)(?:できます|可能です)/,
      /(?:AIとして|モデルとして|アシスタントとして)/,
    ];

    return confusionPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Get system prompt reinforcement based on conversation analysis
   */
  getSystemPromptReinforcement(analysis: ConversationAnalysis): string {
    if (!this.config.reinforceSystemPrompt) {
      return '';
    }

    const parts: string[] = [];

    // Always add basic reminder after threshold
    if (analysis.messageCount >= this.config.reinforceAfterMessages) {
      parts.push(t('agent.reinforcement.reminder'));
    }

    // Strong reinforcement if confusion detected
    if (analysis.agentModeConfusion) {
      parts.push(t('agent.reinforcement.canPerformActions'));
    }

    // Reminder if no recent agent actions in a long conversation
    if (analysis.messageCount > 8 && !analysis.hasRecentAgentAction) {
      parts.push(t('agent.reinforcement.useJsonFormat'));
    }

    // If multiple non-action responses
    if (analysis.consecutiveNonActionResponses >= 3) {
      parts.push(t('agent.reinforcement.dontForget'));
    }

    if (parts.length === 0) {
      return '';
    }

    return '\n\n---\nIMPORTANT REMINDER:\n' + parts.join('\n');
  }

  /**
   * Enhance user message with agent mode context if needed
   */
  enhanceUserMessage(
    message: string,
    analysis: ConversationAnalysis
  ): string {
    if (!this.config.injectInlineReminders) {
      return message;
    }

    // Only inject if we detect potential issues
    const needsReinforcement =
      analysis.agentModeConfusion ||
      (analysis.messageCount >= this.config.reinforceAfterMessages &&
        analysis.consecutiveNonActionResponses >= 2);

    if (!needsReinforcement) {
      return message;
    }

    // Check if message is requesting an action
    const isActionRequest = this.isActionRequest(message);

    if (isActionRequest) {
      return `[AGENT MODE ACTIVE - Respond with JSON actions]\n\n${message}`;
    }

    return message;
  }

  /**
   * Check if a user message is requesting vault actions
   */
  private isActionRequest(message: string): boolean {
    const actionPatterns = [
      // Spanish/English
      /(?:crea|create|genera|generate|haz|make)/i,
      /(?:mueve|move|mover)/i,
      /(?:elimina|delete|borra|remove)/i,
      /(?:renombra|rename)/i,
      /(?:busca|search|encuentra|find)/i,
      /(?:lista|list|muestra|show)/i,
      /(?:agrega|add|añade|append)/i,
      /(?:carpeta|folder|nota|note|archivo|file)/i,
      // Chinese
      /(?:创建|生成|做|制作)/,
      /(?:移动)/,
      /(?:删除|移除|删掉)/,
      /(?:重命名)/,
      /(?:搜索|查找|找)/,
      /(?:列[出表]|显示|展示)/,
      /(?:添加|增加|追加)/,
      /(?:文件夹|笔记|文件|档案)/,
      // German
      /(?:erstell|generier|mach|anlegen)/i,
      /(?:verschieb|beweg)/i,
      /(?:l[öo]sch|entfern)/i,
      /(?:umbenennen|rename)/i,
      /(?:such|find)/i,
      /(?:list|zeig|anzeigen)/i,
      /(?:f[üu]g|hinzuf[üu]gen|anh[äa]ngen)/i,
      /(?:ordner|notiz|datei|dokument)/i,
      // French
      /(?:cr[ée]e|cr[ée]er|g[ée]n[èe]re|g[ée]n[ée]rer|fais|faire)/i,
      /(?:d[ée]place|d[ée]placer|bouge|bouger)/i,
      /(?:supprime|supprimer|efface|effacer)/i,
      /(?:renomme|renommer)/i,
      /(?:cherche|chercher|trouve|trouver)/i,
      /(?:liste|lister|montre|montrer|affiche|afficher)/i,
      /(?:ajoute|ajouter|rajoute|rajouter)/i,
      /(?:dossier|note|fichier|document)/i,
      // Japanese
      /(?:作成|作って|作る|生成)/,
      /(?:移動|移して|移す)/,
      /(?:削除|消して|消す|除去)/,
      /(?:名前(?:を)?変更|リネーム)/,
      /(?:検索|探して|探す|見つけて)/,
      /(?:一覧|リスト|表示)/,
      /(?:追加|足して|加えて)/,
      /(?:フォルダ|ノート|ファイル|ドキュメント)/,
    ];

    const matchCount = actionPatterns.filter(p => p.test(message)).length;
    return matchCount >= 2;
  }

  /**
   * Generate a recovery prompt when the model seems confused
   */
  generateRecoveryPrompt(originalMessage: string): string {
    return t('agent.reinforcement.recoveryPrompt', { message: originalMessage });
  }

  /**
   * Check if we should attempt auto-recovery
   */
  shouldAttemptRecovery(analysis: ConversationAnalysis): boolean {
    return analysis.agentModeConfusion && analysis.consecutiveNonActionResponses <= 2;
  }
}
