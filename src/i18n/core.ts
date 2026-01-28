import type { Locale, Translations, TranslationKey } from './types';
import { logger } from '../logger';
import enLocale from './locales/en';

// Lazy-loaded translations
let translations: Translations | null = null;
let currentLocale: Locale = 'en';

/**
 * Supported locales
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'es', 'zh', 'de', 'fr', 'ja'] as const;

/**
 * Default locale
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Detect locale from Obsidian settings
 * Uses localStorage where Obsidian stores its language preference
 */
export function detectObsidianLocale(): Locale {
  try {
    const obsidianLang = window.localStorage.getItem('language');
    if (obsidianLang && isLocaleSupported(obsidianLang)) {
      return obsidianLang;
    }
  } catch {
    // localStorage not available
  }
  return DEFAULT_LOCALE;
}

/**
 * Resolve locale based on settings and Obsidian preference
 * @param settingsLanguage - Language setting from plugin ('auto' or locale code)
 */
export function resolveLocale(settingsLanguage: string | undefined): Locale {
  // If user set a specific language, use it
  if (settingsLanguage && settingsLanguage !== 'auto' && isLocaleSupported(settingsLanguage)) {
    return settingsLanguage;
  }
  // Otherwise, auto-detect from Obsidian
  return detectObsidianLocale();
}

/**
 * Load translations for a locale
 */
async function loadTranslations(locale: Locale): Promise<Translations> {
  switch (locale) {
    case 'es':
      return (await import('./locales/es')).default;
    case 'zh':
      return (await import('./locales/zh')).default;
    case 'de':
      return (await import('./locales/de')).default;
    case 'fr':
      return (await import('./locales/fr')).default;
    case 'ja':
      return (await import('./locales/ja')).default;
    case 'en':
    default:
      return (await import('./locales/en')).default;
  }
}

/**
 * Initialize or change the current locale
 * @param locale - The locale to set
 */
export async function setLocale(locale: Locale): Promise<void> {
  if (!isLocaleSupported(locale)) {
    locale = DEFAULT_LOCALE;
  }
  currentLocale = locale;
  translations = await loadTranslations(locale);
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get all supported locales with their display names
 */
export function getSupportedLocales(): Array<{ code: Locale; name: string }> {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' }
  ];
}

/**
 * Translate a key to the current locale
 * Supports parameter interpolation with {{param}} syntax
 *
 * @param key - Translation key
 * @param params - Optional parameters for interpolation
 * @returns Translated string
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  if (!translations) {
    // Fallback: return key if translations not loaded
    logger.warn(`[i18n] Translations not loaded. Key: ${key}`);
    return key;
  }

  let text = translations[key];

  if (text === undefined) {
    logger.warn(`[i18n] Missing translation for key: ${key}`);
    return key;
  }

  // Parameter interpolation
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(value));
    }
  }

  return text;
}

/**
 * Synchronous initialization for use during plugin load
 * This loads English as default, then the proper locale can be set later
 */
export function initSync(): void {
  // Use the statically imported English locale
  translations = enLocale;
  currentLocale = 'en';
}

/**
 * Check if translations are loaded
 */
export function isInitialized(): boolean {
  return translations !== null;
}
