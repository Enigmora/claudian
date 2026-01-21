import { App, Modal, Setting, Notice, TFolder } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { generateNoteContent, extractSuggestedTags, suggestTitle } from './templates/default';

export class NoteCreatorModal extends Modal {
  plugin: ClaudeCompanionPlugin;
  content: string;

  private title: string;
  private tags: string;
  private folder: string;

  constructor(app: App, plugin: ClaudeCompanionPlugin, content: string) {
    super(app);
    this.plugin = plugin;
    this.content = content;

    // Valores iniciales
    this.title = suggestTitle(content);
    this.tags = extractSuggestedTags(content).join(', ');
    this.folder = plugin.settings.notesFolder;
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Crear nota desde chat' });

    // Preview del contenido
    const previewContainer = contentEl.createDiv({ cls: 'note-creator-preview' });
    previewContainer.createEl('h4', { text: 'Vista previa' });
    const previewText = this.content.length > 300
      ? this.content.slice(0, 300) + '...'
      : this.content;
    previewContainer.createEl('p', { text: previewText, cls: 'note-creator-preview-text' });

    // Título
    new Setting(contentEl)
      .setName('Título')
      .setDesc('Nombre del archivo (sin extensión .md)')
      .addText(text => text
        .setValue(this.title)
        .onChange(value => this.title = value)
        .inputEl.addClass('note-creator-title-input')
      );

    // Tags
    new Setting(contentEl)
      .setName('Tags')
      .setDesc('Separados por comas')
      .addText(text => text
        .setPlaceholder('tag1, tag2, tag3')
        .setValue(this.tags)
        .onChange(value => this.tags = value)
      );

    // Carpeta
    new Setting(contentEl)
      .setName('Carpeta')
      .setDesc('Carpeta destino de la nota')
      .addText(text => text
        .setValue(this.folder)
        .onChange(value => this.folder = value)
      );

    // Botones
    const buttonContainer = contentEl.createDiv({ cls: 'note-creator-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancelar' });
    cancelBtn.onclick = () => this.close();

    const createBtn = buttonContainer.createEl('button', {
      text: 'Crear nota',
      cls: 'mod-cta'
    });
    createBtn.onclick = () => this.createNote();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async createNote(): Promise<void> {
    if (!this.title.trim()) {
      new Notice('El título es requerido');
      return;
    }

    try {
      // Crear carpeta si no existe
      await this.ensureFolderExists(this.folder);

      // Generar contenido de la nota
      const tagsArray = this.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const today = new Date().toISOString().split('T')[0];

      const noteContent = generateNoteContent({
        title: this.title,
        content: this.content,
        tags: tagsArray,
        date: today
      });

      // Crear archivo
      const fileName = this.sanitizeFileName(this.title);
      const filePath = this.folder
        ? `${this.folder}/${fileName}.md`
        : `${fileName}.md`;

      // Verificar si existe
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      if (existingFile) {
        new Notice(`Ya existe un archivo con el nombre: ${fileName}`);
        return;
      }

      const file = await this.app.vault.create(filePath, noteContent);

      new Notice(`Nota creada: ${file.path}`);

      // Abrir la nota
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);

      this.close();

    } catch (error) {
      console.error('Error creando nota:', error);
      new Notice(`Error al crear la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    if (!folderPath) return;

    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }
  }

  private sanitizeFileName(name: string): string {
    // Remover caracteres no permitidos en nombres de archivo
    return name
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
