import { App, PluginSettingTab, Setting } from 'obsidian';
import ClaudeCompanionPlugin from './main';

export interface ClaudeCompanionSettings {
  apiKey: string;
  model: string;
  notesFolder: string;
  maxTokens: number;
  systemPrompt: string;
}

export const DEFAULT_SETTINGS: ClaudeCompanionSettings = {
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  notesFolder: 'Claude Notes',
  maxTokens: 4096,
  systemPrompt: 'Eres un asistente útil para organizar notas en Obsidian. Responde de forma clara y estructurada, usando formato Markdown cuando sea apropiado. Si te piden crear contenido para una nota, incluye sugerencias de tags relevantes.'
};

export const AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Recomendado)' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Rápido)' },
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

    containerEl.createEl('h2', { text: 'Claude Companion - Configuración' });

    // API Key
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Tu clave de API de Anthropic. Se almacena localmente en tu bóveda.')
      .addText(text => text
        .setPlaceholder('sk-ant-...')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        })
        .inputEl.type = 'password'
      );

    // Modelo
    new Setting(containerEl)
      .setName('Modelo')
      .setDesc('Selecciona el modelo de Claude a utilizar.')
      .addDropdown(dropdown => {
        AVAILABLE_MODELS.forEach(model => {
          dropdown.addOption(model.id, model.name);
        });
        dropdown
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          });
      });

    // Carpeta de notas
    new Setting(containerEl)
      .setName('Carpeta de notas')
      .setDesc('Carpeta donde se guardarán las notas generadas desde el chat.')
      .addText(text => text
        .setPlaceholder('Claude Notes')
        .setValue(this.plugin.settings.notesFolder)
        .onChange(async (value) => {
          this.plugin.settings.notesFolder = value;
          await this.plugin.saveSettings();
        })
      );

    // Max tokens
    new Setting(containerEl)
      .setName('Máximo de tokens')
      .setDesc('Número máximo de tokens en las respuestas (1000-8192).')
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
    new Setting(containerEl)
      .setName('Prompt del sistema')
      .setDesc('Instrucciones que definen el comportamiento de Claude.')
      .addTextArea(text => {
        text
          .setPlaceholder('Eres un asistente...')
          .setValue(this.plugin.settings.systemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.systemPrompt = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 6;
        text.inputEl.cols = 50;
      });

    // Información adicional
    containerEl.createEl('hr');
    containerEl.createEl('p', {
      text: '💡 Obtén tu API key en console.anthropic.com',
      cls: 'setting-item-description'
    });
  }
}
