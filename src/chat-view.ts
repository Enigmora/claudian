import { ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient, Message } from './claude-client';
import { NoteCreatorModal } from './note-creator';
import { AgentMode, AgentResponse } from './agent-mode';
import { VaultActionExecutor, VaultAction } from './vault-actions';
import { ConfirmationModal } from './confirmation-modal';
import { t } from './i18n';
// Phase 2: Enhanced Agent Mode
import { TruncationDetector, TruncationDetectionResult } from './truncation-detector';
import { ContextReinforcer, ConversationAnalysis } from './context-reinforcer';
import { ResponseValidator, ValidationResult } from './response-validator';
import { TaskPlanner, TaskPlan, TaskAnalysis } from './task-planner';

export const VIEW_TYPE_CHAT = 'claudian-chat';

export class ChatView extends ItemView {
  plugin: ClaudeCompanionPlugin;
  client: ClaudeClient;

  private messagesContainer: HTMLElement;
  private inputEl: HTMLTextAreaElement;
  private sendButton: HTMLButtonElement;
  private isStreaming: boolean = false;

  // Agent Mode
  private agentMode: AgentMode;
  private executor: VaultActionExecutor;
  private isAgentModeActive: boolean = false;
  private agentToggle: HTMLElement;

  // Phase 2: Enhanced Agent Mode
  private contextReinforcer: ContextReinforcer;
  private taskPlanner: TaskPlanner;
  private currentPlan: TaskPlan | null = null;
  private autoContinueCount: number = 0;
  private readonly MAX_AUTO_CONTINUES: number = 5;

  // Phase 3: Context Management
  private currentPartialId: string | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: ClaudeCompanionPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.client = new ClaudeClient(plugin.settings);
    this.executor = new VaultActionExecutor(plugin);
    this.agentMode = new AgentMode(plugin, this.executor, plugin.indexer);
    this.isAgentModeActive = plugin.settings.agentModeEnabled;

    // Phase 2: Initialize enhanced components
    this.contextReinforcer = new ContextReinforcer();
    this.taskPlanner = new TaskPlanner({
      maxActionsPerSubtask: 8,
      maxSubtasks: 10,
      enableAutoPlan: plugin.settings.enableAutoPlan
    });
  }

  getViewType(): string {
    return VIEW_TYPE_CHAT;
  }

  getDisplayText(): string {
    return 'Claudian';
  }

  getIcon(): string {
    return 'claudian';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('claudian-container');

    // Header
    const header = container.createDiv({ cls: 'claudian-header' });

    // Logo and title
    const headerTitle = header.createDiv({ cls: 'claudian-header-title' });
    const logoContainer = headerTitle.createDiv({ cls: 'claudian-logo' });
    logoContainer.innerHTML = `<svg width="24" height="24" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 35L236.6 75V185L150 265L63.4 185V75L150 35Z"
            stroke="#7F52FF"
            stroke-width="24"
            stroke-linejoin="round"/>
      <path d="M150 85C153.9 115 175 136.1 205 140C175 143.9 153.9 165 150 195C146.1 165 125 143.9 95 140C125 136.1 146.1 115 150 85Z"
            fill="#E95D3C"/>
    </svg>`;
    headerTitle.createEl('h4', { text: 'Claudian' });

    // Header controls
    const headerControls = header.createDiv({ cls: 'claudian-header-controls' });

    // Agent mode toggle
    this.agentToggle = headerControls.createDiv({ cls: 'claudian-agent-toggle' });
    const agentLabel = this.agentToggle.createSpan({ cls: 'agent-toggle-label', text: t('chat.agentLabel') });
    const toggleSwitch = this.agentToggle.createDiv({ cls: 'agent-toggle-switch' });
    if (this.isAgentModeActive) {
      toggleSwitch.addClass('is-active');
    }
    toggleSwitch.onclick = () => this.toggleAgentMode(toggleSwitch);

    const clearBtn = headerControls.createEl('button', { cls: 'claudian-clear-btn' });
    setIcon(clearBtn, 'trash-2');
    clearBtn.setAttribute('aria-label', t('chat.clearLabel'));
    clearBtn.onclick = () => this.clearChat();

    // Messages container
    this.messagesContainer = container.createDiv({ cls: 'claudian-messages' });

    // Restore history if exists
    this.restoreHistory();

    // Input wrapper container (for resize)
    const inputWrapper = container.createDiv({ cls: 'claudian-input-wrapper' });

    // Resize handle
    const resizeHandle = inputWrapper.createDiv({ cls: 'claudian-resize-handle' });
    this.setupResizeHandle(resizeHandle, inputWrapper, container as HTMLElement);

    // Input area
    const inputArea = inputWrapper.createDiv({ cls: 'claudian-input-area' });

    this.inputEl = inputArea.createEl('textarea', {
      cls: 'claudian-input',
      attr: { placeholder: t('chat.placeholder') }
    });

    // Enter to send, Shift+Enter for new line
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea based on content (respecting wrapper limits)
    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto';
      const maxHeight = inputWrapper.clientHeight - 24; // padding
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, maxHeight) + 'px';
    });

    this.sendButton = inputArea.createEl('button', {
      cls: 'claudian-send-btn',
      text: t('chat.send')
    });
    this.sendButton.onclick = () => this.sendMessage();
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  private restoreHistory(): void {
    const history = this.client.getHistory();
    history.forEach(msg => {
      this.renderMessage(msg.role, msg.content);
    });
  }

  private clearChat(): void {
    this.client.clearHistory();
    this.messagesContainer.empty();
    new Notice(t('chat.cleared'));
  }

  private toggleAgentMode(toggleEl: HTMLElement): void {
    this.isAgentModeActive = !this.isAgentModeActive;

    if (this.isAgentModeActive) {
      toggleEl.addClass('is-active');
      new Notice(t('chat.agentEnabled'));
    } else {
      toggleEl.removeClass('is-active');
      new Notice(t('chat.agentDisabled'));
    }
  }

  private async sendMessage(): Promise<void> {
    const message = this.inputEl.value.trim();
    if (!message || this.isStreaming) return;

    // Update settings in case they changed
    this.client.updateSettings(this.plugin.settings);

    // Clear input
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';

    // Render user message
    this.renderMessage('user', message);

    // Prepare container for response
    const responseEl = this.createMessageElement('assistant');
    const contentEl = responseEl.querySelector('.claudian-message-content') as HTMLElement;

    // Add streaming cursor
    const cursorEl = contentEl.createSpan({ cls: 'claudian-cursor' });

    this.isStreaming = true;
    this.sendButton.disabled = true;
    this.sendButton.setText('...');

    let fullResponse = '';

    // Choose method based on mode
    if (this.isAgentModeActive) {
      await this.sendAgentMessage(message, responseEl, contentEl, cursorEl);
    } else {
      await this.sendNormalMessage(message, responseEl, contentEl, cursorEl);
    }
  }

  private async sendNormalMessage(
    message: string,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    cursorEl: HTMLElement
  ): Promise<void> {
    let fullResponse = '';

    await this.client.sendMessageStream(message, {
      onStart: () => {
        // Streaming started
      },
      onToken: (token) => {
        fullResponse += token;
        // Update content as it arrives
        cursorEl.remove();
        contentEl.empty();

        // Render markdown
        MarkdownRenderer.render(
          this.app,
          fullResponse,
          contentEl,
          '',
          this
        );

        // Re-add cursor
        contentEl.appendChild(cursorEl);

        // Auto scroll
        this.scrollToBottom();
      },
      onComplete: (response) => {
        // Remove cursor and add action buttons
        cursorEl.remove();
        contentEl.empty();

        // Render final markdown
        MarkdownRenderer.render(
          this.app,
          response,
          contentEl,
          '',
          this
        );

        // Add action buttons
        this.addMessageActions(responseEl, response);

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.empty();
        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
      }
    });
  }

  private async sendAgentMessage(
    message: string,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    cursorEl: HTMLElement
  ): Promise<void> {
    let fullResponse = '';

    // Phase 2: Context reinforcement
    let enhancedMessage = message;
    let systemPromptAdditions = '';

    if (this.plugin.settings.enableContextReinforcement) {
      const history = this.client.getHistory();
      const analysis = this.contextReinforcer.analyzeConversation(history);

      if (analysis.needsReinforcement) {
        systemPromptAdditions = this.contextReinforcer.getSystemPromptReinforcement(analysis);
        enhancedMessage = this.contextReinforcer.enhanceUserMessage(message, analysis);
      }
    }

    // Phase 2: Task complexity analysis
    if (this.plugin.settings.enableAutoPlan) {
      const taskAnalysis = this.taskPlanner.analyzeRequest(message);
      if (taskAnalysis.suggestPlanning && !this.currentPlan) {
        // Create a simple plan for complex tasks
        this.currentPlan = this.taskPlanner.createSimplePlan(message, taskAnalysis);
      }
    }

    const agentSystemPrompt = this.agentMode.getSystemPrompt() + systemPromptAdditions;

    // Reset auto-continue counter for new message
    this.autoContinueCount = 0;

    await this.client.sendAgentMessageStream(enhancedMessage, agentSystemPrompt, {
      onStart: () => {
        // Streaming started
      },
      onToken: (token) => {
        fullResponse += token;
        cursorEl.remove();
        contentEl.empty();

        // Show response as it arrives
        MarkdownRenderer.render(
          this.app,
          fullResponse,
          contentEl,
          '',
          this
        );

        contentEl.appendChild(cursorEl);
        this.scrollToBottom();
      },
      onComplete: async (response) => {
        cursorEl.remove();
        contentEl.empty();

        // Phase 2: Truncation detection - CHECK FIRST before parsing
        const history = this.client.getHistory();
        const truncationResult = TruncationDetector.detect({
          response,
          isAgentMode: true,
          history
        });

        // Handle truncation with auto-continue - BEFORE attempting to parse
        if (truncationResult.isTruncated &&
            this.plugin.settings.autoContinueOnTruncation &&
            this.autoContinueCount < this.MAX_AUTO_CONTINUES) {

          this.autoContinueCount++;

          // Show partial response while continuing
          MarkdownRenderer.render(this.app, response, contentEl, '', this);

          await this.handleTruncatedResponse(
            response,
            truncationResult,
            responseEl,
            contentEl
          );
          return;
        }

        // Only parse and validate AFTER confirming response is complete
        const parsedResponse = this.agentMode.parseAgentResponse(response);
        const validation = ResponseValidator.validate(response, parsedResponse);

        // Handle validation issues (model confusion, missing JSON)
        if (!validation.isValid && ResponseValidator.shouldRetry(validation) &&
            this.autoContinueCount < this.MAX_AUTO_CONTINUES) {

          this.autoContinueCount++;
          await this.handleValidationRetry(
            response,
            validation,
            responseEl,
            contentEl
          );
          return;
        }

        // Normal processing
        if (this.agentMode.isAgentResponse(response)) {
          await this.handleAgentResponse(response, responseEl, contentEl);
        } else {
          // Normal response (conversation)
          MarkdownRenderer.render(
            this.app,
            response,
            contentEl,
            '',
            this
          );
          this.addMessageActions(responseEl, response);
        }

        // Reset state after successful completion
        this.autoContinueCount = 0;
        this.currentPlan = null;

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.empty();
        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });

        this.autoContinueCount = 0;
        this.currentPlan = null;

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
      }
    });
  }

  /**
   * Phase 2: Delay helper to avoid rate limits
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Phase 2/3: Handle truncated response with auto-continue
   * Uses context manager to persist partial responses
   */
  private async handleTruncatedResponse(
    partialResponse: string,
    truncationResult: TruncationDetectionResult,
    responseEl: HTMLElement,
    contentEl: HTMLElement
  ): Promise<void> {
    const contextManager = this.plugin.contextManager;

    // Phase 3: Save partial response to temp storage on first truncation
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
    const agentSystemPrompt = this.agentMode.getSystemPrompt();

    await this.client.sendAgentMessageStream(continuePrompt, agentSystemPrompt, {
      onStart: () => {},
      onToken: (token) => {
        continuationResponse += token;
        cursorEl.remove();

        // Render combined response
        const combined = TruncationDetector.mergeResponses(partialResponse, continuationResponse);
        contentEl.empty();
        MarkdownRenderer.render(this.app, combined, contentEl, '', this);
        contentEl.appendChild(cursorEl);
        this.scrollToBottom();
      },
      onComplete: async (response) => {
        cursorEl.remove();
        indicator.remove();

        // Merge and process complete response
        const fullResponse = TruncationDetector.mergeResponses(partialResponse, response);
        contentEl.empty();

        // Phase 3: Update partial in storage
        if (this.currentPartialId && contextManager) {
          await contextManager.appendToPartialResponse(this.currentPartialId, response);
        }

        // Check if still truncated
        const newTruncation = TruncationDetector.detect({
          response: fullResponse,
          isAgentMode: true,
          history: this.client.getHistory()
        });

        if (newTruncation.isTruncated &&
            this.autoContinueCount < this.MAX_AUTO_CONTINUES) {
          this.autoContinueCount++;
          await this.handleTruncatedResponse(fullResponse, newTruncation, responseEl, contentEl);
          return;
        }

        // Phase 3: Complete partial and clean up
        if (this.currentPartialId && contextManager) {
          await contextManager.completePartialResponse(this.currentPartialId);
          this.currentPartialId = null;
        }

        // Process complete response
        if (this.agentMode.isAgentResponse(fullResponse)) {
          await this.handleAgentResponse(fullResponse, responseEl, contentEl);
        } else {
          MarkdownRenderer.render(this.app, fullResponse, contentEl, '', this);
          this.addMessageActions(responseEl, fullResponse);
        }

        this.autoContinueCount = 0;
        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
        this.scrollToBottom();
      },
      onError: async (error) => {
        cursorEl.remove();

        // Phase 3: Clean up partial on error
        if (this.currentPartialId && contextManager) {
          await contextManager.completePartialResponse(this.currentPartialId);
          this.currentPartialId = null;
        }

        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });
        this.autoContinueCount = 0;
        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
      }
    });
  }

  /**
   * Phase 2: Handle validation retry when model shows confusion
   */
  private async handleValidationRetry(
    originalResponse: string,
    validation: ValidationResult,
    responseEl: HTMLElement,
    contentEl: HTMLElement
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
    const agentSystemPrompt = this.agentMode.getSystemPrompt() +
      '\n\n' + t('agent.reinforcement.reminder');

    await this.client.sendAgentMessageStream(retryPrompt, agentSystemPrompt, {
      onStart: () => {},
      onToken: (token) => {
        retryResponse += token;
        cursorEl.remove();
        contentEl.empty();
        MarkdownRenderer.render(this.app, retryResponse, contentEl, '', this);
        contentEl.appendChild(cursorEl);
        this.scrollToBottom();
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
          await this.handleValidationRetry(response, retryValidation, responseEl, contentEl);
          return;
        }

        // Process response
        if (this.agentMode.isAgentResponse(response)) {
          await this.handleAgentResponse(response, responseEl, contentEl);
        } else {
          MarkdownRenderer.render(this.app, response, contentEl, '', this);
          this.addMessageActions(responseEl, response);
        }

        this.autoContinueCount = 0;
        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });
        this.autoContinueCount = 0;
        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText(t('chat.send'));
      }
    });
  }

  private async handleAgentResponse(
    response: string,
    responseEl: HTMLElement,
    contentEl: HTMLElement
  ): Promise<void> {
    const agentResponse = this.agentMode.parseAgentResponse(response);

    if (!agentResponse || agentResponse.actions.length === 0) {
      // No actions, show normal message
      MarkdownRenderer.render(
        this.app,
        agentResponse?.message || response,
        contentEl,
        '',
        this
      );
      this.addMessageActions(responseEl, response);
      return;
    }

    // Show initial message
    MarkdownRenderer.render(
      this.app,
      agentResponse.message,
      contentEl,
      '',
      this
    );

    // Check for destructive actions that require confirmation
    const destructiveActions = this.agentMode.getDestructiveActions(agentResponse.actions);

    if (destructiveActions.length > 0 && this.plugin.settings.confirmDestructiveActions) {
      // Show confirmation modal
      await this.showConfirmationAndExecute(agentResponse, responseEl, contentEl);
    } else {
      // Execute directly
      await this.executeAgentActions(agentResponse.actions, responseEl, contentEl, agentResponse.message);
    }
  }

  private async showConfirmationAndExecute(
    agentResponse: AgentResponse,
    responseEl: HTMLElement,
    contentEl: HTMLElement
  ): Promise<void> {
    const destructiveActions = this.agentMode.getDestructiveActions(agentResponse.actions);

    return new Promise((resolve) => {
      new ConfirmationModal(
        this.plugin,
        destructiveActions,
        async () => {
          // Confirmed: execute all actions
          await this.executeAgentActions(
            agentResponse.actions,
            responseEl,
            contentEl,
            agentResponse.message
          );
          resolve();
        },
        () => {
          // Cancelled: show message
          const cancelMsg = contentEl.createDiv({ cls: 'agent-action-cancelled' });
          cancelMsg.setText(t('chat.actionsCancelled'));
          resolve();
        }
      ).open();
    });
  }

  private async executeAgentActions(
    actions: VaultAction[],
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    originalMessage: string
  ): Promise<void> {
    try {
      const results = await this.agentMode.executeActions(actions);
      const summary = this.agentMode.getSummaryMessage(results, originalMessage);

      // Update content with results
      contentEl.empty();
      MarkdownRenderer.render(
        this.app,
        summary,
        contentEl,
        '',
        this
      );

      // Add visual indicator for executed actions
      const actionsIndicator = contentEl.createDiv({ cls: 'agent-actions-indicator' });
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        actionsIndicator.addClass('all-success');
        actionsIndicator.setText(t('chat.actionsExecuted', { count: String(successCount) }));
      } else {
        actionsIndicator.addClass('has-errors');
        actionsIndicator.setText(t('chat.actionsPartial', { success: String(successCount), failed: String(failCount) }));
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('chat.errorUnknown');
      contentEl.createDiv({ cls: 'agent-action-error' }).setText(t('chat.error', { message: errorMsg }));
    }

    this.addMessageActions(responseEl, originalMessage);
  }

  private renderMessage(role: 'user' | 'assistant', content: string): void {
    const messageEl = this.createMessageElement(role);
    const contentEl = messageEl.querySelector('.claudian-message-content') as HTMLElement;

    if (role === 'assistant') {
      MarkdownRenderer.render(
        this.app,
        content,
        contentEl,
        '',
        this
      );
      this.addMessageActions(messageEl, content);
    } else {
      contentEl.setText(content);
    }

    this.scrollToBottom();
  }

  private createMessageElement(role: 'user' | 'assistant'): HTMLElement {
    const messageEl = this.messagesContainer.createDiv({
      cls: `claudian-message claudian-message-${role}`
    });

    messageEl.createDiv({ cls: 'claudian-message-content' });

    return messageEl;
  }

  private addMessageActions(messageEl: HTMLElement, content: string): void {
    const actionsEl = messageEl.createDiv({ cls: 'claudian-message-actions' });

    // Copy button
    const copyBtn = actionsEl.createEl('button', { cls: 'claudian-action-btn' });
    setIcon(copyBtn, 'clipboard-copy');
    copyBtn.setAttribute('aria-label', t('chat.copyLabel'));
    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(content);
      new Notice(t('chat.copied'));
    };

    // Create note button
    const noteBtn = actionsEl.createEl('button', { cls: 'claudian-action-btn' });
    setIcon(noteBtn, 'file-plus');
    noteBtn.setAttribute('aria-label', t('chat.createNoteLabel'));
    noteBtn.onclick = () => {
      new NoteCreatorModal(this.app, this.plugin, content).open();
    };
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private setupResizeHandle(
    handle: HTMLElement,
    wrapper: HTMLElement,
    container: HTMLElement
  ): void {
    const MIN_HEIGHT = 64;  // Minimum height in px
    const MAX_RATIO = 0.5;  // Maximum 50% of parent container

    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    const onMouseDown = (e: MouseEvent) => {
      isResizing = true;
      startY = e.clientY;
      startHeight = wrapper.offsetHeight;
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = startY - e.clientY;
      const maxHeight = container.offsetHeight * MAX_RATIO;
      const newHeight = Math.min(Math.max(startHeight + deltaY, MIN_HEIGHT), maxHeight);

      wrapper.style.height = newHeight + 'px';

      // Adjust textarea to new size
      const inputArea = wrapper.querySelector('.claudian-input-area') as HTMLElement;
      if (inputArea) {
        this.inputEl.style.height = 'auto';
        const availableHeight = newHeight - 24; // padding
        this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, availableHeight) + 'px';
      }
    };

    const onMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    handle.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Clean up event listeners when view closes
    this.register(() => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });
  }
}
