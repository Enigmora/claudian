/**
 * Claudian Internationalization Module
 *
 * Provides translation support for the plugin with:
 * - Automatic Obsidian language detection
 * - Manual language override in settings
 * - Type-safe translation keys
 * - Parameter interpolation
 *
 * @example
 * ```typescript
 * import { t, setLocale } from './i18n';
 *
 * // Initialize with user's preferred locale
 * await setLocale('es');
 *
 * // Use translations
 * const message = t('chat.send'); // "Enviar"
 *
 * // With parameters
 * const progress = t('batch.processing', { current: '5', total: '10' });
 * // "Procesando 5 de 10 notas..."
 * ```
 */

export {
  t,
  setLocale,
  getLocale,
  getSupportedLocales,
  resolveLocale,
  detectObsidianLocale,
  isLocaleSupported,
  initSync,
  isInitialized,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE
} from './core';

export type { Locale, Translations, TranslationKey } from './types';
