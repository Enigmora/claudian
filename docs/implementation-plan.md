# Plan de Implementación: claudian

## Fase 1 - MVP (Mínimo Producto Viable)

### Estado Actual
- **Completitud:** 0% implementado
- **Existente:** Solo especificación (`obsidian-claude-plugin-spec.md`)

### Objetivo del MVP
1. **Panel de chat lateral** con streaming de respuestas
2. **Comando para crear nota** desde el contenido del chat
3. **Configuración básica** (API key, selector de modelo)

---

## Diagrama de Dependencias

```
Paso 1: Configuración del Proyecto
    │
    ▼
Paso 2: Plugin Scaffold (main.ts)
    │
    ├──► Paso 3: Sistema de Settings
    │         │
    │         ▼
    └──► Paso 4: Claude Client
              │
              ▼
          Paso 5: Chat View (depende de 3 y 4)
              │
              ▼
          Paso 6: Comando Crear Nota
              │
              ▼
          Paso 7: Estilos CSS
              │
              ▼
          Paso 8: Testing y Refinamiento
```

---

## Pasos Detallados

### PASO 1: Configuración del Proyecto
**Complejidad:** Baja

**Archivos a crear:**
| Archivo | Propósito |
|---------|-----------|
| `package.json` | Dependencias: typescript, esbuild, obsidian, @anthropic-ai/sdk |
| `tsconfig.json` | Configuración TypeScript (ES6, ESNext modules) |
| `esbuild.config.mjs` | Build script con soporte dev/production |
| `manifest.json` | Metadata del plugin (id, nombre, versión) |
| `.gitignore` | Excluir node_modules, main.js, data.json |

**Verificación:**
```bash
npm install
npm run dev
```

---

### PASO 2: Plugin Scaffold Básico
**Complejidad:** Baja | **Dependencias:** Paso 1

**Archivo:** `src/main.ts`

**Estructura:**
```typescript
export default class ClaudianPlugin extends Plugin {
  settings: ClaudianSettings;

  async onload() {
    await this.loadSettings();
    // Registrar comandos, vistas, ribbon icon
  }

  async onunload() {
    // Limpieza
  }
}
```

**Funcionalidad inicial:**
- Clase principal extendiendo `Plugin`
- Sistema de carga/guardado de settings
- Comando para abrir chat
- Icono en ribbon

---

### PASO 3: Sistema de Settings
**Complejidad:** Media | **Dependencias:** Paso 2

**Archivo:** `src/settings.ts`

**Interface de configuración:**
```typescript
interface ClaudianSettings {
  apiKey: string;           // API key de Anthropic
  model: string;            // claude-3-5-sonnet-20241022, etc.
  notesFolder: string;      // Carpeta destino de notas
  maxTokens: number;        // 1000-8192
  systemPrompt: string;     // Instrucciones para Claude
}
```

**UI de Settings:**
- Campo password para API key
- Dropdown para selección de modelo
- Text input para carpeta de notas
- Slider para max tokens
- Textarea para system prompt

---

### PASO 4: Claude Client (Wrapper API)
**Complejidad:** Media-Alta | **Dependencias:** Paso 3

**Archivo:** `src/claude-client.ts`

**Características:**
- Inicialización del SDK de Anthropic
- Método `sendMessageStream()` con callbacks:
  - `onStart()` - Inicio de streaming
  - `onToken(token)` - Cada token recibido
  - `onComplete(response)` - Respuesta completa
  - `onError(error)` - Manejo de errores
- Gestión de historial de conversación
- Soporte para `dangerouslyAllowBrowser: true` (requerido en Obsidian)

**Consideraciones:**
- Manejo de rate limiting
- Timeout configurable
- Reintentos automáticos

---

### PASO 5: Chat View (Panel Lateral)
**Complejidad:** Alta | **Dependencias:** Pasos 3 y 4

**Archivo:** `src/chat-view.ts`

**Componentes UI:**
```
┌─────────────────────────────┐
│  Claudian     [🗑️]  │ ← Header
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │ Mensaje usuario     │   │ ← Alineado derecha
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ Respuesta Claude    │   │ ← Alineado izquierda
│  │ con Markdown        │   │
│  │ [📋 Copiar][📝 Nota]│   │ ← Acciones
│  └─────────────────────┘   │
│                             │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ Escribe mensaje...  │   │ ← Input
│  └─────────────────────┘   │
│                   [Enviar] │ ← Botón
└─────────────────────────────┘
```

**Funcionalidad:**
- Renderizado de Markdown con `MarkdownRenderer`
- Streaming visual con cursor parpadeante
- Scroll automático a último mensaje
- Enter para enviar, Shift+Enter para nueva línea
- Botón copiar al portapapeles
- Botón crear nota desde mensaje

---

### PASO 6: Comando Crear Nota
**Complejidad:** Media | **Dependencias:** Paso 5

**Archivos:**
- `src/templates/default.ts` - Template de nota
- `src/note-creator.ts` - Modal de creación

**Template de nota:**
```markdown
---
created: {{date}}
tags: [{{tags}}]
source: claude-chat
status: draft
---

# {{title}}

{{content}}

---
*Generado con Claudian - {{date}}*
```

**Modal de creación:**
- Preview del contenido (primeros 300 chars)
- Input para título (sugerido automáticamente)
- Input para tags (extraídos del contenido)
- Input para carpeta destino
- Botones Cancelar / Crear nota

**Comandos registrados:**
- `create-note-from-selection` - Crear nota desde texto seleccionado

---

### PASO 7: Estilos CSS
**Complejidad:** Media | **Dependencias:** Paso 6

**Archivo:** `styles.css`

**Áreas a estilizar:**
- Layout del chat (flexbox)
- Header con controles
- Mensajes de usuario (background accent, alineado derecha)
- Mensajes de Claude (background secondary, alineado izquierda)
- Animación de cursor streaming (`@keyframes blink`)
- Animación de entrada de mensajes (`@keyframes fadeIn`)
- Input y botones
- Modal de crear nota
- Code blocks en respuestas

**Consideraciones:**
- Usar variables CSS de Obsidian (`--background-primary`, `--text-normal`, etc.)
- Soporte automático para tema claro y oscuro

---

### PASO 8: Testing y Refinamiento
**Complejidad:** Media | **Dependencias:** Todos los pasos

**Checklist:**

#### Funcionalidad Core
- [ ] Plugin carga sin errores en consola
- [ ] Settings se guardan y persisten tras reinicio
- [ ] API key se almacena de forma segura
- [ ] Chat se abre desde ribbon y comando
- [ ] Mensajes se envían correctamente
- [ ] Streaming funciona sin cortes
- [ ] Historial se mantiene durante sesión
- [ ] Botón limpiar funciona

#### Creación de Notas
- [ ] Modal se abre correctamente
- [ ] Título se sugiere automáticamente
- [ ] Tags se extraen del contenido
- [ ] Carpeta se crea si no existe
- [ ] Nota se crea con formato correcto (frontmatter)
- [ ] Nota se abre después de crear
- [ ] Comando de selección funciona

#### Manejo de Errores
- [ ] Sin API key → mensaje claro
- [ ] Sin conexión → error graceful
- [ ] API key inválida → error descriptivo
- [ ] Rate limiting → comunicar al usuario

#### UX/UI
- [ ] Tema claro funciona correctamente
- [ ] Tema oscuro funciona correctamente
- [ ] Scroll automático a último mensaje
- [ ] Cursor de streaming visible
- [ ] Botones tienen feedback visual
- [ ] Markdown se renderiza correctamente
- [ ] Code blocks con syntax highlighting

---

## Resumen de Archivos a Crear

| Archivo | Paso | Propósito |
|---------|------|-----------|
| `package.json` | 1 | Dependencias y scripts |
| `tsconfig.json` | 1 | Configuración TypeScript |
| `esbuild.config.mjs` | 1 | Build configuration |
| `manifest.json` | 1 | Metadata del plugin |
| `.gitignore` | 1 | Exclusiones de git |
| `src/main.ts` | 2+ | Entry point del plugin |
| `src/settings.ts` | 3 | Settings y UI de configuración |
| `src/claude-client.ts` | 4 | Wrapper Anthropic API |
| `src/chat-view.ts` | 5 | Panel de chat lateral |
| `src/templates/default.ts` | 6 | Template de notas |
| `src/note-creator.ts` | 6 | Modal de creación de notas |
| `styles.css` | 7 | Estilos del plugin |

**Total:** 12 archivos

---

## Sesiones de Trabajo Sugeridas

| Sesión | Pasos | Entregable |
|--------|-------|------------|
| **1** | 1-3 | Proyecto configurado, settings funcionales |
| **2** | 4-5 | Cliente Claude, chat con streaming |
| **3** | 6-7 | Creación de notas, estilos completos |
| **4** | 8 | Testing completo, bugs corregidos |

---

## Verificación Final del MVP

1. Instalar plugin en bóveda de prueba
2. Configurar API key en settings
3. Abrir chat desde ribbon
4. Enviar mensaje y verificar streaming
5. Crear nota desde respuesta de Claude
6. Verificar formato de nota (frontmatter, contenido)
7. Probar en tema claro y oscuro

---

## Próximas Fases (Post-MVP)

### Fase 2: Integración con Bóveda
- Comando "Procesar nota activa"
- Sugerencias de tags y wikilinks
- Indexación de títulos existentes

### Fase 3: Automatización
- Templates de extracción personalizados
- Procesamiento batch de notas
- Generación de índices/mapas de conceptos

---

*Documento generado: 2026-01-20*
*Referencia: obsidian-claude-plugin-spec.md*
