import { Modal, TFile, Notice, setIcon, SuggestModal } from 'obsidian';
import ClaudianPlugin from './main';
import { ExtractionTemplate, getAllTemplates } from './extraction-templates';
import { BatchProcessor } from './batch-processor';
import { ConceptMapGenerator } from './concept-map-generator';
import { t } from './i18n';

/**
 * Modal for selecting a folder from the vault
 */
class FolderSuggestModal extends SuggestModal<string> {
  private folders: string[];
  private onSelect: (folder: string) => void;

  constructor(app: import('obsidian').App, folders: string[], onSelect: (folder: string) => void) {
    super(app);
    this.folders = folders;
    this.onSelect = onSelect;
    this.setPlaceholder(t('batch.folderPrompt'));
  }

  getSuggestions(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return this.folders.filter(folder =>
      folder.toLowerCase().includes(lowerQuery)
    );
  }

  renderSuggestion(folder: string, el: HTMLElement): void {
    el.createEl('div', { text: folder || '/' });
  }

  onChooseSuggestion(folder: string): void {
    this.onSelect(folder);
  }
}

type BatchMode = 'extraction' | 'concept-map';

export class BatchModal extends Modal {
  private plugin: ClaudianPlugin;
  private batchProcessor: BatchProcessor;
  private conceptMapGenerator: ConceptMapGenerator;
  private mode: BatchMode;

  private selectedFiles: Set<TFile> = new Set();
  private selectedTemplate: ExtractionTemplate | null = null;
  private conceptMapTitle: string = '';

  private filesContainer: HTMLElement;
  private templateContainer: HTMLElement;
  private progressContainer: HTMLElement;
  private actionsContainer: HTMLElement;

  constructor(
    plugin: ClaudianPlugin,
    batchProcessor: BatchProcessor,
    conceptMapGenerator: ConceptMapGenerator,
    mode: BatchMode = 'extraction'
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.batchProcessor = batchProcessor;
    this.conceptMapGenerator = conceptMapGenerator;
    this.mode = mode;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('batch-modal');

    const title = this.mode === 'extraction'
      ? t('batch.titleExtraction')
      : t('batch.titleConceptMap');
    contentEl.createEl('h2', { text: title });

    // File/note selector
    this.renderFileSelector(contentEl);

    // Template selector (only for extraction)
    if (this.mode === 'extraction') {
      this.renderTemplateSelector(contentEl);
    } else {
      this.renderConceptMapOptions(contentEl);
    }

    // Progress container (hidden initially)
    this.progressContainer = contentEl.createDiv({ cls: 'batch-progress-container hidden' });

    // Action buttons
    this.renderActions(contentEl);
  }

  private renderFileSelector(container: HTMLElement) {
    const section = container.createDiv({ cls: 'batch-section' });
    section.createEl('h3', { text: t('batch.selectNotes') });

    // Toolbar
    const toolbar = section.createDiv({ cls: 'batch-toolbar' });

    // Select folder button
    const folderBtn = toolbar.createEl('button', {
      text: t('batch.selectFolder'),
      cls: 'batch-btn-secondary'
    });
    folderBtn.addEventListener('click', () => this.showFolderPicker());

    // Select all button
    const selectAllBtn = toolbar.createEl('button', {
      text: t('batch.selectAll'),
      cls: 'batch-btn-secondary'
    });
    selectAllBtn.addEventListener('click', () => this.selectAllFiles());

    // Clear selection button
    const clearBtn = toolbar.createEl('button', {
      text: t('batch.clear'),
      cls: 'batch-btn-secondary'
    });
    clearBtn.addEventListener('click', () => this.clearSelection());

    // Counter
    const counter = toolbar.createSpan({ cls: 'batch-counter' });
    counter.id = 'batch-counter';
    this.updateCounter();

    // Files list
    this.filesContainer = section.createDiv({ cls: 'batch-files-container' });
    this.renderFilesList();
  }

  private renderFilesList() {
    this.filesContainer.empty();

    const files = this.app.vault.getMarkdownFiles()
      .sort((a, b) => a.path.localeCompare(b.path));

    if (files.length === 0) {
      this.filesContainer.createEl('p', {
        text: t('batch.noNotes'),
        cls: 'batch-empty'
      });
      return;
    }

    // Group by folder
    const byFolder = new Map<string, TFile[]>();
    for (const file of files) {
      const folder = file.parent?.path || '/';
      if (!byFolder.has(folder)) {
        byFolder.set(folder, []);
      }
      byFolder.get(folder)!.push(file);
    }

    for (const [folder, folderFiles] of byFolder) {
      const folderDiv = this.filesContainer.createDiv({ cls: 'batch-folder' });

      const folderHeader = folderDiv.createDiv({ cls: 'batch-folder-header' });
      const folderCheckbox = folderHeader.createEl('input', { type: 'checkbox' });
      folderHeader.createSpan({ text: folder === '/' ? t('batch.rootFolder') : folder });

      folderCheckbox.addEventListener('change', () => {
        for (const file of folderFiles) {
          if (folderCheckbox.checked) {
            this.selectedFiles.add(file);
          } else {
            this.selectedFiles.delete(file);
          }
        }
        this.renderFilesList();
        this.updateCounter();
      });

      const filesList = folderDiv.createDiv({ cls: 'batch-files-list' });
      for (const file of folderFiles) {
        const fileRow = filesList.createDiv({ cls: 'batch-file-row' });
        const checkbox = fileRow.createEl('input', { type: 'checkbox' });
        checkbox.checked = this.selectedFiles.has(file);
        fileRow.createSpan({ text: file.basename });

        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            this.selectedFiles.add(file);
          } else {
            this.selectedFiles.delete(file);
          }
          this.updateCounter();
        });
      }

      // Mark folder checkbox if all are selected
      folderCheckbox.checked = folderFiles.every(f => this.selectedFiles.has(f));
      folderCheckbox.indeterminate = !folderCheckbox.checked &&
        folderFiles.some(f => this.selectedFiles.has(f));
    }
  }

  private renderTemplateSelector(container: HTMLElement) {
    const section = container.createDiv({ cls: 'batch-section' });
    section.createEl('h3', { text: t('batch.selectTemplate') });

    this.templateContainer = section.createDiv({ cls: 'batch-templates-container' });

    const templates = getAllTemplates();
    for (const template of templates) {
      const card = this.templateContainer.createDiv({
        cls: `batch-template-card ${this.selectedTemplate?.id === template.id ? 'is-selected' : ''}`
      });

      const iconSpan = card.createSpan({ cls: 'batch-template-icon' });
      setIcon(iconSpan, template.icon);

      const info = card.createDiv({ cls: 'batch-template-info' });
      info.createEl('strong', { text: template.name });
      info.createEl('p', { text: template.description });

      card.addEventListener('click', () => {
        this.selectedTemplate = template;
        this.templateContainer.querySelectorAll('.batch-template-card').forEach(el => {
          el.removeClass('is-selected');
        });
        card.addClass('is-selected');
      });
    }
  }

  private renderConceptMapOptions(container: HTMLElement) {
    const section = container.createDiv({ cls: 'batch-section' });
    section.createEl('h3', { text: t('batch.mapOptions') });

    const inputContainer = section.createDiv({ cls: 'batch-input-row' });
    inputContainer.createEl('label', { text: t('batch.mapTitle') });
    const input = inputContainer.createEl('input', {
      type: 'text',
      placeholder: t('batch.mapTitlePlaceholder')
    });
    input.value = this.conceptMapTitle;
    input.addEventListener('input', () => {
      this.conceptMapTitle = input.value;
    });
  }

  private renderActions(container: HTMLElement) {
    this.actionsContainer = container.createDiv({ cls: 'batch-actions' });

    const cancelBtn = this.actionsContainer.createEl('button', {
      text: t('batch.cancel'),
      cls: 'batch-btn-secondary'
    });
    cancelBtn.addEventListener('click', () => this.close());

    const processBtn = this.actionsContainer.createEl('button', {
      text: this.mode === 'extraction' ? t('batch.processNotes') : t('batch.generateMap'),
      cls: 'batch-btn-primary'
    });
    processBtn.addEventListener('click', () => { void this.startProcessing(); });
  }

  private updateCounter() {
    const counter = document.getElementById('batch-counter');
    if (counter) {
      counter.textContent = t('batch.counter', { count: String(this.selectedFiles.size) });
    }
  }

  private showFolderPicker() {
    // Collect all folders from markdown files
    const folders = new Set<string>();
    this.app.vault.getMarkdownFiles().forEach(f => {
      if (f.parent) folders.add(f.parent.path);
    });

    const folderList = Array.from(folders).sort();

    // Show folder selection modal
    new FolderSuggestModal(this.app, folderList, (folder) => {
      const files = this.app.vault.getMarkdownFiles().filter(f =>
        f.parent?.path === folder || f.path.startsWith(folder + '/')
      );
      files.forEach(f => this.selectedFiles.add(f));
      this.renderFilesList();
      this.updateCounter();
    }).open();
  }

  private selectAllFiles() {
    this.app.vault.getMarkdownFiles().forEach(f => this.selectedFiles.add(f));
    this.renderFilesList();
    this.updateCounter();
  }

  private clearSelection() {
    this.selectedFiles.clear();
    this.renderFilesList();
    this.updateCounter();
  }

  private async startProcessing() {
    if (this.selectedFiles.size === 0) {
      new Notice(t('batch.selectAtLeastOne'));
      return;
    }

    if (this.mode === 'extraction' && !this.selectedTemplate) {
      new Notice(t('batch.selectTemplateRequired'));
      return;
    }

    if (this.mode === 'concept-map' && !this.conceptMapTitle.trim()) {
      this.conceptMapTitle = `Concept Map - ${new Date().toISOString().split('T')[0]}`;
    }

    // Show progress
    this.progressContainer.removeClass('hidden');
    this.progressContainer.empty();

    const progressBar = this.progressContainer.createDiv({ cls: 'batch-progress-bar' });
    const progressFill = progressBar.createDiv({ cls: 'batch-progress-fill' });
    const progressText = this.progressContainer.createDiv({ cls: 'batch-progress-text' });

    const files = Array.from(this.selectedFiles);

    if (this.mode === 'extraction') {
      await this.runExtractionBatch(files, progressFill, progressText);
    } else {
      await this.runConceptMapGeneration(files, progressFill, progressText);
    }
  }

  private async runExtractionBatch(
    files: TFile[],
    progressFill: HTMLElement,
    progressText: HTMLElement
  ) {
    progressText.textContent = t('batch.starting');

    try {
      const _results = await this.batchProcessor.processNotes(
        files,
        this.selectedTemplate!,
        {
          onStart: (total) => {
            progressText.textContent = t('batch.processing', { current: '0', total: String(total), note: '' });
          },
          onProgress: (progress) => {
            const percent = (progress.current / progress.total) * 100;
            progressFill.setCssStyles({ width: `${percent}%` });
            progressText.textContent = t('batch.processing', {
              current: String(progress.current),
              total: String(progress.total),
              note: progress.currentNote
            });
          },
          onComplete: (results, errors) => {
            progressFill.setCssStyles({ width: '100%' });
            progressText.textContent = t('batch.completed', {
              success: String(results.length),
              errors: String(errors.length)
            });

            if (results.length > 0) {
              void (async () => {
                const file = await this.batchProcessor.saveResultsAsNote(results, this.selectedTemplate!);
                new Notice(t('batch.savedTo', { path: file.path }));

                // Open the note
                const leaf = this.app.workspace.getLeaf(false);
                await leaf.openFile(file);
              })();
            }

            setTimeout(() => this.close(), 1500);
          }
        }
      );
    } catch (error) {
      progressText.textContent = t('chat.error', { message: error instanceof Error ? error.message : t('chat.errorUnknown') });
      new Notice(t('batch.errorProcessing'));
    }
  }

  private async runConceptMapGeneration(
    files: TFile[],
    progressFill: HTMLElement,
    progressText: HTMLElement
  ) {
    progressText.textContent = t('batch.analyzing');
    progressFill.setCssStyles({ width: '30%' });

    try {
      const _map = await this.conceptMapGenerator.generateFromNotes(
        files,
        this.conceptMapTitle,
        {
          onStart: () => {
            progressFill.setCssStyles({ width: '10%' });
          },
          onProgress: (message) => {
            progressText.textContent = message;
            progressFill.setCssStyles({ width: '50%' });
          },
          onComplete: (map) => {
            progressFill.setCssStyles({ width: '90%' });
            progressText.textContent = t('batch.saving');

            void (async () => {
              const file = await this.conceptMapGenerator.saveAsNote(map);
              progressFill.setCssStyles({ width: '100%' });
              progressText.textContent = t('batch.mapGenerated');

              new Notice(t('batch.savedTo', { path: file.path }));

              const leaf = this.app.workspace.getLeaf(false);
              await leaf.openFile(file);

              setTimeout(() => this.close(), 1500);
            })();
          },
          onError: (error) => {
            progressText.textContent = t('chat.error', { message: error.message });
            new Notice(t('batch.errorGenerating'));
          }
        }
      );
    } catch (error) {
      progressText.textContent = t('chat.error', { message: error instanceof Error ? error.message : t('chat.errorUnknown') });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
