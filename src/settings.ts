import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { t, getSupportedLocales, setLocale, resolveLocale } from './i18n';
import type { Locale } from './i18n';

export interface ClaudeCompanionSettings {
  language: 'auto' | Locale;
  apiKey: string;
  model: string;
  notesFolder: string;
  maxTokens: number;
  systemPrompt: string;
  maxNotesInContext: number;
  maxTagsInContext: number;
  // Agent Mode
  agentModeEnabled: boolean;
  confirmDestructiveActions: boolean;
  protectedFolders: string[];
  maxActionsPerMessage: number;
}

export const DEFAULT_SETTINGS: ClaudeCompanionSettings = {
  language: 'auto',
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  notesFolder: 'Claude Notes',
  maxTokens: 4096,
  systemPrompt: '', // Will be set from i18n on load
  maxNotesInContext: 100,
  maxTagsInContext: 50,
  // Agent Mode
  agentModeEnabled: false,
  confirmDestructiveActions: true,
  protectedFolders: ['.obsidian', 'templates', '_templates'],
  maxActionsPerMessage: 10
};

export interface ModelOption {
  id: string;
  nameKey: 'settings.model.sonnet4' | 'settings.model.opus4' | 'settings.model.sonnet35' | 'settings.model.haiku35';
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'claude-sonnet-4-20250514', nameKey: 'settings.model.sonnet4' },
  { id: 'claude-opus-4-20250514', nameKey: 'settings.model.opus4' },
  { id: 'claude-3-5-sonnet-20241022', nameKey: 'settings.model.sonnet35' },
  { id: 'claude-3-5-haiku-20241022', nameKey: 'settings.model.haiku35' },
];

export class ClaudeCompanionSettingTab extends PluginSettingTab {
  plugin: ClaudeCompanionPlugin;

  constructor(app: App, plugin: ClaudeCompanionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: t('settings.title') });

    // Language
    new Setting(containerEl)
      .setName(t('settings.language.name'))
      .setDesc(t('settings.language.desc'))
      .addDropdown(dropdown => {
        dropdown.addOption('auto', t('settings.language.auto'));
        for (const locale of getSupportedLocales()) {
          dropdown.addOption(locale.code, locale.name);
        }
        dropdown
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as 'auto' | Locale;
            await this.plugin.saveSettings();
            // Change locale and refresh display
            const newLocale = resolveLocale(value);
            await setLocale(newLocale);
            this.display();
          });
      });

    // API Key
    const apiKeySetting = new Setting(containerEl)
      .setName(t('settings.apiKey.name'))
      .addText(text => text
        .setPlaceholder(t('settings.apiKey.placeholder'))
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        })
        .inputEl.type = 'password'
      );

    // Build description with clickable link
    const apiKeyDescEl = apiKeySetting.descEl;
    apiKeyDescEl.createSpan({ text: t('settings.apiKey.descPart1') });
    const consoleLink = apiKeyDescEl.createEl('a', {
      text: 'console.anthropic.com',
      href: 'https://console.anthropic.com'
    });
    consoleLink.setAttr('target', '_blank');
    apiKeyDescEl.createSpan({ text: t('settings.apiKey.descPart2') });

    // Model
    new Setting(containerEl)
      .setName(t('settings.model.name'))
      .setDesc(t('settings.model.desc'))
      .addDropdown(dropdown => {
        AVAILABLE_MODELS.forEach(model => {
          dropdown.addOption(model.id, t(model.nameKey));
        });
        dropdown
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          });
      });

    // Notes folder
    new Setting(containerEl)
      .setName(t('settings.folder.name'))
      .setDesc(t('settings.folder.desc'))
      .addText(text => text
        .setPlaceholder(t('settings.folder.placeholder'))
        .setValue(this.plugin.settings.notesFolder)
        .onChange(async (value) => {
          this.plugin.settings.notesFolder = value;
          await this.plugin.saveSettings();
        })
      );

    // Max tokens
    new Setting(containerEl)
      .setName(t('settings.maxTokens.name'))
      .setDesc(t('settings.maxTokens.desc'))
      .addSlider(slider => slider
        .setLimits(1000, 8192, 256)
        .setValue(this.plugin.settings.maxTokens)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxTokens = value;
          await this.plugin.saveSettings();
        })
      );

    // System prompt
    const systemPromptSetting = new Setting(containerEl)
      .setName(t('settings.systemPrompt.name'))
      .setDesc(t('settings.systemPrompt.desc'))
      .addTextArea(text => {
        text
          .setPlaceholder(t('settings.systemPrompt.placeholder'))
          .setValue(this.plugin.settings.systemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.systemPrompt = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 8;
        text.inputEl.cols = 50;
      })
      .addButton(button => {
        button
          .setButtonText(t('settings.systemPrompt.restore'))
          .onClick(async () => {
            this.plugin.settings.systemPrompt = t('prompt.default');
            await this.plugin.saveSettings();
            this.display(); // Refresh to show updated value
            new Notice(t('settings.systemPrompt.restored'));
          });
      });

    // Note Processing Section
    containerEl.createEl('hr');
    containerEl.createEl('h3', { text: t('settings.section.noteProcessing') });

    // Max notes in context
    new Setting(containerEl)
      .setName(t('settings.maxNotesContext.name'))
      .setDesc(t('settings.maxNotesContext.desc'))
      .addSlider(slider => slider
        .setLimits(10, 500, 10)
        .setValue(this.plugin.settings.maxNotesInContext)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxNotesInContext = value;
          await this.plugin.saveSettings();
        })
      );

    // Max tags in context
    new Setting(containerEl)
      .setName(t('settings.maxTagsContext.name'))
      .setDesc(t('settings.maxTagsContext.desc'))
      .addSlider(slider => slider
        .setLimits(10, 200, 10)
        .setValue(this.plugin.settings.maxTagsInContext)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxTagsInContext = value;
          await this.plugin.saveSettings();
        })
      );

    // Agent Mode Section
    containerEl.createEl('hr');
    containerEl.createEl('h3', { text: t('settings.section.agentMode') });

    // Enable agent mode by default
    new Setting(containerEl)
      .setName(t('settings.agentEnabled.name'))
      .setDesc(t('settings.agentEnabled.desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.agentModeEnabled)
        .onChange(async (value) => {
          this.plugin.settings.agentModeEnabled = value;
          await this.plugin.saveSettings();
        })
      );

    // Confirm destructive actions
    new Setting(containerEl)
      .setName(t('settings.confirmDestructive.name'))
      .setDesc(t('settings.confirmDestructive.desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.confirmDestructiveActions)
        .onChange(async (value) => {
          this.plugin.settings.confirmDestructiveActions = value;
          await this.plugin.saveSettings();
        })
      );

    // Protected folders
    new Setting(containerEl)
      .setName(t('settings.protectedFolders.name'))
      .setDesc(t('settings.protectedFolders.desc'))
      .addText(text => text
        .setPlaceholder(t('settings.protectedFolders.placeholder'))
        .setValue(this.plugin.settings.protectedFolders.join(', '))
        .onChange(async (value) => {
          this.plugin.settings.protectedFolders = value
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0);
          await this.plugin.saveSettings();
        })
      );

    // Max actions per message
    new Setting(containerEl)
      .setName(t('settings.maxActions.name'))
      .setDesc(t('settings.maxActions.desc'))
      .addSlider(slider => slider
        .setLimits(1, 20, 1)
        .setValue(this.plugin.settings.maxActionsPerMessage)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxActionsPerMessage = value;
          await this.plugin.saveSettings();
        })
      );

    // Footer - Copyright notice
    containerEl.createEl('hr');
    const copyrightEl = containerEl.createEl('div', {
      cls: 'claudian-settings-footer'
    });

    // License line
    const licenseLine = copyrightEl.createEl('p', {
      cls: 'setting-item-description'
    });
    licenseLine.createSpan({ text: `${t('settings.footer.license')} · ` });
    licenseLine.createSpan({ text: `${t('settings.footer.developedBy')} ` });
    const enigmoraLink = licenseLine.createEl('a', {
      text: 'Enigmora SC',
      href: 'https://enigmora.com'
    });
    enigmoraLink.setAttr('target', '_blank');

    // Source code line
    const sourceLine = copyrightEl.createEl('p', {
      cls: 'setting-item-description'
    });
    sourceLine.createSpan({ text: `${t('settings.footer.sourceCode')}: ` });
    const repoLink = sourceLine.createEl('a', {
      text: 'github.com/Enigmora/claudian',
      href: 'https://github.com/Enigmora/claudian'
    });
    repoLink.setAttr('target', '_blank');
  }
}
