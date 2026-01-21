# Obsidian Claude Plugin - Especificación de Proyecto

## Resumen Ejecutivo

**Nombre del proyecto:** `obsidian-claude-companion`

**Objetivo:** Crear un plugin de Obsidian que permita interactuar con Claude directamente desde la aplicación, generando notas estructuradas con formato compatible con Obsidian (wikilinks, tags, YAML frontmatter).

**Motivación:** Evitar depender de plugins de terceros que requieren confiar API keys a código desconocido. Este plugin será desarrollado y auditado por el usuario.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Obsidian                         │
│  ┌───────────────────────────────────────────────┐  │
│  │           obsidian-claude-companion           │  │
│  │                                               │  │
│  │  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │  Chat View  │  │   Note Processor        │ │  │
│  │  │  (Panel)    │  │   - Extraer conceptos   │ │  │
│  │  │             │  │   - Sugerir tags        │ │  │
│  │  └─────────────┘  │   - Proponer enlaces    │ │  │
│  │                   └─────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           Settings                       │  │
│  │  │  - API Key (local)                       │  │
│  │  │  - Modelo preferido                      │  │
│  │  │  - Templates personalizados              │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          │ HTTPS (api.anthropic.com)
                          ▼
                ┌───────────────────┐
                │   Anthropic API   │
                │   Claude 3.5/4    │
                └───────────────────┘
```

---

## Funcionalidades

### Fase 1: MVP (Mínimo Viable)

1. **Panel de chat lateral**
   - Conversación con Claude desde Obsidian
   - Historial de mensajes persistente por sesión
   - Streaming de respuestas

2. **Comando: Crear nota desde chat**
   - Seleccionar texto en el chat
   - Generar nota `.md` con estructura predefinida
   - Guardar en carpeta configurable

3. **Configuración básica**
   - Campo para API key (almacenada en `.obsidian/plugins/obsidian-claude-companion/data.json`)
   - Selector de modelo (claude-3-5-sonnet, claude-3-opus, etc.)

### Fase 2: Integración con bóveda

4. **Comando: Procesar nota activa**
   - Enviar nota actual a Claude
   - Recibir sugerencias de:
     - Tags relevantes
     - Wikilinks a notas existentes
     - Conceptos para extraer como notas atómicas

5. **Contexto de bóveda**
   - Indexar títulos de notas existentes
   - Enviar contexto relevante a Claude para mejorar sugerencias

### Fase 3: Automatización

6. **Templates de extracción**
   - Definir prompts personalizados para diferentes tipos de contenido
   - Ej: "Extraer ideas clave", "Generar resumen ejecutivo", "Identificar preguntas abiertas"

7. **Procesamiento batch**
   - Procesar múltiples notas seleccionadas
   - Generar índice o mapa de conceptos

---

## Stack Técnico

### Lenguaje y herramientas

- **TypeScript** (requerido por Obsidian)
- **Node.js** para desarrollo
- **esbuild** para bundling (recomendado por Obsidian)

### Dependencias principales

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "esbuild": "^0.20.0",
    "obsidian": "latest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0"
  }
}
```

### Estructura del proyecto

```
obsidian-claude-companion/
├── src/
│   ├── main.ts              # Entry point del plugin
│   ├── settings.ts          # Configuración y UI de settings
│   ├── chat-view.ts         # Panel de chat lateral
│   ├── claude-client.ts     # Wrapper para Anthropic API
│   ├── note-processor.ts    # Lógica de procesamiento de notas
│   ├── vault-indexer.ts     # Indexación de bóveda
│   └── templates/
│       └── default.ts       # Templates de extracción
├── styles.css               # Estilos del plugin
├── manifest.json            # Metadata del plugin
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── .gitignore
└── README.md
```

---

## Configuración del entorno de desarrollo

### Prerequisitos

```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Setup inicial

```bash
# Clonar/crear repositorio
mkdir obsidian-claude-companion
cd obsidian-claude-companion

# Inicializar proyecto
npm init -y

# Instalar dependencias
npm install --save-dev typescript @types/node esbuild obsidian
npm install @anthropic-ai/sdk

# Crear estructura
mkdir -p src/templates
```

### Configuración de TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES6",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": ["DOM", "ES5", "ES6", "ES7"]
  },
  "include": ["src/**/*.ts"]
}
```

### Build script

**esbuild.config.mjs:**
```javascript
import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";

esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian"],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  minify: prod,
}).catch(() => process.exit(1));
```

### Scripts en package.json

```json
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production",
    "version": "node version-bump.mjs && git add manifest.json versions.json"
  }
}
```

---

## Archivos base del plugin

### manifest.json

```json
{
  "id": "obsidian-claude-companion",
  "name": "Claude Companion",
  "version": "0.1.0",
  "minAppVersion": "1.0.0",
  "description": "Chat con Claude y genera notas estructuradas directamente en tu bóveda.",
  "author": "Tu nombre",
  "authorUrl": "https://github.com/tu-usuario",
  "isDesktopOnly": false
}
```

### .gitignore

```
node_modules/
main.js
*.js.map
.DS_Store
data.json
```

---

## API de Anthropic - Consideraciones

### Autenticación

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: settings.apiKey, // Nunca hardcodear
});
```

### Llamada básica

```typescript
const response = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: [
    { role: "user", content: userMessage }
  ],
  system: "Eres un asistente para organizar notas en Obsidian..."
});
```

### Streaming (recomendado para UX)

```typescript
const stream = await client.messages.stream({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 4096,
  messages: [...],
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    // Actualizar UI con chunk.delta.text
  }
}
```

---

## Formato de notas generadas

### Template por defecto

```markdown
---
created: {{date}}
tags: [{{tags}}]
source: claude-chat
status: draft
---

# {{title}}

{{content}}

## Enlaces relacionados

{{links}}

## Metadata

- Generado desde: Chat con Claude
- Fecha: {{date}}
```

### Ejemplo de nota generada

```markdown
---
created: 2025-01-20
tags: [productividad, obsidian, automatización]
source: claude-chat
status: draft
---

# Flujo de trabajo para captura de ideas

El problema central es la consolidación, no la captura...

## Enlaces relacionados

- [[Obsidian como segundo cerebro]]
- [[Sistemas de notas atómicas]]

## Metadata

- Generado desde: Chat con Claude
- Fecha: 2025-01-20
```

---

## Desarrollo paso a paso

### Paso 1: Scaffold básico

Crear `src/main.ts` con plugin mínimo que carga y registra comandos.

### Paso 2: Settings

Implementar panel de configuración para API key.

### Paso 3: Claude client

Crear wrapper que maneje autenticación y llamadas.

### Paso 4: Chat view

Implementar panel lateral con input y display de mensajes.

### Paso 5: Generación de notas

Conectar chat con creación de archivos `.md`.

---

## Testing local

1. Crear bóveda de prueba o usar una existente
2. Crear carpeta `.obsidian/plugins/obsidian-claude-companion/`
3. Copiar `main.js`, `manifest.json`, `styles.css`
4. Recargar Obsidian (Ctrl/Cmd + R)
5. Activar plugin en Settings > Community Plugins

---

## Seguridad

- **API key nunca en código fuente**
- **API key almacenada solo en `data.json` local** (excluido de git)
- **Todas las llamadas directas a api.anthropic.com** (sin proxies)
- **Código 100% auditable** por el usuario

---

## Próximos pasos

1. [ ] Crear repositorio en GitHub
2. [ ] Implementar scaffold básico (`main.ts`)
3. [ ] Agregar configuración de API key
4. [ ] Implementar cliente de Claude con streaming
5. [ ] Crear vista de chat
6. [ ] Agregar comando de generación de notas
7. [ ] Testing en bóveda real
8. [ ] Documentación de uso

---

## Recursos

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Anthropic API Reference](https://docs.anthropic.com/en/api/messages)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
