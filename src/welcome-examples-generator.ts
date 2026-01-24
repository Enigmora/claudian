import { App, TFile } from 'obsidian';
import { VaultIndexer } from './vault-indexer';
import { t } from './i18n';
import { logger } from './logger';

export interface PersonalizedExample {
  text: string;
  complexity: 1 | 2 | 3 | 4 | 5;
}

interface VaultData {
  noteTitles: string[];
  allTags: string[];
  noteCount: number;
}

/**
 * Generates personalized welcome screen examples based on vault content.
 * Uses templates with real vault data (titles, tags) for interpolation.
 */
export class WelcomeExamplesGenerator {
  private static readonly MIN_NOTES_THRESHOLD = 10;

  // Common words to filter out when extracting topics (multilingual)
  private static readonly STOP_WORDS = new Set([
    // Spanish
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
    'en', 'con', 'por', 'para', 'sobre', 'como', 'sin', 'desde', 'hasta',
    'que', 'cual', 'quien', 'donde', 'cuando', 'porque', 'aunque', 'mientras',
    'nota', 'notas', 'archivo', 'archivos', 'documento', 'documentos',
    // English
    'the', 'a', 'an', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
    'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'also',
    'note', 'notes', 'file', 'files', 'document', 'documents',
    // Common date/time words (English/Spanish)
    'day', 'week', 'month', 'year', 'today', 'yesterday', 'tomorrow',
    'dia', 'semana', 'mes', 'ano', 'hoy', 'ayer', 'manana',
    // Chinese stop words
    '的', '了', '和', '是', '在', '有', '我', '他', '她', '它',
    '这', '那', '这个', '那个', '一个', '一些', '什么', '怎么',
    '为什么', '哪里', '哪个', '谁', '如何', '可以', '应该', '会',
    '能', '要', '想', '让', '把', '被', '给', '从', '到', '对',
    '笔记', '文件', '文档', '档案',
    // Chinese date/time
    '天', '周', '月', '年', '今天', '昨天', '明天', '日期',
    // German stop words
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'eines',
    'einem', 'einen', 'und', 'oder', 'aber', 'wenn', 'weil', 'dass', 'als',
    'für', 'mit', 'auf', 'von', 'zu', 'bei', 'nach', 'über', 'unter', 'vor',
    'durch', 'ohne', 'gegen', 'zwischen', 'ist', 'sind', 'war', 'waren',
    'wird', 'werden', 'wurde', 'wurden', 'hat', 'haben', 'hatte', 'hatten',
    'kann', 'können', 'muss', 'müssen', 'soll', 'sollen', 'will', 'wollen',
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr',
    'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes', 'welcher', 'welche',
    'notiz', 'notizen', 'datei', 'dateien', 'dokument', 'dokumente',
    // German date/time
    'tag', 'woche', 'monat', 'jahr', 'heute', 'gestern', 'morgen', 'datum',
    // French stop words
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi',
    'ce', 'cette', 'ces', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
    'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos', 'leur', 'leurs',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on',
    'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'entre', 'vers',
    'par', 'chez', 'après', 'avant', 'depuis', 'pendant', 'contre',
    'est', 'sont', 'était', 'étaient', 'sera', 'seront', 'été',
    'ont', 'avait', 'avaient', 'aura', 'auront',
    'peut', 'peuvent', 'doit', 'doivent', 'fait', 'font',
    'note', 'notes', 'fichier', 'fichiers', 'document', 'documents',
    // French date/time
    'jour', 'semaine', 'mois', 'année', 'aujourd', 'hier', 'demain', 'date'
  ]);

  constructor(
    private app: App,
    private indexer: VaultIndexer | null
  ) {}

  /**
   * Generates 5 personalized examples ordered by complexity.
   * Returns null if vault has fewer than MIN_NOTES_THRESHOLD notes.
   */
  generate(): PersonalizedExample[] | null {
    // Try to get data from indexer first, fallback to direct vault access
    const vaultData = this.getVaultData();

    logger.debug('WelcomeExamplesGenerator: vault data', {
      noteCount: vaultData.noteCount,
      titlesCount: vaultData.noteTitles.length,
      tagsCount: vaultData.allTags.length
    });

    // Check minimum notes threshold
    if (vaultData.noteCount < WelcomeExamplesGenerator.MIN_NOTES_THRESHOLD) {
      logger.debug('WelcomeExamplesGenerator: below threshold, using static examples');
      return null;
    }

    // Extract useful data from vault
    const topics = this.extractTopics(vaultData.noteTitles);
    const tags = this.selectRepresentativeTags(vaultData.allTags);
    const noteNames = this.selectRepresentativeNotes(vaultData.noteTitles);

    logger.debug('WelcomeExamplesGenerator: extracted data', {
      topics: topics.slice(0, 5),
      tags: tags.slice(0, 5),
      noteNames: noteNames.slice(0, 3)
    });

    // Generate examples using templates with interpolated data
    return this.generateExamplesFromTemplates(topics, tags, noteNames);
  }

  /**
   * Gets vault data from indexer if available, otherwise directly from vault.
   */
  private getVaultData(): VaultData {
    // Try indexer first
    if (this.indexer) {
      const context = this.indexer.getVaultContext();
      if (context.noteCount > 0) {
        return context;
      }
    }

    // Fallback: get data directly from vault
    logger.debug('WelcomeExamplesGenerator: indexer not ready, reading vault directly');
    return this.getVaultDataDirect();
  }

  /**
   * Gets vault data directly from Obsidian's vault API.
   */
  private getVaultDataDirect(): VaultData {
    const files = this.app.vault.getMarkdownFiles();
    const noteTitles = files.map(f => f.basename);
    const allTags = new Set<string>();

    // Extract tags from metadata cache
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.tags) {
        cache.tags.forEach(tagCache => {
          if (tagCache?.tag) {
            allTags.add(tagCache.tag.replace(/^#/, ''));
          }
        });
      }
      if (cache?.frontmatter?.tags) {
        const fmTags = Array.isArray(cache.frontmatter.tags)
          ? cache.frontmatter.tags
          : [cache.frontmatter.tags];
        fmTags.forEach((tag: unknown) => {
          if (typeof tag === 'string') {
            allTags.add(tag.replace(/^#/, ''));
          }
        });
      }
    }

    return {
      noteTitles,
      allTags: Array.from(allTags),
      noteCount: files.length
    };
  }

  /**
   * Extracts common topics from note titles by analyzing word frequency.
   */
  private extractTopics(titles: string[]): string[] {
    const wordFrequency = new Map<string, number>();

    for (const title of titles) {
      // Tokenize: split by spaces, hyphens, underscores, and common separators
      const words = title
        .toLowerCase()
        .split(/[\s\-_.,;:!?()[\]{}|/\\]+/)
        .filter(word => word.length >= 3)
        .filter(word => !WelcomeExamplesGenerator.STOP_WORDS.has(word))
        .filter(word => !/^\d+$/.test(word)); // Filter pure numbers

      for (const word of words) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    }

    // Sort by frequency and return top topics
    return Array.from(wordFrequency.entries())
      .filter(([, count]) => count >= 2) // At least 2 occurrences
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => this.capitalizeFirst(word));
  }

  /**
   * Selects representative tags (most used, avoiding system tags).
   */
  private selectRepresentativeTags(tags: string[]): string[] {
    // Filter out likely system tags
    const filtered = tags.filter(tag =>
      !tag.startsWith('_') &&
      !tag.includes('/') && // Nested tags might be too specific
      tag.length >= 2 &&
      tag.length <= 30
    );

    // Return up to 10 representative tags
    return filtered.slice(0, 10);
  }

  /**
   * Selects representative note names (varied lengths, interesting names).
   */
  private selectRepresentativeNotes(titles: string[]): string[] {
    // Filter out likely daily notes and very short/long names
    const filtered = titles.filter(title => {
      // Skip daily notes (common patterns)
      if (/^\d{4}-\d{2}-\d{2}/.test(title)) return false;
      if (/^\d{2}[-/]\d{2}[-/]\d{2,4}/.test(title)) return false;
      // Skip very short or very long titles
      if (title.length < 3 || title.length > 50) return false;
      return true;
    });

    // Shuffle and take a sample to get variety
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }

  /**
   * Generates 5 examples from templates with interpolated data.
   */
  private generateExamplesFromTemplates(
    topics: string[],
    tags: string[],
    noteNames: string[]
  ): PersonalizedExample[] {
    const examples: PersonalizedExample[] = [];

    // Level 1: Simple search (topic-based)
    const topic1 = topics[0] || 'ideas';
    examples.push({
      text: t('welcome.template.search', { topic: topic1 }),
      complexity: 1
    });

    // Level 2: Read and summarize (note-based)
    const noteName = noteNames[0] || 'Ideas';
    examples.push({
      text: t('welcome.template.read', { noteName }),
      complexity: 2
    });

    // Level 3: Create note (topic-based)
    const topic2 = topics[1] || topics[0] || 'proyectos';
    examples.push({
      text: t('welcome.template.create', { topic: topic2 }),
      complexity: 3
    });

    // Level 4: Analyze by tag (tag-based)
    const tag = tags[0] || 'proyecto';
    examples.push({
      text: t('welcome.template.analyze', { tag }),
      complexity: 4
    });

    // Level 5: Organize (topic-based)
    const topic3 = topics[2] || topics[0] || 'notas';
    examples.push({
      text: t('welcome.template.organize', { topic: topic3 }),
      complexity: 5
    });

    return examples;
  }

  /**
   * Capitalizes the first letter of a string.
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
