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

    const content = await this.plugin.app.vault.read(file);
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    let newContent: string;

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const existingTagsMatch = frontmatter.match(/^tags:\s*\[(.*?)\]/m) ||
                                frontmatter.match(/^tags:\s*\n((?:\s+-\s+.*\n)*)/m);

      let existingTags: string[] = [];
      if (existingTagsMatch) {
        if (existingTagsMatch[1].includes('-')) {
          existingTags = existingTagsMatch[1]
            .split('\n')
            .map(line => line.replace(/^\s*-\s*/, '').trim())
            .filter(t => t);
        } else {
          existingTags = existingTagsMatch[1]
            .split(',')
            .map(t => t.trim().replace(/['"]/g, ''))
            .filter(t => t);
        }
      }

      const mergedTags = [...new Set([...existingTags, ...tags])];
      const tagsLine = `tags: [${mergedTags.join(', ')}]`;

      if (existingTagsMatch) {
        const newFrontmatter = frontmatter.replace(
          /^tags:.*(?:\n(?:\s+-.*)*)?/m,
          tagsLine
        );
        newContent = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);
      } else {
        const newFrontmatter = frontmatter + `\n${tagsLine}`;
        newContent = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);
      }
    } else {
      const tagsLine = `tags: [${tags.join(', ')}]`;
      newContent = `---\n${tagsLine}\n---\n\n${content}`;
    }

    await this.plugin.app.vault.modify(file, newContent);
    new Notice(`${tags.length} tag(s) aplicados.`);
  }

  async insertWikilinks(file: TFile, wikilinks: WikilinkSuggestion[]): Promise<void> {
    if (wikilinks.length === 0) return;

    let content = await this.plugin.app.vault.read(file);

    const linksSection = '\n\n## Enlaces relacionados\n\n' +
      wikilinks.map(wl => `- [[${wl.target}]] - ${wl.context}`).join('\n');

    const existingLinksMatch = content.match(/\n## Enlaces relacionados\n/);

    if (existingLinksMatch) {
      const insertPoint = content.indexOf('## Enlaces relacionados');
      const nextSectionMatch = content.slice(insertPoint).match(/\n## [^#]/);
      const endPoint = nextSectionMatch
        ? insertPoint + nextSectionMatch.index!
        : content.length;

      const existingSection = content.slice(insertPoint, endPoint);
      const newLinks = wikilinks
        .filter(wl => !existingSection.includes(`[[${wl.target}]]`))
        .map(wl => `- [[${wl.target}]] - ${wl.context}`)
        .join('\n');

      if (newLinks) {
        content = content.slice(0, endPoint) + '\n' + newLinks + content.slice(endPoint);
      }
    } else {
      content += linksSection;
    }

    await this.plugin.app.vault.modify(file, content);
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

    const frontmatter = `---
created: ${new Date().toISOString().split('T')[0]}
source: atomic-concept
---

`;

    const content = frontmatter + `# ${concept.title}\n\n${concept.summary}\n\n${concept.content}`;

    const file = await this.plugin.app.vault.create(filePath, content);
    new Notice(`Nota "${concept.title}" creada.`);
    return file;
  }
}
