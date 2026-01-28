import { ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon } from 'obsidian';
import ClaudianPlugin from './main';
import { ClaudeClient } from './claude-client';
import { NoteCreatorModal } from './note-creator';
import { AgentMode, AgentResponse } from './agent-mode';
import { VaultActionExecutor, VaultAction, ActionProgress, ActionResult } from './vault-actions';
import { ConfirmationModal } from './confirmation-modal';
import { t } from './i18n';
import { logger, isDev } from './logger';
// Phase 2: Enhanced Agent Mode
import { TruncationDetector } from './truncation-detector';
import { ContextReinforcer } from './context-reinforcer';
import { ResponseValidator } from './response-validator';
import { TaskPlanner, TaskPlan } from './task-planner';
// Model Orchestrator
import { ModelOrchestrator, ExecutionMode, RouteResult } from './model-orchestrator';
// Extracted components
import { StreamingUIManager } from './streaming-ui-manager';
import { ContinuationHandler } from './continuation-handler';
import { TokenTrackingUI } from './token-tracking-ui';
import { ContextSessionManager } from './context-session-manager';
import { RobustnessHandler, RobustnessCallbacks } from './robustness-handler';
import { AgentLoopManager } from './agent-loop-manager';
import { WelcomeExamplesGenerator } from './welcome-examples-generator';

/**
 * Creates the Claudian logo SVG element programmatically
 */
function createClaudianLogo(container: HTMLElement, size: number): void {
  const svg = container.createSvg('svg', {
    attr: {
      width: String(size),
      height: String(size),
      viewBox: '0 0 300 300',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    }
  });
  svg.createSvg('path', {
    attr: {
      d: 'M150 35L236.6 75V185L150 265L63.4 185V75L150 35Z',
      stroke: '#7F52FF',
      'stroke-width': '24',
      'stroke-linejoin': 'round'
    }
  });
  svg.createSvg('path', {
    attr: {
      d: 'M150 85C153.9 115 175 136.1 205 140C175 143.9 153.9 165 150 195C146.1 165 125 143.9 95 140C125 136.1 146.1 115 150 85Z',
      fill: '#E95D3C'
    }
  });
}

export const VIEW_TYPE_CHAT = 'claudian-chat';

export class ChatView extends ItemView {
  plugin: ClaudianPlugin;
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

  // Phase 2: Agentic Loop State - now handled by AgentLoopManager

  // Phase 5: Token Tracking - now handled by TokenTrackingUI

  // Welcome Screen
  private welcomeScreen: HTMLElement | null = null;

  // Model Orchestrator
  private orchestrator: ModelOrchestrator;
  private lastRouteResult: RouteResult | null = null;

  // Extracted components
  private streamingUI: StreamingUIManager;
  private continuationHandler: ContinuationHandler;
  private tokenTrackingUI: TokenTrackingUI;
  private contextSession: ContextSessionManager;
  private robustnessHandler: RobustnessHandler;
  private agentLoopManager: AgentLoopManager;

  // Processing status overlay (replaces input during processing)
  private processingOverlay: HTMLElement | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: ClaudianPlugin) {
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

    // Initialize extracted components
    this.streamingUI = new StreamingUIManager(this.orchestrator);
    this.continuationHandler = new ContinuationHandler(this.agentMode);
    this.contextSession = new ContextSessionManager(this.plugin, this.client);
    this.robustnessHandler = new RobustnessHandler(
      this.app,
      this.client,
      this.agentMode,
      () => this.plugin.contextManager,
      this.plugin.settings
    );
    this.agentLoopManager = new AgentLoopManager();
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
    createClaudianLogo(logoContainer, 24);
    headerTitle.createEl('h4', { text: 'Claudian' });

    // Dev mode indicator
    if (isDev()) {
      headerTitle.createSpan({ cls: 'claudian-dev-badge', text: 'DEV' });
    }

    // Header controls
    const headerControls = header.createDiv({ cls: 'claudian-header-controls' });

    // Agent mode toggle
    this.agentToggle = headerControls.createDiv({ cls: 'claudian-agent-toggle' });
    this.agentToggle.createSpan({ cls: 'agent-toggle-label', text: t('chat.agentLabel') });
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
    this.tokenTrackingUI = new TokenTrackingUI(this.app, this.plugin, container as HTMLElement);
    this.tokenTrackingUI.initialize();

    // Phase 6: Initialize context session
    await this.contextSession.initialize();
  }

  /**
   * Handle send/stop button click
   */
  private handleButtonClick(): void {
    if (this.isStreaming || this.agentLoopManager.isActive()) {
      // Stop the current stream and/or cancel the agentic loop
      this.client.abortStream();
      if (this.agentLoopManager.isActive()) {
        this.agentLoopManager.cancel();
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

    // Always hide processing status - actions are done even if loop continues
    this.streamingUI.hideProcessingStatus(this.processingOverlay, this.inputEl);

    // Don't reset to Send if agentic loop is still active (unless forced)
    if (this.agentLoopManager.isActive() && !force) {
      // Keep button in Stop mode while loop is active
      this.sendButton.setText(t('chat.stop'));
      this.sendButton.addClass('is-stop');
      this.sendButton.disabled = false;
      return;
    }

    this.sendButton.setText(t('chat.send'));
    this.sendButton.removeClass('is-stop');
    this.sendButton.disabled = false;
  }

  async onClose(): Promise<void> {
    // Cleanup token tracking subscription
    this.tokenTrackingUI.cleanup();

    // Phase 6: End context session
    await this.contextSession.end();
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
    createClaudianLogo(logoEl, 64);

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

    // Generate personalized examples or use static fallbacks
    const generator = new WelcomeExamplesGenerator(this.app, this.plugin.indexer);
    const personalizedExamples = generator.generate();
    const examples = personalizedExamples
      ? personalizedExamples.map(e => e.text)
      : [
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
    if (!message || this.isStreaming || this.agentLoopManager.isActive()) return;

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
    await this.contextSession.checkAndSummarize();

    // Route request through orchestrator (async Haiku classification)
    this.lastRouteResult = await this.orchestrator.routeRequest(message, false);
    const selectedModel = this.lastRouteResult.model;

    let fullResponse = '';

    await this.client.sendMessageStream(message, {
      onStart: () => {
        // Streaming started
      },
      onUsage: (usage) => {
        this.tokenTrackingUI.trackUsage(usage);
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

        // Show visible notice so user knows something went wrong
        new Notice(t('chat.error', { message: error.message }), 5000);

        this.resetButtonToSend();
        this.scrollToBottom();
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
    await this.contextSession.checkAndSummarize();

    // Route request through orchestrator (async Haiku classification)
    // For continuation commands, keep using the same model to avoid re-classification
    const isContinuation = this.continuationHandler.isContinuationCommand(message);
    if (isContinuation && this.lastRouteResult) {
      // Keep the same model for continuations
      logger.debug(' Continuation detected, keeping model:',
        this.orchestrator.getSelector().getModelDisplayName(this.lastRouteResult.model));
    } else {
      // New request, classify and route (shows "classifying..." status)
      this.streamingUI.showProcessingStatus(this.processingOverlay, this.inputEl, 'status.classifying', this.lastRouteResult);
      this.lastRouteResult = await this.orchestrator.routeRequest(message, true);
    }
    const selectedModel = this.lastRouteResult.model;
    this.streamingUI.showProcessingStatus(this.processingOverlay, this.inputEl, 'status.waitingResponse', this.lastRouteResult);

    let fullResponse = '';
    let streamingIndicator: HTMLElement | null = null;

    // In agent mode, ALWAYS show streaming indicator during the entire streaming phase.
    // This prevents the "JSON flash" where partial JSON content would briefly render
    // as colored code before being replaced by the proper indicator.
    // All rendering decisions are deferred to onComplete when we have the full response.
    cursorEl.remove();
    contentEl.empty();
    streamingIndicator = this.streamingUI.createStreamingIndicator(contentEl);

    // Detect manual continuation commands and enhance with context
    let enhancedMessage = message;
    if (this.continuationHandler.isContinuationCommand(message)) {
      enhancedMessage = this.continuationHandler.buildContinuationPrompt(message, this.client.getHistory());
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
    this.robustnessHandler.resetCounters();

    await this.client.sendAgentMessageStream(enhancedMessage, agentSystemPrompt, {
      onStart: () => {
        // Streaming started
      },
      onUsage: (usage) => {
        this.tokenTrackingUI.trackUsage(usage);
      },
      onToken: (token) => {
        fullResponse += token;

        // In agent mode, ALWAYS keep the streaming indicator visible during streaming.
        // We never render partial content to avoid the "JSON flash" problem where
        // incomplete JSON would briefly appear as syntax-highlighted code.
        // All content rendering is deferred to onComplete.
        this.streamingUI.updateStreamingIndicator(streamingIndicator, fullResponse);
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
            this.robustnessHandler.getAutoContinueCount() < this.robustnessHandler.MAX_AUTO_CONTINUES) {

          this.robustnessHandler.incrementAutoContinueCount();

          // Show continuation indicator instead of partial JSON response
          // This prevents the "JSON flash" when response is truncated agent JSON
          const continueIndicator = this.streamingUI.createStreamingIndicator(contentEl);
          this.streamingUI.updateStreamingIndicator(continueIndicator, response);

          await this.robustnessHandler.handleTruncatedResponse(
            response,
            truncationResult,
            responseEl,
            contentEl,
            this.getRobustnessCallbacks(),
            this
          );
          return;
        }

        // Only parse and validate AFTER confirming response is complete
        const parsedResponse = this.agentMode.parseAgentResponse(response);
        const validation = ResponseValidator.validate(response, parsedResponse);

        // Handle validation issues (model confusion, missing JSON)
        if (!validation.isValid && ResponseValidator.shouldRetry(validation) &&
            this.robustnessHandler.getAutoContinueCount() < this.robustnessHandler.MAX_AUTO_CONTINUES) {

          this.robustnessHandler.incrementAutoContinueCount();
          await this.robustnessHandler.handleValidationRetry(
            response,
            validation,
            responseEl,
            contentEl,
            this.getRobustnessCallbacks(),
            this
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
        this.robustnessHandler.resetCounters();
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

        // Show visible notice so user knows something went wrong
        new Notice(t('chat.error', { message: error.message }), 5000);

        this.robustnessHandler.resetCounters();
        this.currentPlan = null;

        this.resetButtonToSend();
        this.scrollToBottom();
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
      this.agentLoopManager.start();
      // Phase 3: Create loop container for visual history
      this.agentLoopManager.setContainer(contentEl.createDiv({ cls: 'agent-loop-container' }));
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
      if (this.agentLoopManager.getContainer()) {
        this.agentLoopManager.addLoopStepToHistory(loopCount + 1, agentResponse.message, actionResults, false, () => this.scrollToBottom());
      }

      // Send results back to Claude and continue the loop
      await this.continueAgenticLoop(actionResults, responseEl, contentEl, loopCount);
    } else {
      // No more iterations needed, end the loop if active
      if (this.agentLoopManager.isActive()) {
        // Phase 3: Show final step in history if we have a container
        if (this.agentLoopManager.getContainer() && agentResponse.message) {
          this.agentLoopManager.addLoopStepToHistory(loopCount + 1, agentResponse.message, actionResults, true, () => this.scrollToBottom());
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
    if (this.agentLoopManager.isCancelled()) {
      this.endAgenticLoop();
      const cancelledEl = contentEl.createDiv({ cls: 'agent-loop-cancelled' });
      cancelledEl.setText(t('agent.loopCancelled'));
      this.resetButtonToSend();
      return;
    }

    // Check iteration limit
    if (loopCount >= MAX_LOOP_COUNT) {
      logger.warn(' Agentic loop limit reached:', loopCount);
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
      logger.warn(' All actions failed, stopping agentic loop');
      this.endAgenticLoop();
      const errorEl = contentEl.createDiv({ cls: 'agent-loop-error' });
      errorEl.setText(t('agent.allActionsFailed'));
      this.resetButtonToSend();
      return;
    }

    // Detect infinite loops by hashing current actions
    const actionsHash = this.agentLoopManager.hashActions(results.map(r => r.action));
    if (this.agentLoopManager.hasInHistory(actionsHash)) {
      logger.warn(' Infinite loop detected - same actions repeated');
      this.endAgenticLoop();
      const warningEl = contentEl.createDiv({ cls: 'agent-loop-warning' });
      warningEl.setText(t('agent.infiniteLoopDetected'));
      this.resetButtonToSend();
      return;
    }
    this.agentLoopManager.addToHistory(actionsHash);

    // Format results for Claude
    const resultsMessage = this.agentLoopManager.formatResultsForAgent(results, (action) => this.getActionDescription(action));
    logger.debug(' Agentic loop - sending results back to Claude:', resultsMessage);

    // Phase 3: Use loop container if available, otherwise use contentEl
    const indicatorContainer = this.agentLoopManager.getContainer() || contentEl;

    // Show indicator that we're continuing with cancel button
    const loopIndicator = indicatorContainer.createDiv({ cls: 'agent-loop-indicator' });

    // Phase 3: Show step X of max Y
    const stepText = loopIndicator.createSpan({ cls: 'loop-step-text' });
    stepText.setText(t('agent.loopProgress', {
      current: String(loopCount + 2),
      max: String(MAX_LOOP_COUNT)
    }));

    // Phase 3: Token counter for this loop
    const loopTokens = this.agentLoopManager.getTokens();
    const tokenCounter = loopIndicator.createSpan({ cls: 'loop-token-counter' });
    tokenCounter.setText(t('agent.loopTokens', {
      input: this.agentLoopManager.formatTokenCount(loopTokens.input),
      output: this.agentLoopManager.formatTokenCount(loopTokens.output)
    }));

    // Add cancel button
    const cancelBtn = loopIndicator.createEl('button', {
      cls: 'agent-loop-cancel-btn',
      text: t('agent.cancelLoop')
    });
    cancelBtn.onclick = () => {
      this.agentLoopManager.cancel();
      this.client.abortStream();
    };

    // Create new streaming indicator
    const streamingIndicator = this.streamingUI.createStreamingIndicator(indicatorContainer);

    // Update status indicator
    this.streamingUI.showProcessingStatus(this.processingOverlay, this.inputEl, 'status.waitingResponse', this.lastRouteResult);

    // Get system prompt with model-specific optimizations
    const selectedModel = this.lastRouteResult?.model;
    const agentSystemPrompt = this.agentMode.getSystemPrompt(selectedModel);

    let fullResponse = '';

    // Send results back to Claude
    await this.client.sendAgentMessageStream(resultsMessage, agentSystemPrompt, {
      onStart: () => {},
      onUsage: (usage) => {
        this.tokenTrackingUI.trackUsage(usage);
        // Phase 3: Track tokens for this loop session
        this.agentLoopManager.addTokens(usage);
        // Update the token counter display
        const currentTokens = this.agentLoopManager.getTokens();
        tokenCounter.setText(t('agent.loopTokens', {
          input: this.agentLoopManager.formatTokenCount(currentTokens.input),
          output: this.agentLoopManager.formatTokenCount(currentTokens.output)
        }));
      },
      onToken: (token) => {
        fullResponse += token;
        this.streamingUI.updateStreamingIndicator(streamingIndicator, fullResponse);
        this.scrollToBottom();
      },
      onComplete: async (response) => {
        // Remove streaming elements
        loopIndicator.remove();
        streamingIndicator.remove();

        // Check if cancelled during streaming
        if (this.agentLoopManager.isCancelled()) {
          this.endAgenticLoop();
          const cancelledEl = (this.agentLoopManager.getContainer() || contentEl).createDiv({ cls: 'agent-loop-cancelled' });
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
        const errorContainer = this.agentLoopManager.getContainer() || contentEl;
        if (this.agentLoopManager.isCancelled()) {
          const cancelledEl = errorContainer.createDiv({ cls: 'agent-loop-cancelled' });
          cancelledEl.setText(t('agent.loopCancelled'));
        } else {
          errorContainer.createEl('span', {
            text: t('chat.error', { message: error.message }),
            cls: 'claudian-error'
          });
          // Show visible notice so user knows something went wrong
          new Notice(t('chat.error', { message: error.message }), 5000);
        }
        this.resetButtonToSend();
        this.scrollToBottom();
      }
    }, selectedModel);
  }

  /**
   * End the agentic loop and reset state
   */
  private endAgenticLoop(): void {
    this.agentLoopManager.showTokenSummary();
    this.agentLoopManager.end();
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
    this.streamingUI.showProcessingStatus(this.processingOverlay, this.inputEl, 'status.executingActions', this.lastRouteResult);

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
    const completedResults: Map<number, { element: HTMLElement, result: unknown }> = new Map();

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
      if (!this.agentLoopManager.isActive()) {
        this.addMessageActions(responseEl, originalMessage);
      }
      return results;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('chat.errorUnknown');
      progressBarContainer.addClass('error');
      progressText.setText(t('chat.error', { message: errorMsg }));
      // Only add action buttons if we're not in an active agentic loop
      if (!this.agentLoopManager.isActive()) {
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
   * Create callbacks for RobustnessHandler
   */
  private getRobustnessCallbacks(): RobustnessCallbacks {
    return {
      trackTokenUsage: (usage) => this.tokenTrackingUI.trackUsage(usage),
      scrollToBottom: () => this.scrollToBottom(),
      resetButton: () => this.resetButtonToSend(),
      getRouteResult: () => this.lastRouteResult,
      handleAgentResponse: (response, responseEl, contentEl) =>
        this.handleAgentResponse(response, responseEl, contentEl),
      addMessageActions: (responseEl, content) => this.addMessageActions(responseEl, content),
      createStreamingIndicator: (container) => this.streamingUI.createStreamingIndicator(container),
      updateStreamingIndicator: (indicator, response) =>
        this.streamingUI.updateStreamingIndicator(indicator, response),
    };
  }

  /**
   * Update token footer visibility based on settings
   * Public method to allow settings to trigger updates
   */
  public updateTokenFooterVisibility(): void {
    this.tokenTrackingUI.updateVisibility();
  }

  /**
   * Update execution mode from settings
   * Public method to allow settings to trigger updates
   */
  public updateExecutionMode(mode: ExecutionMode): void {
    this.orchestrator.setMode(mode);
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
    this.tokenTrackingUI.updateLanguage();

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
