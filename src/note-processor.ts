import { TFile, Notice } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient, NoteSuggestions, AtomicConcept, WikilinkSuggestion } from './claude-client';
import { VaultIndexer } from './vault-indexer';

export interface ProcessCallbacks {
  onStart?: () => void;
  onProgress?: (message: string) => void;
  onComplete?: (suggestions: NoteSuggestions) => void;
  onError?: (error: Error) => void;
}

export interface ValidatedWikilink extends WikilinkSuggestion {
  exists: boolean;
}

export interface ValidatedSuggestions extends Omit<NoteSuggestions, 'wikilinks'> {
  wikilinks: ValidatedWikilink[];
}

export class NoteProcessor {
  private plugin: ClaudeCompanionPlugin;
  private claudeClient: ClaudeClient;
  private indexer: VaultIndexer;

  constructor(plugin: ClaudeCompanionPlugin, claudeClient: ClaudeClient, indexer: VaultIndexer) {
    this.plugin = plugin;
    this.claudeClient = claudeClient;
    this.indexer = indexer;
  }

  async processActiveNote(callbacks: ProcessCallbacks): Promise<void> {
    const file = this.plugin.app.workspace.getActiveFile();

    if (!file || file.extension !== 'md') {
      callbacks.onError?.(new Error('No hay una nota markdown activa.'));
      return;
    }

    callbacks.onStart?.();
    callbacks.onProgress?.('Leyendo contenido de la nota...');

    const content = await this.plugin.app.vault.read(file);
    const vaultContext = this.indexer.getVaultContext();

    callbacks.onProgress?.('Analizando con Claude...');

    let fullResponse = '';

    await this.claudeClient.processNoteStream(
      content,
      file.basename,
      vaultContext,
      {
        onStart: () => {},
        onToken: (token) => {
          fullResponse += token;
        },
        onComplete: (response) => {
          try {
            const suggestions = this.parseSuggestions(response);
            const validated = this.validateWikilinks(suggestions);
            callbacks.onComplete?.(validated);
          } catch (error) {
            callbacks.onError?.(error instanceof Error ? error : new Error('Error al parsear respuesta'));
          }
        },
        onError: (error) => {
          callbacks.onError?.(error);
        }
      }
    );
  }

  parseSuggestions(response: string): NoteSuggestions {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta.');
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        wikilinks: Array.isArray(parsed.wikilinks) ? parsed.wikilinks : [],
        atomicConcepts: Array.isArray(parsed.atomicConcepts) ? parsed.atomicConcepts : [],
        reasoning: parsed.reasoning || ''
      };
    } catch (error) {
      throw new Error('Error al parsear JSON de sugerencias.');
    }
  }

  validateWikilinks(suggestions: NoteSuggestions): ValidatedSuggestions {
    const validatedWikilinks: ValidatedWikilink[] = suggestions.wikilinks.map(wl => ({
      ...wl,
      exists: this.indexer.noteExists(wl.target)
    }));

    return {
      ...suggestions,
      wikilinks: validatedWikilinks
    };
  }

  async applyTags(file: TFile, tags: string[]): Promise<void> {
    if (tags.length === 0) return;

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
      const existingTags: string[] = Array.isArray(frontmatter.tags)
        ? frontmatter.tags
        : (frontmatter.tags ? [frontmatter.tags] : []);

      const mergedTags = [...new Set([...existingTags, ...tags])];
      frontmatter.tags = mergedTags;
    });

    new Notice(`${tags.length} tag(s) aplicados.`);
  }

  async insertWikilinks(file: TFile, wikilinks: WikilinkSuggestion[]): Promise<void> {
    if (wikilinks.length === 0) return;

    await this.plugin.app.vault.process(file, (content) => {
      const sectionHeader = '## Enlaces relacionados';
      const existingSectionRegex = /\n## Enlaces relacionados\n/;

      const newLinksFormatted = wikilinks
        .map(wl => `- [[${wl.target}]] - ${wl.context}`);

      if (existingSectionRegex.test(content)) {
        const insertPoint = content.indexOf(sectionHeader);
        const afterHeader = content.slice(insertPoint + sectionHeader.length);
        const nextSectionMatch = afterHeader.match(/\n## [^#]/);
        const endPoint = nextSectionMatch
          ? insertPoint + sectionHeader.length + nextSectionMatch.index!
          : content.length;

        const existingSection = content.slice(insertPoint, endPoint);

        const linksToAdd = newLinksFormatted
          .filter(link => !existingSection.includes(link.split(' - ')[0]))
          .join('\n');

        if (linksToAdd) {
          const trimmedEnd = content.slice(insertPoint, endPoint).trimEnd();
          const restOfContent = content.slice(endPoint);
          return content.slice(0, insertPoint) + trimmedEnd + '\n' + linksToAdd + restOfContent;
        }
        return content;
      } else {
        const trimmedContent = content.trimEnd();
        const linksSection = `\n\n${sectionHeader}\n\n${newLinksFormatted.join('\n')}\n`;
        return trimmedContent + linksSection;
      }
    });

    new Notice(`${wikilinks.length} wikilink(s) insertados.`);
  }

  async createAtomicNote(concept: AtomicConcept): Promise<TFile> {
    const folder = this.plugin.settings.notesFolder;
    const fileName = `${concept.title}.md`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const folderPath = folder || '';
    if (folderPath && !this.plugin.app.vault.getAbstractFileByPath(folderPath)) {
      await this.plugin.app.vault.createFolder(folderPath);
    }

    const bodyContent = `# ${concept.title}\n\n${concept.summary}\n\n${concept.content}`;
    const file = await this.plugin.app.vault.create(filePath, bodyContent);

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.created = new Date().toISOString().split('T')[0];
      frontmatter.source = 'atomic-concept';
    });

    new Notice(`Nota "${concept.title}" creada.`);
    return file;
  }
}
