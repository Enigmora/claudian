/**
 * Claudian Logger
 *
 * Centralized logging with environment-aware filtering:
 * - Development: All levels (debug, info, warn, error)
 * - Production: Only warn and error (for user bug reports)
 */

// Injected by esbuild at build time
declare const __DEV__: boolean;

const PREFIX = '[Claudian]';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Check if we're in development mode
 */
export function isDev(): boolean {
  try {
    return __DEV__;
  } catch {
    // Fallback if __DEV__ is not defined
    return false;
  }
}

/**
 * Logger with level filtering based on environment
 */
export const logger = {
  /**
   * Debug messages - development only
   * Use for: detailed flow info, variable values, orchestrator decisions
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev()) {
      console.log(`${PREFIX} ${message}`, ...args);
    }
  },

  /**
   * Info messages - development only
   * Use for: lifecycle events, successful operations, state changes
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev()) {
      console.log(`${PREFIX} ${message}`, ...args);
    }
  },

  /**
   * Warning messages - always shown
   * Use for: recoverable errors, fallbacks, deprecated usage
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${PREFIX} ${message}`, ...args);
  },

  /**
   * Error messages - always shown
   * Use for: failures, exceptions, critical issues
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(`${PREFIX} ${message}`, ...args);
  },
};

export default logger;
