import { TFile, Notice } from 'obsidian';
import ClaudianPlugin from './main';
import { ClaudeClient, NoteSuggestions, AtomicConcept, WikilinkSuggestion } from './claude-client';
import { VaultIndexer } from './vault-indexer';
import { t } from './i18n';

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

/**
 * Raw JSON structure from Claude's suggestions response
 */
interface RawSuggestionsJson {
  tags?: unknown[];
  wikilinks?: unknown[];
  atomicConcepts?: unknown[];
  reasoning?: string;
}

export class NoteProcessor {
  private plugin: ClaudianPlugin;
  private claudeClient: ClaudeClient;
  private indexer: VaultIndexer;

  constructor(plugin: ClaudianPlugin, claudeClient: ClaudeClient, indexer: VaultIndexer) {
    this.plugin = plugin;
    this.claudeClient = claudeClient;
    this.indexer = indexer;
  }

  async processActiveNote(callbacks: ProcessCallbacks): Promise<void> {
    const file = this.plugin.app.workspace.getActiveFile();

    if (!file || file.extension !== 'md') {
      callbacks.onError?.(new Error(t('error.noActiveNote')));
      return;
    }

    callbacks.onStart?.();
    callbacks.onProgress?.(t('processor.reading'));

    const content = await this.plugin.app.vault.read(file);
    const vaultContext = this.indexer.getVaultContext();

    callbacks.onProgress?.(t('processor.analyzing'));

    let _fullResponse = '';

    await this.claudeClient.processNoteStream(
      content,
      file.basename,
      vaultContext,
      {
        onStart: () => {},
        onToken: (token) => {
          _fullResponse += token;
        },
        onComplete: (response) => {
          try {
            const suggestions = this.parseSuggestions(response);
            const validated = this.validateWikilinks(suggestions);
            callbacks.onComplete?.(validated);
          } catch (error) {
            callbacks.onError?.(error instanceof Error ? error : new Error(t('error.parseResponse')));
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
      throw new Error(t('error.parseJson'));
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as RawSuggestionsJson;

      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags as string[] : [],
        wikilinks: Array.isArray(parsed.wikilinks) ? parsed.wikilinks as WikilinkSuggestion[] : [],
        atomicConcepts: Array.isArray(parsed.atomicConcepts) ? parsed.atomicConcepts as AtomicConcept[] : [],
        reasoning: parsed.reasoning ?? ''
      };
    } catch {
      throw new Error(t('error.parseResponse'));
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

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
      const rawTags = frontmatter.tags;
      const existingTags: string[] = Array.isArray(rawTags)
        ? rawTags.filter((t): t is string => typeof t === 'string')
        : (typeof rawTags === 'string' ? [rawTags] : []);

      const mergedTags = [...new Set([...existingTags, ...tags])];
      frontmatter.tags = mergedTags;
    });

    new Notice(t('suggestions.tagsApplied', { count: String(tags.length) }));
  }

  async insertWikilinks(file: TFile, wikilinks: WikilinkSuggestion[]): Promise<void> {
    if (wikilinks.length === 0) return;

    await this.plugin.app.vault.process(file, (content) => {
      const sectionHeader = `## ${t('processor.relatedLinks')}`;
      const existingSectionRegex = new RegExp(`\n## ${t('processor.relatedLinks')}\n`);

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

    new Notice(t('suggestions.wikilinksInserted', { count: String(wikilinks.length) }));
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

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
      frontmatter.created = new Date().toISOString().split('T')[0];
      frontmatter.source = 'atomic-concept';
    });

    new Notice(t('noteCreator.created', { path: concept.title }));
    return file;
  }
}
