import { Plugin, WorkspaceLeaf, Notice, TFile } from 'obsidian';
import { ClaudeCompanionSettings, ClaudeCompanionSettingTab, DEFAULT_SETTINGS } from './settings';
import { ChatView, VIEW_TYPE_CHAT } from './chat-view';
import { VaultIndexer } from './vault-indexer';
import { ClaudeClient } from './claude-client';
import { NoteProcessor } from './note-processor';
import { SuggestionsModal } from './suggestions-modal';

export default class ClaudeCompanionPlugin extends Plugin {
  settings: ClaudeCompanionSettings;
  indexer: VaultIndexer;
  claudeClient: ClaudeClient;
  noteProcessor: NoteProcessor;

  async onload() {
    await this.loadSettings();

    // Inicializar cliente de Claude
    this.claudeClient = new ClaudeClient(this.settings);

    // Inicializar indexador de bóveda
    this.indexer = new VaultIndexer(this);
    await this.indexer.initialize();

    // Inicializar procesador de notas
    this.noteProcessor = new NoteProcessor(this, this.claudeClient, this.indexer);

    // Registrar la vista de chat
    this.registerView(
      VIEW_TYPE_CHAT,
      (leaf) => new ChatView(leaf, this)
    );

    // Agregar icono en ribbon
    this.addRibbonIcon('message-circle', 'Claude Companion by Enigmora', () => {
      this.activateChatView();
    });

    // Registrar comando para abrir chat
    this.addCommand({
      id: 'open-claude-chat',
      name: 'Abrir chat con Claude',
      callback: () => {
        this.activateChatView();
      }
    });

    // Registrar comando para procesar nota activa
    this.addCommand({
      id: 'process-active-note',
      name: 'Procesar nota activa con Claude',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file?.extension === 'md') {
          if (!checking) {
            this.processActiveNote(file);
          }
          return true;
        }
        return false;
      }
    });

    // Agregar tab de settings
    this.addSettingTab(new ClaudeCompanionSettingTab(this.app, this));
  }

  private async processActiveNote(file: TFile): Promise<void> {
    const notice = new Notice('Procesando nota con Claude...', 0);

    this.noteProcessor.processActiveNote({
      onStart: () => {},
      onProgress: (message) => {
        notice.setMessage(message);
      },
      onComplete: (suggestions) => {
        notice.hide();
        new SuggestionsModal(this, this.noteProcessor, suggestions, file).open();
      },
      onError: (error) => {
        notice.hide();
        new Notice(`Error: ${error.message}`);
      }
    });
  }

  async onunload() {
    // Limpiar vistas al desactivar plugin
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateChatView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT);

    if (leaves.length > 0) {
      // Ya existe una vista, usarla
      leaf = leaves[0];
    } else {
      // Crear nueva vista en el panel derecho
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_CHAT, active: true });
      }
    }

    // Revelar la vista
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}
