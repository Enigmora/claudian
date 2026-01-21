# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Claudian** - The ultimate Claude AI integration for Obsidian. Powered by Claude.

Plugin de Obsidian para chat con Claude y generación de notas estructuradas con wikilinks, tags y YAML frontmatter.

## Build Commands

```bash
npm install              # Instalar dependencias
npm run dev              # Build desarrollo (con sourcemaps)
npm run build            # Build producción (minificado)
./deploy.sh . <destino>  # Compilar y desplegar a bóveda
```

## Testing Local

1. Ejecutar `./deploy.sh . /ruta/a/boveda/.obsidian/plugins/claudian/`
2. O copiar archivos de `dist/` manualmente a `.obsidian/plugins/claudian/`
3. Recargar Obsidian (Ctrl/Cmd + R)
4. Activar plugin en Settings > Community Plugins

## Architecture

```
src/
├── main.ts                  # Entry point, registra comandos y vistas
├── settings.ts              # PluginSettingTab con config (API key, modelo, etc.)
├── claude-client.ts         # Wrapper Anthropic SDK con streaming
├── chat-view.ts             # ItemView para panel lateral de chat
├── note-creator.ts          # Modal para crear notas desde chat
├── note-processor.ts        # Procesamiento de notas existentes
├── vault-indexer.ts         # Indexación de bóveda
├── suggestions-modal.ts     # Modal de sugerencias interactivo
├── extraction-templates.ts  # Templates de extracción predefinidos
├── batch-processor.ts       # Procesamiento batch de notas
├── batch-modal.ts           # Modal de selección para batch
├── concept-map-generator.ts # Generador de mapas de conceptos
├── vault-actions.ts         # Ejecutor de acciones sobre bóveda
├── agent-mode.ts            # Gestión del modo agente
├── confirmation-modal.ts    # Modal de confirmación de acciones
└── templates/
    └── default.ts           # Template de notas con frontmatter
```

**Flujo principal:**
- `main.ts` inicializa plugin y registra `ChatView` como vista lateral
- `ChatView` usa `ClaudeClient` para streaming de mensajes
- Modo agente permite ejecutar acciones sobre la bóveda via lenguaje natural
- Respuestas se pueden convertir a notas via `NoteCreator` modal
- Settings persisten en `.obsidian/plugins/claudian/data.json`

## Key Patterns

**Obsidian API:**
- Extender `Plugin` para entry point
- Extender `ItemView` para paneles personalizados
- Extender `PluginSettingTab` para UI de configuración
- Usar `MarkdownRenderer.render()` para renderizar respuestas
- Usar `app.fileManager.processFrontMatter()` para modificar YAML

**Anthropic SDK:**
- Requiere `dangerouslyAllowBrowser: true` para funcionar en Obsidian
- Usar `client.messages.stream()` con eventos `on('text')` para streaming
- API key almacenada localmente, nunca en código

**CSS:**
- Usar variables de Obsidian (`--background-primary`, `--text-normal`, etc.)
- Soporte automático tema claro/oscuro
- Clases con prefijo `claudian-` para evitar conflictos

## Specifications

- `docs/obsidian-claude-plugin-spec.md` - Especificación completa del proyecto
- `docs/implementation-plan.md` - Plan de implementación por fases
- `docs/phase-4-vault-agent.md` - Documentación del modo agente

## Git Branching Strategy

**CRITICAL: Never commit directly to `main` branch.**

All changes must go through feature/fix branches and Pull Requests. This ensures code review, CI validation, and a clean commit history.

### Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features or enhancements | `feature/export-excel` |
| `feat/` | Alias for feature | `feat/folio-c5` |
| `fix/` | Bug fixes | `fix/report-form-tests` |
| `hotfix/` | Urgent production fixes | `hotfix/auth-bypass` |
| `docs/` | Documentation-only changes | `docs/api-reference` |
| `refactor/` | Code refactoring (no behavior change) | `refactor/catalog-service` |
| `test/` | Test-only changes | `test/bunit-coverage` |
