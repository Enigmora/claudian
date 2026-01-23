import { ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient, Message } from './claude-client';
import { NoteCreatorModal } from './note-creator';
import { AgentMode, AgentResponse } from './agent-mode';
import { VaultActionExecutor, VaultAction, ActionProgress, ActionResult } from './vault-actions';
import { ConfirmationModal } from './confirmation-modal';
import { t } from './i18n';
// Phase 2: Enhanced Agent Mode
import { TruncationDetector, TruncationDetectionResult } from './truncation-detector';
import { ContextReinforcer, ConversationAnalysis } from './context-reinforcer';
import { ResponseValidator, ValidationResult } from './response-validator';
import { TaskPlanner, TaskPlan, TaskAnalysis } from './task-planner';
// Phase 5: Token Tracking
import type { TokenUsage, SessionTokenStats } from './token-tracker';
// Phase 6: Context Management
import type { ContextManager } from './context-manager';
// Model Orchestrator
import { ModelOrchestrator, ExecutionMode, ModelId, RouteResult } from './model-orchestrator';

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

  // Phase 2: Agentic Loop State
  private agentLoopActive: boolean = false;
  private agentLoopHistory: string[] = [];  // Hash of actions per iteration to detect loops
  private agentLoopCancelled: boolean = false;
  // Phase 3: Loop UX enhancements
  private agentLoopTokens: { input: number; output: number } = { input: 0, output: 0 };
  private agentLoopContainer: HTMLElement | null = null;  // Container for loop history

  // Phase 5: Token Tracking
  private tokenFooter: HTMLElement | null = null;
  private tokenIndicator: HTMLElement | null = null;
  private tokenUsageCleanup: (() => void) | null = null;

  // Welcome Screen
  private welcomeScreen: HTMLElement | null = null;

  // Model Orchestrator
  private orchestrator: ModelOrchestrator;
  private lastRouteResult: RouteResult | null = null;

  // Processing status overlay (replaces input during processing)
  private processingOverlay: HTMLElement | null = null;

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

    // Model Orchestrator (shares ClaudeClient for Haiku classification)
    this.orchestrator = new ModelOrchestrator(this.client, plugin.settings.executionMode);
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
    await this.restoreHistory();

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

    // Processing overlay (shown during active operations)
    this.processingOverlay = inputArea.createDiv({ cls: 'claudian-processing-overlay hidden' });
    this.processingOverlay.createSpan({ cls: 'processing-spinner' });
    this.processingOverlay.createSpan({ cls: 'processing-text' });

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
      // Calculate available height: input-area height minus padding
      const inputAreaHeight = inputArea.clientHeight;
      const maxHeight = inputAreaHeight - 16; // account for padding
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, maxHeight) + 'px';
    });

    this.sendButton = inputArea.createEl('button', {
      cls: 'claudian-send-btn',
      text: t('chat.send')
    });
    this.sendButton.onclick = () => this.handleButtonClick();

    // Phase 5: Token usage footer (independent element, not inside inputWrapper)
    this.createTokenFooter(container as HTMLElement);
    this.setupTokenTracking();

    // Phase 6: Initialize context session
    await this.initializeContextSession();
  }

  /**
   * Handle send/stop button click
   */
  private handleButtonClick(): void {
    if (this.isStreaming || this.agentLoopActive) {
      // Stop the current stream and/or cancel the agentic loop
      this.client.abortStream();
      if (this.agentLoopActive) {
        this.agentLoopCancelled = true;
      }
      this.resetButtonToSend(true); // Force reset
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
   * @param force - Force reset even if agentic loop is active (used for cancellation)
   */
  private resetButtonToSend(force: boolean = false): void {
    this.isStreaming = false;

    // Don't reset to Send if agentic loop is still active (unless forced)
    if (this.agentLoopActive && !force) {
      // Keep button in Stop mode while loop is active
      this.sendButton.setText(t('chat.stop'));
      this.sendButton.addClass('is-stop');
      this.sendButton.disabled = false;
      return;
    }

    // Hide processing status when fully done
    this.hideProcessingStatus();

    this.sendButton.setText(t('chat.send'));
    this.sendButton.removeClass('is-stop');
    this.sendButton.disabled = false;
  }

  async onClose(): Promise<void> {
    // Cleanup token tracking subscription
    if (this.tokenUsageCleanup) {
      this.tokenUsageCleanup();
      this.tokenUsageCleanup = null;
    }

    // Phase 6: End context session
    await this.endContextSession();
  }

  private async restoreHistory(): Promise<void> {
    const history = this.client.getHistory();
    if (history.length === 0) {
      this.showWelcomeScreen();
    } else {
      history.forEach(msg => {
        this.renderMessage(msg.role, msg.content);
      });
    }
  }

  private async clearChat(): Promise<void> {
    await this.client.clearHistory();
    this.messagesContainer.empty();
    this.showWelcomeScreen();
    new Notice(t('chat.cleared'));
  }

  private showWelcomeScreen(): void {
    // Remove existing welcome screen if any
    this.hideWelcomeScreen();

    this.welcomeScreen = this.messagesContainer.createDiv({ cls: 'claudian-welcome' });

    // Logo SVG
    const logoEl = this.welcomeScreen.createDiv({ cls: 'claudian-welcome-logo' });
    logoEl.innerHTML = `<svg width="64" height="64" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 35L236.6 75V185L150 265L63.4 185V75L150 35Z"
            stroke="#7F52FF"
            stroke-width="24"
            stroke-linejoin="round"/>
      <path d="M150 85C153.9 115 175 136.1 205 140C175 143.9 153.9 165 150 195C146.1 165 125 143.9 95 140C125 136.1 146.1 115 150 85Z"
            fill="#E95D3C"/>
    </svg>`;

    // Title
    this.welcomeScreen.createEl('h2', {
      text: t('welcome.title'),
      cls: 'claudian-welcome-title'
    });

    // Developed by
    this.welcomeScreen.createEl('p', {
      text: t('welcome.developedBy'),
      cls: 'claudian-welcome-developed-by'
    });

    // Greeting
    this.welcomeScreen.createEl('p', {
      text: t('welcome.greeting'),
      cls: 'claudian-welcome-greeting'
    });

    // Spacer
    this.welcomeScreen.createDiv({ cls: 'claudian-welcome-spacer' });

    // Examples section
    const examplesEl = this.welcomeScreen.createDiv({ cls: 'claudian-welcome-examples' });
    examplesEl.createEl('p', {
      text: t('welcome.examplesHeader'),
      cls: 'claudian-welcome-examples-header'
    });

    const examplesList = examplesEl.createEl('ul', { cls: 'claudian-welcome-examples-list' });
    const examples = [
      t('welcome.example1'),
      t('welcome.example2'),
      t('welcome.example3'),
      t('welcome.example4'),
      t('welcome.example5')
    ];

    examples.forEach(example => {
      const li = examplesList.createEl('li', { text: example });
      li.onclick = () => {
        // Remove quotes from example text
        const cleanText = example.replace(/^"|"$/g, '');
        this.inputEl.value = cleanText;
        this.inputEl.focus();
      };
    });

    // Agent mode hint
    this.welcomeScreen.createEl('p', {
      text: t('welcome.agentModeHint'),
      cls: 'claudian-welcome-agent-hint'
    });
  }

  private hideWelcomeScreen(): void {
    if (this.welcomeScreen) {
      this.welcomeScreen.remove();
      this.welcomeScreen = null;
    }
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
    // Prevent sending if streaming or agentic loop is active
    if (!message || this.isStreaming || this.agentLoopActive) return;

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

    // Hide welcome screen if visible
    this.hideWelcomeScreen();

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
    // Phase 6: Check for summarization before sending
    await this.checkAndPerformSummarization();

    // Route request through orchestrator (async Haiku classification)
    this.lastRouteResult = await this.orchestrator.routeRequest(message, false);
    const selectedModel = this.lastRouteResult.model;

    let fullResponse = '';

    await this.client.sendMessageStream(message, {
      onStart: () => {
        // Streaming started
      },
      onUsage: (usage) => {
        this.trackTokenUsage(usage);
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
    }, selectedModel);
  }

  private async sendAgentMessage(
    message: string,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    cursorEl: HTMLElement
  ): Promise<void> {
    // Phase 6: Check for summarization before sending
    await this.checkAndPerformSummarization();

    // Route request through orchestrator (async Haiku classification)
    // For continuation commands, keep using the same model to avoid re-classification
    const isContinuation = this.isContinuationCommand(message);
    if (isContinuation && this.lastRouteResult) {
      // Keep the same model for continuations
      console.log('[Claudian] Continuation detected, keeping model:',
        this.orchestrator.getSelector().getModelDisplayName(this.lastRouteResult.model));
    } else {
      // New request, classify and route (shows "classifying..." status)
      this.showProcessingStatus('status.classifying');
      this.lastRouteResult = await this.orchestrator.routeRequest(message, true);
    }
    const selectedModel = this.lastRouteResult.model;
    this.showProcessingStatus('status.waitingResponse');

    let fullResponse = '';
    let streamingIndicator: HTMLElement | null = null;

    // In agent mode, ALWAYS show streaming indicator during the entire streaming phase.
    // This prevents the "JSON flash" where partial JSON content would briefly render
    // as colored code before being replaced by the proper indicator.
    // All rendering decisions are deferred to onComplete when we have the full response.
    cursorEl.remove();
    contentEl.empty();
    streamingIndicator = this.createStreamingIndicator(contentEl);

    // Detect manual continuation commands and enhance with context
    let enhancedMessage = message;
    if (this.isContinuationCommand(message)) {
      enhancedMessage = this.buildContinuationPrompt(message);
    }

    // Phase 2: Context reinforcement
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

    // Get system prompt with model-specific optimizations
    // Haiku uses a more verbose prompt for better results
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel) + systemPromptAdditions;

    // Reset auto-continue counter for new message
    this.autoContinueCount = 0;

    await this.client.sendAgentMessageStream(enhancedMessage, agentSystemPrompt, {
      onStart: () => {
        // Streaming started
      },
      onUsage: (usage) => {
        this.trackTokenUsage(usage);
      },
      onToken: (token) => {
        fullResponse += token;

        // In agent mode, ALWAYS keep the streaming indicator visible during streaming.
        // We never render partial content to avoid the "JSON flash" problem where
        // incomplete JSON would briefly appear as syntax-highlighted code.
        // All content rendering is deferred to onComplete.
        this.updateStreamingIndicator(streamingIndicator, fullResponse);
        this.scrollToBottom();
      },
      onComplete: async (response: string) => {
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

          // Show continuation indicator instead of partial JSON response
          // This prevents the "JSON flash" when response is truncated agent JSON
          const continueIndicator = this.createStreamingIndicator(contentEl);
          this.updateStreamingIndicator(continueIndicator, response);

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
        if (parsedResponse && parsedResponse.actions.length > 0) {
          // Pass already-parsed response to avoid double parsing
          await this.handleAgentResponse(response, responseEl, contentEl, 0, parsedResponse);
        } else if (this.agentMode.isAgentResponse(response)) {
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
    }, selectedModel);
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
    // Use the model from the last route result (if available) or re-route
    const selectedModel = this.lastRouteResult?.model;
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel);

    // Streaming indicator - kept visible throughout streaming to prevent JSON flash
    let streamingIndicator: HTMLElement | null = null;

    // Show indicator for entire streaming duration
    cursorEl.remove();
    contentEl.empty();
    streamingIndicator = this.createStreamingIndicator(contentEl);

    await this.client.sendAgentMessageStream(continuePrompt, agentSystemPrompt, {
      onStart: () => {},
      onUsage: (usage) => {
        this.trackTokenUsage(usage);
      },
      onToken: (token) => {
        continuationResponse += token;

        // Keep indicator visible during streaming - no early rendering
        this.updateStreamingIndicator(streamingIndicator, continuationResponse);
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
    }, selectedModel);
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
    // Use the model from the last route result (if available)
    const selectedModel = this.lastRouteResult?.model;
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel) +
      '\n\n' + t('agent.reinforcement.reminder');

    // Streaming indicator - kept visible throughout streaming to prevent JSON flash
    let streamingIndicator: HTMLElement | null = null;

    // Show indicator for entire streaming duration
    cursorEl.remove();
    contentEl.empty();
    streamingIndicator = this.createStreamingIndicator(contentEl);

    await this.client.sendAgentMessageStream(retryPrompt, agentSystemPrompt, {
      onStart: () => {},
      onUsage: (usage) => {
        this.trackTokenUsage(usage);
      },
      onToken: (token) => {
        retryResponse += token;

        // Keep indicator visible during streaming - no early rendering
        this.updateStreamingIndicator(streamingIndicator, retryResponse);
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
    }, selectedModel);
  }

  private async handleAgentResponse(
    response: string,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    loopCount: number = 0,
    preParseResponse?: AgentResponse | null
  ): Promise<void> {
    // Use pre-parsed response if available to avoid double parsing
    const agentResponse = preParseResponse !== undefined
      ? preParseResponse
      : this.agentMode.parseAgentResponse(response);

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

    let actionResults: ActionResult[] = [];

    // Phase 2/3: Start the agentic loop BEFORE executing actions if awaitResults is true
    // This ensures agentLoopActive is set before executeAgentActionsWithResults checks it
    const willContinueLoop = agentResponse.awaitResults === true;
    if (willContinueLoop && loopCount === 0) {
      this.startAgenticLoop();
      // Phase 3: Create loop container for visual history
      this.agentLoopContainer = contentEl.createDiv({ cls: 'agent-loop-container' });
    }

    if (actionsNeedingConfirmation.length > 0 && this.plugin.settings.confirmDestructiveActions) {
      // Show message before confirmation modal
      MarkdownRenderer.render(this.app, agentResponse.message, contentEl, '', this);
      // Show confirmation modal (including overwrite warnings)
      actionResults = await this.showConfirmationAndExecuteWithResults(agentResponse, responseEl, contentEl, overwriteActions.length > 0);
    } else {
      // Execute directly and get results
      actionResults = await this.executeAgentActionsWithResults(agentResponse.actions, responseEl, contentEl, agentResponse.message);
    }

    // Phase 2/3: Continue the agentic loop if awaitResults is true
    if (willContinueLoop && actionResults.length > 0) {
      // Phase 3: Add this step to the visual history
      if (this.agentLoopContainer) {
        this.addLoopStepToHistory(loopCount + 1, agentResponse.message, actionResults);
      }

      // Send results back to Claude and continue the loop
      await this.continueAgenticLoop(actionResults, responseEl, contentEl, loopCount);
    } else {
      // No more iterations needed, end the loop if active
      if (this.agentLoopActive) {
        // Phase 3: Show final step in history if we have a container
        if (this.agentLoopContainer && agentResponse.message) {
          this.addLoopStepToHistory(loopCount + 1, agentResponse.message, actionResults, true);
        }
        this.endAgenticLoop();
        // Add action buttons now that the loop has ended
        this.addMessageActions(responseEl, agentResponse.message);
      }
    }
  }

  /**
   * Continue the agentic loop by sending action results back to Claude
   * This allows Claude to make informed decisions based on actual data
   *
   * Phase 2: Full implementation with loop detection, error handling, and cancellation
   */
  private async continueAgenticLoop(
    results: ActionResult[],
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    loopCount: number
  ): Promise<void> {
    const MAX_LOOP_COUNT = 5;

    // Check if loop was cancelled
    if (this.agentLoopCancelled) {
      this.endAgenticLoop();
      const cancelledEl = contentEl.createDiv({ cls: 'agent-loop-cancelled' });
      cancelledEl.setText(t('agent.loopCancelled'));
      this.resetButtonToSend();
      return;
    }

    // Check iteration limit
    if (loopCount >= MAX_LOOP_COUNT) {
      console.warn('[Claudian] Agentic loop limit reached:', loopCount);
      this.endAgenticLoop();
      const warningEl = contentEl.createDiv({ cls: 'agent-loop-warning' });
      warningEl.setText(t('agent.loopLimitReached'));
      this.resetButtonToSend();
      return;
    }

    // Check if all actions failed - stop the loop to prevent wasted API calls
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (successCount === 0 && failCount > 0) {
      console.warn('[Claudian] All actions failed, stopping agentic loop');
      this.endAgenticLoop();
      const errorEl = contentEl.createDiv({ cls: 'agent-loop-error' });
      errorEl.setText(t('agent.allActionsFailed'));
      this.resetButtonToSend();
      return;
    }

    // Detect infinite loops by hashing current actions
    const actionsHash = this.hashActions(results.map(r => r.action));
    if (this.agentLoopHistory.includes(actionsHash)) {
      console.warn('[Claudian] Infinite loop detected - same actions repeated');
      this.endAgenticLoop();
      const warningEl = contentEl.createDiv({ cls: 'agent-loop-warning' });
      warningEl.setText(t('agent.infiniteLoopDetected'));
      this.resetButtonToSend();
      return;
    }
    this.agentLoopHistory.push(actionsHash);

    // Mark loop as active
    this.agentLoopActive = true;

    // Format results for Claude
    const resultsMessage = this.formatResultsForAgent(results);
    console.log('[Claudian] Agentic loop - sending results back to Claude:', resultsMessage);

    // Phase 3: Use loop container if available, otherwise use contentEl
    const indicatorContainer = this.agentLoopContainer || contentEl;

    // Show indicator that we're continuing with cancel button
    const loopIndicator = indicatorContainer.createDiv({ cls: 'agent-loop-indicator' });

    // Phase 3: Show step X of max Y
    const stepText = loopIndicator.createSpan({ cls: 'loop-step-text' });
    stepText.setText(t('agent.loopProgress', {
      current: String(loopCount + 2),
      max: String(MAX_LOOP_COUNT)
    }));

    // Phase 3: Token counter for this loop
    const tokenCounter = loopIndicator.createSpan({ cls: 'loop-token-counter' });
    tokenCounter.setText(t('agent.loopTokens', {
      input: this.formatTokenCount(this.agentLoopTokens.input),
      output: this.formatTokenCount(this.agentLoopTokens.output)
    }));

    // Add cancel button
    const cancelBtn = loopIndicator.createEl('button', {
      cls: 'agent-loop-cancel-btn',
      text: t('agent.cancelLoop')
    });
    cancelBtn.onclick = () => {
      this.agentLoopCancelled = true;
      this.client.abortStream();
    };

    // Create new streaming indicator
    const streamingIndicator = this.createStreamingIndicator(indicatorContainer);

    // Update status indicator
    this.showProcessingStatus('status.waitingResponse');

    // Get system prompt with model-specific optimizations
    const selectedModel = this.lastRouteResult?.model;
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel);

    let fullResponse = '';

    // Send results back to Claude
    await this.client.sendAgentMessageStream(resultsMessage, agentSystemPrompt, {
      onStart: () => {},
      onUsage: (usage) => {
        this.trackTokenUsage(usage);
        // Phase 3: Track tokens for this loop session
        this.agentLoopTokens.input += usage.inputTokens;
        this.agentLoopTokens.output += usage.outputTokens;
        // Update the token counter display
        tokenCounter.setText(t('agent.loopTokens', {
          input: this.formatTokenCount(this.agentLoopTokens.input),
          output: this.formatTokenCount(this.agentLoopTokens.output)
        }));
      },
      onToken: (token) => {
        fullResponse += token;
        this.updateStreamingIndicator(streamingIndicator, fullResponse);
        this.scrollToBottom();
      },
      onComplete: async (response) => {
        // Remove streaming elements
        loopIndicator.remove();
        streamingIndicator.remove();

        // Check if cancelled during streaming
        if (this.agentLoopCancelled) {
          this.endAgenticLoop();
          const cancelledEl = (this.agentLoopContainer || contentEl).createDiv({ cls: 'agent-loop-cancelled' });
          cancelledEl.setText(t('agent.loopCancelled'));
          this.resetButtonToSend();
          return;
        }

        // Process the new response (may have more actions or be final)
        if (this.agentMode.isAgentResponse(response)) {
          await this.handleAgentResponse(response, responseEl, contentEl, loopCount + 1);
        } else {
          // Final response without actions - end the loop
          this.endAgenticLoop();
          // Render final response in the main content area
          contentEl.empty();
          MarkdownRenderer.render(this.app, response, contentEl, '', this);
          this.addMessageActions(responseEl, response);
        }

        this.resetButtonToSend();
        this.scrollToBottom();
      },
      onError: (error) => {
        loopIndicator.remove();
        streamingIndicator.remove();
        this.endAgenticLoop();

        // Check if it was a cancellation
        const errorContainer = this.agentLoopContainer || contentEl;
        if (this.agentLoopCancelled) {
          const cancelledEl = errorContainer.createDiv({ cls: 'agent-loop-cancelled' });
          cancelledEl.setText(t('agent.loopCancelled'));
        } else {
          errorContainer.createEl('span', {
            text: t('chat.error', { message: error.message }),
            cls: 'claudian-error'
          });
        }
        this.resetButtonToSend();
      }
    }, selectedModel);
  }

  /**
   * Generate a hash of actions to detect repeated loops
   */
  private hashActions(actions: VaultAction[]): string {
    return actions.map(a => `${a.action}:${JSON.stringify(a.params)}`).sort().join('|');
  }

  /**
   * End the agentic loop and reset state
   */
  private endAgenticLoop(): void {
    this.agentLoopActive = false;
    this.agentLoopHistory = [];
    this.agentLoopCancelled = false;
    // Phase 3: Show final token count if we tracked any
    if (this.agentLoopContainer && (this.agentLoopTokens.input > 0 || this.agentLoopTokens.output > 0)) {
      const tokenSummary = this.agentLoopContainer.createDiv({ cls: 'agent-loop-token-summary' });
      tokenSummary.setText(t('agent.loopTokenSummary', {
        input: this.formatTokenCount(this.agentLoopTokens.input),
        output: this.formatTokenCount(this.agentLoopTokens.output)
      }));
    }
    this.agentLoopTokens = { input: 0, output: 0 };
    this.agentLoopContainer = null;
  }

  /**
   * Start a new agentic loop session
   */
  private startAgenticLoop(): void {
    this.agentLoopActive = true;
    this.agentLoopHistory = [];
    this.agentLoopCancelled = false;
    this.agentLoopTokens = { input: 0, output: 0 };
    this.agentLoopContainer = null;
  }

  /**
   * Phase 3: Add a step to the visual loop history
   */
  private addLoopStepToHistory(
    stepNumber: number,
    message: string,
    results: ActionResult[],
    isFinal: boolean = false
  ): void {
    if (!this.agentLoopContainer) return;

    const stepEl = this.agentLoopContainer.createDiv({
      cls: `agent-loop-step ${isFinal ? 'final' : ''}`
    });

    // Step header with number and status
    const headerEl = stepEl.createDiv({ cls: 'agent-loop-step-header' });
    const stepBadge = headerEl.createSpan({ cls: 'step-badge' });
    stepBadge.setText(isFinal ? '✓' : String(stepNumber));

    const stepTitle = headerEl.createSpan({ cls: 'step-title' });
    stepTitle.setText(isFinal ? t('agent.loopStepFinal') : t('agent.loopStep', { step: String(stepNumber) }));

    // Action summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    if (results.length > 0) {
      const statsEl = headerEl.createSpan({ cls: 'step-stats' });
      if (failCount === 0) {
        statsEl.addClass('all-success');
        statsEl.setText(`${successCount} ✓`);
      } else {
        statsEl.addClass('has-errors');
        statsEl.setText(`${successCount} ✓ / ${failCount} ✗`);
      }
    }

    // Message content (collapsible for intermediate steps)
    const contentEl = stepEl.createDiv({ cls: 'agent-loop-step-content' });

    // Show a truncated version of the message
    const truncatedMessage = message.length > 150
      ? message.substring(0, 150) + '...'
      : message;
    contentEl.setText(truncatedMessage);

    // If message is long, add expand toggle
    if (message.length > 150) {
      const expandToggle = stepEl.createDiv({ cls: 'step-expand-toggle' });
      expandToggle.setText(t('agent.loopExpandStep'));
      let expanded = false;
      expandToggle.onclick = () => {
        expanded = !expanded;
        contentEl.setText(expanded ? message : truncatedMessage);
        expandToggle.setText(expanded ? t('agent.loopCollapseStep') : t('agent.loopExpandStep'));
      };
    }

    this.scrollToBottom();
  }

  /**
   * Format token count for display
   */
  private formatTokenCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return String(count);
  }

  private async showConfirmationAndExecuteWithResults(
    agentResponse: AgentResponse,
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    hasOverwrites: boolean = false
  ): Promise<ActionResult[]> {
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
          const results = await this.executeAgentActionsWithResults(
            actionsToExecute,
            responseEl,
            contentEl,
            agentResponse.message
          );
          resolve(results);
        },
        () => {
          // Cancelled: show message
          const cancelMsg = contentEl.createDiv({ cls: 'agent-action-cancelled' });
          cancelMsg.setText(t('chat.actionsCancelled'));
          resolve([]);
        }
      ).open();
    });
  }

  private async executeAgentActionsWithResults(
    actions: VaultAction[],
    responseEl: HTMLElement,
    contentEl: HTMLElement,
    originalMessage: string
  ): Promise<ActionResult[]> {
    // Update status indicator
    this.showProcessingStatus('status.executingActions');

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

      // Only add action buttons if we're not in an active agentic loop
      // (buttons will be added once at the end of the complete loop)
      if (!this.agentLoopActive) {
        this.addMessageActions(responseEl, originalMessage);
      }
      return results;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('chat.errorUnknown');
      progressBarContainer.addClass('error');
      progressText.setText(t('chat.error', { message: errorMsg }));
      // Only add action buttons if we're not in an active agentic loop
      if (!this.agentLoopActive) {
        this.addMessageActions(responseEl, originalMessage);
      }
      return [];
    }
  }

  /**
   * Format action results for sending back to Claude in the agentic loop
   * This allows Claude to see what happened and continue with informed decisions
   */
  private formatResultsForAgent(results: ActionResult[]): string {
    const formattedResults = results.map(r => {
      const actionDesc = this.getActionDescription(r.action);
      if (r.success) {
        // Format the result data appropriately
        let resultStr = '';
        if (r.result !== undefined && r.result !== null) {
          if (Array.isArray(r.result)) {
            // For list-folder and similar actions that return arrays
            resultStr = `\n  Resultado: ${JSON.stringify(r.result, null, 2)}`;
          } else if (typeof r.result === 'object') {
            resultStr = `\n  Resultado: ${JSON.stringify(r.result, null, 2)}`;
          } else if (typeof r.result === 'string' && r.result.length > 200) {
            // Truncate long content (like read-note)
            resultStr = `\n  Resultado: "${r.result.substring(0, 200)}..." (${r.result.length} caracteres)`;
          } else if (r.result !== true) {
            resultStr = `\n  Resultado: ${r.result}`;
          }
        }
        return `✓ ${actionDesc}${resultStr}`;
      } else {
        return `✗ ${actionDesc}\n  Error: ${r.error}`;
      }
    }).join('\n\n');

    return `[RESULTADOS]\n${formattedResults}\n\nContinúa o finaliza.`;
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
      case 'copy-note':
        return t('agent.copyNote', { from: params.from, to: params.to });
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

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 6: Context Management
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize context session when chat view opens
   */
  private async initializeContextSession(): Promise<void> {
    const contextManager = this.plugin.contextManager;
    const settings = this.plugin.settings;

    if (!settings.autoContextManagement || !contextManager) {
      return;
    }

    try {
      // Update thresholds from settings
      contextManager.updateThresholds({
        summarizeThreshold: settings.messageSummarizeThreshold,
        maxMessagesInContext: settings.maxActiveContextMessages
      });

      // Connect context manager to client
      this.client.setContextManager(contextManager, true);

      // Start or resume session
      const existingSessionId = contextManager.getCurrentSessionId();
      if (existingSessionId) {
        await contextManager.resumeSession(existingSessionId);
      } else {
        await contextManager.startSession();
      }

      // Sync existing client history to context manager if needed
      const clientHistory = this.client.getHistory();
      if (clientHistory.length > 0 && !contextManager.isReady()) {
        await contextManager.syncFromHistory(clientHistory);
      }

      console.log('[Claudian] Context session initialized');
    } catch (error) {
      console.error('[Claudian] Failed to initialize context session:', error);
      // Disable context management on error to allow chat to work
      this.client.setContextManager(null, false);
    }
  }

  /**
   * End context session when chat view closes
   */
  private async endContextSession(): Promise<void> {
    const contextManager = this.plugin.contextManager;

    if (!contextManager) {
      return;
    }

    try {
      // Disconnect from client
      this.client.setContextManager(null, false);

      // Note: We don't end the session here to preserve history across view reopens
      // Session is only ended explicitly by clearing the chat
      console.log('[Claudian] Context session paused');
    } catch (error) {
      console.error('[Claudian] Error ending context session:', error);
    }
  }

  /**
   * Check if summarization is needed and perform it
   * Called before sending messages to the API
   */
  private async checkAndPerformSummarization(): Promise<boolean> {
    const settings = this.plugin.settings;

    if (!settings.autoContextManagement) {
      return false;
    }

    try {
      const summarized = await this.client.checkAndSummarize(
        (messages) => this.generateSummary(messages)
      );

      if (summarized) {
        console.log('[Claudian] Conversation history summarized');
      }

      return summarized;
    } catch (error) {
      console.error('[Claudian] Error during summarization:', error);
      return false;
    }
  }

  /**
   * Generate a summary of messages using Claude
   */
  private async generateSummary(messages: Message[]): Promise<string> {
    return new Promise((resolve, reject) => {
      // Format conversation for summarization
      const conversation = messages.map(m =>
        `${m.role.toUpperCase()}: ${m.content}`
      ).join('\n\n');

      const prompt = t('context.summaryPrompt', { conversation });

      // Use a direct API call for summarization (without affecting history)
      const client = this.plugin.claudeClient;

      // Create a temporary client for summarization
      const tempSettings = { ...this.plugin.settings, maxTokens: 1024 };
      const summaryClient = new (require('./claude-client').ClaudeClient)(tempSettings);

      let summary = '';

      summaryClient.sendMessageStream(prompt, {
        onToken: (token: string) => {
          summary += token;
        },
        onComplete: () => {
          resolve(summary);
        },
        onError: (error: Error) => {
          // Fallback to simple summary on error
          const fallback = JSON.stringify({
            keyTopics: [],
            lastActions: [],
            summary: `Previous conversation with ${messages.length} messages.`
          });
          resolve(fallback);
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Manual Continuation Handling
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Detect if the user message is a continuation command
   * These are short messages like "continúa", "sigue", "continue", etc.
   */
  private isContinuationCommand(message: string): boolean {
    const normalized = message.toLowerCase().trim();

    // Must be a short message (continuation commands are typically brief)
    if (normalized.length > 50) {
      return false;
    }

    // Common continuation patterns in Spanish and English
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
  private buildContinuationPrompt(originalMessage: string): string {
    const history = this.client.getHistory();

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

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 5: Token Tracking UI
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create the token usage footer element
   */
  private createTokenFooter(wrapper: HTMLElement): void {
    this.tokenFooter = wrapper.createDiv({ cls: 'claudian-token-footer' });

    // Token indicator
    this.tokenIndicator = this.tokenFooter.createDiv({ cls: 'claudian-token-indicator' });

    // Input tokens
    const inputSpan = this.tokenIndicator.createSpan({ cls: 'token-stat token-input' });
    inputSpan.createSpan({ cls: 'token-label', text: t('tokens.inputLabel') + ': ' });
    inputSpan.createSpan({ cls: 'token-value', text: '0' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // Output tokens
    const outputSpan = this.tokenIndicator.createSpan({ cls: 'token-stat token-output' });
    outputSpan.createSpan({ cls: 'token-label', text: t('tokens.outputLabel') + ': ' });
    outputSpan.createSpan({ cls: 'token-value', text: '0' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // Calls
    const callsSpan = this.tokenIndicator.createSpan({ cls: 'token-stat token-calls' });
    callsSpan.createSpan({ cls: 'token-label', text: t('tokens.callsLabel') + ': ' });
    callsSpan.createSpan({ cls: 'token-value', text: '0' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // History link
    const historyLink = this.tokenIndicator.createSpan({ cls: 'token-history-link' });
    historyLink.setText(t('tokens.historyLink'));
    historyLink.onclick = () => this.openTokenHistoryModal();

    // Initial visibility based on settings
    this.updateTokenFooterVisibility();
  }

  /**
   * Setup token tracking subscription
   */
  private setupTokenTracking(): void {
    const tracker = this.plugin.tokenTracker;
    if (!tracker) return;

    // Subscribe to usage updates
    this.tokenUsageCleanup = tracker.onUsageUpdate((stats) => {
      this.updateTokenIndicator(stats);
    });

    // Show current session stats
    const currentStats = tracker.getSessionStats();
    this.updateTokenIndicator(currentStats);
  }

  /**
   * Track token usage via the plugin's tracker
   */
  private trackTokenUsage(usage: TokenUsage): void {
    const tracker = this.plugin.tokenTracker;
    if (tracker) {
      tracker.trackUsage(usage);
    }
  }

  /**
   * Update the token indicator with new stats
   */
  private updateTokenIndicator(stats: SessionTokenStats): void {
    if (!this.tokenIndicator) return;

    const tracker = this.plugin.tokenTracker;

    // Update input value
    const inputValue = this.tokenIndicator.querySelector('.token-input .token-value');
    if (inputValue) {
      inputValue.setText(tracker ? tracker.formatTokenCount(stats.inputTokens) : String(stats.inputTokens));
    }

    // Update output value
    const outputValue = this.tokenIndicator.querySelector('.token-output .token-value');
    if (outputValue) {
      outputValue.setText(tracker ? tracker.formatTokenCount(stats.outputTokens) : String(stats.outputTokens));
    }

    // Update calls value
    const callsValue = this.tokenIndicator.querySelector('.token-calls .token-value');
    if (callsValue) {
      callsValue.setText(String(stats.callCount));
    }

    // Add pulse animation on update
    this.tokenIndicator.addClass('pulse');
    setTimeout(() => {
      this.tokenIndicator?.removeClass('pulse');
    }, 500);

    // Update visibility in case settings changed
    this.updateTokenFooterVisibility();
  }

  /**
   * Open the token history modal with animated bar chart
   */
  private openTokenHistoryModal(): void {
    const { TokenHistoryModal } = require('./token-history-modal');
    new TokenHistoryModal(this.app, this.plugin).open();
  }

  /**
   * Update token footer visibility based on settings
   * Public method to allow settings to trigger updates
   */
  public updateTokenFooterVisibility(): void {
    if (!this.tokenFooter) return;

    if (this.plugin.settings.showTokenIndicator) {
      this.tokenFooter.removeClass('hidden');
    } else {
      this.tokenFooter.addClass('hidden');
    }
  }

  /**
   * Update execution mode from settings
   * Public method to allow settings to trigger updates
   */
  public updateExecutionMode(mode: ExecutionMode): void {
    this.orchestrator.setMode(mode);
  }

  /**
   * Show processing overlay in place of input
   * Combines status message with model name for clarity
   */
  private showProcessingStatus(statusKey: string): void {
    if (!this.processingOverlay) return;

    // Get current model name
    const modelName = this.lastRouteResult
      ? this.orchestrator.getSelector().getModelDisplayName(this.lastRouteResult.model)
      : '';

    // Build combined message: "Waiting for response from Haiku 4.5..."
    const statusText = this.processingOverlay.querySelector('.processing-text');
    if (statusText) {
      const baseStatus = t(statusKey as any);
      const fullStatus = modelName
        ? `${baseStatus.replace('...', '')} (${modelName})...`
        : baseStatus;
      statusText.setText(fullStatus);
    }

    // Show overlay and hide input
    this.processingOverlay.removeClass('hidden');
    this.inputEl.addClass('hidden');
  }

  /**
   * Hide processing overlay and restore input
   */
  private hideProcessingStatus(): void {
    if (!this.processingOverlay) return;
    this.processingOverlay.addClass('hidden');
    this.inputEl.removeClass('hidden');
  }

  /**
   * Update UI texts when language changes
   * Public method to allow settings to trigger updates
   */
  public updateLanguage(): void {
    // Update send button
    if (this.sendButton && !this.isStreaming) {
      this.sendButton.setText(t('chat.send'));
    }

    // Update input placeholder
    if (this.inputEl) {
      this.inputEl.placeholder = t('chat.placeholder');
    }

    // Update agent toggle label
    const agentLabel = this.containerEl.querySelector('.agent-toggle-label');
    if (agentLabel) {
      agentLabel.setText(t('chat.agentLabel'));
    }

    // Update token footer labels
    if (this.tokenIndicator) {
      const inputLabel = this.tokenIndicator.querySelector('.token-input .token-label');
      if (inputLabel) {
        inputLabel.setText(t('tokens.inputLabel') + ': ');
      }

      const outputLabel = this.tokenIndicator.querySelector('.token-output .token-label');
      if (outputLabel) {
        outputLabel.setText(t('tokens.outputLabel') + ': ');
      }

      const callsLabel = this.tokenIndicator.querySelector('.token-calls .token-label');
      if (callsLabel) {
        callsLabel.setText(t('tokens.callsLabel') + ': ');
      }

      const historyLink = this.tokenIndicator.querySelector('.token-history-link');
      if (historyLink) {
        historyLink.setText(t('tokens.historyLink'));
      }
    }

    // Update welcome screen if visible
    if (this.welcomeScreen) {
      this.showWelcomeScreen();
    }
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
