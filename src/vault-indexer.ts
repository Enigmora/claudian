import { TFile, MetadataCache, Vault, Events } from 'obsidian';
import ClaudeCompanionPlugin from './main';

export interface NoteMetadata {
  title: string;
  path: string;
  tags: string[];
}

export interface VaultContext {
  noteTitles: string[];
  allTags: string[];
  noteCount: number;
}

export class VaultIndexer {
  private plugin: ClaudeCompanionPlugin;
  private vault: Vault;
  private metadataCache: MetadataCache;
  private noteIndex: Map<string, NoteMetadata> = new Map();
  private allTags: Set<string> = new Set();

  constructor(plugin: ClaudeCompanionPlugin) {
    this.plugin = plugin;
    this.vault = plugin.app.vault;
    this.metadataCache = plugin.app.metadataCache;
  }

  async initialize(): Promise<void> {
    await this.buildIndex();
    this.registerEventHandlers();
  }

  private async buildIndex(): Promise<void> {
    this.noteIndex.clear();
    this.allTags.clear();

    const files = this.vault.getMarkdownFiles();

    for (const file of files) {
      this.indexFile(file);
    }
  }

  private indexFile(file: TFile): void {
    const cache = this.metadataCache.getFileCache(file);
    const tags: string[] = [];

    if (cache?.tags) {
      cache.tags.forEach(tagCache => {
        // Guard against null/undefined tags (can happen during file creation)
        if (tagCache?.tag) {
          const tag = tagCache.tag.replace(/^#/, '');
          tags.push(tag);
          this.allTags.add(tag);
        }
      });
    }

    if (cache?.frontmatter?.tags) {
      const fmTags = Array.isArray(cache.frontmatter.tags)
        ? cache.frontmatter.tags
        : [cache.frontmatter.tags];
      fmTags.forEach((tag: unknown) => {
        // Guard against null/undefined/non-string tags
        if (typeof tag === 'string') {
          const cleanTag = tag.replace(/^#/, '');
          if (!tags.includes(cleanTag)) {
            tags.push(cleanTag);
          }
          this.allTags.add(cleanTag);
        }
      });
    }

    const title = file.basename;
    this.noteIndex.set(file.path, {
      title,
      path: file.path,
      tags
    });
  }

  private removeFile(path: string): void {
    this.noteIndex.delete(path);
    this.rebuildTagsFromIndex();
  }

  private rebuildTagsFromIndex(): void {
    this.allTags.clear();
    for (const note of this.noteIndex.values()) {
      note.tags.forEach(tag => this.allTags.add(tag));
    }
  }

  private registerEventHandlers(): void {
    this.plugin.registerEvent(
      this.vault.on('create', (file) => {
        if (file instanceof TFile && file.extension === 'md') {
          setTimeout(() => this.indexFile(file), 100);
        }
      })
    );

    this.plugin.registerEvent(
      this.vault.on('delete', (file) => {
        if (file instanceof TFile && file.extension === 'md') {
          this.removeFile(file.path);
        }
      })
    );

    this.plugin.registerEvent(
      this.vault.on('rename', (file, oldPath) => {
        if (file instanceof TFile && file.extension === 'md') {
          this.removeFile(oldPath);
          this.indexFile(file);
        }
      })
    );

    this.plugin.registerEvent(
      this.metadataCache.on('changed', (file) => {
        if (file.extension === 'md') {
          this.indexFile(file);
        }
      })
    );
  }

  getVaultContext(): VaultContext {
    const maxNotes = this.plugin.settings.maxNotesInContext || 100;
    const maxTags = this.plugin.settings.maxTagsInContext || 50;

    const noteTitles = Array.from(this.noteIndex.values())
      .map(note => note.title)
      .slice(0, maxNotes);

    const allTags = Array.from(this.allTags).slice(0, maxTags);

    return {
      noteTitles,
      allTags,
      noteCount: this.noteIndex.size
    };
  }

  getNoteByTitle(title: string): NoteMetadata | undefined {
    for (const note of this.noteIndex.values()) {
      if (note.title.toLowerCase() === title.toLowerCase()) {
        return note;
      }
    }
    return undefined;
  }

  noteExists(title: string): boolean {
    return this.getNoteByTitle(title) !== undefined;
  }

  getAllNoteTitles(): string[] {
    return Array.from(this.noteIndex.values()).map(note => note.title);
  }

  getAllTags(): string[] {
    return Array.from(this.allTags);
  }
}
