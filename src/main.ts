import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ClaudeCompanionSettings, ClaudeCompanionSettingTab, DEFAULT_SETTINGS } from './settings';
import { ChatView, VIEW_TYPE_CHAT } from './chat-view';

export default class ClaudeCompanionPlugin extends Plugin {
  settings: ClaudeCompanionSettings;

  async onload() {
    await this.loadSettings();

    // Registrar la vista de chat
    this.registerView(
      VIEW_TYPE_CHAT,
      (leaf) => new ChatView(leaf, this)
    );

    // Agregar icono en ribbon
    this.addRibbonIcon('message-circle', 'Claude Companion', () => {
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

    // Agregar tab de settings
    this.addSettingTab(new ClaudeCompanionSettingTab(this.app, this));
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
