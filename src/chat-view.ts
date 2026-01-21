import { ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient, Message } from './claude-client';
import { NoteCreatorModal } from './note-creator';

export const VIEW_TYPE_CHAT = 'claude-companion-chat';

export class ChatView extends ItemView {
  plugin: ClaudeCompanionPlugin;
  client: ClaudeClient;

  private messagesContainer: HTMLElement;
  private inputEl: HTMLTextAreaElement;
  private sendButton: HTMLButtonElement;
  private isStreaming: boolean = false;

  constructor(leaf: WorkspaceLeaf, plugin: ClaudeCompanionPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.client = new ClaudeClient(plugin.settings);
  }

  getViewType(): string {
    return VIEW_TYPE_CHAT;
  }

  getDisplayText(): string {
    return 'Claude Companion';
  }

  getIcon(): string {
    return 'message-circle';
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('claude-companion-container');

    // Header
    const header = container.createDiv({ cls: 'claude-companion-header' });
    header.createEl('h4', { text: 'Claude Companion' });

    const clearBtn = header.createEl('button', { cls: 'claude-companion-clear-btn' });
    setIcon(clearBtn, 'trash-2');
    clearBtn.setAttribute('aria-label', 'Limpiar chat');
    clearBtn.onclick = () => this.clearChat();

    // Contenedor de mensajes
    this.messagesContainer = container.createDiv({ cls: 'claude-companion-messages' });

    // Restaurar historial si existe
    this.restoreHistory();

    // Área de input
    const inputArea = container.createDiv({ cls: 'claude-companion-input-area' });

    this.inputEl = inputArea.createEl('textarea', {
      cls: 'claude-companion-input',
      attr: { placeholder: 'Escribe tu mensaje...' }
    });

    // Enter para enviar, Shift+Enter para nueva línea
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.inputEl.addEventListener('input', () => {
      this.inputEl.style.height = 'auto';
      this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 150) + 'px';
    });

    this.sendButton = inputArea.createEl('button', {
      cls: 'claude-companion-send-btn',
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
    const contentEl = responseEl.querySelector('.claude-companion-message-content') as HTMLElement;

    // Agregar cursor de streaming
    const cursorEl = contentEl.createSpan({ cls: 'claude-companion-cursor' });

    this.isStreaming = true;
    this.sendButton.disabled = true;
    this.sendButton.setText('...');

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
          cls: 'claude-companion-error'
        });

        this.isStreaming = false;
        this.sendButton.disabled = false;
        this.sendButton.setText('Enviar');
      }
    });
  }

  private renderMessage(role: 'user' | 'assistant', content: string): void {
    const messageEl = this.createMessageElement(role);
    const contentEl = messageEl.querySelector('.claude-companion-message-content') as HTMLElement;

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
      cls: `claude-companion-message claude-companion-message-${role}`
    });

    messageEl.createDiv({ cls: 'claude-companion-message-content' });

    return messageEl;
  }

  private addMessageActions(messageEl: HTMLElement, content: string): void {
    const actionsEl = messageEl.createDiv({ cls: 'claude-companion-message-actions' });

    // Botón copiar
    const copyBtn = actionsEl.createEl('button', { cls: 'claude-companion-action-btn' });
    setIcon(copyBtn, 'clipboard-copy');
    copyBtn.setAttribute('aria-label', 'Copiar');
    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(content);
      new Notice('Copiado al portapapeles');
    };

    // Botón crear nota
    const noteBtn = actionsEl.createEl('button', { cls: 'claude-companion-action-btn' });
    setIcon(noteBtn, 'file-plus');
    noteBtn.setAttribute('aria-label', 'Crear nota');
    noteBtn.onclick = () => {
      new NoteCreatorModal(this.app, this.plugin, content).open();
    };
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
