/**
 * Context Manager
 * Manages conversation context, summaries, and checkpoints.
 * Works with ContextStorage to offload context when conversations get long.
 */

import { Message } from './claude-client';
import { ContextStorage } from './context-storage';
import { TaskPlan, Subtask } from './task-planner';

export interface SessionData {
  id: string;
  startedAt: number;
  messages: Message[];
  summaries: ConversationSummary[];
  activePlanId?: string;
  metadata: {
    totalMessages: number;
    summarizedMessages: number;
    lastActivity: number;
  };
}

export interface ConversationSummary {
  id: string;
  createdAt: number;
  messageRange: { start: number; end: number };
  keyTopics: string[];
  lastActions: string[];
  summary: string;
  tokenEstimate: number;
}

export interface PartialResponse {
  id: string;
  sessionId: string;
  content: string;
  continuationCount: number;
  createdAt: number;
  lastUpdated: number;
  isComplete: boolean;
}

export interface CheckpointData {
  id: string;
  sessionId: string;
  planId: string;
  completedSubtasks: number;
  subtaskResults: Array<{
    subtaskId: string;
    success: boolean;
    actionsExecuted: number;
    error?: string;
  }>;
  timestamp: number;
}

export interface ContextWindow {
  systemPrompt: string;
  recentMessages: Message[];
  summaryContext?: string;
  activeTask?: string;
  partialResponse?: string;
}

export interface ContextManagerOptions {
  maxMessagesInContext?: number;
  summarizeThreshold?: number;
}

export class ContextManager {
  private storage: ContextStorage;
  private currentSession: SessionData | null = null;

  // Thresholds for context management (now configurable)
  private maxMessagesInContext: number;
  private summarizeThreshold: number;
  private static readonly ESTIMATED_TOKENS_PER_CHAR = 0.25; // ~4 chars per token

  constructor(storage: ContextStorage, options?: ContextManagerOptions) {
    this.storage = storage;
    this.maxMessagesInContext = options?.maxMessagesInContext ?? 50;
    this.summarizeThreshold = options?.summarizeThreshold ?? 20;
  }

  /**
   * Update thresholds at runtime (called from settings)
   */
  updateThresholds(options: ContextManagerOptions): void {
    if (options.maxMessagesInContext !== undefined) {
      this.maxMessagesInContext = options.maxMessagesInContext;
    }
    if (options.summarizeThreshold !== undefined) {
      this.summarizeThreshold = options.summarizeThreshold;
    }
  }

  /**
   * Get the current thresholds
   */
  getThresholds(): { maxMessagesInContext: number; summarizeThreshold: number } {
    return {
      maxMessagesInContext: this.maxMessagesInContext,
      summarizeThreshold: this.summarizeThreshold
    };
  }

  /**
   * Start a new session
   */
  async startSession(): Promise<string> {
    const sessionId = await this.storage.save('session', {
      startedAt: Date.now(),
      messages: [],
      summaries: [],
      metadata: {
        totalMessages: 0,
        summarizedMessages: 0,
        lastActivity: Date.now()
      }
    } as Omit<SessionData, 'id'>, {
      description: 'Chat session'
    });

    this.currentSession = {
      id: sessionId,
      startedAt: Date.now(),
      messages: [],
      summaries: [],
      metadata: {
        totalMessages: 0,
        summarizedMessages: 0,
        lastActivity: Date.now()
      }
    };

    await this.storage.setCurrentSessionId(sessionId);

    return sessionId;
  }

  /**
   * Resume an existing session
   */
  async resumeSession(sessionId: string): Promise<boolean> {
    const sessionData = await this.storage.load<SessionData>('session', sessionId);

    if (sessionData) {
      this.currentSession = { ...sessionData, id: sessionId };
      await this.storage.setCurrentSessionId(sessionId);
      return true;
    }

    return false;
  }

  /**
   * End the current session
   */
  async endSession(): Promise<void> {
    if (this.currentSession) {
      // Clean up session-related temp files
      await this.storage.purgeBySession(this.currentSession.id);
      this.currentSession = null;
      await this.storage.setCurrentSessionId(undefined);
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSession?.id || null;
  }

  /**
   * Add a message to the current session
   */
  async addMessage(message: Message): Promise<void> {
    if (!this.currentSession) {
      await this.startSession();
    }

    this.currentSession!.messages.push(message);
    this.currentSession!.metadata.totalMessages++;
    this.currentSession!.metadata.lastActivity = Date.now();

    // Save to storage
    await this.saveCurrentSession();
  }

  /**
   * Save current session to storage
   */
  private async saveCurrentSession(): Promise<void> {
    if (this.currentSession) {
      await this.storage.update('session', this.currentSession.id, {
        startedAt: this.currentSession.startedAt,
        messages: this.currentSession.messages,
        summaries: this.currentSession.summaries,
        activePlanId: this.currentSession.activePlanId,
        metadata: this.currentSession.metadata
      });
    }
  }

  /**
   * Check if we should summarize older messages
   */
  shouldSummarize(): boolean {
    if (!this.currentSession) return false;
    return this.currentSession.messages.length >= this.summarizeThreshold;
  }

  /**
   * Summarize older messages and offload to storage
   * Returns the summary context to include in the system prompt
   */
  async summarizeAndOffload(
    generateSummary: (messages: Message[]) => Promise<string>
  ): Promise<ConversationSummary | null> {
    if (!this.currentSession || !this.shouldSummarize()) {
      return null;
    }

    const messages = this.currentSession.messages;

    // Keep last N messages in active context
    const recentMessages = messages.slice(-this.maxMessagesInContext);
    const oldMessages = messages.slice(0, -this.maxMessagesInContext);

    if (oldMessages.length === 0) {
      return null;
    }

    // Generate summary using the provided function (calls the LLM)
    const summaryText = await generateSummary(oldMessages);

    // Parse summary or use as-is
    let parsedSummary: { keyTopics?: string[]; lastActions?: string[]; summary?: string };
    try {
      parsedSummary = JSON.parse(summaryText);
    } catch {
      parsedSummary = { summary: summaryText };
    }

    // Create summary object
    const summary: ConversationSummary = {
      id: `summary-${Date.now()}`,
      createdAt: Date.now(),
      messageRange: {
        start: this.currentSession.metadata.summarizedMessages,
        end: this.currentSession.metadata.summarizedMessages + oldMessages.length
      },
      keyTopics: parsedSummary.keyTopics || [],
      lastActions: parsedSummary.lastActions || [],
      summary: parsedSummary.summary || summaryText,
      tokenEstimate: Math.ceil(summaryText.length * ContextManager.ESTIMATED_TOKENS_PER_CHAR)
    };

    // Save old messages to context storage
    await this.storage.save('context', {
      messages: oldMessages,
      summary: summary.summary,
      summarizedAt: Date.now()
    }, {
      relatedSessionId: this.currentSession.id,
      description: `Messages ${summary.messageRange.start}-${summary.messageRange.end}`
    });

    // Update session
    this.currentSession.messages = recentMessages;
    this.currentSession.summaries.push(summary);
    this.currentSession.metadata.summarizedMessages += oldMessages.length;

    await this.saveCurrentSession();

    return summary;
  }

  /**
   * Build the context window for sending to the LLM
   */
  buildContextWindow(
    systemPrompt: string,
    activeTask?: string
  ): ContextWindow {
    const contextWindow: ContextWindow = {
      systemPrompt,
      recentMessages: this.currentSession?.messages || []
    };

    // Add summary context if we have summaries
    if (this.currentSession?.summaries.length) {
      const allSummaries = this.currentSession.summaries;
      const recentSummary = allSummaries[allSummaries.length - 1];

      contextWindow.summaryContext = this.buildSummaryContext(recentSummary);
    }

    if (activeTask) {
      contextWindow.activeTask = activeTask;
    }

    return contextWindow;
  }

  /**
   * Build summary context string
   */
  private buildSummaryContext(summary: ConversationSummary): string {
    let context = `[Previous conversation summary: ${summary.summary}]`;

    if (summary.keyTopics.length > 0) {
      context += `\n[Key topics: ${summary.keyTopics.join(', ')}]`;
    }

    if (summary.lastActions.length > 0) {
      context += `\n[Recent actions: ${summary.lastActions.join(', ')}]`;
    }

    return context;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PARTIAL RESPONSE MANAGEMENT (for truncation handling)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a partial (truncated) response
   */
  async savePartialResponse(content: string): Promise<string> {
    const sessionId = this.currentSession?.id || 'no-session';

    const partialId = await this.storage.save('partial', {
      sessionId,
      content,
      continuationCount: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      isComplete: false
    } as Omit<PartialResponse, 'id'>, {
      relatedSessionId: sessionId,
      description: 'Truncated response'
    });

    return partialId;
  }

  /**
   * Append to a partial response
   */
  async appendToPartialResponse(
    partialId: string,
    additionalContent: string
  ): Promise<PartialResponse | null> {
    const partial = await this.storage.load<PartialResponse>('partial', partialId);

    if (!partial) {
      return null;
    }

    const updated: PartialResponse = {
      ...partial,
      id: partialId,
      content: partial.content + additionalContent,
      continuationCount: partial.continuationCount + 1,
      lastUpdated: Date.now()
    };

    await this.storage.update('partial', partialId, updated);

    return updated;
  }

  /**
   * Mark a partial response as complete
   */
  async completePartialResponse(partialId: string): Promise<string | null> {
    const partial = await this.storage.load<PartialResponse>('partial', partialId);

    if (!partial) {
      return null;
    }

    // Delete the partial file since we're done with it
    await this.storage.delete('partial', partialId);

    return partial.content;
  }

  /**
   * Get a partial response
   */
  async getPartialResponse(partialId: string): Promise<PartialResponse | null> {
    const partial = await this.storage.load<PartialResponse>('partial', partialId);
    return partial ? { ...partial, id: partialId } : null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECKPOINT MANAGEMENT (for task planning)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a checkpoint for a task plan
   */
  async saveCheckpoint(
    planId: string,
    completedSubtasks: number,
    results: CheckpointData['subtaskResults']
  ): Promise<string> {
    const sessionId = this.currentSession?.id || 'no-session';

    const checkpointId = await this.storage.save('checkpoint', {
      sessionId,
      planId,
      completedSubtasks,
      subtaskResults: results,
      timestamp: Date.now()
    } as Omit<CheckpointData, 'id'>, {
      relatedSessionId: sessionId,
      description: `Plan ${planId} checkpoint at subtask ${completedSubtasks}`
    });

    return checkpointId;
  }

  /**
   * Load the latest checkpoint for a plan
   */
  async loadCheckpoint(planId: string): Promise<CheckpointData | null> {
    const checkpoints = this.storage.listByType('checkpoint');

    // Find checkpoints for this plan, sorted by timestamp (newest first)
    const planCheckpoints = checkpoints
      .filter(c => c.description?.includes(planId))
      .sort((a, b) => b.createdAt - a.createdAt);

    if (planCheckpoints.length === 0) {
      return null;
    }

    const checkpoint = await this.storage.load<CheckpointData>(
      'checkpoint',
      planCheckpoints[0].id
    );

    return checkpoint ? { ...checkpoint, id: planCheckpoints[0].id } : null;
  }

  /**
   * Delete checkpoints for a completed plan
   */
  async clearCheckpoints(planId: string): Promise<number> {
    const checkpoints = this.storage.listByType('checkpoint');

    let count = 0;
    for (const checkpoint of checkpoints) {
      if (checkpoint.description?.includes(planId)) {
        await this.storage.delete('checkpoint', checkpoint.id);
        count++;
      }
    }

    return count;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Save a task plan
   */
  async savePlan(plan: TaskPlan): Promise<string> {
    const sessionId = this.currentSession?.id || 'no-session';

    const planId = await this.storage.save('plan', plan, {
      relatedSessionId: sessionId,
      description: `Plan: ${plan.originalRequest.substring(0, 50)}...`
    });

    if (this.currentSession) {
      this.currentSession.activePlanId = planId;
      await this.saveCurrentSession();
    }

    return planId;
  }

  /**
   * Load a task plan
   */
  async loadPlan(planId: string): Promise<TaskPlan | null> {
    return await this.storage.load<TaskPlan>('plan', planId);
  }

  /**
   * Update a task plan
   */
  async updatePlan(planId: string, plan: TaskPlan): Promise<boolean> {
    return await this.storage.update('plan', planId, plan);
  }

  /**
   * Delete a task plan and its checkpoints
   */
  async deletePlan(planId: string): Promise<void> {
    await this.storage.delete('plan', planId);
    await this.clearCheckpoints(planId);

    if (this.currentSession?.activePlanId === planId) {
      this.currentSession.activePlanId = undefined;
      await this.saveCurrentSession();
    }
  }

  /**
   * Get the active plan for the current session
   */
  async getActivePlan(): Promise<TaskPlan | null> {
    if (!this.currentSession?.activePlanId) {
      return null;
    }

    return await this.loadPlan(this.currentSession.activePlanId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Estimate token count for a string
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length * ContextManager.ESTIMATED_TOKENS_PER_CHAR);
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    messageCount: number;
    summarizedCount: number;
    summaryCount: number;
    hasActivePlan: boolean;
  } | null {
    if (!this.currentSession) {
      return null;
    }

    return {
      messageCount: this.currentSession.messages.length,
      summarizedCount: this.currentSession.metadata.summarizedMessages,
      summaryCount: this.currentSession.summaries.length,
      hasActivePlan: !!this.currentSession.activePlanId
    };
  }

  /**
   * Clear all messages (but keep session)
   */
  async clearMessages(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.messages = [];
      this.currentSession.summaries = [];
      this.currentSession.metadata.totalMessages = 0;
      this.currentSession.metadata.summarizedMessages = 0;
      await this.saveCurrentSession();
    }
  }

  /**
   * Get active messages for sending to the API
   * Includes summary context if available
   */
  getActiveMessages(): Message[] {
    if (!this.currentSession) {
      return [];
    }
    return [...this.currentSession.messages];
  }

  /**
   * Sync from an existing message history (migration helper)
   * Useful when integrating with existing ClaudeClient history
   */
  async syncFromHistory(messages: Message[]): Promise<void> {
    if (!this.currentSession) {
      await this.startSession();
    }

    // Replace current messages with the provided history
    this.currentSession!.messages = [...messages];
    this.currentSession!.metadata.totalMessages = messages.length;
    this.currentSession!.metadata.lastActivity = Date.now();

    await this.saveCurrentSession();
  }

  /**
   * Get the summary context string to prepend to system prompt
   */
  getSummaryContext(): string | null {
    if (!this.currentSession?.summaries.length) {
      return null;
    }

    const allSummaries = this.currentSession.summaries;
    const recentSummary = allSummaries[allSummaries.length - 1];

    return this.buildSummaryContext(recentSummary);
  }

  /**
   * Check if context management is ready (session active)
   */
  isReady(): boolean {
    return this.currentSession !== null;
  }
}
