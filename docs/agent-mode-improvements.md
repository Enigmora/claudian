# Plan de Implementación: Mejoras del Modo Agente

## Resumen Ejecutivo

Este documento describe las mejoras planificadas para el modo agente de Claudian, enfocándose en resolver problemas de truncamiento, pérdida de contexto y fiabilidad en la ejecución de acciones.

**Problemas identificados:**
1. Truncamiento de respuestas largas
2. Pérdida de contexto del modo agente en conversaciones largas
3. Discrepancia entre lo que el modelo reporta y lo que ejecuta
4. Límites de capacidad para tareas complejas

**Estrategia principal:** Implementar un sistema de gestión de contexto con archivos temporales que permita manejar tareas largas sin saturar el context window del modelo.

---

## Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DEL MODO AGENTE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Usuario: "Crea 5 archivos sobre Elvis Presley"                             │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    TASK PLANNER (nuevo)                                 │ │
│  │  - Detecta tarea compleja (múltiples archivos)                         │ │
│  │  - Divide en subtareas manejables                                      │ │
│  │  - Crea plan de ejecución en archivo temporal                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  CONTEXT MANAGER (nuevo)                                │ │
│  │  - Gestiona archivos temporales de contexto                            │ │
│  │  - Resume historial cuando excede umbral                               │ │
│  │  - Carga/descarga contexto según necesidad                             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  EXECUTION ENGINE (mejorado)                            │ │
│  │  - Ejecuta subtareas secuencialmente                                   │ │
│  │  - Detecta truncamiento y auto-continúa                                │ │
│  │  - Valida coherencia respuesta vs acciones                             │ │
│  │  - Checkpoint después de cada acción exitosa                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  RESULT AGGREGATOR (nuevo)                              │ │
│  │  - Consolida resultados de subtareas                                   │ │
│  │  - Genera resumen final para usuario                                   │ │
│  │  - Limpia archivos temporales                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Nivel 2: Mejoras de Código (Corto/Mediano Plazo)

### Fase 2.1: Detección y Manejo de Truncamiento

**Objetivo:** Detectar cuando una respuesta está truncada y solicitar continuación automáticamente.

**Archivos a modificar:**
- `src/claude-client.ts`
- `src/chat-view.ts`

**Implementación:**

```typescript
// src/truncation-detector.ts (nuevo)

export interface TruncationDetectionResult {
  isTruncated: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export class TruncationDetector {
  // Patrones que indican respuesta truncada
  private static readonly TRUNCATION_PATTERNS = [
    /\{[^}]*$/,                    // JSON sin cerrar
    /\[[^\]]*$/,                   // Array sin cerrar
    /```[^`]*$/,                   // Code block sin cerrar
    /\d+\.\s+[^.]*$/,              // Lista numerada interrumpida
    /"content":\s*"[^"]*$/,        // String JSON sin cerrar
  ];

  // Patrones que indican respuesta completa
  private static readonly COMPLETION_PATTERNS = [
    /\}\s*$/,                      // JSON cerrado
    /```\s*$/,                     // Code block cerrado
    /\.\s*$/,                      // Termina con punto
    /"requiresConfirmation":\s*(true|false)\s*\}\s*$/,  // Agent response completa
  ];

  static detect(response: string, maxTokens: number): TruncationDetectionResult {
    const trimmed = response.trim();

    // Verificar longitud aproximada (4 chars ≈ 1 token)
    const estimatedTokens = response.length / 4;
    const nearLimit = estimatedTokens > maxTokens * 0.9;

    // Verificar patrones de truncamiento
    for (const pattern of this.TRUNCATION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isTruncated: true,
          confidence: nearLimit ? 'high' : 'medium',
          reason: 'Incomplete structure detected'
        };
      }
    }

    // Verificar si parece completa
    for (const pattern of this.COMPLETION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isTruncated: false,
          confidence: 'high',
          reason: 'Complete structure detected'
        };
      }
    }

    // Si está cerca del límite pero no hay patrones claros
    if (nearLimit) {
      return {
        isTruncated: true,
        confidence: 'low',
        reason: 'Near token limit'
      };
    }

    return {
      isTruncated: false,
      confidence: 'medium',
      reason: 'No truncation indicators'
    };
  }
}
```

**Cambios en chat-view.ts:**

```typescript
// En sendAgentMessage, después de onComplete:
onComplete: async (response) => {
  const truncationResult = TruncationDetector.detect(
    response,
    this.plugin.settings.maxTokens
  );

  if (truncationResult.isTruncated && truncationResult.confidence !== 'low') {
    // Auto-continuar
    await this.requestContinuation(responseEl, contentEl, response);
  } else {
    // Procesar normalmente
    await this.handleAgentResponse(response, responseEl, contentEl);
  }
}

private async requestContinuation(
  responseEl: HTMLElement,
  contentEl: HTMLElement,
  partialResponse: string
): Promise<void> {
  // Mostrar indicador
  const continueIndicator = contentEl.createDiv({ cls: 'agent-continuing' });
  continueIndicator.setText(t('agent.continuing'));

  // Solicitar continuación
  const continuationPrompt = 'Continue from where you left off. Complete the pending JSON structure or action.';

  // Enviar sin añadir al historial visible
  await this.client.sendAgentMessageStream(
    continuationPrompt,
    this.agentMode.getSystemPrompt(),
    {
      onToken: (token) => { /* acumular */ },
      onComplete: async (continuation) => {
        // Combinar respuestas
        const fullResponse = this.mergeResponses(partialResponse, continuation);
        continueIndicator.remove();
        await this.handleAgentResponse(fullResponse, responseEl, contentEl);
      }
    }
  );
}
```

**Estimación:** 2-3 días de desarrollo

---

### Fase 2.2: Refuerzo de Contexto del Modo Agente

**Objetivo:** Asegurar que el modelo no "olvide" que está en modo agente durante conversaciones largas.

**Archivos a modificar:**
- `src/agent-mode.ts`
- `src/claude-client.ts`

**Implementación:**

```typescript
// src/agent-mode.ts - Modificar getSystemPrompt()

getSystemPrompt(): string {
  const vaultContext = this.indexer.getVaultContext();
  const folders = this.getFolderList();

  // System prompt base
  const basePrompt = t('prompt.agentMode', {
    maxActions: String(this.plugin.settings.maxActionsPerMessage || 10),
    noteCount: String(vaultContext.noteCount),
    folders: folders,
    tags: vaultContext.allTags.slice(0, 20).map(tag => '#' + tag).join(', ') || '(none)',
    noteTitles: vaultContext.noteTitles.slice(0, 15).join(', ')
  });

  // Agregar refuerzo si el historial es largo
  const historyLength = this.plugin.client?.getHistory().length || 0;

  if (historyLength > 6) {
    return basePrompt + this.getContextReinforcement();
  }

  return basePrompt;
}

private getContextReinforcement(): string {
  return `

REMINDER - IMPORTANT:
You are in AGENT MODE. You MUST respond with JSON when the user requests vault actions.
Do NOT say you cannot create files - you CAN through the actions system.
If a task is complex, break it into multiple action batches.
Always use the JSON format for actions:
{
  "actions": [...],
  "message": "...",
  "requiresConfirmation": false
}`;
}
```

**Inyección de contexto en mensajes:**

```typescript
// src/claude-client.ts - Modificar sendAgentMessageStream()

async sendAgentMessageStream(
  userMessage: string,
  agentSystemPrompt: string,
  callbacks: StreamCallbacks
): Promise<void> {
  // Inyectar recordatorio si historial es largo
  const historyLength = this.conversationHistory.length;
  let enhancedMessage = userMessage;

  if (historyLength > 8) {
    enhancedMessage = `[Agent Mode Active - Use JSON format for vault actions]\n\n${userMessage}`;
  }

  this.conversationHistory.push({
    role: 'user',
    content: enhancedMessage
  });

  // ... resto del método
}
```

**Estimación:** 1-2 días de desarrollo

---

### Fase 2.3: Validación de Coherencia Respuesta vs Acciones

**Objetivo:** Detectar cuando el modelo dice que hizo algo pero no generó acciones ejecutables.

**Archivos a crear:**
- `src/response-validator.ts`

**Archivos a modificar:**
- `src/chat-view.ts`

**Implementación:**

```typescript
// src/response-validator.ts (nuevo)

export interface ValidationResult {
  isValid: boolean;
  hasActionClaims: boolean;
  hasActionJson: boolean;
  warnings: string[];
}

export class ResponseValidator {
  // Patrones que indican que el modelo DICE que hizo algo
  private static readonly ACTION_CLAIM_PATTERNS = [
    /(?:he |i have |i've |ya |created|creado|moved|movido|deleted|eliminado|renamed|renombrado)/i,
    /(?:archivo|file|nota|note|carpeta|folder).*(?:creado|created|guardado|saved)/i,
    /(?:listo|done|completado|completed|finished)/i,
  ];

  static validate(response: string, parsedActions: any): ValidationResult {
    const hasActionClaims = this.detectActionClaims(response);
    const hasActionJson = parsedActions &&
                          Array.isArray(parsedActions.actions) &&
                          parsedActions.actions.length > 0;

    const warnings: string[] = [];

    // Caso problemático: dice que hizo algo pero no hay acciones
    if (hasActionClaims && !hasActionJson) {
      warnings.push(t('warning.actionClaimsNoJson'));
    }

    // Caso: hay acciones pero el mensaje no las menciona (menor)
    if (hasActionJson && !hasActionClaims) {
      // Esto es OK, el JSON es lo que importa
    }

    return {
      isValid: hasActionJson || !hasActionClaims,
      hasActionClaims,
      hasActionJson,
      warnings
    };
  }

  private static detectActionClaims(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    return this.ACTION_CLAIM_PATTERNS.some(pattern => pattern.test(lowerResponse));
  }
}
```

**Integración en chat-view.ts:**

```typescript
// En handleAgentResponse()
private async handleAgentResponse(
  response: string,
  responseEl: HTMLElement,
  contentEl: HTMLElement
): Promise<void> {
  const agentResponse = this.agentMode.parseAgentResponse(response);

  // Validar coherencia
  const validation = ResponseValidator.validate(response, agentResponse);

  if (!validation.isValid && validation.warnings.length > 0) {
    // Mostrar advertencia al usuario
    const warningEl = contentEl.createDiv({ cls: 'agent-warning' });
    warningEl.innerHTML = `⚠️ ${validation.warnings.join('<br>')}`;

    // Ofrecer reintentar
    const retryBtn = warningEl.createEl('button', {
      text: t('agent.retryWithJson'),
      cls: 'agent-retry-btn'
    });
    retryBtn.onclick = () => this.retryAsAgentAction(response);
  }

  // Continuar con el flujo normal
  // ...
}

private async retryAsAgentAction(originalResponse: string): Promise<void> {
  const retryPrompt = `You said: "${originalResponse.substring(0, 200)}..."

But you didn't provide the JSON action format. Please provide the EXACT actions as JSON:
{
  "actions": [{ "action": "...", "params": {...} }],
  "message": "...",
  "requiresConfirmation": false
}`;

  await this.sendAgentMessage(retryPrompt, /* ... */);
}
```

**Estimación:** 2 días de desarrollo

---

### Fase 2.4: División Automática de Tareas Complejas

**Objetivo:** Detectar tareas que requieren muchas acciones y dividirlas en lotes manejables.

**Archivos a crear:**
- `src/task-planner.ts`

**Implementación:**

```typescript
// src/task-planner.ts (nuevo)

export interface TaskPlan {
  originalRequest: string;
  subtasks: Subtask[];
  estimatedActions: number;
  requiresPlanning: boolean;
}

export interface Subtask {
  id: string;
  description: string;
  prompt: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
}

export class TaskPlanner {
  // Patrones que indican tareas complejas
  private static readonly COMPLEX_TASK_PATTERNS = [
    /(?:crear?|create?|generar?|generate?)\s+(\d+|varios|multiple|many)/i,
    /(?:todos?|all)\s+(?:los?|the)?\s*(?:archivos?|files?|notas?|notes?)/i,
    /(?:estructura|structure)\s+(?:de\s+)?(?:proyecto|project|carpetas?|folders?)/i,
    /(?:organizar?|organize?|mover?|move?)\s+(?:todos?|all|múltiples?|multiple)/i,
  ];

  static analyzeRequest(request: string): { isComplex: boolean; reason?: string } {
    for (const pattern of this.COMPLEX_TASK_PATTERNS) {
      const match = request.match(pattern);
      if (match) {
        return {
          isComplex: true,
          reason: `Detected complex pattern: ${match[0]}`
        };
      }
    }

    // Contar número de acciones implícitas
    const actionKeywords = (request.match(/(?:crear?|mover?|eliminar?|renombrar?|create?|move?|delete?|rename?)/gi) || []).length;

    if (actionKeywords >= 3) {
      return {
        isComplex: true,
        reason: `Multiple action keywords: ${actionKeywords}`
      };
    }

    return { isComplex: false };
  }

  static async createPlan(
    request: string,
    client: ClaudeClient,
    maxActionsPerBatch: number
  ): Promise<TaskPlan> {
    // Solicitar al modelo que divida la tarea
    const planningPrompt = `Analyze this request and break it into subtasks that can each be completed with at most ${maxActionsPerBatch} actions:

REQUEST: ${request}

Respond with JSON:
{
  "subtasks": [
    {
      "id": "task-1",
      "description": "Brief description",
      "prompt": "Specific instruction for this subtask",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": number
}`;

    // Llamar al modelo para planificación
    const planResponse = await client.sendPlanningRequest(planningPrompt);

    return this.parsePlanResponse(request, planResponse);
  }

  private static parsePlanResponse(originalRequest: string, response: string): TaskPlan {
    try {
      const parsed = JSON.parse(response);
      return {
        originalRequest,
        subtasks: parsed.subtasks.map((st: any, idx: number) => ({
          ...st,
          id: st.id || `subtask-${idx}`,
          status: 'pending'
        })),
        estimatedActions: parsed.estimatedTotalActions || parsed.subtasks.length * 5,
        requiresPlanning: true
      };
    } catch {
      // Fallback: tratar como tarea única
      return {
        originalRequest,
        subtasks: [{
          id: 'single-task',
          description: originalRequest,
          prompt: originalRequest,
          dependencies: [],
          status: 'pending'
        }],
        estimatedActions: 10,
        requiresPlanning: false
      };
    }
  }
}
```

**Integración con el flujo:**

```typescript
// En chat-view.ts - sendAgentMessage()

private async sendAgentMessage(message: string, ...): Promise<void> {
  // Analizar complejidad
  const analysis = TaskPlanner.analyzeRequest(message);

  if (analysis.isComplex) {
    // Mostrar indicador de planificación
    this.showPlanningIndicator(contentEl);

    // Crear plan
    const plan = await TaskPlanner.createPlan(
      message,
      this.client,
      this.plugin.settings.maxActionsPerMessage
    );

    if (plan.subtasks.length > 1) {
      // Ejecutar plan por fases
      await this.executePlan(plan, responseEl, contentEl);
      return;
    }
  }

  // Continuar con flujo normal para tareas simples
  await this.executeSingleTask(message, responseEl, contentEl);
}

private async executePlan(
  plan: TaskPlan,
  responseEl: HTMLElement,
  contentEl: HTMLElement
): Promise<void> {
  const progressEl = contentEl.createDiv({ cls: 'agent-plan-progress' });

  for (let i = 0; i < plan.subtasks.length; i++) {
    const subtask = plan.subtasks[i];

    // Actualizar progreso
    progressEl.setText(t('agent.executingSubtask', {
      current: String(i + 1),
      total: String(plan.subtasks.length),
      description: subtask.description
    }));

    // Verificar dependencias
    const unmetDeps = subtask.dependencies.filter(
      depId => plan.subtasks.find(st => st.id === depId)?.status !== 'completed'
    );

    if (unmetDeps.length > 0) {
      subtask.status = 'failed';
      continue;
    }

    // Ejecutar subtarea
    subtask.status = 'in_progress';

    try {
      const result = await this.executeSubtask(subtask);
      subtask.status = 'completed';
      subtask.result = result;

      // Guardar checkpoint
      await this.saveCheckpoint(plan, i);
    } catch (error) {
      subtask.status = 'failed';
      // Continuar con siguiente subtarea si es posible
    }
  }

  // Mostrar resumen final
  this.showPlanSummary(plan, contentEl);
}
```

**Estimación:** 3-4 días de desarrollo

---

## Nivel 3: Arquitectura (Largo Plazo)

### Fase 3.1: Sistema de Gestión de Contexto con Archivos Temporales

**Objetivo:** Implementar un sistema que almacene contexto en archivos temporales para manejar conversaciones largas y tareas complejas sin saturar el context window.

**Archivos a crear:**
- `src/context-manager.ts`
- `src/context-storage.ts`

**Estructura de archivos temporales:**

```
.obsidian/plugins/claudian/
├── data.json                    # Configuración (existente)
├── temp/                        # Carpeta de archivos temporales
│   ├── sessions/                # Sesiones de conversación
│   │   ├── session-{uuid}.json  # Sesión activa
│   │   └── ...
│   ├── plans/                   # Planes de tareas
│   │   ├── plan-{uuid}.json     # Plan de ejecución
│   │   └── ...
│   ├── checkpoints/             # Puntos de recuperación
│   │   ├── checkpoint-{uuid}.json
│   │   └── ...
│   └── context/                 # Contexto descargado
│       ├── summary-{uuid}.json  # Resumen de conversación
│       └── ...
└── temp-index.json              # Índice de archivos temporales
```

**Implementación:**

```typescript
// src/context-storage.ts (nuevo)

import { Plugin } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';

export interface TempFileMetadata {
  id: string;
  type: 'session' | 'plan' | 'checkpoint' | 'context';
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
  size: number;
  relatedSessionId?: string;
}

export interface TempIndex {
  version: number;
  files: TempFileMetadata[];
  lastPurge: number;
}

export class ContextStorage {
  private plugin: Plugin;
  private basePath: string;
  private index: TempIndex;

  // Configuración de expiración (en milisegundos)
  private static readonly EXPIRATION = {
    session: 24 * 60 * 60 * 1000,      // 24 horas
    plan: 4 * 60 * 60 * 1000,          // 4 horas
    checkpoint: 2 * 60 * 60 * 1000,    // 2 horas
    context: 12 * 60 * 60 * 1000       // 12 horas
  };

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.basePath = `${plugin.manifest.dir}/temp`;
    this.index = { version: 1, files: [], lastPurge: 0 };
  }

  async initialize(): Promise<void> {
    // Crear estructura de carpetas
    const folders = ['sessions', 'plans', 'checkpoints', 'context'];

    for (const folder of folders) {
      const path = `${this.basePath}/${folder}`;
      if (!await this.plugin.app.vault.adapter.exists(path)) {
        await this.plugin.app.vault.adapter.mkdir(path);
      }
    }

    // Cargar o crear índice
    await this.loadIndex();

    // Purga inicial
    await this.purgeExpired();
  }

  private async loadIndex(): Promise<void> {
    const indexPath = `${this.plugin.manifest.dir}/temp-index.json`;

    try {
      if (await this.plugin.app.vault.adapter.exists(indexPath)) {
        const content = await this.plugin.app.vault.adapter.read(indexPath);
        this.index = JSON.parse(content);
      }
    } catch {
      this.index = { version: 1, files: [], lastPurge: Date.now() };
    }
  }

  private async saveIndex(): Promise<void> {
    const indexPath = `${this.plugin.manifest.dir}/temp-index.json`;
    await this.plugin.app.vault.adapter.write(
      indexPath,
      JSON.stringify(this.index, null, 2)
    );
  }

  async save(
    type: TempFileMetadata['type'],
    data: any,
    relatedSessionId?: string
  ): Promise<string> {
    const id = uuidv4();
    const now = Date.now();
    const expiration = ContextStorage.EXPIRATION[type];

    const metadata: TempFileMetadata = {
      id,
      type,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + expiration,
      size: 0,
      relatedSessionId
    };

    const filePath = `${this.basePath}/${type}s/${type}-${id}.json`;
    const content = JSON.stringify(data, null, 2);

    await this.plugin.app.vault.adapter.write(filePath, content);

    metadata.size = content.length;
    this.index.files.push(metadata);
    await this.saveIndex();

    return id;
  }

  async load<T>(type: TempFileMetadata['type'], id: string): Promise<T | null> {
    const filePath = `${this.basePath}/${type}s/${type}-${id}.json`;

    try {
      if (await this.plugin.app.vault.adapter.exists(filePath)) {
        const content = await this.plugin.app.vault.adapter.read(filePath);

        // Actualizar last accessed
        const fileIndex = this.index.files.findIndex(f => f.id === id);
        if (fileIndex >= 0) {
          this.index.files[fileIndex].lastAccessedAt = Date.now();
          await this.saveIndex();
        }

        return JSON.parse(content) as T;
      }
    } catch (error) {
      console.error(`Error loading temp file ${id}:`, error);
    }

    return null;
  }

  async delete(type: TempFileMetadata['type'], id: string): Promise<void> {
    const filePath = `${this.basePath}/${type}s/${type}-${id}.json`;

    try {
      if (await this.plugin.app.vault.adapter.exists(filePath)) {
        await this.plugin.app.vault.adapter.remove(filePath);
      }
    } catch (error) {
      console.error(`Error deleting temp file ${id}:`, error);
    }

    this.index.files = this.index.files.filter(f => f.id !== id);
    await this.saveIndex();
  }

  async purgeExpired(): Promise<number> {
    const now = Date.now();
    const expiredFiles = this.index.files.filter(f => f.expiresAt < now);

    for (const file of expiredFiles) {
      await this.delete(file.type, file.id);
    }

    this.index.lastPurge = now;
    await this.saveIndex();

    return expiredFiles.length;
  }

  async purgeBySession(sessionId: string): Promise<number> {
    const sessionFiles = this.index.files.filter(
      f => f.relatedSessionId === sessionId
    );

    for (const file of sessionFiles) {
      await this.delete(file.type, file.id);
    }

    return sessionFiles.length;
  }

  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, { count: number; size: number }>;
  }> {
    const stats = {
      totalFiles: this.index.files.length,
      totalSize: 0,
      byType: {} as Record<string, { count: number; size: number }>
    };

    for (const file of this.index.files) {
      stats.totalSize += file.size;

      if (!stats.byType[file.type]) {
        stats.byType[file.type] = { count: 0, size: 0 };
      }
      stats.byType[file.type].count++;
      stats.byType[file.type].size += file.size;
    }

    return stats;
  }
}
```

**Context Manager:**

```typescript
// src/context-manager.ts (nuevo)

import { ClaudeClient, Message } from './claude-client';
import { ContextStorage } from './context-storage';

export interface ConversationSummary {
  sessionId: string;
  messageCount: number;
  keyTopics: string[];
  lastActions: string[];
  summary: string;
  originalMessages: Message[];
}

export interface ContextWindow {
  systemPrompt: string;
  recentMessages: Message[];
  summaryContext?: string;
  activeTask?: string;
}

export class ContextManager {
  private storage: ContextStorage;
  private client: ClaudeClient;
  private currentSessionId: string;

  // Umbrales de gestión de contexto
  private static readonly MAX_MESSAGES_IN_CONTEXT = 10;
  private static readonly SUMMARIZE_THRESHOLD = 8;
  private static readonly ESTIMATED_TOKENS_PER_MESSAGE = 500;

  constructor(storage: ContextStorage, client: ClaudeClient) {
    this.storage = storage;
    this.client = client;
    this.currentSessionId = '';
  }

  async startSession(): Promise<string> {
    this.currentSessionId = await this.storage.save('session', {
      startedAt: Date.now(),
      messages: [],
      summaries: []
    });
    return this.currentSessionId;
  }

  async endSession(): Promise<void> {
    if (this.currentSessionId) {
      await this.storage.purgeBySession(this.currentSessionId);
      this.currentSessionId = '';
    }
  }

  async shouldSummarize(messages: Message[]): Promise<boolean> {
    return messages.length >= ContextManager.SUMMARIZE_THRESHOLD;
  }

  async summarizeAndOffload(messages: Message[]): Promise<ConversationSummary> {
    // Mantener últimos N mensajes
    const recentMessages = messages.slice(-ContextManager.MAX_MESSAGES_IN_CONTEXT);
    const oldMessages = messages.slice(0, -ContextManager.MAX_MESSAGES_IN_CONTEXT);

    if (oldMessages.length === 0) {
      return {
        sessionId: this.currentSessionId,
        messageCount: messages.length,
        keyTopics: [],
        lastActions: [],
        summary: '',
        originalMessages: messages
      };
    }

    // Generar resumen de mensajes antiguos
    const summaryPrompt = `Summarize this conversation concisely, focusing on:
1. Key topics discussed
2. Actions taken or planned
3. Important decisions made

CONVERSATION:
${oldMessages.map(m => `${m.role}: ${m.content.substring(0, 500)}`).join('\n\n')}

Respond with JSON:
{
  "keyTopics": ["topic1", "topic2"],
  "lastActions": ["action1", "action2"],
  "summary": "Concise summary..."
}`;

    // Solicitar resumen (usar modelo rápido si está disponible)
    const summaryResponse = await this.client.sendSummaryRequest(summaryPrompt);

    let parsedSummary;
    try {
      parsedSummary = JSON.parse(summaryResponse);
    } catch {
      parsedSummary = {
        keyTopics: [],
        lastActions: [],
        summary: summaryResponse
      };
    }

    // Guardar mensajes antiguos en archivo temporal
    await this.storage.save('context', {
      messages: oldMessages,
      summary: parsedSummary.summary,
      summarizedAt: Date.now()
    }, this.currentSessionId);

    return {
      sessionId: this.currentSessionId,
      messageCount: messages.length,
      keyTopics: parsedSummary.keyTopics || [],
      lastActions: parsedSummary.lastActions || [],
      summary: parsedSummary.summary || '',
      originalMessages: recentMessages
    };
  }

  buildContextWindow(
    systemPrompt: string,
    messages: Message[],
    summary?: ConversationSummary
  ): ContextWindow {
    let summaryContext: string | undefined;

    if (summary && summary.summary) {
      summaryContext = `[Previous conversation summary: ${summary.summary}]
[Key topics: ${summary.keyTopics.join(', ')}]
[Recent actions: ${summary.lastActions.join(', ')}]`;
    }

    return {
      systemPrompt,
      recentMessages: summary?.originalMessages || messages,
      summaryContext
    };
  }

  async saveCheckpoint(
    planId: string,
    completedSubtasks: number,
    state: any
  ): Promise<string> {
    return await this.storage.save('checkpoint', {
      planId,
      completedSubtasks,
      state,
      savedAt: Date.now()
    }, this.currentSessionId);
  }

  async loadCheckpoint(checkpointId: string): Promise<any | null> {
    return await this.storage.load('checkpoint', checkpointId);
  }
}
```

**Estimación:** 5-7 días de desarrollo

---

### Fase 3.2: Estrategia de Purga de Archivos Temporales

**Objetivo:** Mantener el sistema limpio eliminando archivos temporales de forma inteligente.

**Estrategias de purga:**

```typescript
// src/purge-strategies.ts (nuevo)

export interface PurgeStrategy {
  name: string;
  shouldPurge(file: TempFileMetadata, now: number): boolean;
  priority: number;  // Mayor = purgar primero
}

export class PurgeManager {
  private storage: ContextStorage;
  private strategies: PurgeStrategy[];

  constructor(storage: ContextStorage) {
    this.storage = storage;
    this.strategies = [
      new ExpiredPurgeStrategy(),
      new SizeLimitPurgeStrategy(),
      new InactivePurgeStrategy(),
      new OrphanedPurgeStrategy()
    ];
  }

  async runPurge(): Promise<PurgeResult> {
    const stats = await this.storage.getStats();
    const result: PurgeResult = {
      purgedFiles: 0,
      freedSpace: 0,
      errors: []
    };

    // Ordenar estrategias por prioridad
    const sortedStrategies = [...this.strategies].sort(
      (a, b) => b.priority - a.priority
    );

    for (const strategy of sortedStrategies) {
      try {
        const strategyResult = await this.applyStrategy(strategy);
        result.purgedFiles += strategyResult.purgedFiles;
        result.freedSpace += strategyResult.freedSpace;
      } catch (error) {
        result.errors.push(`${strategy.name}: ${error}`);
      }
    }

    return result;
  }

  private async applyStrategy(strategy: PurgeStrategy): Promise<PurgeResult> {
    // Implementación específica por estrategia
    // ...
  }
}

// Estrategia 1: Archivos expirados
class ExpiredPurgeStrategy implements PurgeStrategy {
  name = 'expired';
  priority = 100;

  shouldPurge(file: TempFileMetadata, now: number): boolean {
    return file.expiresAt < now;
  }
}

// Estrategia 2: Límite de tamaño total
class SizeLimitPurgeStrategy implements PurgeStrategy {
  name = 'size-limit';
  priority = 80;

  private static readonly MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

  shouldPurge(file: TempFileMetadata, now: number): boolean {
    // Se determina dinámicamente basado en tamaño total
    return false; // Lógica en el manager
  }
}

// Estrategia 3: Archivos inactivos
class InactivePurgeStrategy implements PurgeStrategy {
  name = 'inactive';
  priority = 60;

  private static readonly INACTIVE_THRESHOLD = 2 * 60 * 60 * 1000; // 2 horas

  shouldPurge(file: TempFileMetadata, now: number): boolean {
    return (now - file.lastAccessedAt) > InactivePurgeStrategy.INACTIVE_THRESHOLD;
  }
}

// Estrategia 4: Archivos huérfanos (sesión terminada)
class OrphanedPurgeStrategy implements PurgeStrategy {
  name = 'orphaned';
  priority = 90;

  shouldPurge(file: TempFileMetadata, now: number): boolean {
    // Verificar si la sesión relacionada ya no existe
    return false; // Lógica en el manager
  }
}
```

**Automatización de purga:**

```typescript
// En main.ts - onload()

async onload() {
  // ... inicialización existente ...

  // Inicializar storage
  this.contextStorage = new ContextStorage(this);
  await this.contextStorage.initialize();

  // Programar purga periódica
  this.registerInterval(
    window.setInterval(
      () => this.runScheduledPurge(),
      30 * 60 * 1000  // Cada 30 minutos
    )
  );

  // Purga al cerrar Obsidian
  this.app.workspace.on('quit', () => {
    this.contextStorage.purgeExpired();
  });
}

private async runScheduledPurge(): Promise<void> {
  const purgeManager = new PurgeManager(this.contextStorage);
  const result = await purgeManager.runPurge();

  if (result.purgedFiles > 0) {
    console.log(`Claudian: Purged ${result.purgedFiles} temp files, freed ${result.freedSpace} bytes`);
  }
}
```

**Estimación:** 2-3 días de desarrollo

---

### Fase 3.3: Tool Use Nativo de Anthropic

**Objetivo:** Migrar del sistema actual de parsing JSON a la API nativa de Tool Use de Anthropic para mayor fiabilidad.

**Archivos a crear:**
- `src/tools/vault-tools.ts`

**Archivos a modificar:**
- `src/claude-client.ts`
- `src/agent-mode.ts`

**Implementación:**

```typescript
// src/tools/vault-tools.ts (nuevo)

export const VAULT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'create_folder',
    description: 'Create a new folder in the vault',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the folder to create (e.g., "Projects/2024")'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'create_note',
    description: 'Create a new note with optional content and frontmatter',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path for the note (e.g., "Notes/my-note.md")'
        },
        content: {
          type: 'string',
          description: 'Content of the note in Markdown format'
        },
        frontmatter: {
          type: 'object',
          description: 'YAML frontmatter fields',
          additionalProperties: true
        }
      },
      required: ['path']
    }
  },
  {
    name: 'read_note',
    description: 'Read the content of an existing note',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the note to read'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'delete_note',
    description: 'Delete a note from the vault',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the note to delete'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'move_note',
    description: 'Move a note to a new location',
    input_schema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Current path of the note'
        },
        to: {
          type: 'string',
          description: 'New path for the note'
        }
      },
      required: ['from', 'to']
    }
  },
  {
    name: 'search_notes',
    description: 'Search for notes by title, content, or tags',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        field: {
          type: 'string',
          enum: ['title', 'content', 'tags'],
          description: 'Field to search in'
        },
        folder: {
          type: 'string',
          description: 'Optional folder to limit search'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'append_content',
    description: 'Append content to the end of a note',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the note'
        },
        content: {
          type: 'string',
          description: 'Content to append'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'list_folder',
    description: 'List contents of a folder',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path of the folder'
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to list recursively'
        }
      },
      required: ['path']
    }
  }
];
```

**Modificación del cliente:**

```typescript
// src/claude-client.ts - Nuevo método para tool use

async sendAgentMessageWithTools(
  userMessage: string,
  agentSystemPrompt: string,
  callbacks: StreamCallbacks & {
    onToolUse?: (toolName: string, input: any) => Promise<any>;
  }
): Promise<void> {
  if (!this.client) {
    callbacks.onError?.(new Error(t('error.apiKeyMissing')));
    return;
  }

  this.conversationHistory.push({
    role: 'user',
    content: userMessage
  });

  callbacks.onStart?.();

  try {
    let response = await this.client.messages.create({
      model: this.settings.model,
      max_tokens: this.settings.maxTokens,
      system: agentSystemPrompt,
      tools: VAULT_TOOLS,
      messages: this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    // Procesar tool calls
    while (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find(
        block => block.type === 'tool_use'
      );

      if (toolUseBlock && callbacks.onToolUse) {
        // Ejecutar herramienta
        const toolResult = await callbacks.onToolUse(
          toolUseBlock.name,
          toolUseBlock.input
        );

        // Continuar conversación con resultado
        this.conversationHistory.push({
          role: 'assistant',
          content: response.content
        });

        this.conversationHistory.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(toolResult)
          }]
        });

        // Siguiente iteración
        response = await this.client.messages.create({
          model: this.settings.model,
          max_tokens: this.settings.maxTokens,
          system: agentSystemPrompt,
          tools: VAULT_TOOLS,
          messages: this.conversationHistory
        });
      }
    }

    // Respuesta final
    const textContent = response.content.find(
      block => block.type === 'text'
    );

    const finalResponse = textContent?.text || '';

    this.conversationHistory.push({
      role: 'assistant',
      content: finalResponse
    });

    callbacks.onComplete?.(finalResponse);

  } catch (error) {
    this.conversationHistory.pop();
    this.handleError(error, callbacks);
  }
}
```

**Estimación:** 4-5 días de desarrollo

---

## Cronograma de Implementación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRONOGRAMA DE IMPLEMENTACIÓN                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  NIVEL 2 - Mejoras de Código (2-3 semanas)                                  │
│  ─────────────────────────────────────────                                  │
│                                                                              │
│  Semana 1:                                                                   │
│  ├── Fase 2.1: Detección de truncamiento ████████░░ 2-3 días                │
│  └── Fase 2.2: Refuerzo de contexto      ██████░░░░ 1-2 días                │
│                                                                              │
│  Semana 2:                                                                   │
│  ├── Fase 2.3: Validación de coherencia  ████████░░ 2 días                  │
│  └── Fase 2.4: División de tareas        ██████████ 3-4 días                │
│                                                                              │
│  NIVEL 3 - Arquitectura (3-4 semanas)                                       │
│  ─────────────────────────────────────                                      │
│                                                                              │
│  Semana 3-4:                                                                 │
│  └── Fase 3.1: Context Manager + Storage ██████████████ 5-7 días            │
│                                                                              │
│  Semana 4-5:                                                                 │
│  ├── Fase 3.2: Estrategias de purga      ██████████ 2-3 días                │
│  └── Fase 3.3: Tool Use nativo           ████████████ 4-5 días              │
│                                                                              │
│  Testing e integración: 3-5 días                                            │
│                                                                              │
│  TOTAL ESTIMADO: 5-7 semanas                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Archivos Final

```
src/
├── main.ts                      # Modificar: inicializar storage, purga
├── settings.ts                  # Modificar: nuevas opciones
├── claude-client.ts             # Modificar: tool use, context window
├── chat-view.ts                 # Modificar: integrar mejoras
├── agent-mode.ts                # Modificar: refuerzo contexto
├── vault-actions.ts             # Sin cambios
├── truncation-detector.ts       # NUEVO: detección de truncamiento
├── response-validator.ts        # NUEVO: validación coherencia
├── task-planner.ts              # NUEVO: división de tareas
├── context-manager.ts           # NUEVO: gestión de contexto
├── context-storage.ts           # NUEVO: almacenamiento temporal
├── purge-strategies.ts          # NUEVO: estrategias de purga
├── tools/
│   └── vault-tools.ts           # NUEVO: definición de tools
└── i18n/
    └── locales/
        ├── en.ts                # Modificar: nuevas traducciones
        └── es.ts                # Modificar: nuevas traducciones
```

---

## Configuración Nueva (settings.ts)

```typescript
export interface ClaudeCompanionSettings {
  // ... existentes ...

  // Nuevas opciones - Context Management
  enableContextOffloading: boolean;       // Habilitar descarga de contexto
  contextSummarizeThreshold: number;      // Mensajes antes de resumir (default: 8)
  maxMessagesInContext: number;           // Máximo en contexto activo (default: 10)

  // Nuevas opciones - Task Planning
  enableAutoPlanComplexTasks: boolean;    // Auto-dividir tareas complejas
  maxSubtasksPerPlan: number;             // Máximo subtareas (default: 10)

  // Nuevas opciones - Truncation Handling
  enableAutoContinuation: boolean;        // Auto-continuar respuestas truncadas
  maxContinuationAttempts: number;        // Máximo intentos (default: 3)

  // Nuevas opciones - Temp Files
  tempFileRetentionHours: number;         // Horas retención (default: 24)
  maxTempStorageMB: number;               // Máximo almacenamiento (default: 50)

  // Nuevas opciones - Tool Use
  useNativeToolUse: boolean;              // Usar API Tool Use (experimental)
}
```

---

## Métricas de Éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Tasa de truncamiento | ~40% en tareas largas | <10% |
| "Olvido" de modo agente | Frecuente después de 6+ mensajes | Raro |
| Discrepancia acción/reporte | ~30% | <5% |
| Tareas complejas exitosas | ~50% | >90% |
| Espacio temp files | N/A | <50MB promedio |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Overhead de I/O por temp files | Media | Bajo | Batching de escrituras, índice en memoria |
| Context window aún insuficiente | Baja | Alto | Resumen más agresivo, priorización |
| Tool Use API cambia | Baja | Medio | Abstracción, fallback a JSON parsing |
| Complejidad de debug | Alta | Medio | Logging extensivo, modo debug |
| Compatibilidad Obsidian mobile | Media | Medio | Testing específico, feature flags |

---

*Documento creado: 2025-01-21*
*Última actualización: 2025-01-21*
*Autor: Claude Opus 4.5 para Enigmora SC*
