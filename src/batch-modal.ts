import { Modal, TFile, TFolder, Notice, setIcon } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ExtractionTemplate, getAllTemplates } from './extraction-templates';
import { BatchProcessor, BatchProgress } from './batch-processor';
import { ConceptMapGenerator } from './concept-map-generator';

type BatchMode = 'extraction' | 'concept-map';

export class BatchModal extends Modal {
  private plugin: ClaudeCompanionPlugin;
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
    plugin: ClaudeCompanionPlugin,
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
      ? 'Procesamiento Batch'
      : 'Generar Mapa de Conceptos';
    contentEl.createEl('h2', { text: title });

    // Selector de carpeta/notas
    this.renderFileSelector(contentEl);

    // Selector de template (solo para extraction)
    if (this.mode === 'extraction') {
      this.renderTemplateSelector(contentEl);
    } else {
      this.renderConceptMapOptions(contentEl);
    }

    // Contenedor de progreso (oculto inicialmente)
    this.progressContainer = contentEl.createDiv({ cls: 'batch-progress-container hidden' });

    // Botones de acción
    this.renderActions(contentEl);
  }

  private renderFileSelector(container: HTMLElement) {
    const section = container.createDiv({ cls: 'batch-section' });
    section.createEl('h3', { text: 'Seleccionar notas' });

    // Barra de herramientas
    const toolbar = section.createDiv({ cls: 'batch-toolbar' });

    // Botón seleccionar carpeta
    const folderBtn = toolbar.createEl('button', {
      text: 'Seleccionar carpeta',
      cls: 'batch-btn-secondary'
    });
    folderBtn.addEventListener('click', () => this.showFolderPicker());

    // Botón seleccionar todo
    const selectAllBtn = toolbar.createEl('button', {
      text: 'Seleccionar todo',
      cls: 'batch-btn-secondary'
    });
    selectAllBtn.addEventListener('click', () => this.selectAllFiles());

    // Botón limpiar selección
    const clearBtn = toolbar.createEl('button', {
      text: 'Limpiar',
      cls: 'batch-btn-secondary'
    });
    clearBtn.addEventListener('click', () => this.clearSelection());

    // Contador
    const counter = toolbar.createSpan({ cls: 'batch-counter' });
    counter.id = 'batch-counter';
    this.updateCounter();

    // Lista de archivos
    this.filesContainer = section.createDiv({ cls: 'batch-files-container' });
    this.renderFilesList();
  }

  private renderFilesList() {
    this.filesContainer.empty();

    const files = this.app.vault.getMarkdownFiles()
      .sort((a, b) => a.path.localeCompare(b.path));

    if (files.length === 0) {
      this.filesContainer.createEl('p', {
        text: 'No hay notas en la bóveda',
        cls: 'batch-empty'
      });
      return;
    }

    // Agrupar por carpeta
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
      const folderCheckbox = folderHeader.createEl('input', { type: 'checkbox' }) as HTMLInputElement;
      folderHeader.createSpan({ text: folder === '/' ? 'Raíz' : folder });

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
        const checkbox = fileRow.createEl('input', { type: 'checkbox' }) as HTMLInputElement;
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

      // Marcar checkbox de carpeta si todos están seleccionados
      folderCheckbox.checked = folderFiles.every(f => this.selectedFiles.has(f));
      folderCheckbox.indeterminate = !folderCheckbox.checked &&
        folderFiles.some(f => this.selectedFiles.has(f));
    }
  }

  private renderTemplateSelector(container: HTMLElement) {
    const section = container.createDiv({ cls: 'batch-section' });
    section.createEl('h3', { text: 'Seleccionar template' });

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
    section.createEl('h3', { text: 'Opciones del mapa' });

    const inputContainer = section.createDiv({ cls: 'batch-input-row' });
    inputContainer.createEl('label', { text: 'Título del mapa:' });
    const input = inputContainer.createEl('input', {
      type: 'text',
      placeholder: 'Mi mapa de conceptos'
    }) as HTMLInputElement;
    input.value = this.conceptMapTitle;
    input.addEventListener('input', () => {
      this.conceptMapTitle = input.value;
    });
  }

  private renderActions(container: HTMLElement) {
    this.actionsContainer = container.createDiv({ cls: 'batch-actions' });

    const cancelBtn = this.actionsContainer.createEl('button', {
      text: 'Cancelar',
      cls: 'batch-btn-secondary'
    });
    cancelBtn.addEventListener('click', () => this.close());

    const processBtn = this.actionsContainer.createEl('button', {
      text: this.mode === 'extraction' ? 'Procesar notas' : 'Generar mapa',
      cls: 'batch-btn-primary'
    });
    processBtn.addEventListener('click', () => this.startProcessing());
  }

  private updateCounter() {
    const counter = document.getElementById('batch-counter');
    if (counter) {
      counter.textContent = `${this.selectedFiles.size} notas seleccionadas`;
    }
  }

  private showFolderPicker() {
    // Mostrar un simple prompt para seleccionar carpeta
    const folders = new Set<string>();
    this.app.vault.getMarkdownFiles().forEach(f => {
      if (f.parent) folders.add(f.parent.path);
    });

    const folderList = Array.from(folders).sort();
    const folder = prompt('Ingresa el nombre de la carpeta:', folderList[0] || '');

    if (folder) {
      const files = this.app.vault.getMarkdownFiles().filter(f =>
        f.parent?.path === folder || f.path.startsWith(folder + '/')
      );
      files.forEach(f => this.selectedFiles.add(f));
      this.renderFilesList();
      this.updateCounter();
    }
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
      new Notice('Selecciona al menos una nota');
      return;
    }

    if (this.mode === 'extraction' && !this.selectedTemplate) {
      new Notice('Selecciona un template');
      return;
    }

    if (this.mode === 'concept-map' && !this.conceptMapTitle.trim()) {
      this.conceptMapTitle = `Mapa de conceptos - ${new Date().toISOString().split('T')[0]}`;
    }

    // Mostrar progreso
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
    progressText.textContent = 'Iniciando procesamiento...';

    try {
      const results = await this.batchProcessor.processNotes(
        files,
        this.selectedTemplate!,
        {
          onStart: (total) => {
            progressText.textContent = `Procesando 0/${total} notas...`;
          },
          onProgress: (progress) => {
            const percent = (progress.current / progress.total) * 100;
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `Procesando ${progress.current}/${progress.total}: ${progress.currentNote}`;
          },
          onComplete: async (results, errors) => {
            progressFill.style.width = '100%';
            progressText.textContent = `Completado: ${results.length} exitosos, ${errors.length} errores`;

            if (results.length > 0) {
              const file = await this.batchProcessor.saveResultsAsNote(results, this.selectedTemplate!);
              new Notice(`Resultados guardados en: ${file.path}`);

              // Abrir la nota
              const leaf = this.app.workspace.getLeaf(false);
              await leaf.openFile(file);
            }

            setTimeout(() => this.close(), 1500);
          }
        }
      );
    } catch (error) {
      progressText.textContent = `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      new Notice('Error durante el procesamiento');
    }
  }

  private async runConceptMapGeneration(
    files: TFile[],
    progressFill: HTMLElement,
    progressText: HTMLElement
  ) {
    progressText.textContent = 'Analizando notas...';
    progressFill.style.width = '30%';

    try {
      const map = await this.conceptMapGenerator.generateFromNotes(
        files,
        this.conceptMapTitle,
        {
          onStart: () => {
            progressFill.style.width = '10%';
          },
          onProgress: (message) => {
            progressText.textContent = message;
            progressFill.style.width = '50%';
          },
          onComplete: async (map) => {
            progressFill.style.width = '90%';
            progressText.textContent = 'Guardando mapa...';

            const file = await this.conceptMapGenerator.saveAsNote(map);
            progressFill.style.width = '100%';
            progressText.textContent = 'Mapa generado exitosamente';

            new Notice(`Mapa guardado en: ${file.path}`);

            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(file);

            setTimeout(() => this.close(), 1500);
          },
          onError: (error) => {
            progressText.textContent = `Error: ${error.message}`;
            new Notice('Error al generar mapa');
          }
        }
      );
    } catch (error) {
      progressText.textContent = `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
