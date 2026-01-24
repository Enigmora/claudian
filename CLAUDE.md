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
├── settings.ts              # PluginSettingTab con config (API key, modo, etc.)
├── claude-client.ts         # Wrapper Anthropic SDK con streaming
├── chat-view.ts             # ItemView para panel lateral de chat
├── model-orchestrator.ts    # Enrutador inteligente de modelos
├── logger.ts                # Sistema de logging centralizado
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
├── context-manager.ts       # Gestión de contexto de conversación
├── context-storage.ts       # Almacenamiento temporal de contexto
├── i18n/                    # Internationalization system
│   ├── index.ts             # Public API (t, setLocale, etc.)
│   ├── types.ts             # TypeScript types and translation keys
│   ├── core.ts              # Runtime logic
│   └── locales/
│       ├── en.ts            # English translations (default)
│       ├── es.ts            # Spanish translations
│       └── zh.ts            # Chinese translations (Simplified)
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
4. Add translations in `src/i18n/locales/zh.ts` (required)
5. Use `t('your.key')` in the code

**Parameter interpolation:**
```typescript
t('batch.processing', { current: 5, total: 10, note: 'My Note' })
// "Processing 5/10: My Note"
```

**Supported locales:**
- Phase 1 (current): `en` (default), `es`
- Phase 2 (current): `zh`
- Phase 3 (planned): `de`
- Phase 4 (planned): `fr`, `ja`

**Multilingual regex patterns:**

Some features use regex patterns that match user input in multiple languages. When adding new locales, search for these patterns and add the corresponding translations:

| Location | Variable | Purpose |
|----------|----------|---------|
| `src/continuation-handler.ts` | `continuationPatterns` | Detects continuation commands ("continúa", "continue", "继续", etc.) |
| `src/response-validator.ts` | `ACTION_CLAIM_PATTERNS` | Detects action claims in responses |
| `src/response-validator.ts` | `CONFUSION_PATTERNS` | Detects model confusion about capabilities |
| `src/context-reinforcer.ts` | `confusionPatterns` | Detects when model forgets agent mode |
| `src/context-reinforcer.ts` | `actionPatterns` | Detects action requests in user messages |
| `src/task-planner.ts` | `COMPLEXITY_PATTERNS` | Detects complex task indicators |
| `src/task-planner.ts` | `MULTI_FILE_PATTERNS` | Detects multi-file requests |
| `src/task-planner.ts` | `ACTION_KEYWORDS` | Action keyword matching |
| `src/welcome-examples-generator.ts` | `STOP_WORDS` | Common words to filter from topic extraction |

Example of adding German patterns:
```typescript
// Existing patterns
/^contin[uú]a?r?$/i,  // Spanish
/^continue$/i,         // English

// Add German
/^weiter$/i,           // German: "continue"
/^fortfahren$/i,       // German: "proceed"

// Chinese (already implemented)
/^继续$/,              // Chinese: "continue"
/^接着$/,              // Chinese: "go on"
```

## Logging

**CRITICAL: Never use `console.log`, `console.warn`, or `console.error` directly.**

All debug and error messages must use the centralized logger from `src/logger.ts`. This ensures:
- Production builds only show warnings and errors (for user bug reports)
- Development builds show all log levels for debugging
- Consistent `[Claudian]` prefix across all messages

```typescript
// ✅ Correct
import { logger } from './logger';
logger.debug('Orchestrator classified task as simple');
logger.info('Context session initialized');
logger.warn('Task classification failed, using fallback');
logger.error('API Error:', error);

// ❌ Wrong - direct console usage
console.log('[Claudian] Something happened');
console.error('Error:', error);
```

**Log levels:**

| Level | Production | Development | Use For |
|-------|------------|-------------|---------|
| `debug` | Hidden | Visible | Detailed flow, variable values, orchestrator decisions |
| `info` | Hidden | Visible | Lifecycle events, successful operations, state changes |
| `warn` | Visible | Visible | Recoverable errors, fallbacks, deprecated usage |
| `error` | Visible | Visible | Failures, exceptions, critical issues |

**Guidelines:**
- Use `debug` for information only developers need during development
- Use `info` for notable events (migrations, session start/end)
- Use `warn` for issues that don't break functionality but should be noted
- Use `error` for failures that users might need to report

The `__DEV__` constant is injected at build time by esbuild to determine the environment.

## Documentation

**CRITICAL: README.md must always be in English.**

The main `README.md` file is the source of truth for project documentation and must be written in English. When making changes to documentation:

1. Always update `README.md` (English) first
2. Immediately propagate changes to all localized README files:
   - `README_ES.md` (Spanish)
   - Future: `README_ZH.md`, `README_DE.md`, etc.
3. Keep all README versions in sync—no version should have outdated information

This ensures consistency across all documentation and maintains English as the canonical source.

## Wiki Documentation

**CRITICAL: Wiki canonical source is English.**

Wiki documentation is stored in `/wiki` folder and follows these conventions:

**File naming:**
- English (canonical): `Page-Name.md`
- Spanish: `Page-Name.es.md`
- Future locales: `Page-Name.{locale}.md`

**Wiki structure:**
```
wiki/
├── Home.md                    # Main landing page
├── Getting-Started.md         # Installation & setup
├── Configuration.md           # Settings reference
├── Troubleshooting.md         # Common issues
├── FAQ.md                     # Frequently asked questions
├── Features/
│   ├── Chat-Interface.md      # Chat feature docs
│   ├── Agent-Mode.md          # Agent mode docs
│   ├── Batch-Processing.md    # Batch processing
│   └── Concept-Maps.md        # Concept maps
├── _Sidebar.md                # Navigation sidebar
├── _Footer.md                 # Footer with credits
└── images/                    # Screenshots (shared across languages)
```

**Update workflow:**
1. Always update English version first
2. Immediately update all localized versions (`.es.md`, etc.)
3. Keep structure identical across languages
4. Images are shared across all languages (stored in `wiki/images/`)

**Adding new pages:**
1. Create English version first
2. Create translations for all supported locales
3. Update `_Sidebar.md` and `_Sidebar.{locale}.md`
4. Add any required screenshots to `wiki/images/`

**Screenshots:**
- Store in `wiki/images/`
- Use descriptive kebab-case names
- Recommended width: 800px
- Document new screenshots in `docs/wiki-screenshots-guide.md`

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

## Releases

Releases are automated via GitHub Actions. To create a new release:

1. Update version in `manifest.json` and `package.json`
2. Commit and push changes to `main`
3. Create and push a version tag:
   ```bash
   git tag -a v1.0.0 -m "v1.0.0"
   git push origin v1.0.0
   ```
4. GitHub Actions will automatically:
   - Build the plugin
   - Verify manifest version matches tag
   - Create a GitHub Release with `main.js`, `manifest.json`, and `styles.css`

**Version format:** Use semantic versioning (e.g., `v1.0.0`, `v1.2.3`)
