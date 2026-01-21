import { App, PluginSettingTab, Setting } from 'obsidian';
import ClaudeCompanionPlugin from './main';

export interface ClaudeCompanionSettings {
  apiKey: string;
  model: string;
  notesFolder: string;
  maxTokens: number;
  systemPrompt: string;
  maxNotesInContext: number;
  maxTagsInContext: number;
  // Modo Agente
  agentModeEnabled: boolean;
  confirmDestructiveActions: boolean;
  protectedFolders: string[];
  maxActionsPerMessage: number;
}

export const DEFAULT_SETTINGS: ClaudeCompanionSettings = {
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  notesFolder: 'Claude Notes',
  maxTokens: 4096,
  systemPrompt: 'Eres un asistente útil para organizar notas en Obsidian. Responde de forma clara y estructurada, usando formato Markdown cuando sea apropiado. Si te piden crear contenido para una nota, incluye sugerencias de tags relevantes.',
  maxNotesInContext: 100,
  maxTagsInContext: 50,
  // Modo Agente
  agentModeEnabled: false,
  confirmDestructiveActions: true,
  protectedFolders: ['.obsidian', 'templates', '_templates'],
  maxActionsPerMessage: 10
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

    containerEl.createEl('h2', { text: 'Claudian - Configuración' });

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

    // Sección de Procesamiento de Notas
    containerEl.createEl('hr');
    containerEl.createEl('h3', { text: 'Procesamiento de Notas' });

    // Max notas en contexto
    new Setting(containerEl)
      .setName('Máximo de notas en contexto')
      .setDesc('Número máximo de títulos de notas a incluir al procesar (10-500).')
      .addSlider(slider => slider
        .setLimits(10, 500, 10)
        .setValue(this.plugin.settings.maxNotesInContext)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxNotesInContext = value;
          await this.plugin.saveSettings();
        })
      );

    // Max tags en contexto
    new Setting(containerEl)
      .setName('Máximo de tags en contexto')
      .setDesc('Número máximo de tags existentes a incluir al procesar (10-200).')
      .addSlider(slider => slider
        .setLimits(10, 200, 10)
        .setValue(this.plugin.settings.maxTagsInContext)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxTagsInContext = value;
          await this.plugin.saveSettings();
        })
      );

    // Sección de Modo Agente
    containerEl.createEl('hr');
    containerEl.createEl('h3', { text: 'Modo Agente' });

    // Activar modo agente por defecto
    new Setting(containerEl)
      .setName('Activar modo agente por defecto')
      .setDesc('El modo agente permite a Claude ejecutar acciones sobre la bóveda.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.agentModeEnabled)
        .onChange(async (value) => {
          this.plugin.settings.agentModeEnabled = value;
          await this.plugin.saveSettings();
        })
      );

    // Confirmar acciones destructivas
    new Setting(containerEl)
      .setName('Confirmar acciones destructivas')
      .setDesc('Solicitar confirmación antes de eliminar archivos o reemplazar contenido.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.confirmDestructiveActions)
        .onChange(async (value) => {
          this.plugin.settings.confirmDestructiveActions = value;
          await this.plugin.saveSettings();
        })
      );

    // Carpetas protegidas
    new Setting(containerEl)
      .setName('Carpetas protegidas')
      .setDesc('Carpetas que el agente no puede modificar (separadas por comas).')
      .addText(text => text
        .setPlaceholder('.obsidian, templates')
        .setValue(this.plugin.settings.protectedFolders.join(', '))
        .onChange(async (value) => {
          this.plugin.settings.protectedFolders = value
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0);
          await this.plugin.saveSettings();
        })
      );

    // Máximo de acciones por mensaje
    new Setting(containerEl)
      .setName('Máximo de acciones por mensaje')
      .setDesc('Límite de acciones que Claude puede ejecutar en un solo mensaje (1-20).')
      .addSlider(slider => slider
        .setLimits(1, 20, 1)
        .setValue(this.plugin.settings.maxActionsPerMessage)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.maxActionsPerMessage = value;
          await this.plugin.saveSettings();
        })
      );

    // Información adicional
    containerEl.createEl('hr');
    containerEl.createEl('p', {
      text: 'Obtén tu API key en console.anthropic.com',
      cls: 'setting-item-description'
    });
  }
}
