/**
 * Purge Strategies
 * Defines different strategies for cleaning up temporary files.
 */

import { ContextStorage, TempFileMetadata, StorageStats } from './context-storage';

export interface PurgeResult {
  strategy: string;
  purgedFiles: number;
  freedSpace: number;
  errors: string[];
}

export interface PurgeStrategy {
  name: string;
  priority: number; // Higher = purge first
  shouldPurge(file: TempFileMetadata, now: number, stats: StorageStats): boolean;
}

/**
 * Strategy 1: Purge expired files
 * Highest priority - always purge files past their expiration
 */
export class ExpiredPurgeStrategy implements PurgeStrategy {
  name = 'expired';
  priority = 100;

  shouldPurge(file: TempFileMetadata, now: number, _stats: StorageStats): boolean {
    return file.expiresAt < now;
  }
}

/**
 * Strategy 2: Purge based on total storage size
 * When total size exceeds limit, purge oldest files first
 */
export class SizeLimitPurgeStrategy implements PurgeStrategy {
  name = 'size-limit';
  priority = 80;

  private static readonly MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly TARGET_SIZE = 40 * 1024 * 1024; // 40MB (80% of max)

  private exceedsLimit: boolean = false;
  private currentSize: number = 0;

  shouldPurge(file: TempFileMetadata, _now: number, stats: StorageStats): boolean {
    // Check if we're over the limit
    if (!this.exceedsLimit) {
      this.exceedsLimit = stats.totalSize > SizeLimitPurgeStrategy.MAX_TOTAL_SIZE;
      this.currentSize = stats.totalSize;
    }

    if (!this.exceedsLimit) {
      return false;
    }

    // Purge until we reach target size
    if (this.currentSize <= SizeLimitPurgeStrategy.TARGET_SIZE) {
      return false;
    }

    // Mark for purge and track reduction
    this.currentSize -= file.size;
    return true;
  }

  reset(): void {
    this.exceedsLimit = false;
    this.currentSize = 0;
  }
}

/**
 * Strategy 3: Purge inactive files
 * Files not accessed for a certain period
 */
export class InactivePurgeStrategy implements PurgeStrategy {
  name = 'inactive';
  priority = 60;

  // Different thresholds by file type
  private static readonly INACTIVE_THRESHOLDS: Record<TempFileMetadata['type'], number> = {
    session: 4 * 60 * 60 * 1000,      // 4 hours
    plan: 2 * 60 * 60 * 1000,         // 2 hours
    checkpoint: 1 * 60 * 60 * 1000,   // 1 hour
    context: 6 * 60 * 60 * 1000,      // 6 hours
    partial: 30 * 60 * 1000           // 30 minutes
  };

  shouldPurge(file: TempFileMetadata, now: number, _stats: StorageStats): boolean {
    const threshold = InactivePurgeStrategy.INACTIVE_THRESHOLDS[file.type];
    return (now - file.lastAccessedAt) > threshold;
  }
}

/**
 * Strategy 4: Purge orphaned files
 * Files whose related session no longer exists
 */
export class OrphanedPurgeStrategy implements PurgeStrategy {
  name = 'orphaned';
  priority = 90;

  private activeSessions: Set<string>;

  constructor(activeSessions: string[]) {
    this.activeSessions = new Set(activeSessions);
  }

  shouldPurge(file: TempFileMetadata, _now: number, _stats: StorageStats): boolean {
    // If file has a related session, check if it still exists
    if (file.relatedSessionId) {
      return !this.activeSessions.has(file.relatedSessionId);
    }
    return false;
  }

  updateActiveSessions(sessions: string[]): void {
    this.activeSessions = new Set(sessions);
  }
}

/**
 * Strategy 5: Purge by file type quota
 * Each type has a maximum count/size
 */
export class TypeQuotaPurgeStrategy implements PurgeStrategy {
  name = 'type-quota';
  priority = 50;

  private static readonly TYPE_QUOTAS: Record<TempFileMetadata['type'], { maxCount: number; maxSize: number }> = {
    session: { maxCount: 5, maxSize: 10 * 1024 * 1024 },      // 5 sessions, 10MB
    plan: { maxCount: 10, maxSize: 5 * 1024 * 1024 },         // 10 plans, 5MB
    checkpoint: { maxCount: 20, maxSize: 5 * 1024 * 1024 },   // 20 checkpoints, 5MB
    context: { maxCount: 20, maxSize: 20 * 1024 * 1024 },     // 20 contexts, 20MB
    partial: { maxCount: 10, maxSize: 5 * 1024 * 1024 }       // 10 partials, 5MB
  };

  private typeCounts: Map<TempFileMetadata['type'], { count: number; size: number }> = new Map();

  shouldPurge(file: TempFileMetadata, now: number, stats: StorageStats): boolean {
    const quota = TypeQuotaPurgeStrategy.TYPE_QUOTAS[file.type];
    const typeStats = stats.byType[file.type];

    if (!typeStats) {
      return false;
    }

    // Initialize or get current counts
    if (!this.typeCounts.has(file.type)) {
      this.typeCounts.set(file.type, { count: typeStats.count, size: typeStats.size });
    }

    const current = this.typeCounts.get(file.type)!;

    // Check if over quota
    if (current.count > quota.maxCount || current.size > quota.maxSize) {
      current.count--;
      current.size -= file.size;
      return true;
    }

    return false;
  }

  reset(): void {
    this.typeCounts.clear();
  }
}

/**
 * Purge Manager
 * Coordinates multiple purge strategies
 */
export class PurgeManager {
  private storage: ContextStorage;
  private strategies: PurgeStrategy[];

  constructor(storage: ContextStorage, activeSessions: string[] = []) {
    this.storage = storage;
    this.strategies = [
      new ExpiredPurgeStrategy(),
      new OrphanedPurgeStrategy(activeSessions),
      new SizeLimitPurgeStrategy(),
      new InactivePurgeStrategy(),
      new TypeQuotaPurgeStrategy()
    ];
  }

  /**
   * Run all purge strategies
   */
  async runPurge(): Promise<PurgeResult> {
    const result: PurgeResult = {
      strategy: 'all',
      purgedFiles: 0,
      freedSpace: 0,
      errors: []
    };

    const stats = await this.storage.getStats();
    const now = Date.now();

    // Sort strategies by priority (highest first)
    const sortedStrategies = [...this.strategies].sort((a, b) => b.priority - a.priority);

    // Get all files and sort by last accessed (oldest first for fair purging)
    const allFiles = [
      ...this.storage.listByType('session'),
      ...this.storage.listByType('plan'),
      ...this.storage.listByType('checkpoint'),
      ...this.storage.listByType('context'),
      ...this.storage.listByType('partial')
    ].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

    const filesToPurge = new Set<string>();

    // Apply each strategy
    for (const strategy of sortedStrategies) {
      for (const file of allFiles) {
        // Skip if already marked for purge
        if (filesToPurge.has(`${file.type}:${file.id}`)) {
          continue;
        }

        try {
          if (strategy.shouldPurge(file, now, stats)) {
            filesToPurge.add(`${file.type}:${file.id}`);
          }
        } catch (error) {
          result.errors.push(`${strategy.name}: ${error}`);
        }
      }

      // Reset stateful strategies
      if ('reset' in strategy && typeof (strategy as { reset?: () => void }).reset === 'function') {
        (strategy as { reset: () => void }).reset();
      }
    }

    // Actually delete the files
    for (const fileKey of filesToPurge) {
      const [type, id] = fileKey.split(':');
      const file = allFiles.find(f => f.type === type && f.id === id);

      if (file) {
        try {
          const deleted = await this.storage.delete(file.type, file.id);
          if (deleted) {
            result.purgedFiles++;
            result.freedSpace += file.size;
          }
        } catch (error) {
          result.errors.push(`Delete ${fileKey}: ${error}`);
        }
      }
    }

    return result;
  }

  /**
   * Run only expired file purge (quick cleanup)
   */
  async runQuickPurge(): Promise<number> {
    return await this.storage.purgeExpired();
  }

  /**
   * Update active sessions for orphan detection
   */
  updateActiveSessions(sessions: string[]): void {
    const orphanStrategy = this.strategies.find(
      s => s instanceof OrphanedPurgeStrategy
    );

    if (orphanStrategy) {
      orphanStrategy.updateActiveSessions(sessions);
    }
  }
}
