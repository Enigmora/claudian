# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**obsidian-claude-companion** - Plugin de Obsidian para chat con Claude y generación de notas estructuradas con wikilinks, tags y YAML frontmatter.

## Build Commands

```bash
npm install              # Instalar dependencias
npm run dev              # Build desarrollo (con sourcemaps)
npm run build            # Build producción (minificado)
```

## Testing Local

1. Copiar `main.js`, `manifest.json`, `styles.css` a `.obsidian/plugins/obsidian-claude-companion/`
2. Recargar Obsidian (Ctrl/Cmd + R)
3. Activar plugin en Settings > Community Plugins

## Architecture

```
src/
├── main.ts           # Entry point, registra comandos y vistas
├── settings.ts       # PluginSettingTab con config (API key, modelo, etc.)
├── claude-client.ts  # Wrapper Anthropic SDK con streaming
├── chat-view.ts      # ItemView para panel lateral de chat
├── note-creator.ts   # Modal para crear notas desde chat
├── note-processor.ts # Procesamiento de notas existentes (Fase 2)
├── vault-indexer.ts  # Indexación de bóveda (Fase 2)
└── templates/
    └── default.ts    # Template de notas con frontmatter
```

**Flujo principal:**
- `main.ts` inicializa plugin y registra `ChatView` como vista lateral
- `ChatView` usa `ClaudeClient` para streaming de mensajes
- Respuestas se pueden convertir a notas via `NoteCreator` modal
- Settings persisten en `.obsidian/plugins/obsidian-claude-companion/data.json`

## Key Patterns

**Obsidian API:**
- Extender `Plugin` para entry point
- Extender `ItemView` para paneles personalizados
- Extender `PluginSettingTab` para UI de configuración
- Usar `MarkdownRenderer.render()` para renderizar respuestas

**Anthropic SDK:**
- Requiere `dangerouslyAllowBrowser: true` para funcionar en Obsidian
- Usar `client.messages.stream()` con eventos `on('text')` para streaming
- API key almacenada localmente, nunca en código

**CSS:**
- Usar variables de Obsidian (`--background-primary`, `--text-normal`, etc.)
- Soporte automático tema claro/oscuro

## Specifications

- `docs/obsidian-claude-plugin-spec.md` - Especificación completa del proyecto
- `docs/implementation-plan.md` - Plan de implementación por fases
