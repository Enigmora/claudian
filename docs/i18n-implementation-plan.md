# Internationalization (i18n) Implementation Plan

> **Document Version:** 1.0
> **Created:** 2025-01-20
> **Status:** Planning

## Table of Contents

1. [Overview](#overview)
2. [Goals & Principles](#goals--principles)
3. [Language Roadmap](#language-roadmap)
4. [Technical Architecture](#technical-architecture)
5. [Implementation Phases](#implementation-phases)
6. [File Structure](#file-structure)
7. [Translation Scope](#translation-scope)
8. [RTL Considerations](#rtl-considerations)
9. [Contributor Guide](#contributor-guide)
10. [Testing Strategy](#testing-strategy)

---

## Overview

Claudian is currently implemented entirely in Spanish. This plan outlines the strategy to internationalize the plugin, starting with English (default) and Spanish, with subsequent phases adding Chinese, German, French, and Japanese.

### Current State

- **~90 hardcoded strings** across 10+ source files
- **No i18n infrastructure** exists
- **README.md** is in Spanish (needs English translation)
- **System prompts** and templates are in Spanish

### Target State

- Fully internationalized plugin with hybrid language detection
- English as default language
- User-configurable language override in settings
- All user-facing strings, templates, and prompts translated
- README.md and wiki in English (primary documentation language)

---

## Goals & Principles

### Primary Goals

1. **User Experience First** — Language should "just work" based on Obsidian's configured language
2. **Developer Experience** — Simple, type-safe translation system with autocomplete
3. **Maintainability** — Easy to add new languages without modifying core code
4. **Completeness** — All user-facing content must be translatable

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Hybrid Detection** | Auto-detect from Obsidian, allow manual override |
| **English Default** | Fallback to English for unsupported languages |
| **Type Safety** | TypeScript interfaces for translation keys |
| **Lazy Loading** | Load only the active language's translations |
| **No Dependencies** | Implement lightweight i18n without external libraries |

---

## Language Roadmap

### Phase 1: Foundation (Priority)

| Language | Code | Direction | Status |
|----------|------|-----------|--------|
| English | `en` | LTR | Default |
| Spanish | `es` | LTR | Current implementation |

**Scope:** Complete i18n infrastructure + all translations

### Phase 2: High-Demand Languages

| Language | Code | Direction | Status |
|----------|------|-----------|--------|
| Chinese (Simplified) | `zh` | LTR | Planned |
| German | `de` | LTR | Planned |

**Note:** Chinese uses LTR horizontal layout in modern web interfaces.

### Phase 3: Extended Support

| Language | Code | Direction | Status |
|----------|------|-----------|--------|
| French | `fr` | LTR | Planned |
| Japanese | `ja` | LTR | Planned |

**Note:** Japanese uses LTR horizontal layout in modern web interfaces.

---

## Technical Architecture

### Language Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Language Resolution                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Check plugin settings (settings.language)               │
│     └─► If 'auto' or undefined, continue to step 2         │
│     └─► If specific language, use it                       │
│                                                             │
│  2. Check Obsidian language                                 │
│     └─► window.localStorage.getItem('language')            │
│     └─► If supported language, use it                      │
│                                                             │
│  3. Fallback to English ('en')                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

```typescript
// src/i18n/index.ts - Main entry point
export { t, setLocale, getLocale, getSupportedLocales } from './core';
export type { Locale, TranslationKey } from './types';

// src/i18n/types.ts - Type definitions
export type Locale = 'en' | 'es' | 'zh' | 'de' | 'fr' | 'ja';
export type TranslationKey = keyof typeof import('./locales/en').default;

// src/i18n/core.ts - Runtime logic
let currentLocale: Locale = 'en';
let translations: Record<string, string> = {};

export function t(key: TranslationKey, params?: Record<string, string>): string;
export function setLocale(locale: Locale): Promise<void>;
export function getLocale(): Locale;
export function getSupportedLocales(): Locale[];
```

### Translation File Format

```typescript
// src/i18n/locales/en.ts
export default {
  // Settings
  'settings.title': 'Claudian Settings',
  'settings.apiKey.name': 'API Key',
  'settings.apiKey.desc': 'Your Anthropic API key',
  'settings.model.name': 'Model',
  'settings.model.desc': 'Claude model to use',

  // Chat
  'chat.placeholder': 'Type your message...',
  'chat.send': 'Send',
  'chat.createNote': 'Create note',
  'chat.cleared': 'Chat cleared',

  // Agent mode
  'agent.enabled': 'Agent mode enabled',
  'agent.disabled': 'Agent mode disabled',
  'agent.confirmation.title': 'Confirm Actions',

  // Errors
  'error.apiKey.invalid': 'Invalid API key',
  'error.apiKey.missing': 'API key is required',
  'error.rateLimit': 'Rate limit exceeded. Please wait.',
  'error.connection': 'Connection error. Check your internet.',

  // ... more keys
} as const;
```

### Parameter Interpolation

```typescript
// Translation with parameters
'batch.processing': 'Processing {{current}} of {{total}} notes...',

// Usage
t('batch.processing', { current: '5', total: '10' });
// Output: "Processing 5 of 10 notes..."
```

---

## Implementation Phases

### Phase 1A: Infrastructure Setup

**Goal:** Create i18n system and migrate existing Spanish strings

#### Tasks

1. **Create i18n module structure**
   ```
   src/i18n/
   ├── index.ts          # Public API exports
   ├── types.ts          # TypeScript types
   ├── core.ts           # Runtime logic
   └── locales/
       ├── en.ts         # English (translate from Spanish)
       └── es.ts         # Spanish (extract current strings)
   ```

2. **Implement core functions**
   - `t(key, params?)` — Get translated string
   - `setLocale(locale)` — Change active language
   - `getLocale()` — Get current language
   - `detectLocale(settings)` — Hybrid detection logic

3. **Add language setting**
   ```typescript
   // In ClaudianSettings interface
   language: 'auto' | 'en' | 'es';
   ```

4. **Create translation key inventory**
   - Extract all Spanish strings from source files
   - Organize into logical namespaces
   - Create TypeScript interface for type safety

### Phase 1B: String Migration

**Goal:** Replace all hardcoded strings with `t()` calls

#### Files to Migrate (Priority Order)

| File | Strings | Priority | Notes |
|------|---------|----------|-------|
| `settings.ts` | ~15 | High | Settings labels and descriptions |
| `chat-view.ts` | ~12 | High | Main user interface |
| `batch-modal.ts` | ~10 | High | Batch processing UI |
| `note-creator.ts` | ~8 | High | Note creation dialog |
| `confirmation-modal.ts` | ~6 | Medium | Destructive action confirmations |
| `suggestions-modal.ts` | ~8 | Medium | Tag/wikilink suggestions |
| `claude-client.ts` | ~12 | Medium | Error messages, system prompts |
| `extraction-templates.ts` | ~10 | Medium | Template names and descriptions |
| `main.ts` | ~4 | Low | Command names |
| `agent-mode.ts` | ~2 | Low | Agent messages |

#### Migration Pattern

```typescript
// Before
new Setting(containerEl)
  .setName('API Key')
  .setDesc('Tu clave de API de Anthropic');

// After
import { t } from './i18n';

new Setting(containerEl)
  .setName(t('settings.apiKey.name'))
  .setDesc(t('settings.apiKey.desc'));
```

### Phase 1C: Templates & Prompts

**Goal:** Internationalize system prompts and extraction templates

#### System Prompts

```typescript
// src/i18n/locales/en.ts
export default {
  // ... UI strings ...

  // System prompts (these are sent to Claude)
  'prompt.noteProcessor': `You are an assistant that analyzes notes...`,
  'prompt.agentMode': `You are an agent that manages an Obsidian vault...`,
  'prompt.conceptMap': `Analyze the following notes and generate...`,

  // Extraction templates
  'template.keyIdeas.name': 'Extract Key Ideas',
  'template.keyIdeas.desc': 'Summarize the main ideas from the note',
  'template.keyIdeas.prompt': 'Extract and list the key ideas from this note...',
};
```

### Phase 1D: Documentation

**Goal:** Translate README.md to English, update documentation

1. **Translate README.md** — Full English translation
2. **Create README_ES.md** — Keep Spanish version linked
3. **Update CLAUDE.md** — Keep bilingual (technical reference)
4. **Update docs/** — English as primary language

---

## File Structure

### Final Directory Structure

```
src/
├── i18n/
│   ├── index.ts              # Public exports
│   ├── types.ts              # TypeScript types
│   ├── core.ts               # Runtime logic (detection, loading)
│   ├── constants.ts          # Supported locales, defaults
│   └── locales/
│       ├── en.ts             # English (default)
│       ├── es.ts             # Spanish
│       ├── zh.ts             # Chinese (Phase 2)
│       ├── de.ts             # German (Phase 2)
│       ├── fr.ts             # French (Phase 3)
│       └── ja.ts             # Japanese (Phase 3)
├── main.ts
├── settings.ts
└── ... (other source files)
```

### Translation File Template

```typescript
// src/i18n/locales/{locale}.ts
import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════
  'settings.title': '',
  'settings.language.name': '',
  'settings.language.desc': '',
  'settings.language.auto': '',
  'settings.apiKey.name': '',
  'settings.apiKey.desc': '',
  'settings.apiKey.placeholder': '',
  'settings.model.name': '',
  'settings.model.desc': '',
  // ... more settings keys

  // ═══════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════
  'chat.placeholder': '',
  'chat.send': '',
  'chat.clear': '',
  'chat.createNote': '',
  'chat.agentMode': '',
  // ... more chat keys

  // ═══════════════════════════════════════════════════════════
  // MODALS
  // ═══════════════════════════════════════════════════════════
  'modal.confirm': '',
  'modal.cancel': '',
  'modal.noteCreator.title': '',
  // ... more modal keys

  // ═══════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════
  'error.apiKey.invalid': '',
  'error.apiKey.missing': '',
  'error.rateLimit': '',
  'error.connection': '',
  'error.unknown': '',
  // ... more error keys

  // ═══════════════════════════════════════════════════════════
  // SYSTEM PROMPTS (sent to Claude API)
  // ═══════════════════════════════════════════════════════════
  'prompt.noteProcessor': '',
  'prompt.agentMode': '',
  'prompt.conceptMap': '',
  'prompt.batchExtraction': '',

  // ═══════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════
  'template.keyIdeas.name': '',
  'template.keyIdeas.desc': '',
  'template.summary.name': '',
  'template.summary.desc': '',
  // ... more template keys
};

export default translations;
```

---

## Translation Scope

### Categories of Translatable Content

| Category | Description | Examples |
|----------|-------------|----------|
| **UI Labels** | Static text in interface | "Send", "Cancel", "Settings" |
| **Descriptions** | Help text and explanations | Setting descriptions |
| **Placeholders** | Input field hints | "Type your message..." |
| **Notifications** | Toast messages | "Chat cleared", "Note created" |
| **Errors** | Error messages | "Invalid API key" |
| **Commands** | Obsidian command names | "Open chat with Claude" |
| **System Prompts** | Instructions sent to Claude | Agent mode prompt |
| **Templates** | Extraction template definitions | "Extract Key Ideas" |

### String Inventory by File

#### `settings.ts` (~15 strings)

```typescript
// Section headers
'settings.section.api': 'API Configuration',
'settings.section.notes': 'Note Processing',
'settings.section.agent': 'Agent Mode',
'settings.section.advanced': 'Advanced',

// API settings
'settings.apiKey.name': 'API Key',
'settings.apiKey.desc': 'Your Anthropic API key from console.anthropic.com',
'settings.apiKey.placeholder': 'sk-ant-...',
'settings.model.name': 'Model',
'settings.model.desc': 'Claude model to use for responses',

// Note settings
'settings.folder.name': 'Notes Folder',
'settings.folder.desc': 'Destination folder for generated notes',
'settings.maxTokens.name': 'Max Tokens',
'settings.maxTokens.desc': 'Maximum tokens in responses',

// Context settings
'settings.contextNotes.name': 'Notes in Context',
'settings.contextNotes.desc': 'Number of note titles to include when processing',
'settings.contextTags.name': 'Tags in Context',
'settings.contextTags.desc': 'Number of tags to include when processing',
```

#### `chat-view.ts` (~12 strings)

```typescript
'chat.placeholder': 'Type your message...',
'chat.send': 'Send',
'chat.clear': 'Clear chat',
'chat.cleared': 'Chat cleared',
'chat.createNote': 'Create note',
'chat.copy': 'Copy',
'chat.copied': 'Copied to clipboard',
'chat.agentMode.label': 'Agent Mode',
'chat.agentMode.enabled': 'Agent mode enabled',
'chat.agentMode.disabled': 'Agent mode disabled',
'chat.thinking': 'Claude is thinking...',
'chat.error': 'Error sending message',
```

#### `claude-client.ts` (~12 strings)

```typescript
// Error messages
'error.apiKey.missing': 'API key is required. Configure it in settings.',
'error.apiKey.invalid': 'Invalid API key. Check your key in settings.',
'error.rateLimit': 'Rate limit exceeded. Please wait a moment.',
'error.overloaded': 'Claude is overloaded. Try again later.',
'error.connection': 'Connection error. Check your internet connection.',
'error.unknown': 'An unexpected error occurred.',

// System prompts (long form)
'prompt.default': 'You are Claude, an AI assistant...',
'prompt.noteContext': 'Context from the user\'s vault...',
```

---

## RTL Considerations

### Current Language Support

| Language | Code | Direction | RTL Support Needed |
|----------|------|-----------|-------------------|
| English | `en` | LTR | No |
| Spanish | `es` | LTR | No |
| Chinese | `zh` | LTR | No |
| German | `de` | LTR | No |
| French | `fr` | LTR | No |
| Japanese | `ja` | LTR | No |

**Result:** None of the planned languages require RTL support.

### Future RTL Considerations

If RTL languages (Arabic, Hebrew, Persian, Urdu) are added in the future:

1. **CSS Preparation**
   ```css
   /* Future-proof with logical properties */
   .claudian-container {
     padding-inline-start: 1rem;  /* Instead of padding-left */
     margin-inline-end: 0.5rem;   /* Instead of margin-right */
   }
   ```

2. **Direction Attribute**
   ```typescript
   // Set direction based on locale
   containerEl.setAttribute('dir', isRTL(locale) ? 'rtl' : 'ltr');
   ```

3. **Bidirectional Text**
   ```css
   .claudian-chat-message {
     unicode-bidi: plaintext;
   }
   ```

### Recommendation

For Phase 1-3, no RTL infrastructure is needed. Document the approach for future contributors who may add RTL languages.

---

## Contributor Guide

### Adding a New Translation

1. **Create translation file**
   ```bash
   cp src/i18n/locales/en.ts src/i18n/locales/{code}.ts
   ```

2. **Register the locale**
   ```typescript
   // src/i18n/constants.ts
   export const SUPPORTED_LOCALES = ['en', 'es', 'zh', 'de', 'fr', 'ja', '{code}'] as const;
   ```

3. **Translate all strings**
   - Keep the same keys
   - Translate only the values
   - Preserve parameter placeholders (`{{param}}`)

4. **Test the translation**
   - Set `language: '{code}'` in plugin settings
   - Verify all UI elements display correctly
   - Check for text overflow issues

### Translation Guidelines

| Guideline | Description |
|-----------|-------------|
| **Preserve placeholders** | Keep `{{variable}}` exactly as-is |
| **Match tone** | Professional but friendly |
| **Consider length** | Some languages are longer; test UI fit |
| **Use native terms** | Prefer native tech terms when natural |
| **Be consistent** | Use same translation for same term |

### Quality Checklist

- [ ] All keys have translations (no empty strings)
- [ ] Placeholders preserved correctly
- [ ] UI tested at different window sizes
- [ ] Error messages are helpful and clear
- [ ] Technical terms are appropriate for audience

---

## Testing Strategy

### Manual Testing

1. **Language switching**
   - Change language in settings
   - Verify immediate UI update
   - Restart plugin, verify persistence

2. **Auto-detection**
   - Set Obsidian to Spanish, verify Spanish UI
   - Set Obsidian to English, verify English UI
   - Set Obsidian to unsupported language, verify English fallback

3. **UI coverage**
   - Settings tab
   - Chat panel
   - All modals (note creator, batch, confirmation, suggestions)
   - Notifications/toasts
   - Error states

### Automated Testing (Future)

```typescript
// Example test structure
describe('i18n', () => {
  it('should detect Obsidian locale', () => {
    localStorage.setItem('language', 'es');
    expect(detectLocale({ language: 'auto' })).toBe('es');
  });

  it('should fallback to English for unsupported locales', () => {
    localStorage.setItem('language', 'ko');
    expect(detectLocale({ language: 'auto' })).toBe('en');
  });

  it('should respect manual override', () => {
    localStorage.setItem('language', 'es');
    expect(detectLocale({ language: 'en' })).toBe('en');
  });

  it('should have all keys in all locales', () => {
    const enKeys = Object.keys(en);
    const esKeys = Object.keys(es);
    expect(esKeys).toEqual(enKeys);
  });
});
```

---

## Implementation Timeline

### Phase 1: Foundation (Current Priority)

| Step | Description | Status |
|------|-------------|--------|
| 1A | Create i18n infrastructure | Pending |
| 1B | Migrate strings (Spanish extraction) | Pending |
| 1C | Create English translations | Pending |
| 1D | Internationalize templates & prompts | Pending |
| 1E | Translate README.md to English | Pending |
| 1F | Testing & QA | Pending |

### Phase 2: Chinese & German

| Step | Description | Status |
|------|-------------|--------|
| 2A | Create Chinese (zh) translations | Planned |
| 2B | Create German (de) translations | Planned |
| 2C | Testing & QA | Planned |

### Phase 3: French & Japanese

| Step | Description | Status |
|------|-------------|--------|
| 3A | Create French (fr) translations | Planned |
| 3B | Create Japanese (ja) translations | Planned |
| 3C | Testing & QA | Planned |

---

## Appendix: String Extraction Commands

### Find all Spanish strings (development helper)

```bash
# Find quoted strings in TypeScript files
grep -rn "'[A-ZÁÉÍÓÚÑ]" src/ --include="*.ts"
grep -rn '"[A-ZÁÉÍÓÚÑ]' src/ --include="*.ts"

# Find template literals with Spanish
grep -rn '\`[^`]*[áéíóúñ]' src/ --include="*.ts"
```

---

## References

- [Obsidian Forum: A way to get Obsidian's currently set language](https://forum.obsidian.md/t/a-way-to-get-obsidian-s-currently-set-language/17829)
- [Obsidian Forum: Integrating i18next for a plugin](https://forum.obsidian.md/t/integrating-i18next-for-a-plugin/54907)
- [Obsidian Forum: Translation of plugins to other languages](https://forum.obsidian.md/t/translation-of-plugins-to-other-languages/15715)
