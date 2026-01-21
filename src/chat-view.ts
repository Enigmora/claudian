import { ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient, Message } from './claude-client';
import { NoteCreatorModal } from './note-creator';
import { AgentMode, AgentResponse } from './agent-mode';
import { VaultActionExecutor, VaultAction, ActionProgress } from './vault-actions';
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
    this.sendButton.onclick = () => this.handleButtonClick();
  }

  /**
   * Handle send/stop button click
   */
  private handleButtonClick(): void {
    if (this.isStreaming) {
      // Stop the current stream
      this.client.abortStream();
      this.resetButtonToSend();
    } else {
      // Send new message
      this.sendMessage();
    }
  }

  /**
   * Set button to Stop mode (during streaming)
   */
  private setButtonToStop(): void {
    this.sendButton.setText(t('chat.stop'));
    this.sendButton.addClass('is-stop');
    this.sendButton.disabled = false;
  }

  /**
   * Reset button to Send mode
   */
  private resetButtonToSend(): void {
    this.isStreaming = false;
    this.sendButton.setText(t('chat.send'));
    this.sendButton.removeClass('is-stop');
    this.sendButton.disabled = false;
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

    // Check if user is asking for vault actions without agent mode
    if (!this.isAgentModeActive && this.detectsVaultActionIntent(message)) {
      // Show warning and offer to enable agent mode
      const shouldContinue = await this.showAgentModeWarning();
      if (!shouldContinue) {
        return; // User cancelled or enabled agent mode
      }
    }

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
    this.setButtonToStop();

    let fullResponse = '';

    // Choose method based on mode
    if (this.isAgentModeActive) {
      await this.sendAgentMessage(message, responseEl, contentEl, cursorEl);
    } else {
      await this.sendNormalMessage(message, responseEl, contentEl, cursorEl);
    }
  }

  /**
   * Detect if the user message contains intent to perform vault actions
   * This is a heuristic check to warn users when agent mode is needed
   */
  private detectsVaultActionIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Action verbs (Spanish and English)
    const actionVerbs = [
      // Create
      'crea', 'crear', 'create', 'genera', 'generar', 'generate',
      'escribe', 'escribir', 'write', 'haz', 'hacer', 'make',
      // Delete
      'elimina', 'eliminar', 'delete', 'borra', 'borrar', 'remove',
      // Move/Rename
      'mueve', 'mover', 'move', 'renombra', 'renombrar', 'rename',
      // Modify
      'modifica', 'modificar', 'modify', 'actualiza', 'actualizar', 'update',
      'agrega', 'agregar', 'add', 'añade', 'añadir', 'append',
      // Organize
      'organiza', 'organizar', 'organize', 'ordena', 'ordenar', 'sort'
    ];

    // Target objects (Spanish and English)
    const targetObjects = [
      // Notes
      'nota', 'notas', 'note', 'notes',
      // Files
      'archivo', 'archivos', 'file', 'files', 'documento', 'documentos',
      // Folders
      'carpeta', 'carpetas', 'folder', 'folders', 'directorio', 'directorios',
      // Content
      'contenido', 'content'
    ];

    // Vault references
    const vaultReferences = [
      'bóveda', 'boveda', 'vault', 'obsidian'
    ];

    // Check for action verb + target object combination
    const hasActionVerb = actionVerbs.some(verb => lowerMessage.includes(verb));
    const hasTargetObject = targetObjects.some(obj => lowerMessage.includes(obj));
    const hasVaultReference = vaultReferences.some(ref => lowerMessage.includes(ref));

    // Strong indicators: explicit vault mention with action
    if (hasVaultReference && hasActionVerb) {
      return true;
    }

    // Medium indicators: action + target object
    if (hasActionVerb && hasTargetObject) {
      return true;
    }

    // Check for specific phrases that strongly indicate vault actions
    const strongPhrases = [
      'en la carpeta', 'in the folder', 'in folder',
      'crea un archivo', 'create a file', 'crear archivo',
      'nueva nota', 'new note', 'crear nota', 'create note',
      'elimina el archivo', 'delete the file', 'borrar archivo',
      'mueve a', 'move to', 'mover a'
    ];

    return strongPhrases.some(phrase => lowerMessage.includes(phrase));
  }

  /**
   * Show warning when user tries vault actions without agent mode
   * Returns true if user wants to continue anyway, false if cancelled/enabled agent mode
   */
  private async showAgentModeWarning(): Promise<boolean> {
    return new Promise((resolve) => {
      // Create warning message element
      const warningEl = this.messagesContainer.createDiv({ cls: 'agent-mode-warning' });

      const iconEl = warningEl.createSpan({ cls: 'warning-icon' });
      iconEl.setText('⚠️');

      const textEl = warningEl.createDiv({ cls: 'warning-text' });
      textEl.createEl('strong', { text: t('agent.warningTitle') });
      textEl.createEl('p', { text: t('agent.warningDescription') });

      const buttonsEl = warningEl.createDiv({ cls: 'warning-buttons' });

      // Enable Agent Mode button
      const enableBtn = buttonsEl.createEl('button', {
        cls: 'warning-btn-primary',
        text: t('agent.enableAgentMode')
      });
      enableBtn.onclick = () => {
        // Enable agent mode
        this.isAgentModeActive = true;
        const toggleSwitch = this.agentToggle.querySelector('.agent-toggle-switch');
        if (toggleSwitch) {
          toggleSwitch.addClass('is-active');
        }
        new Notice(t('chat.agentEnabled'));
        warningEl.remove();
        resolve(false); // Don't continue, let user re-send with agent mode
      };

      // Continue anyway button
      const continueBtn = buttonsEl.createEl('button', {
        cls: 'warning-btn-secondary',
        text: t('agent.continueAnyway')
      });
      continueBtn.onclick = () => {
        warningEl.remove();
        resolve(true); // Continue without agent mode
      };

      // Cancel button
      const cancelBtn = buttonsEl.createEl('button', {
        cls: 'warning-btn-tertiary',
        text: t('confirmation.cancel')
      });
      cancelBtn.onclick = () => {
        warningEl.remove();
        resolve(false); // Don't continue
      };

      this.scrollToBottom();
    });
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

        this.resetButtonToSend();
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.empty();
        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });

        this.resetButtonToSend();
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
    let streamingIndicator: HTMLElement | null = null;
    let isShowingIndicator = false;
    let confirmedAsJson = false; // Once confirmed as JSON, stay in indicator mode

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

        // Once confirmed as JSON, don't switch back to markdown view
        if (!confirmedAsJson) {
          confirmedAsJson = this.looksLikeAgentJsonResponse(fullResponse);
        }

        if (confirmedAsJson) {
          // Show elegant processing indicator instead of raw JSON
          if (!isShowingIndicator) {
            cursorEl.remove();
            contentEl.empty();
            streamingIndicator = this.createStreamingIndicator(contentEl);
            isShowingIndicator = true;
          }
          // Update the indicator with current stats
          this.updateStreamingIndicator(streamingIndicator, fullResponse);
        } else {
          // Not yet confirmed as JSON - show as markdown for now
          cursorEl.remove();
          contentEl.empty();

          MarkdownRenderer.render(
            this.app,
            fullResponse,
            contentEl,
            '',
            this
          );

          contentEl.appendChild(cursorEl);
        }

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

        this.resetButtonToSend();
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

        this.resetButtonToSend();
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
        this.resetButtonToSend();
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
        this.resetButtonToSend();
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
        this.resetButtonToSend();
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.createEl('span', {
          text: t('chat.error', { message: error.message }),
          cls: 'claudian-error'
        });
        this.autoContinueCount = 0;
        this.resetButtonToSend();
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

    // Check for destructive actions that require confirmation
    const destructiveActions = this.agentMode.getDestructiveActions(agentResponse.actions);

    // Check for actions that would overwrite existing files
    const overwriteActions = this.executor.getOverwriteActions(agentResponse.actions);

    // Combine actions that need confirmation
    const actionsNeedingConfirmation = [...destructiveActions, ...overwriteActions];

    if (actionsNeedingConfirmation.length > 0 && this.plugin.settings.confirmDestructiveActions) {
      // Show message before confirmation modal
      MarkdownRenderer.render(this.app, agentResponse.message, contentEl, '', this);
      // Show confirmation modal (including overwrite warnings)
      await this.showConfirmationAndExecute(agentResponse, responseEl, contentEl, overwriteActions.length > 0);
    } else {
      // Execute directly - executeAgentActions will render the message
      await this.executeAgentActions(agentResponse.actions, responseEl, contentEl, agentResponse.message);
    }
  }

  private async showConfirmationAndExecute(
    agentResponse: AgentResponse,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    hasOverwrites: boolean = false
  ): Promise<void> {
    const destructiveActions = this.agentMode.getDestructiveActions(agentResponse.actions);
    const overwriteActions = this.executor.getOverwriteActions(agentResponse.actions);

    // Combine both types of actions for the modal
    const allConfirmActions = [...destructiveActions, ...overwriteActions];

    return new Promise((resolve) => {
      new ConfirmationModal(
        this.plugin,
        allConfirmActions,
        async () => {
          // Confirmed: mark overwrite actions and execute
          let actionsToExecute = agentResponse.actions;
          if (hasOverwrites) {
            actionsToExecute = this.executor.markForOverwrite(agentResponse.actions);
          }
          await this.executeAgentActions(
            actionsToExecute,
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
    // Clear any previous content (e.g., from confirmation modal flow)
    contentEl.empty();

    // Create progress container
    const progressContainer = contentEl.createDiv({ cls: 'agent-progress-container' });

    // Show initial message
    const messageEl = progressContainer.createDiv({ cls: 'agent-progress-message' });
    MarkdownRenderer.render(this.app, originalMessage, messageEl, '', this);

    // Create progress list for real-time updates
    const progressList = progressContainer.createDiv({ cls: 'agent-progress-list' });

    // Progress bar
    const progressBarContainer = progressContainer.createDiv({ cls: 'agent-progress-bar-container' });
    const progressText = progressBarContainer.createDiv({ cls: 'agent-progress-text' });
    progressText.setText(t('agent.progressStarting'));
    const progressBarTrack = progressBarContainer.createDiv({ cls: 'agent-progress-bar-track' });
    const progressBar = progressBarTrack.createDiv({ cls: 'agent-progress-bar' });

    // Track completed results for final summary
    const completedResults: Map<number, { element: HTMLElement, result: any }> = new Map();

    try {
      const results = await this.agentMode.executeActions(actions, (progress: ActionProgress) => {
        const { current, total, action, result } = progress;

        // Update progress bar
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.setText(t('agent.progressStatus', {
          current: String(current),
          total: String(total)
        }));

        // Get or create progress item for this action
        let itemEl = completedResults.get(current)?.element;

        if (!itemEl) {
          // Create new progress item (before execution completes)
          itemEl = progressList.createDiv({ cls: 'agent-progress-item in-progress' });
          const iconEl = itemEl.createSpan({ cls: 'agent-progress-icon' });
          iconEl.setText('⏳');
          const descEl = itemEl.createSpan({ cls: 'agent-progress-desc' });
          descEl.setText(action.description || this.getActionDescription(action));
          completedResults.set(current, { element: itemEl, result: null });
        }

        // Update item when result is available
        if (result) {
          itemEl.removeClass('in-progress');
          const iconEl = itemEl.querySelector('.agent-progress-icon') as HTMLElement;

          if (result.success) {
            itemEl.addClass('success');
            iconEl.setText('✓');
          } else {
            itemEl.addClass('error');
            iconEl.setText('✗');
            // Add error message
            const errorEl = itemEl.createSpan({ cls: 'agent-progress-error' });
            errorEl.setText(result.error || t('chat.errorUnknown'));
          }

          completedResults.set(current, { element: itemEl, result });
        }

        // Auto scroll to show progress
        this.scrollToBottom();
      });

      // Final summary
      progressBar.style.width = '100%';
      progressBarContainer.addClass('complete');

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      // Update progress text with final status
      if (failCount === 0) {
        progressText.setText(t('chat.actionsExecuted', { count: String(successCount) }));
        progressBarContainer.addClass('all-success');
      } else {
        progressText.setText(t('chat.actionsPartial', { success: String(successCount), failed: String(failCount) }));
        progressBarContainer.addClass('has-errors');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('chat.errorUnknown');
      progressBarContainer.addClass('error');
      progressText.setText(t('chat.error', { message: errorMsg }));
    }

    this.addMessageActions(responseEl, originalMessage);
  }

  /**
   * Get human-readable description for an action
   */
  private getActionDescription(action: VaultAction): string {
    const { params } = action;

    switch (action.action) {
      case 'create-folder':
        return t('agent.createFolder', { path: params.path });
      case 'delete-folder':
        return t('agent.deleteFolder', { path: params.path });
      case 'list-folder':
        return t('agent.listFolder', { path: params.path || '/' });
      case 'create-note':
        return t('agent.createNote', { path: params.path });
      case 'read-note':
        return t('agent.readNote', { path: params.path });
      case 'delete-note':
        return t('agent.deleteNote', { path: params.path });
      case 'rename-note':
        return t('agent.renameNote', { from: params.from, to: params.to });
      case 'move-note':
        return t('agent.moveNote', { from: params.from, to: params.to });
      case 'append-content':
        return t('agent.appendContent', { path: params.path });
      case 'prepend-content':
        return t('agent.prependContent', { path: params.path });
      case 'replace-content':
        return t('agent.replaceContent', { path: params.path });
      case 'update-frontmatter':
        return t('agent.updateFrontmatter', { path: params.path });
      case 'search-notes':
        return t('agent.searchNotes', { query: params.query });
      case 'get-note-info':
        return t('agent.getNoteInfo', { path: params.path });
      case 'find-links':
        return t('agent.findLinks', { target: params.target });
      default:
        return t('agent.genericAction', { action: action.action });
    }
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

  /**
   * Detect if the response looks like an agent JSON response
   * This helps us show a nice indicator instead of raw JSON during streaming
   */
  private looksLikeAgentJsonResponse(response: string): boolean {
    const trimmed = response.trim();

    // Case 1: Response starts directly with JSON object
    if (trimmed.startsWith('{')) {
      // Wait for at least a few characters
      if (trimmed.length < 5) {
        return false;
      }
      // If we have { followed by quote (with optional whitespace), it's JSON
      if (/^\{\s*"/.test(trimmed)) {
        return true;
      }
    }

    // Case 2: JSON inside markdown code block (```json or ```)
    if (trimmed.includes('```')) {
      // Check if it looks like a JSON code block with agent patterns
      const codeBlockMatch = /```(?:json)?\s*\{[\s\S]*?"(?:actions|thinking|message)"/.test(trimmed);
      if (codeBlockMatch) {
        return true;
      }
    }

    // Case 3: JSON appears somewhere in the response (after text explanation)
    // Look for the characteristic agent JSON structure anywhere in the text
    const hasAgentJsonStructure = /\{\s*"(?:thinking|actions|message)"\s*:/.test(trimmed);
    if (hasAgentJsonStructure) {
      return true;
    }

    return false;
  }

  /**
   * Create a streaming indicator for agent responses
   */
  private createStreamingIndicator(container: HTMLElement): HTMLElement {
    const indicator = container.createDiv({ cls: 'agent-streaming-indicator' });

    // Header with spinner
    const header = indicator.createDiv({ cls: 'agent-streaming-header' });
    const spinner = header.createSpan({ cls: 'agent-streaming-spinner' });
    spinner.setText('⚙️');
    header.createSpan({ cls: 'agent-streaming-title', text: t('agent.generatingResponse') });

    // Stats container
    const stats = indicator.createDiv({ cls: 'agent-streaming-stats' });

    // Character count
    const charStat = stats.createDiv({ cls: 'agent-streaming-stat' });
    charStat.createSpan({ cls: 'stat-label', text: t('agent.streamingChars') });
    charStat.createSpan({ cls: 'stat-value chars-count', text: '0' });

    // Actions detected
    const actionsStat = stats.createDiv({ cls: 'agent-streaming-stat' });
    actionsStat.createSpan({ cls: 'stat-label', text: t('agent.streamingActions') });
    actionsStat.createSpan({ cls: 'stat-value actions-count', text: '0' });

    // Progress bar (indeterminate)
    const progressContainer = indicator.createDiv({ cls: 'agent-streaming-progress' });
    progressContainer.createDiv({ cls: 'agent-streaming-progress-bar' });

    // Collapsible raw preview (for debugging)
    const previewToggle = indicator.createDiv({ cls: 'agent-streaming-preview-toggle' });
    previewToggle.setText(t('agent.showRawResponse'));

    const previewContainer = indicator.createDiv({ cls: 'agent-streaming-preview hidden' });
    const previewContent = previewContainer.createEl('pre', { cls: 'agent-streaming-preview-content' });

    previewToggle.onclick = () => {
      previewContainer.classList.toggle('hidden');
      previewToggle.setText(
        previewContainer.classList.contains('hidden')
          ? t('agent.showRawResponse')
          : t('agent.hideRawResponse')
      );
    };

    return indicator;
  }

  /**
   * Update the streaming indicator with current response stats
   */
  private updateStreamingIndicator(indicator: HTMLElement | null, response: string): void {
    if (!indicator) return;

    // Update character count
    const charsEl = indicator.querySelector('.chars-count');
    if (charsEl) {
      charsEl.setText(this.formatNumber(response.length));
    }

    // Count actions detected so far
    const actionsCount = (response.match(/"action"\s*:/g) || []).length;
    const actionsEl = indicator.querySelector('.actions-count');
    if (actionsEl) {
      actionsEl.setText(String(actionsCount));
    }

    // Update raw preview
    const previewContent = indicator.querySelector('.agent-streaming-preview-content');
    if (previewContent) {
      // Show last 500 chars to keep it manageable
      const previewText = response.length > 500
        ? '...' + response.slice(-500)
        : response;
      previewContent.setText(previewText);
    }
  }

  /**
   * Format large numbers with K/M suffix
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return String(num);
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
