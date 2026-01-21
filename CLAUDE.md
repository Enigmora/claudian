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
├── i18n/                    # Internationalization system
│   ├── index.ts             # Public API (t, setLocale, etc.)
│   ├── types.ts             # TypeScript types and translation keys
│   ├── core.ts              # Runtime logic
│   └── locales/
│       ├── en.ts            # English translations (default)
│       └── es.ts            # Spanish translations
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

## Internationalization (i18n)

**CRITICAL: All user-visible strings must be internationalized.**

Every string displayed to the user (UI labels, messages, errors, tooltips, system prompts, etc.) must use the translation function `t()` from the i18n module. Never hardcode user-facing text.

```typescript
// ✅ Correct
import { t } from './i18n';
new Notice(t('error.apiKeyMissing'));
button.setButtonText(t('chat.send'));

// ❌ Wrong - hardcoded strings
new Notice('API key not configured');
button.setButtonText('Send');
```

**Adding new strings:**
1. Add the translation key to `src/i18n/types.ts`
2. Add translations in `src/i18n/locales/en.ts` (required)
3. Add translations in `src/i18n/locales/es.ts` (required)
4. Use `t('your.key')` in the code

**Parameter interpolation:**
```typescript
t('batch.processing', { current: 5, total: 10, note: 'My Note' })
// "Processing 5/10: My Note"
```

**Supported locales:**
- Phase 1 (current): `en` (default), `es`
- Phase 2 (planned): `zh`, `de`
- Phase 3 (planned): `fr`, `ja`

## Documentation

**CRITICAL: README.md must always be in English.**

The main `README.md` file is the source of truth for project documentation and must be written in English. When making changes to documentation:

1. Always update `README.md` (English) first
2. Immediately propagate changes to all localized README files:
   - `README_ES.md` (Spanish)
   - Future: `README_ZH.md`, `README_DE.md`, etc.
3. Keep all README versions in sync—no version should have outdated information

This ensures consistency across all documentation and maintains English as the canonical source.

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
