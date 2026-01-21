import { ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient, Message } from './claude-client';
import { NoteCreatorModal } from './note-creator';
import { AgentMode, AgentResponse } from './agent-mode';
import { VaultActionExecutor, VaultAction } from './vault-actions';
import { ConfirmationModal } from './confirmation-modal';

export const VIEW_TYPE_CHAT = 'claudian-chat';

export class ChatView extends ItemView {
  plugin: ClaudeCompanionPlugin;
  client: ClaudeClient;

  private messagesContainer: HTMLElement;
  private inputEl: HTMLTextAreaElement;
  private sendButton: HTMLButtonElement;
  private isStreaming: boolean = false;

  // Modo Agente
  private agentMode: AgentMode;
  private executor: VaultActionExecutor;
  private isAgentModeActive: boolean = false;
  private agentToggle: HTMLElement;

  constructor(leaf: WorkspaceLeaf, plugin: ClaudeCompanionPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.client = new ClaudeClient(plugin.settings);
    this.executor = new VaultActionExecutor(plugin);
    this.agentMode = new AgentMode(plugin, this.executor, plugin.indexer);
    this.isAgentModeActive = plugin.settings.agentModeEnabled;
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

    // Logo y título
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

    // Controles del header
    const headerControls = header.createDiv({ cls: 'claudian-header-controls' });

    // Toggle de modo agente
    this.agentToggle = headerControls.createDiv({ cls: 'claudian-agent-toggle' });
    const agentLabel = this.agentToggle.createSpan({ cls: 'agent-toggle-label', text: 'Agente' });
    const toggleSwitch = this.agentToggle.createDiv({ cls: 'agent-toggle-switch' });
    if (this.isAgentModeActive) {
      toggleSwitch.addClass('is-active');
    }
    toggleSwitch.onclick = () => this.toggleAgentMode(toggleSwitch);

    const clearBtn = headerControls.createEl('button', { cls: 'claudian-clear-btn' });
    setIcon(clearBtn, 'trash-2');
    clearBtn.setAttribute('aria-label', 'Limpiar chat');
    clearBtn.onclick = () => this.clearChat();

    // Contenedor de mensajes
    this.messagesContainer = container.createDiv({ cls: 'claudian-messages' });

    // Restaurar historial si existe
    this.restoreHistory();

    // Contenedor del área de input (para resize)
    const inputWrapper = container.createDiv({ cls: 'claudian-input-wrapper' });

    // Handle para redimensionar
    const resizeHandle = inputWrapper.createDiv({ cls: 'claudian-resize-handle' });
    this.setupResizeHandle(resizeHandle, inputWrapper, container as HTMLElement);

    // Área de input
    const inputArea = inputWrapper.createDiv({ cls: 'claudian-input-area' });

    this.inputEl = inputArea.createEl('textarea', {
      cls: 'claudian-input',
      attr: { placeholder: 'Escribe tu mensaje...' }
    });

    // Enter para enviar, Shift+Enter para nueva línea
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea basado en contenido (respetando límites del wrapper)
    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto';
      const maxHeight = inputWrapper.clientHeight - 24; // padding
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, maxHeight) + 'px';
    });

    this.sendButton = inputArea.createEl('button', {
      cls: 'claudian-send-btn',
      text: 'Enviar'
    });
    this.sendButton.onclick = () => this.sendMessage();
  }

  async onClose(): Promise<void> {
    // Limpieza si es necesaria
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
    new Notice('Chat limpiado');
  }

  private toggleAgentMode(toggleEl: HTMLElement): void {
    this.isAgentModeActive = !this.isAgentModeActive;

    if (this.isAgentModeActive) {
      toggleEl.addClass('is-active');
      new Notice('Modo agente activado');
    } else {
      toggleEl.removeClass('is-active');
      new Notice('Modo agente desactivado');
    }
  }

  private async sendMessage(): Promise<void> {
    const message = this.inputEl.value.trim();
    if (!message || this.isStreaming) return;

    // Actualizar settings por si cambiaron
    this.client.updateSettings(this.plugin.settings);

    // Limpiar input
    this.inputEl.value = '';
    this.inputEl.style.height = 'auto';

    // Renderizar mensaje del usuario
    this.renderMessage('user', message);

    // Preparar contenedor para respuesta
    const responseEl = this.createMessageElement('assistant');
    const contentEl = responseEl.querySelector('.claudian-message-content') as HTMLElement;

    // Agregar cursor de streaming
    const cursorEl = contentEl.createSpan({ cls: 'claudian-cursor' });

    this.isStreaming = true;
    this.sendButton.disabled = true;
    this.sendButton.setText('...');

    let fullResponse = '';

    // Elegir método según modo
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
        // Streaming iniciado
      },
      onToken: (token) => {
        fullResponse += token;
        // Actualizar contenido mientras llega
        cursorEl.remove();
        contentEl.empty();

        // Renderizar markdown
        MarkdownRenderer.render(
          this.app,
          fullResponse,
          contentEl,
          '',
          this
        );

        // Re-agregar cursor
        contentEl.appendChild(cursorEl);

        // Scroll automático
        this.scrollToBottom();
      },
      onComplete: (response) => {
        // Remover cursor y agregar botones de acción
        cursorEl.remove();
        contentEl.empty();

        // Renderizar markdown final
        MarkdownRenderer.render(
          this.app,
          response,
          contentEl,
          '',
          this
        );

        // Agregar botones de acción
        this.addMessageActions(responseEl, response);

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText('Enviar');
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.empty();
        contentEl.createEl('span', {
          text: `Error: ${error.message}`,
          cls: 'claudian-error'
        });

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText('Enviar');
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
    const agentSystemPrompt = this.agentMode.getSystemPrompt();

    await this.client.sendAgentMessageStream(message, agentSystemPrompt, {
      onStart: () => {
        // Streaming iniciado
      },
      onToken: (token) => {
        fullResponse += token;
        cursorEl.remove();
        contentEl.empty();

        // Mostrar respuesta mientras llega
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

        // Verificar si es respuesta del agente con acciones
        if (this.agentMode.isAgentResponse(response)) {
          await this.handleAgentResponse(response, responseEl, contentEl);
        } else {
          // Respuesta normal (conversación)
          MarkdownRenderer.render(
            this.app,
            response,
            contentEl,
            '',
            this
          );
          this.addMessageActions(responseEl, response);
        }

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText('Enviar');
        this.scrollToBottom();
      },
      onError: (error) => {
        cursorEl.remove();
        contentEl.empty();
        contentEl.createEl('span', {
          text: `Error: ${error.message}`,
          cls: 'claudian-error'
        });

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText('Enviar');
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
      // No hay acciones, mostrar mensaje normal
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

    // Mostrar mensaje inicial
    MarkdownRenderer.render(
      this.app,
      agentResponse.message,
      contentEl,
      '',
      this
    );

    // Verificar si hay acciones destructivas que requieren confirmación
    const destructiveActions = this.agentMode.getDestructiveActions(agentResponse.actions);

    if (destructiveActions.length > 0 && this.plugin.settings.confirmDestructiveActions) {
      // Mostrar modal de confirmación
      await this.showConfirmationAndExecute(agentResponse, responseEl, contentEl);
    } else {
      // Ejecutar directamente
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
          // Confirmado: ejecutar todas las acciones
          await this.executeAgentActions(
            agentResponse.actions,
            responseEl,
            contentEl,
            agentResponse.message
          );
          resolve();
        },
        () => {
          // Cancelado: mostrar mensaje
          const cancelMsg = contentEl.createDiv({ cls: 'agent-action-cancelled' });
          cancelMsg.setText('Acciones canceladas por el usuario.');
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

      // Actualizar contenido con resultados
      contentEl.empty();
      MarkdownRenderer.render(
        this.app,
        summary,
        contentEl,
        '',
        this
      );

      // Agregar indicador visual de acciones ejecutadas
      const actionsIndicator = contentEl.createDiv({ cls: 'agent-actions-indicator' });
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        actionsIndicator.addClass('all-success');
        actionsIndicator.setText(`${successCount} acción(es) ejecutadas`);
      } else {
        actionsIndicator.addClass('has-errors');
        actionsIndicator.setText(`${successCount} exitosas, ${failCount} fallidas`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      contentEl.createDiv({ cls: 'agent-action-error' }).setText(`Error: ${errorMsg}`);
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

    // Botón copiar
    const copyBtn = actionsEl.createEl('button', { cls: 'claudian-action-btn' });
    setIcon(copyBtn, 'clipboard-copy');
    copyBtn.setAttribute('aria-label', 'Copiar');
    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(content);
      new Notice('Copiado al portapapeles');
    };

    // Botón crear nota
    const noteBtn = actionsEl.createEl('button', { cls: 'claudian-action-btn' });
    setIcon(noteBtn, 'file-plus');
    noteBtn.setAttribute('aria-label', 'Crear nota');
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
    const MIN_HEIGHT = 64;  // Altura mínima en px
    const MAX_RATIO = 0.5;  // Máximo 50% del contenedor padre

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

      // Ajustar el textarea al nuevo tamaño
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

    // Limpiar event listeners cuando se cierra la vista
    this.register(() => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });
  }
}
