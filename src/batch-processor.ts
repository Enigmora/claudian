import { TFile } from 'obsidian';
import ClaudianPlugin from './main';
import { ClaudeClient } from './claude-client';
import { ExtractionTemplate, TemplateResult, buildTemplatePrompt } from './extraction-templates';

export interface BatchProgress {
  total: number;
  current: number;
  currentNote: string;
  results: TemplateResult[];
  errors: Array<{ note: string; error: string }>;
}

export interface BatchCallbacks {
  onStart?: (total: number) => void;
  onProgress?: (progress: BatchProgress) => void;
  onNoteComplete?: (result: TemplateResult) => void;
  onNoteError?: (note: string, error: Error) => void;
  onComplete?: (results: TemplateResult[], errors: Array<{ note: string; error: string }>) => void;
  onCancel?: () => void;
}

export class BatchProcessor {
  private plugin: ClaudianPlugin;
  private claudeClient: ClaudeClient;
  private isCancelled: boolean = false;

  constructor(plugin: ClaudianPlugin, claudeClient: ClaudeClient) {
    this.plugin = plugin;
    this.claudeClient = claudeClient;
  }

  cancel(): void {
    this.isCancelled = true;
  }

  async processNotes(
    files: TFile[],
    template: ExtractionTemplate,
    callbacks: BatchCallbacks
  ): Promise<TemplateResult[]> {
    this.isCancelled = false;
    const results: TemplateResult[] = [];
    const errors: Array<{ note: string; error: string }> = [];

    callbacks.onStart?.(files.length);

    for (let i = 0; i < files.length; i++) {
      if (this.isCancelled) {
        callbacks.onCancel?.();
        break;
      }

      const file = files[i];
      const progress: BatchProgress = {
        total: files.length,
        current: i + 1,
        currentNote: file.basename,
        results,
        errors
      };

      callbacks.onProgress?.(progress);

      try {
        const result = await this.processNote(file, template);
        results.push(result);
        callbacks.onNoteComplete?.(result);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        errors.push({ note: file.basename, error: errorMsg });
        callbacks.onNoteError?.(file.basename, error instanceof Error ? error : new Error(errorMsg));
      }

      // Pequeña pausa entre notas para evitar rate limiting
      if (i < files.length - 1 && !this.isCancelled) {
        await this.delay(500);
      }
    }

    callbacks.onComplete?.(results, errors);
    return results;
  }

  private async processNote(file: TFile, template: ExtractionTemplate): Promise<TemplateResult> {
    const content = await this.plugin.app.vault.read(file);
    const prompt = buildTemplatePrompt(template, content, file.basename);

    return new Promise((resolve, reject) => {
      void this.claudeClient.processWithTemplate(
        prompt,
        template,
        {
          onStart: () => {},
          onToken: () => {},
          onComplete: (response) => {
            resolve({
              templateId: template.id,
              noteTitle: file.basename,
              notePath: file.path,
              content: response,
              timestamp: new Date().toISOString()
            });
          },
          onError: (error) => {
            reject(error);
          }
        }
      );
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveResultsAsNote(
    results: TemplateResult[],
    template: ExtractionTemplate,
    outputPath?: string
  ): Promise<TFile> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${template.name} - Batch ${timestamp}.md`;
    const folder = outputPath || this.plugin.settings.notesFolder;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Asegurar que la carpeta existe
    if (folder && !this.plugin.app.vault.getAbstractFileByPath(folder)) {
      await this.plugin.app.vault.createFolder(folder);
    }

    const content = this.formatBatchResults(results, template);
    const file = await this.plugin.app.vault.create(filePath, content);

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
      frontmatter.created = timestamp;
      frontmatter.template = template.id;
      frontmatter.source = 'batch-processing';
      frontmatter['notes-processed'] = results.length;
    });

    return file;
  }

  private formatBatchResults(results: TemplateResult[], template: ExtractionTemplate): string {
    let content = `# ${template.name}\n\n`;
    content += `> Procesamiento batch de ${results.length} notas\n\n`;
    content += `---\n\n`;

    for (const result of results) {
      content += `## [[${result.noteTitle}]]\n\n`;
      content += result.content;
      content += `\n\n---\n\n`;
    }

    return content;
  }
}
