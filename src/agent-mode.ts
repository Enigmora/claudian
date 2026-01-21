import { Notice } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { VaultActionExecutor, VaultAction, ActionResult } from './vault-actions';
import { VaultIndexer } from './vault-indexer';

export interface AgentResponse {
  thinking?: string;
  actions: VaultAction[];
  message: string;
  requiresConfirmation?: boolean;
}

export interface AgentExecutionResult {
  response: AgentResponse;
  results: ActionResult[];
  summary: string;
}

export class AgentMode {
  private plugin: ClaudeCompanionPlugin;
  private executor: VaultActionExecutor;
  private indexer: VaultIndexer;

  constructor(
    plugin: ClaudeCompanionPlugin,
    executor: VaultActionExecutor,
    indexer: VaultIndexer
  ) {
    this.plugin = plugin;
    this.executor = executor;
    this.indexer = indexer;
  }

  isAgentResponse(content: string): boolean {
    // Detectar si la respuesta contiene JSON con acciones
    const trimmed = content.trim();

    // Buscar patrón de JSON con "actions"
    if (trimmed.includes('"actions"') && trimmed.includes('[')) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*"actions"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return Array.isArray(parsed.actions);
        }
      } catch {
        return false;
      }
    }

    return false;
  }

  parseAgentResponse(content: string): AgentResponse | null {
    try {
      const jsonMatch = content.match(/\{[\s\S]*"actions"[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        thinking: parsed.thinking,
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        message: parsed.message || 'Acciones ejecutadas.',
        requiresConfirmation: parsed.requiresConfirmation || false
      };
    } catch (error) {
      console.error('Error parsing agent response:', error);
      return null;
    }
  }

  async executeActions(actions: VaultAction[]): Promise<ActionResult[]> {
    const maxActions = this.plugin.settings.maxActionsPerMessage || 10;

    if (actions.length > maxActions) {
      throw new Error(`Demasiadas acciones (${actions.length}). Máximo permitido: ${maxActions}`);
    }

    return this.executor.executeAll(actions);
  }

  hasDestructiveActions(actions: VaultAction[]): boolean {
    return actions.some(action => this.executor.isDestructiveAction(action));
  }

  getDestructiveActions(actions: VaultAction[]): VaultAction[] {
    return actions.filter(action => this.executor.isDestructiveAction(action));
  }

  formatResults(results: ActionResult[]): string {
    const lines: string[] = [];

    for (const result of results) {
      const icon = result.success ? '✓' : '✗';
      const description = result.action.description ||
        this.getActionDescription(result.action);

      if (result.success) {
        lines.push(`${icon} ${description}`);
      } else {
        lines.push(`${icon} ${description}: ${result.error}`);
      }
    }

    return lines.join('\n');
  }

  private getActionDescription(action: VaultAction): string {
    const { params } = action;

    switch (action.action) {
      case 'create-folder':
        return `Crear carpeta: ${params.path}`;
      case 'delete-folder':
        return `Eliminar carpeta: ${params.path}`;
      case 'list-folder':
        return `Listar carpeta: ${params.path || '/'}`;
      case 'create-note':
        return `Crear nota: ${params.path}`;
      case 'read-note':
        return `Leer nota: ${params.path}`;
      case 'delete-note':
        return `Eliminar nota: ${params.path}`;
      case 'rename-note':
        return `Renombrar: ${params.from} → ${params.to}`;
      case 'move-note':
        return `Mover: ${params.from} → ${params.to}`;
      case 'append-content':
        return `Agregar contenido a: ${params.path}`;
      case 'prepend-content':
        return `Insertar contenido en: ${params.path}`;
      case 'replace-content':
        return `Reemplazar contenido de: ${params.path}`;
      case 'update-frontmatter':
        return `Actualizar frontmatter: ${params.path}`;
      case 'search-notes':
        return `Buscar notas: "${params.query}"`;
      case 'get-note-info':
        return `Obtener info: ${params.path}`;
      case 'find-links':
        return `Buscar enlaces a: ${params.target}`;
      default:
        return `Acción: ${action.action}`;
    }
  }

  getSystemPrompt(): string {
    const vaultContext = this.indexer.getVaultContext();

    // Obtener lista de carpetas
    const folders = new Set<string>();
    this.plugin.app.vault.getMarkdownFiles().forEach(f => {
      if (f.parent && f.parent.path !== '/') {
        folders.add(f.parent.path);
      }
    });
    const folderList = Array.from(folders).slice(0, 30).join(', ') || '(ninguna)';

    return `Eres un asistente que ayuda a gestionar una bóveda de Obsidian. Puedes ejecutar acciones sobre archivos y carpetas.

CAPACIDADES:
- Crear, mover, renombrar y eliminar notas y carpetas
- Leer y modificar contenido de notas
- Buscar notas por título, contenido o tags
- Actualizar frontmatter (YAML)

ACCIONES DISPONIBLES:
- create-folder: { path }
- delete-folder: { path }
- list-folder: { path, recursive? }
- create-note: { path, content?, frontmatter? }
- read-note: { path }
- delete-note: { path }
- rename-note: { from, to }
- move-note: { from, to }
- append-content: { path, content }
- prepend-content: { path, content }
- replace-content: { path, content }
- update-frontmatter: { path, fields }
- search-notes: { query, field?, folder? }
- get-note-info: { path }
- find-links: { target }

FORMATO DE RESPUESTA:
Cuando el usuario solicite una acción sobre la bóveda, responde ÚNICAMENTE con JSON válido:
{
  "thinking": "Tu razonamiento interno (opcional)",
  "actions": [
    { "action": "nombre-accion", "params": { ... }, "description": "Descripción legible" }
  ],
  "message": "Mensaje para el usuario explicando qué harás",
  "requiresConfirmation": false
}

REGLAS IMPORTANTES:
1. Para acciones destructivas (delete-note, delete-folder, replace-content), usa requiresConfirmation: true
2. Las rutas no deben empezar ni terminar con /
3. Las notas se crean con extensión .md automáticamente
4. Si no estás seguro de la intención del usuario, pregunta antes de actuar
5. Para conversación normal (sin acciones sobre la bóveda), responde normalmente SIN formato JSON
6. Máximo ${this.plugin.settings.maxActionsPerMessage || 10} acciones por mensaje

CONTEXTO DE LA BÓVEDA:
- Total de notas: ${vaultContext.noteCount}
- Carpetas existentes: ${folderList}
- Tags existentes: ${vaultContext.allTags.slice(0, 20).map(t => '#' + t).join(', ') || '(ninguno)'}
- Algunas notas: ${vaultContext.noteTitles.slice(0, 15).join(', ')}`;
  }

  getSummaryMessage(results: ActionResult[], originalMessage: string): string {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    let summary = '';

    if (failed === 0) {
      summary = `${originalMessage}\n\n**Acciones ejecutadas:**\n${this.formatResults(results)}`;
    } else if (successful === 0) {
      summary = `No se pudieron ejecutar las acciones:\n${this.formatResults(results)}`;
    } else {
      summary = `${originalMessage}\n\n**Resultados:**\n${this.formatResults(results)}\n\n⚠️ ${failed} acción(es) fallaron.`;
    }

    return summary;
  }
}
