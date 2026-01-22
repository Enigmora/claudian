/**
 * Token Usage Tracking Module
 * Phase 5: Tracks API token consumption per session and historically
 */

export type UsageMethod = 'chat' | 'agent' | 'process' | 'template' | 'conceptMap';

/**
 * Token usage from a single API call
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
  method?: UsageMethod;
}

/**
 * Aggregated token statistics
 */
export interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}

/**
 * Historical token usage data (persisted to data.json)
 */
export interface TokenUsageHistory {
  daily: Record<string, TokenStats>;   // YYYY-MM-DD
  weekly: Record<string, TokenStats>;  // YYYY-Www
  monthly: Record<string, TokenStats>; // YYYY-MM
  allTime: TokenStats;
  lastUpdated: number;
}

/**
 * Session-specific token statistics (in-memory only)
 */
export interface SessionTokenStats extends TokenStats {
  startTime: number;
}

/**
 * Callback type for usage updates
 */
export type UsageUpdateCallback = (session: SessionTokenStats) => void;

/**
 * Default empty history
 */
export function createEmptyHistory(): TokenUsageHistory {
  return {
    daily: {},
    weekly: {},
    monthly: {},
    allTime: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      callCount: 0
    },
    lastUpdated: 0
  };
}

/**
 * Default empty session stats
 */
function createEmptySessionStats(): SessionTokenStats {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    callCount: 0,
    startTime: Date.now()
  };
}

/**
 * Get date key in YYYY-MM-DD format (local timezone)
 */
function getDailyKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get week key in YYYY-Www format (local timezone)
 */
function getWeeklyKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get month key in YYYY-MM format (local timezone)
 */
function getMonthlyKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Merge token stats into existing stats
 */
function mergeStats(existing: TokenStats, usage: TokenUsage): TokenStats {
  return {
    inputTokens: existing.inputTokens + usage.inputTokens,
    outputTokens: existing.outputTokens + usage.outputTokens,
    totalTokens: existing.totalTokens + usage.inputTokens + usage.outputTokens,
    callCount: existing.callCount + 1
  };
}

/**
 * Get or create stats for a given key in a record
 */
function getOrCreateStats(record: Record<string, TokenStats>, key: string): TokenStats {
  if (!record[key]) {
    record[key] = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      callCount: 0
    };
  }
  return record[key];
}

/**
 * Token Usage Tracker
 * Tracks token consumption per session and historically
 */
export class TokenUsageTracker {
  private sessionStats: SessionTokenStats;
  private history: TokenUsageHistory;
  private saveCallback: ((history: TokenUsageHistory) => void) | null = null;
  private saveDebounceTimer: number | null = null;
  private readonly SAVE_DEBOUNCE_MS = 500;
  private updateCallbacks: Set<UsageUpdateCallback> = new Set();

  constructor(history?: TokenUsageHistory) {
    this.sessionStats = createEmptySessionStats();
    this.history = history || createEmptyHistory();
  }

  /**
   * Set the callback for persisting history
   */
  setSaveCallback(callback: (history: TokenUsageHistory) => void): void {
    this.saveCallback = callback;
  }

  /**
   * Register a callback for usage updates
   */
  onUsageUpdate(callback: UsageUpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  /**
   * Track token usage from an API call
   */
  trackUsage(usage: TokenUsage): void {
    // Update session stats
    this.sessionStats.inputTokens += usage.inputTokens;
    this.sessionStats.outputTokens += usage.outputTokens;
    this.sessionStats.totalTokens += usage.inputTokens + usage.outputTokens;
    this.sessionStats.callCount += 1;

    // Update historical stats
    const date = new Date(usage.timestamp);
    const dailyKey = getDailyKey(date);
    const weeklyKey = getWeeklyKey(date);
    const monthlyKey = getMonthlyKey(date);

    this.history.daily[dailyKey] = mergeStats(
      getOrCreateStats(this.history.daily, dailyKey),
      usage
    );

    this.history.weekly[weeklyKey] = mergeStats(
      getOrCreateStats(this.history.weekly, weeklyKey),
      usage
    );

    this.history.monthly[monthlyKey] = mergeStats(
      getOrCreateStats(this.history.monthly, monthlyKey),
      usage
    );

    this.history.allTime = mergeStats(this.history.allTime, usage);
    this.history.lastUpdated = Date.now();

    // Notify update callbacks
    this.notifyUpdate();

    // Debounced save
    this.debouncedSave();
  }

  /**
   * Get current session statistics
   */
  getSessionStats(): SessionTokenStats {
    return { ...this.sessionStats };
  }

  /**
   * Get historical statistics
   */
  getHistory(): TokenUsageHistory {
    return { ...this.history };
  }

  /**
   * Get today's statistics
   */
  getTodayStats(): TokenStats {
    const key = getDailyKey();
    return this.history.daily[key] || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      callCount: 0
    };
  }

  /**
   * Get this week's statistics
   */
  getThisWeekStats(): TokenStats {
    const key = getWeeklyKey();
    return this.history.weekly[key] || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      callCount: 0
    };
  }

  /**
   * Get this month's statistics
   */
  getThisMonthStats(): TokenStats {
    const key = getMonthlyKey();
    return this.history.monthly[key] || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      callCount: 0
    };
  }

  /**
   * Get all-time statistics
   */
  getAllTimeStats(): TokenStats {
    return { ...this.history.allTime };
  }

  /**
   * Reset session statistics
   */
  resetSession(): void {
    this.sessionStats = createEmptySessionStats();
    this.notifyUpdate();
  }

  /**
   * Format token count for display (e.g., "1.2K", "3.5M")
   */
  formatTokenCount(n: number): string {
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return String(n);
  }

  /**
   * Notify all update callbacks
   */
  private notifyUpdate(): void {
    const stats = this.getSessionStats();
    for (const callback of this.updateCallbacks) {
      try {
        callback(stats);
      } catch (e) {
        console.error('Error in usage update callback:', e);
      }
    }
  }

  /**
   * Debounced save to prevent excessive writes
   */
  private debouncedSave(): void {
    if (this.saveDebounceTimer !== null) {
      window.clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = window.setTimeout(() => {
      this.saveDebounceTimer = null;
      if (this.saveCallback) {
        this.saveCallback(this.history);
      }
    }, this.SAVE_DEBOUNCE_MS);
  }

  /**
   * Clean up old historical data (optional, for future use)
   * Keeps last N days/weeks/months of data
   */
  cleanupOldData(keepDays: number = 90, keepWeeks: number = 52, keepMonths: number = 24): void {
    const now = new Date();

    // Clean daily data
    const cutoffDaily = new Date(now);
    cutoffDaily.setDate(cutoffDaily.getDate() - keepDays);
    const cutoffDailyKey = getDailyKey(cutoffDaily);

    for (const key of Object.keys(this.history.daily)) {
      if (key < cutoffDailyKey) {
        delete this.history.daily[key];
      }
    }

    // Clean weekly data
    const cutoffWeekly = new Date(now);
    cutoffWeekly.setDate(cutoffWeekly.getDate() - (keepWeeks * 7));
    const cutoffWeeklyKey = getWeeklyKey(cutoffWeekly);

    for (const key of Object.keys(this.history.weekly)) {
      if (key < cutoffWeeklyKey) {
        delete this.history.weekly[key];
      }
    }

    // Clean monthly data
    const cutoffMonthly = new Date(now);
    cutoffMonthly.setMonth(cutoffMonthly.getMonth() - keepMonths);
    const cutoffMonthlyKey = getMonthlyKey(cutoffMonthly);

    for (const key of Object.keys(this.history.monthly)) {
      if (key < cutoffMonthlyKey) {
        delete this.history.monthly[key];
      }
    }

    this.debouncedSave();
  }
}
