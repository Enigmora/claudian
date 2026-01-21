import { Plugin, WorkspaceLeaf, Notice, TFile, addIcon } from 'obsidian';

// Custom Claudian icon
const CLAUDIAN_ICON = `<svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M150 35L236.6 75V185L150 265L63.4 185V75L150 35Z"
        stroke="currentColor"
        stroke-width="24"
        stroke-linejoin="round"/>
  <path d="M150 85C153.9 115 175 136.1 205 140C175 143.9 153.9 165 150 195C146.1 165 125 143.9 95 140C125 136.1 146.1 115 150 85Z"
        fill="currentColor"/>
</svg>`;

import { ClaudeCompanionSettings, ClaudeCompanionSettingTab, DEFAULT_SETTINGS } from './settings';
import { ChatView, VIEW_TYPE_CHAT } from './chat-view';
import { VaultIndexer } from './vault-indexer';
import { ClaudeClient } from './claude-client';
import { NoteProcessor } from './note-processor';
import { SuggestionsModal } from './suggestions-modal';
import { BatchProcessor } from './batch-processor';
import { ConceptMapGenerator } from './concept-map-generator';
import { BatchModal } from './batch-modal';
import { t, setLocale, resolveLocale, initSync } from './i18n';
// Phase 3: Context Management
import { ContextStorage } from './context-storage';
import { ContextManager } from './context-manager';
import { PurgeManager } from './purge-strategies';

export default class ClaudeCompanionPlugin extends Plugin {
  settings: ClaudeCompanionSettings;
  indexer: VaultIndexer;
  claudeClient: ClaudeClient;
  noteProcessor: NoteProcessor;
  batchProcessor: BatchProcessor;
  conceptMapGenerator: ConceptMapGenerator;
  // Phase 3: Context Management
  contextStorage: ContextStorage;
  contextManager: ContextManager;
  private purgeIntervalId: number | null = null;

  async onload() {
    // Register custom icon
    addIcon('claudian', CLAUDIAN_ICON);

    // Initialize i18n synchronously with English as default
    initSync();

    await this.loadSettings();

    // Now set the correct locale based on settings
    const locale = resolveLocale(this.settings.language);
    await setLocale(locale);

    // Set default system prompt from i18n if empty
    if (!this.settings.systemPrompt) {
      this.settings.systemPrompt = t('prompt.default');
      await this.saveSettings();
    }

    // Initialize Claude client
    this.claudeClient = new ClaudeClient(this.settings);

    // Initialize vault indexer
    this.indexer = new VaultIndexer(this);
    await this.indexer.initialize();

    // Initialize note processor
    this.noteProcessor = new NoteProcessor(this, this.claudeClient, this.indexer);

    // Initialize batch processor
    this.batchProcessor = new BatchProcessor(this, this.claudeClient);

    // Initialize concept map generator
    this.conceptMapGenerator = new ConceptMapGenerator(this, this.claudeClient, this.indexer);

    // Phase 3: Initialize context management
    this.contextStorage = new ContextStorage(this);
    await this.contextStorage.initialize();
    this.contextManager = new ContextManager(this.contextStorage);

    // Schedule periodic purge of temp files (every 30 minutes)
    this.purgeIntervalId = window.setInterval(
      () => this.runScheduledPurge(),
      30 * 60 * 1000
    );
    this.registerInterval(this.purgeIntervalId);

    // Register chat view
    this.registerView(
      VIEW_TYPE_CHAT,
      (leaf) => new ChatView(leaf, this)
    );

    // Add ribbon icon
    this.addRibbonIcon('claudian', 'Claudian', () => {
      this.activateChatView();
    });

    // Register command to open chat
    this.addCommand({
      id: 'open-claude-chat',
      name: t('command.openChat'),
      callback: () => {
        this.activateChatView();
      }
    });

    // Register command to process active note
    this.addCommand({
      id: 'process-active-note',
      name: t('command.processNote'),
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file?.extension === 'md') {
          if (!checking) {
            this.processActiveNote(file);
          }
          return true;
        }
        return false;
      }
    });

    // Register command for batch processing
    this.addCommand({
      id: 'batch-process-notes',
      name: t('command.batchProcess'),
      callback: () => {
        new BatchModal(this, this.batchProcessor, this.conceptMapGenerator, 'extraction').open();
      }
    });

    // Register command to generate concept map
    this.addCommand({
      id: 'generate-concept-map',
      name: t('command.generateMap'),
      callback: () => {
        new BatchModal(this, this.batchProcessor, this.conceptMapGenerator, 'concept-map').open();
      }
    });

    // Add settings tab
    this.addSettingTab(new ClaudeCompanionSettingTab(this.app, this));
  }

  private async processActiveNote(file: TFile): Promise<void> {
    const notice = new Notice(t('processor.processing'), 0);

    this.noteProcessor.processActiveNote({
      onStart: () => {},
      onProgress: (message) => {
        notice.setMessage(message);
      },
      onComplete: (suggestions) => {
        notice.hide();
        new SuggestionsModal(this, this.noteProcessor, suggestions, file).open();
      },
      onError: (error) => {
        notice.hide();
        new Notice(t('chat.error', { message: error.message }));
      }
    });
  }

  async onunload() {
    // Clean up views when disabling plugin
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_CHAT);

    // Phase 3: Final purge of expired temp files
    if (this.contextStorage) {
      await this.contextStorage.purgeExpired();
    }

    // Clear purge interval
    if (this.purgeIntervalId !== null) {
      window.clearInterval(this.purgeIntervalId);
    }
  }

  /**
   * Phase 3: Run scheduled purge of temp files
   */
  private async runScheduledPurge(): Promise<void> {
    if (!this.contextStorage) return;

    try {
      const purgeManager = new PurgeManager(this.contextStorage);
      const result = await purgeManager.runPurge();

      if (result.purgedFiles > 0) {
        console.log(
          `Claudian: Purged ${result.purgedFiles} temp files, freed ${Math.round(result.freedSpace / 1024)}KB`
        );
      }
    } catch (error) {
      console.error('Claudian: Error during scheduled purge:', error);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateChatView() {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT);

    if (leaves.length > 0) {
      // View already exists, use it
      leaf = leaves[0];
    } else {
      // Create new view in right panel
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({ type: VIEW_TYPE_CHAT, active: true });
      }
    }

    // Reveal the view
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
}
