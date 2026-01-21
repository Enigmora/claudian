# Plan de Implementación - Fase 4: Agente de Bóveda

## Resumen

Implementar un sistema que permite a Claude ejecutar acciones sobre la bóveda de Obsidian a través de instrucciones en lenguaje natural en el chat. Claude actúa como un agente inteligente que interpreta las solicitudes del usuario y las traduce en operaciones concretas sobre archivos y carpetas.

## Concepto

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLUJO DE TRABAJO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Usuario: "Crea una nota sobre Python en Programación/"         │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Claude analiza                        │    │
│  │  - Interpreta la intención                              │    │
│  │  - Genera acciones estructuradas                        │    │
│  │  - Propone contenido si es necesario                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Plugin ejecuta acciones                  │    │
│  │  - Valida permisos y seguridad                          │    │
│  │  - Solicita confirmación si es destructivo              │    │
│  │  - Ejecuta operaciones en la bóveda                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  Claude: "He creado la nota 'Python.md' en Programación/"       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Acciones Disponibles

### Gestión de Carpetas

| Acción | Descripción | Parámetros |
|--------|-------------|------------|
| `create-folder` | Crear carpeta (y subcarpetas) | `path` |
| `delete-folder` | Eliminar carpeta vacía | `path` |
| `list-folder` | Listar contenido de carpeta | `path`, `recursive?` |

### Gestión de Notas

| Acción | Descripción | Parámetros |
|--------|-------------|------------|
| `create-note` | Crear nueva nota | `path`, `content?`, `frontmatter?` |
| `read-note` | Leer contenido de nota | `path` |
| `delete-note` | Eliminar nota | `path` |
| `rename-note` | Renombrar nota | `from`, `to` |
| `move-note` | Mover nota a otra carpeta | `from`, `to` |

### Modificación de Contenido

| Acción | Descripción | Parámetros |
|--------|-------------|------------|
| `append-content` | Agregar contenido al final | `path`, `content` |
| `prepend-content` | Agregar contenido al inicio | `path`, `content` |
| `replace-content` | Reemplazar contenido completo | `path`, `content` |
| `update-frontmatter` | Actualizar campos YAML | `path`, `fields` |

### Búsqueda y Consulta

| Acción | Descripción | Parámetros |
|--------|-------------|------------|
| `search-notes` | Buscar notas por criterio | `query`, `field?`, `folder?` |
| `get-note-info` | Obtener metadata de nota | `path` |
| `find-links` | Encontrar notas que enlazan a | `target` |

---

## Estructura de Respuesta de Claude

```typescript
interface AgentResponse {
  // Razonamiento interno (opcional, para debug)
  thinking?: string;

  // Lista de acciones a ejecutar en orden
  actions: VaultAction[];

  // Mensaje para mostrar al usuario
  message: string;

  // Si requiere confirmación antes de ejecutar
  requiresConfirmation?: boolean;
}

interface VaultAction {
  action: ActionType;
  params: Record<string, any>;
  description?: string;  // Descripción legible de la acción
}
```

### Ejemplo de respuesta

```json
{
  "thinking": "El usuario quiere organizar notas de un proyecto. Necesito crear la estructura de carpetas y mover las notas relevantes.",
  "actions": [
    {
      "action": "create-folder",
      "params": { "path": "Proyectos/WebApp" },
      "description": "Crear carpeta Proyectos/WebApp"
    },
    {
      "action": "create-folder",
      "params": { "path": "Proyectos/WebApp/Docs" },
      "description": "Crear subcarpeta Docs"
    },
    {
      "action": "move-note",
      "params": { "from": "Ideas/webapp-spec.md", "to": "Proyectos/WebApp/Docs/spec.md" },
      "description": "Mover especificación al proyecto"
    }
  ],
  "message": "He creado la estructura del proyecto WebApp y movido la especificación a su lugar.",
  "requiresConfirmation": false
}
```

---

## Archivos a Crear

### 1. `src/vault-actions.ts`

Define las acciones disponibles y su ejecución:

```typescript
export type ActionType =
  | 'create-folder' | 'delete-folder' | 'list-folder'
  | 'create-note' | 'read-note' | 'delete-note' | 'rename-note' | 'move-note'
  | 'append-content' | 'prepend-content' | 'replace-content' | 'update-frontmatter'
  | 'search-notes' | 'get-note-info' | 'find-links';

export interface VaultAction {
  action: ActionType;
  params: Record<string, any>;
  description?: string;
}

export interface ActionResult {
  success: boolean;
  action: VaultAction;
  result?: any;
  error?: string;
}

export class VaultActionExecutor {
  constructor(plugin: ClaudianPlugin);

  async execute(action: VaultAction): Promise<ActionResult>;
  async executeAll(actions: VaultAction[]): Promise<ActionResult[]>;

  // Métodos internos para cada acción
  private async createFolder(path: string): Promise<void>;
  private async createNote(path: string, content?: string): Promise<TFile>;
  private async moveNote(from: string, to: string): Promise<void>;
  // ... etc
}
```

### 2. `src/agent-mode.ts`

Gestiona el modo agente en el chat:

```typescript
export interface AgentResponse {
  thinking?: string;
  actions: VaultAction[];
  message: string;
  requiresConfirmation?: boolean;
}

export class AgentMode {
  constructor(plugin: ClaudianPlugin, executor: VaultActionExecutor);

  isAgentMessage(content: string): boolean;
  parseAgentResponse(response: string): AgentResponse;

  async processAgentResponse(response: AgentResponse): Promise<string>;

  getSystemPrompt(): string;  // Prompt especializado para modo agente
}
```

### 3. `src/confirmation-modal.ts`

Modal para confirmar acciones destructivas:

```typescript
export class ConfirmationModal extends Modal {
  constructor(
    app: App,
    actions: VaultAction[],
    onConfirm: () => void,
    onCancel: () => void
  );
}
```

---

## Archivos a Modificar

### 1. `src/chat-view.ts`

- Agregar toggle para activar/desactivar modo agente
- Detectar respuestas con acciones y ejecutarlas
- Mostrar resultados de acciones en el chat

### 2. `src/claude-client.ts`

- Agregar método `sendAgentMessage()` con system prompt especializado
- Manejar respuestas JSON del agente

### 3. `src/settings.ts`

- Agregar configuración de modo agente:
  - `agentModeEnabled: boolean`
  - `confirmDestructiveActions: boolean`
  - `protectedFolders: string[]`
  - `maxActionsPerMessage: number`

### 4. `styles.css`

- Estilos para indicador de modo agente
- Estilos para visualización de acciones ejecutadas
- Estilos para modal de confirmación

---

## Seguridad

### Acciones Destructivas (requieren confirmación)

- `delete-note`
- `delete-folder`
- `replace-content`
- Cualquier acción en carpetas protegidas

### Carpetas Protegidas por Defecto

```typescript
const DEFAULT_PROTECTED_FOLDERS = [
  '.obsidian',
  'templates',
  '_templates'
];
```

### Límites

- Máximo de acciones por mensaje: 10 (configurable)
- No se permite ejecutar código arbitrario
- Las rutas se validan para evitar path traversal

---

## System Prompt para Modo Agente

```
Eres un asistente que ayuda a gestionar una bóveda de Obsidian. Puedes ejecutar acciones sobre archivos y carpetas.

CAPACIDADES:
- Crear, mover, renombrar y eliminar notas y carpetas
- Leer y modificar contenido de notas
- Buscar notas por título, contenido o tags
- Actualizar frontmatter (YAML)

FORMATO DE RESPUESTA:
Cuando el usuario solicite una acción sobre la bóveda, responde ÚNICAMENTE con JSON:
{
  "actions": [...],
  "message": "Descripción de lo que harás/hiciste",
  "requiresConfirmation": true/false
}

REGLAS:
1. Para acciones destructivas (eliminar), usa requiresConfirmation: true
2. Describe claramente cada acción en el mensaje
3. Si no estás seguro de la intención, pregunta antes de actuar
4. Para conversación normal (sin acciones), responde normalmente sin JSON

CONTEXTO DE LA BÓVEDA:
- Carpetas existentes: [lista]
- Notas recientes: [lista]
```

---

## Interfaz de Usuario

### Indicador de Modo Agente

```
┌─────────────────────────────────────────┐
│  Claudian          [🤖 On] [🗑️] │  ← Toggle modo agente
├─────────────────────────────────────────┤
```

### Visualización de Acciones

```
┌─────────────────────────────────────────┐
│ 🤖 Ejecutando acciones...               │
│                                         │
│ ✓ Crear carpeta: Proyectos/WebApp      │
│ ✓ Crear carpeta: Proyectos/WebApp/Docs │
│ ✓ Mover nota: spec.md → Docs/          │
│                                         │
│ He organizado el proyecto WebApp.       │
└─────────────────────────────────────────┘
```

### Modal de Confirmación

```
┌─────────────────────────────────────────┐
│        Confirmar acciones               │
├─────────────────────────────────────────┤
│                                         │
│ Las siguientes acciones se ejecutarán:  │
│                                         │
│ ⚠️ Eliminar nota: borrador.md           │
│ ⚠️ Eliminar carpeta: temp/              │
│                                         │
│ ¿Deseas continuar?                      │
│                                         │
│              [Cancelar] [Confirmar]     │
└─────────────────────────────────────────┘
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear estructura de proyecto

**Usuario:** "Crea una estructura para un nuevo proyecto llamado 'API REST' con carpetas para documentación, código y pruebas"

**Claude responde:**
```json
{
  "actions": [
    { "action": "create-folder", "params": { "path": "Proyectos/API REST" } },
    { "action": "create-folder", "params": { "path": "Proyectos/API REST/Documentación" } },
    { "action": "create-folder", "params": { "path": "Proyectos/API REST/Código" } },
    { "action": "create-folder", "params": { "path": "Proyectos/API REST/Pruebas" } },
    { "action": "create-note", "params": {
      "path": "Proyectos/API REST/README.md",
      "content": "# API REST\n\n## Descripción\n\n## Estructura\n- Documentación/\n- Código/\n- Pruebas/"
    }}
  ],
  "message": "He creado la estructura del proyecto 'API REST' con carpetas para documentación, código y pruebas, además de un README inicial."
}
```

### Ejemplo 2: Organizar notas existentes

**Usuario:** "Mueve todas las notas que contengan 'reunión' al folder Reuniones/"

**Claude responde:**
```json
{
  "actions": [
    { "action": "create-folder", "params": { "path": "Reuniones" } },
    { "action": "search-notes", "params": { "query": "reunión", "field": "title" } },
    { "action": "move-note", "params": { "from": "reunión-enero.md", "to": "Reuniones/reunión-enero.md" } },
    { "action": "move-note", "params": { "from": "notas/reunión-equipo.md", "to": "Reuniones/reunión-equipo.md" } }
  ],
  "message": "He creado la carpeta Reuniones/ y movido 2 notas que contienen 'reunión' en el título."
}
```

### Ejemplo 3: Limpiar notas vacías

**Usuario:** "Elimina todas las notas vacías en la carpeta Borradores/"

**Claude responde:**
```json
{
  "actions": [
    { "action": "delete-note", "params": { "path": "Borradores/sin-titulo.md" } },
    { "action": "delete-note", "params": { "path": "Borradores/temp.md" } }
  ],
  "message": "Encontré 2 notas vacías en Borradores/. ¿Deseas eliminarlas?",
  "requiresConfirmation": true
}
```

---

## Plan de Implementación

### Paso 1: VaultActionExecutor
- Crear `src/vault-actions.ts`
- Implementar todas las acciones sobre la bóveda
- Tests manuales de cada acción

### Paso 2: AgentMode
- Crear `src/agent-mode.ts`
- Implementar parsing de respuestas JSON
- Implementar system prompt especializado

### Paso 3: ConfirmationModal
- Crear `src/confirmation-modal.ts`
- UI para revisar y confirmar acciones

### Paso 4: Integración en ChatView
- Agregar toggle de modo agente
- Detectar y procesar respuestas de agente
- Visualizar acciones ejecutadas

### Paso 5: Settings
- Agregar configuraciones de seguridad
- Carpetas protegidas
- Límites de acciones

### Paso 6: Estilos y UX
- Indicadores visuales
- Animaciones de ejecución
- Feedback de éxito/error

---

## Verificación

1. Activar modo agente en el chat
2. Solicitar crear una carpeta → verificar que se crea
3. Solicitar crear una nota con contenido → verificar contenido
4. Solicitar mover notas → verificar movimiento
5. Solicitar eliminar nota → verificar modal de confirmación
6. Verificar que carpetas protegidas no se pueden modificar
7. Probar límite de acciones por mensaje

---

*Documento creado: 2025-01-20*
*Fase 4 del proyecto Claudian*
