/**
 * Context Storage
 * Manages temporary files for context offloading, checkpoints, and plans.
 * Helps handle long conversations and complex tasks without saturating context window.
 */

import { Plugin } from 'obsidian';
import { logger } from './logger';

export interface TempFileMetadata {
  id: string;
  type: 'session' | 'plan' | 'checkpoint' | 'context' | 'partial';
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
  size: number;
  relatedSessionId?: string;
  description?: string;
}

export interface TempIndex {
  version: number;
  files: TempFileMetadata[];
  lastPurge: number;
  currentSessionId?: string;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  oldestFile?: TempFileMetadata;
  newestFile?: TempFileMetadata;
}

export class ContextStorage {
  private plugin: Plugin;
  private basePath: string;
  private index: TempIndex;
  private initialized: boolean = false;

  // Expiration times in milliseconds
  private static readonly EXPIRATION: Record<TempFileMetadata['type'], number> = {
    session: 24 * 60 * 60 * 1000,      // 24 hours
    plan: 4 * 60 * 60 * 1000,          // 4 hours
    checkpoint: 2 * 60 * 60 * 1000,    // 2 hours
    context: 12 * 60 * 60 * 1000,      // 12 hours
    partial: 1 * 60 * 60 * 1000        // 1 hour (truncated responses)
  };

  // Maximum storage size (50 MB)
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.basePath = `${plugin.manifest.dir}/temp`;
    this.index = { version: 1, files: [], lastPurge: 0 };
  }

  /**
   * Initialize storage - create folders and load index
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const adapter = this.plugin.app.vault.adapter;
    const folders = ['sessions', 'plans', 'checkpoints', 'context', 'partials'];

    // Create base temp folder
    if (!await adapter.exists(this.basePath)) {
      await adapter.mkdir(this.basePath);
    }

    // Create subfolders
    for (const folder of folders) {
      const path = `${this.basePath}/${folder}`;
      if (!await adapter.exists(path)) {
        await adapter.mkdir(path);
      }
    }

    // Load or create index
    await this.loadIndex();

    // Initial purge of expired files
    await this.purgeExpired();

    this.initialized = true;
  }

  /**
   * Load index from disk
   */
  private async loadIndex(): Promise<void> {
    const indexPath = `${this.plugin.manifest.dir}/temp-index.json`;
    const adapter = this.plugin.app.vault.adapter;

    try {
      if (await adapter.exists(indexPath)) {
        const content = await adapter.read(indexPath);
        this.index = JSON.parse(content) as TempIndex;
      }
    } catch {
      logger.warn(' Could not load temp index, creating new one');
      this.index = { version: 1, files: [], lastPurge: Date.now() };
    }
  }

  /**
   * Save index to disk
   */
  private async saveIndex(): Promise<void> {
    const indexPath = `${this.plugin.manifest.dir}/temp-index.json`;
    const adapter = this.plugin.app.vault.adapter;

    try {
      await adapter.write(indexPath, JSON.stringify(this.index, null, 2));
    } catch (error) {
      logger.error(' Could not save temp index:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get folder name for file type
   */
  private getFolderForType(type: TempFileMetadata['type']): string {
    const folderMap: Record<TempFileMetadata['type'], string> = {
      session: 'sessions',
      plan: 'plans',
      checkpoint: 'checkpoints',
      context: 'context',
      partial: 'partials'
    };
    return folderMap[type];
  }

  /**
   * Save data to a temporary file
   */
  async save(
    type: TempFileMetadata['type'],
    data: unknown,
    options?: {
      relatedSessionId?: string;
      description?: string;
      customExpiration?: number;
    }
  ): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const id = this.generateId();
    const now = Date.now();
    const expiration = options?.customExpiration || ContextStorage.EXPIRATION[type];

    const folder = this.getFolderForType(type);
    const filePath = `${this.basePath}/${folder}/${type}-${id}.json`;
    const content = JSON.stringify(data, null, 2);

    const metadata: TempFileMetadata = {
      id,
      type,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: now + expiration,
      size: content.length,
      relatedSessionId: options?.relatedSessionId,
      description: options?.description
    };

    try {
      await this.plugin.app.vault.adapter.write(filePath, content);
      this.index.files.push(metadata);
      await this.saveIndex();

      // Check if we need to purge due to size
      await this.checkStorageLimit();

      return id;
    } catch (error) {
      logger.error(` Could not save temp file ${id}:`, error);
      throw error;
    }
  }

  /**
   * Load data from a temporary file
   */
  async load<T>(type: TempFileMetadata['type'], id: string): Promise<T | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const folder = this.getFolderForType(type);
    const filePath = `${this.basePath}/${folder}/${type}-${id}.json`;

    try {
      if (await this.plugin.app.vault.adapter.exists(filePath)) {
        const content = await this.plugin.app.vault.adapter.read(filePath);

        // Update last accessed time
        const fileIndex = this.index.files.findIndex(f => f.id === id && f.type === type);
        if (fileIndex >= 0) {
          this.index.files[fileIndex].lastAccessedAt = Date.now();
          await this.saveIndex();
        }

        return JSON.parse(content) as T;
      }
    } catch (error) {
      logger.error(` Could not load temp file ${id}:`, error);
    }

    return null;
  }

  /**
   * Update an existing temporary file
   */
  async update(
    type: TempFileMetadata['type'],
    id: string,
    data: unknown
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    const folder = this.getFolderForType(type);
    const filePath = `${this.basePath}/${folder}/${type}-${id}.json`;

    try {
      if (await this.plugin.app.vault.adapter.exists(filePath)) {
        const content = JSON.stringify(data, null, 2);
        await this.plugin.app.vault.adapter.write(filePath, content);

        // Update metadata
        const fileIndex = this.index.files.findIndex(f => f.id === id && f.type === type);
        if (fileIndex >= 0) {
          this.index.files[fileIndex].lastAccessedAt = Date.now();
          this.index.files[fileIndex].size = content.length;
          await this.saveIndex();
        }

        return true;
      }
    } catch (error) {
      logger.error(` Could not update temp file ${id}:`, error);
    }

    return false;
  }

  /**
   * Delete a temporary file
   */
  async delete(type: TempFileMetadata['type'], id: string): Promise<boolean> {
    const folder = this.getFolderForType(type);
    const filePath = `${this.basePath}/${folder}/${type}-${id}.json`;

    try {
      if (await this.plugin.app.vault.adapter.exists(filePath)) {
        await this.plugin.app.vault.adapter.remove(filePath);
      }
    } catch (error) {
      logger.error(` Could not delete temp file ${id}:`, error);
      return false;
    }

    // Remove from index
    this.index.files = this.index.files.filter(f => !(f.id === id && f.type === type));
    await this.saveIndex();

    return true;
  }

  /**
   * Purge all expired files
   */
  async purgeExpired(): Promise<number> {
    const now = Date.now();
    const expiredFiles = this.index.files.filter(f => f.expiresAt < now);

    for (const file of expiredFiles) {
      await this.delete(file.type, file.id);
    }

    this.index.lastPurge = now;
    await this.saveIndex();

    if (expiredFiles.length > 0) {
      logger.debug(` Purged ${expiredFiles.length} expired temp files`);
    }

    return expiredFiles.length;
  }

  /**
   * Purge all files related to a session
   */
  async purgeBySession(sessionId: string): Promise<number> {
    const sessionFiles = this.index.files.filter(f => f.relatedSessionId === sessionId);

    for (const file of sessionFiles) {
      await this.delete(file.type, file.id);
    }

    return sessionFiles.length;
  }

  /**
   * Purge oldest files if storage limit exceeded
   */
  private async checkStorageLimit(): Promise<void> {
    const stats = this.getStats();

    if (stats.totalSize > ContextStorage.MAX_STORAGE_SIZE) {
      // Sort by last accessed (oldest first)
      const sortedFiles = [...this.index.files].sort(
        (a, b) => a.lastAccessedAt - b.lastAccessedAt
      );

      let currentSize = stats.totalSize;
      const targetSize = ContextStorage.MAX_STORAGE_SIZE * 0.8; // Reduce to 80%

      for (const file of sortedFiles) {
        if (currentSize <= targetSize) break;

        await this.delete(file.type, file.id);
        currentSize -= file.size;
      }
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    const stats: StorageStats = {
      totalFiles: this.index.files.length,
      totalSize: 0,
      byType: {}
    };

    let oldest: TempFileMetadata | undefined;
    let newest: TempFileMetadata | undefined;

    for (const file of this.index.files) {
      stats.totalSize += file.size;

      if (!stats.byType[file.type]) {
        stats.byType[file.type] = { count: 0, size: 0 };
      }
      stats.byType[file.type].count++;
      stats.byType[file.type].size += file.size;

      if (!oldest || file.createdAt < oldest.createdAt) {
        oldest = file;
      }
      if (!newest || file.createdAt > newest.createdAt) {
        newest = file;
      }
    }

    stats.oldestFile = oldest;
    stats.newestFile = newest;

    return stats;
  }

  /**
   * List all files of a specific type
   */
  listByType(type: TempFileMetadata['type']): TempFileMetadata[] {
    return this.index.files.filter(f => f.type === type);
  }

  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | undefined {
    return this.index.currentSessionId;
  }

  /**
   * Set the current session ID
   */
  async setCurrentSessionId(sessionId: string | undefined): Promise<void> {
    this.index.currentSessionId = sessionId;
    await this.saveIndex();
  }

  /**
   * Clean up all temp files (for testing or reset)
   */
  async purgeAll(): Promise<number> {
    const count = this.index.files.length;

    for (const file of [...this.index.files]) {
      await this.delete(file.type, file.id);
    }

    return count;
  }
}
