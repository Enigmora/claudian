import { Modal, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { VaultAction } from './vault-actions';

export class ConfirmationModal extends Modal {
  private plugin: ClaudeCompanionPlugin;
  private actions: VaultAction[];
  private onConfirm: () => void;
  private onCancel: () => void;

  constructor(
    plugin: ClaudeCompanionPlugin,
    actions: VaultAction[],
    onConfirm: () => void,
    onCancel: () => void
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.actions = actions;
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('confirmation-modal');

    // Header
    const header = contentEl.createDiv({ cls: 'confirmation-header' });
    const iconSpan = header.createSpan({ cls: 'confirmation-icon' });
    setIcon(iconSpan, 'alert-triangle');
    header.createEl('h2', { text: 'Confirmar acciones' });

    // Descripción
    contentEl.createEl('p', {
      text: 'Las siguientes acciones requieren confirmación:',
      cls: 'confirmation-description'
    });

    // Lista de acciones
    const actionsList = contentEl.createDiv({ cls: 'confirmation-actions-list' });

    for (const action of this.actions) {
      const actionRow = actionsList.createDiv({ cls: 'confirmation-action-row' });

      const actionIcon = actionRow.createSpan({ cls: 'confirmation-action-icon' });
      setIcon(actionIcon, this.getActionIcon(action));

      const actionText = actionRow.createSpan({ cls: 'confirmation-action-text' });
      actionText.textContent = action.description || this.getActionDescription(action);

      // Marcar acciones destructivas
      if (this.isDestructive(action)) {
        actionRow.addClass('is-destructive');
      }
    }

    // Advertencia
    const warning = contentEl.createDiv({ cls: 'confirmation-warning' });
    warning.createEl('p', {
      text: 'Esta acción no se puede deshacer.'
    });

    // Botones
    const buttons = contentEl.createDiv({ cls: 'confirmation-buttons' });

    const cancelBtn = buttons.createEl('button', {
      text: 'Cancelar',
      cls: 'confirmation-btn-cancel'
    });
    cancelBtn.addEventListener('click', () => {
      this.onCancel();
      this.close();
    });

    const confirmBtn = buttons.createEl('button', {
      text: 'Confirmar',
      cls: 'confirmation-btn-confirm'
    });
    confirmBtn.addEventListener('click', () => {
      this.onConfirm();
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private getActionIcon(action: VaultAction): string {
    switch (action.action) {
      case 'delete-note':
      case 'delete-folder':
        return 'trash-2';
      case 'replace-content':
        return 'file-edit';
      case 'move-note':
        return 'folder-input';
      case 'rename-note':
        return 'pencil';
      default:
        return 'alert-circle';
    }
  }

  private getActionDescription(action: VaultAction): string {
    const { params } = action;

    switch (action.action) {
      case 'delete-note':
        return `Eliminar nota: ${params.path}`;
      case 'delete-folder':
        return `Eliminar carpeta: ${params.path}`;
      case 'replace-content':
        return `Reemplazar contenido de: ${params.path}`;
      case 'move-note':
        return `Mover: ${params.from} → ${params.to}`;
      case 'rename-note':
        return `Renombrar: ${params.from} → ${params.to}`;
      default:
        return `${action.action}: ${JSON.stringify(params)}`;
    }
  }

  private isDestructive(action: VaultAction): boolean {
    return ['delete-note', 'delete-folder', 'replace-content'].includes(action.action);
  }
}
