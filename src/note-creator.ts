import { App, Modal, Setting, Notice } from 'obsidian';
import ClaudianPlugin from './main';
import { generateNoteContent, extractSuggestedTags, suggestTitle } from './templates/default';
import { t } from './i18n';
import { logger } from './logger';

export class NoteCreatorModal extends Modal {
  plugin: ClaudianPlugin;
  content: string;

  private title: string;
  private tags: string;
  private folder: string;

  constructor(app: App, plugin: ClaudianPlugin, content: string) {
    super(app);
    this.plugin = plugin;
    this.content = content;

    // Initial values
    this.title = suggestTitle(content);
    this.tags = extractSuggestedTags(content).join(', ');
    this.folder = plugin.settings.notesFolder;
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: t('noteCreator.title') });

    // Content preview
    const previewContainer = contentEl.createDiv({ cls: 'note-creator-preview' });
    previewContainer.createEl('h4', { text: t('noteCreator.preview') });
    const previewText = this.content.length > 300
      ? this.content.slice(0, 300) + '...'
      : this.content;
    previewContainer.createEl('p', { text: previewText, cls: 'note-creator-preview-text' });

    // Title
    new Setting(contentEl)
      .setName(t('noteCreator.titleField.name'))
      .setDesc(t('noteCreator.titleField.desc'))
      .addText(text => text
        .setValue(this.title)
        .onChange(value => this.title = value)
        .inputEl.addClass('note-creator-title-input')
      );

    // Tags
    new Setting(contentEl)
      .setName(t('noteCreator.tags.name'))
      .setDesc(t('noteCreator.tags.desc'))
      .addText(text => text
        .setPlaceholder(t('noteCreator.tags.placeholder'))
        .setValue(this.tags)
        .onChange(value => this.tags = value)
      );

    // Folder
    new Setting(contentEl)
      .setName(t('noteCreator.folder.name'))
      .setDesc(t('noteCreator.folder.desc'))
      .addText(text => text
        .setValue(this.folder)
        .onChange(value => this.folder = value)
      );

    // Buttons
    const buttonContainer = contentEl.createDiv({ cls: 'note-creator-buttons' });

    const cancelBtn = buttonContainer.createEl('button', { text: t('noteCreator.cancel') });
    cancelBtn.onclick = () => this.close();

    const createBtn = buttonContainer.createEl('button', {
      text: t('noteCreator.create'),
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
      new Notice(t('noteCreator.titleRequired'));
      return;
    }

    try {
      // Create folder if it doesn't exist
      await this.ensureFolderExists(this.folder);

      // Generate note content
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

      // Create file
      const fileName = this.sanitizeFileName(this.title);
      const filePath = this.folder
        ? `${this.folder}/${fileName}.md`
        : `${fileName}.md`;

      // Check if exists
      const existingFile = this.app.vault.getAbstractFileByPath(filePath);
      if (existingFile) {
        new Notice(t('noteCreator.fileExists', { name: fileName }));
        return;
      }

      const file = await this.app.vault.create(filePath, noteContent);

      new Notice(t('noteCreator.created', { path: file.path }));

      // Open the note
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);

      this.close();

    } catch (error) {
      logger.error('Error creating note:', error);
      new Notice(t('noteCreator.error', { message: error instanceof Error ? error.message : t('chat.errorUnknown') }));
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
    // Remove characters not allowed in file names
    return name
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
