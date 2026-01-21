import { TFile, TFolder, TAbstractFile, Notice } from 'obsidian';
import ClaudeCompanionPlugin from './main';

export type ActionType =
  | 'create-folder' | 'delete-folder' | 'list-folder'
  | 'create-note' | 'read-note' | 'delete-note' | 'rename-note' | 'move-note'
  | 'append-content' | 'prepend-content' | 'replace-content' | 'update-frontmatter'
  | 'search-notes' | 'get-note-info' | 'find-links';

export interface VaultAction {
  action: ActionType;
  params: Record<string, any>;
  description?: string;
}

export interface ActionResult {
  success: boolean;
  action: VaultAction;
  result?: any;
  error?: string;
}

export interface ActionProgress {
  current: number;
  total: number;
  action: VaultAction;
  result?: ActionResult;
}

export type ProgressCallback = (progress: ActionProgress) => void;

export class VaultActionExecutor {
  private plugin: ClaudeCompanionPlugin;

  constructor(plugin: ClaudeCompanionPlugin) {
    this.plugin = plugin;
  }

  async execute(action: VaultAction): Promise<ActionResult> {
    try {
      const result = await this.executeAction(action);
      return {
        success: true,
        action,
        result
      };
    } catch (error) {
      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async executeAll(actions: VaultAction[], onProgress?: ProgressCallback): Promise<ActionResult[]> {
    const results: ActionResult[] = [];
    const total = actions.length;

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      // Notify progress before execution
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          action
        });
      }

      const result = await this.execute(action);
      results.push(result);

      // Notify progress after execution with result
      if (onProgress) {
        onProgress({
          current: i + 1,
          total,
          action,
          result
        });
      }

      // Si una acción falla, continuar pero registrar
      if (!result.success) {
        console.warn(`Acción fallida: ${action.action}`, result.error);
      }
    }

    return results;
  }

  private async executeAction(action: VaultAction): Promise<any> {
    const { params } = action;

    switch (action.action) {
      // Gestión de carpetas
      case 'create-folder':
        return this.createFolder(params.path);

      case 'delete-folder':
        return this.deleteFolder(params.path);

      case 'list-folder':
        return this.listFolder(params.path, params.recursive);

      // Gestión de notas
      case 'create-note':
        return this.createNote(params.path, params.content, params.frontmatter, params.overwrite);

      case 'read-note':
        return this.readNote(params.path);

      case 'delete-note':
        return this.deleteNote(params.path);

      case 'rename-note':
        return this.renameNote(params.from, params.to);

      case 'move-note':
        return this.moveNote(params.from, params.to);

      // Modificación de contenido
      case 'append-content':
        return this.appendContent(params.path, params.content);

      case 'prepend-content':
        return this.prependContent(params.path, params.content);

      case 'replace-content':
        return this.replaceContent(params.path, params.content);

      case 'update-frontmatter':
        return this.updateFrontmatter(params.path, params.fields);

      // Búsqueda
      case 'search-notes':
        return this.searchNotes(params.query, params.field, params.folder);

      case 'get-note-info':
        return this.getNoteInfo(params.path);

      case 'find-links':
        return this.findLinks(params.target);

      default:
        throw new Error(`Acción desconocida: ${action.action}`);
    }
  }

  // ==================== Gestión de Carpetas ====================

  private async createFolder(path: string): Promise<{ created: boolean; path: string }> {
    // Sanitize path to prevent filesystem issues
    const normalizedPath = this.sanitizePath(path);

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(`Ruta protegida: ${normalizedPath}`);
    }

    const existing = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (existing) {
      return { created: false, path: normalizedPath };
    }

    await this.plugin.app.vault.createFolder(normalizedPath);
    return { created: true, path: normalizedPath };
  }

  private async deleteFolder(path: string): Promise<{ deleted: boolean }> {
    const normalizedPath = this.normalizePath(path);

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(`Ruta protegida: ${normalizedPath}`);
    }

    const folder = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (!folder || !(folder instanceof TFolder)) {
      throw new Error(`Carpeta no encontrada: ${normalizedPath}`);
    }

    if (folder.children.length > 0) {
      throw new Error(`La carpeta no está vacía: ${normalizedPath}`);
    }

    await this.plugin.app.vault.delete(folder);
    return { deleted: true };
  }

  private async listFolder(path: string, recursive: boolean = false): Promise<{
    folders: string[];
    files: string[];
  }> {
    const normalizedPath = path ? this.normalizePath(path) : '';
    const folder = normalizedPath
      ? this.plugin.app.vault.getAbstractFileByPath(normalizedPath)
      : this.plugin.app.vault.getRoot();

    if (!folder || !(folder instanceof TFolder)) {
      throw new Error(`Carpeta no encontrada: ${normalizedPath || '/'}`);
    }

    const folders: string[] = [];
    const files: string[] = [];

    const processFolder = (f: TFolder) => {
      for (const child of f.children) {
        if (child instanceof TFolder) {
          folders.push(child.path);
          if (recursive) {
            processFolder(child);
          }
        } else if (child instanceof TFile) {
          files.push(child.path);
        }
      }
    };

    processFolder(folder);
    return { folders, files };
  }

  // ==================== Gestión de Notas ====================

  private async createNote(
    path: string,
    content?: string,
    frontmatter?: Record<string, any>,
    overwrite?: boolean
  ): Promise<{ path: string; created: boolean; overwritten?: boolean }> {
    // Sanitize path to prevent filesystem issues
    let normalizedPath = this.sanitizePath(path);

    // Asegurar extensión .md
    if (!normalizedPath.endsWith('.md')) {
      normalizedPath += '.md';
    }

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(`Ruta protegida: ${normalizedPath}`);
    }

    // Verificar si ya existe
    const existing = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (existing) {
      if (!overwrite) {
        throw new Error(`Ya existe un archivo: ${normalizedPath}. Usa overwrite: true para sobreescribir.`);
      }
      // Overwrite existing file
      if (existing instanceof TFile) {
        await this.plugin.app.vault.modify(existing, content || '');
        // Update frontmatter if provided
        if (frontmatter && Object.keys(frontmatter).length > 0) {
          await this.plugin.app.fileManager.processFrontMatter(existing, (fm) => {
            // Clear existing and set new
            Object.keys(fm).forEach(key => delete fm[key]);
            Object.assign(fm, frontmatter);
          });
        }
        return { path: normalizedPath, created: false, overwritten: true };
      }
    }

    // Crear carpetas padres recursivamente si no existen
    const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
    if (parentPath) {
      await this.ensureFolderExists(parentPath);
    }

    // Crear nota
    const file = await this.plugin.app.vault.create(normalizedPath, content || '');

    // Aplicar frontmatter si se proporciona
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      await this.plugin.app.fileManager.processFrontMatter(file, (fm) => {
        Object.assign(fm, frontmatter);
      });
    }

    return { path: normalizedPath, created: true };
  }

  private async readNote(path: string): Promise<{ content: string; frontmatter: any }> {
    const normalizedPath = this.normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    const content = await this.plugin.app.vault.read(file);
    const cache = this.plugin.app.metadataCache.getFileCache(file);

    return {
      content,
      frontmatter: cache?.frontmatter || {}
    };
  }

  private async deleteNote(path: string): Promise<{ deleted: boolean }> {
    const normalizedPath = this.normalizePath(path);

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(`Ruta protegida: ${normalizedPath}`);
    }

    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    await this.plugin.app.vault.delete(file);
    return { deleted: true };
  }

  private async renameNote(from: string, to: string): Promise<{ from: string; to: string }> {
    const normalizedFrom = this.normalizePath(from);
    // Sanitize destination path
    let normalizedTo = this.sanitizePath(to);

    if (!normalizedTo.endsWith('.md')) {
      normalizedTo += '.md';
    }

    if (this.isProtectedPath(normalizedFrom) || this.isProtectedPath(normalizedTo)) {
      throw new Error('Ruta protegida');
    }

    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedFrom);
    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedFrom}`);
    }

    await this.plugin.app.fileManager.renameFile(file, normalizedTo);
    return { from: normalizedFrom, to: normalizedTo };
  }

  private async moveNote(from: string, to: string): Promise<{ from: string; to: string }> {
    return this.renameNote(from, to);
  }

  // ==================== Modificación de Contenido ====================

  private async appendContent(path: string, content: string): Promise<{ appended: boolean }> {
    const normalizedPath = this.normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    await this.plugin.app.vault.process(file, (data) => {
      return data + '\n' + content;
    });

    return { appended: true };
  }

  private async prependContent(path: string, content: string): Promise<{ prepended: boolean }> {
    const normalizedPath = this.normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    await this.plugin.app.vault.process(file, (data) => {
      // Preservar frontmatter si existe
      const frontmatterMatch = data.match(/^---\n[\s\S]*?\n---\n/);
      if (frontmatterMatch) {
        return frontmatterMatch[0] + content + '\n' + data.slice(frontmatterMatch[0].length);
      }
      return content + '\n' + data;
    });

    return { prepended: true };
  }

  private async replaceContent(path: string, content: string): Promise<{ replaced: boolean }> {
    const normalizedPath = this.normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(`Ruta protegida: ${normalizedPath}`);
    }

    await this.plugin.app.vault.modify(file, content);
    return { replaced: true };
  }

  private async updateFrontmatter(
    path: string,
    fields: Record<string, any>
  ): Promise<{ updated: boolean }> {
    const normalizedPath = this.normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
      Object.assign(frontmatter, fields);
    });

    return { updated: true };
  }

  // ==================== Búsqueda ====================

  private async searchNotes(
    query: string,
    field: 'title' | 'content' | 'tags' = 'title',
    folder?: string
  ): Promise<{ matches: Array<{ path: string; title: string }> }> {
    const files = this.plugin.app.vault.getMarkdownFiles();
    const matches: Array<{ path: string; title: string }> = [];
    const queryLower = query.toLowerCase();

    for (const file of files) {
      // Filtrar por carpeta si se especifica
      if (folder && !file.path.startsWith(folder)) {
        continue;
      }

      let isMatch = false;

      switch (field) {
        case 'title':
          isMatch = file.basename.toLowerCase().includes(queryLower);
          break;

        case 'content':
          const content = await this.plugin.app.vault.cachedRead(file);
          isMatch = content.toLowerCase().includes(queryLower);
          break;

        case 'tags':
          const cache = this.plugin.app.metadataCache.getFileCache(file);
          const tags = cache?.tags?.map(t => t.tag.toLowerCase()) || [];
          const fmTags = (cache?.frontmatter?.tags || []).map((t: string) =>
            t.toLowerCase()
          );
          isMatch = [...tags, ...fmTags].some(t => t.includes(queryLower));
          break;
      }

      if (isMatch) {
        matches.push({ path: file.path, title: file.basename });
      }
    }

    return { matches };
  }

  private async getNoteInfo(path: string): Promise<{
    path: string;
    title: string;
    size: number;
    created: number;
    modified: number;
    frontmatter: any;
    tags: string[];
    links: string[];
  }> {
    const normalizedPath = this.normalizePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(`Nota no encontrada: ${normalizedPath}`);
    }

    const cache = this.plugin.app.metadataCache.getFileCache(file);
    const tags = [
      ...(cache?.tags?.map(t => t.tag) || []),
      ...(cache?.frontmatter?.tags || [])
    ];
    const links = cache?.links?.map(l => l.link) || [];

    return {
      path: file.path,
      title: file.basename,
      size: file.stat.size,
      created: file.stat.ctime,
      modified: file.stat.mtime,
      frontmatter: cache?.frontmatter || {},
      tags,
      links
    };
  }

  private async findLinks(target: string): Promise<{
    backlinks: Array<{ path: string; title: string }>
  }> {
    const files = this.plugin.app.vault.getMarkdownFiles();
    const backlinks: Array<{ path: string; title: string }> = [];
    const targetLower = target.toLowerCase();

    for (const file of files) {
      const cache = this.plugin.app.metadataCache.getFileCache(file);
      const links = cache?.links || [];

      const hasLink = links.some(l =>
        l.link.toLowerCase() === targetLower ||
        l.link.toLowerCase().includes(targetLower)
      );

      if (hasLink) {
        backlinks.push({ path: file.path, title: file.basename });
      }
    }

    return { backlinks };
  }

  // ==================== Utilidades ====================

  private normalizePath(path: string): string {
    // Remover barras iniciales y finales, normalizar separadores
    return path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
  }

  /**
   * Sanitize a file or folder name to be safe for all operating systems
   * Handles: Windows, macOS, Linux restrictions
   */
  private sanitizeFileName(name: string): string {
    if (!name) return 'untitled';

    // Characters forbidden in Windows: \ / : * ? " < > |
    // Also forbidden in macOS: : (legacy)
    // Also forbidden in Linux: / (handled by path separator logic)
    let sanitized = name
      .replace(/[\\/:*?"<>|]/g, '-')  // Replace forbidden chars with dash
      .replace(/\s+/g, ' ')           // Normalize multiple spaces to single
      .trim();                         // Remove leading/trailing spaces

    // Windows: names cannot end with a period or space
    sanitized = sanitized.replace(/[.\s]+$/, '');

    // Windows reserved names (case insensitive)
    const reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];

    // Check if name (without extension) is reserved
    const nameWithoutExt = sanitized.replace(/\.[^.]+$/, '');
    if (reservedNames.includes(nameWithoutExt.toUpperCase())) {
      sanitized = `_${sanitized}`;
    }

    // Ensure name is not empty after sanitization
    if (!sanitized || sanitized === '.md') {
      sanitized = 'untitled';
    }

    // Limit length (most filesystems support 255, but be conservative)
    if (sanitized.length > 200) {
      const ext = sanitized.match(/\.[^.]+$/)?.[0] || '';
      sanitized = sanitized.slice(0, 200 - ext.length) + ext;
    }

    return sanitized;
  }

  /**
   * Sanitize a full path, applying sanitization to each component
   */
  private sanitizePath(path: string): string {
    const normalized = this.normalizePath(path);
    if (!normalized) return 'untitled';

    // Split path into components
    const parts = normalized.split('/');

    // Sanitize each component
    const sanitizedParts = parts.map(part => this.sanitizeFileName(part));

    // Filter out empty parts
    const cleanParts = sanitizedParts.filter(p => p && p !== '.');

    return cleanParts.join('/') || 'untitled';
  }

  /**
   * Ensure a folder path exists, creating parent folders recursively if needed
   */
  private async ensureFolderExists(folderPath: string): Promise<void> {
    const normalizedPath = this.normalizePath(folderPath);
    if (!normalizedPath) return;

    // Check if folder already exists
    const existing = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (existing) return;

    // Split path into parts and create each level
    const parts = normalizedPath.split('/');
    let currentPath = '';

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const folder = this.plugin.app.vault.getAbstractFileByPath(currentPath);
      if (!folder) {
        try {
          await this.plugin.app.vault.createFolder(currentPath);
        } catch (error) {
          // Folder might have been created by another process, ignore
          if (!(error instanceof Error && error.message.includes('Folder already exists'))) {
            throw error;
          }
        }
      }
    }
  }

  private isProtectedPath(path: string): boolean {
    const protectedFolders = this.plugin.settings.protectedFolders || [
      '.obsidian',
      'templates',
      '_templates'
    ];

    const normalizedPath = path.toLowerCase();
    return protectedFolders.some(folder =>
      normalizedPath === folder.toLowerCase() ||
      normalizedPath.startsWith(folder.toLowerCase() + '/')
    );
  }

  isDestructiveAction(action: VaultAction): boolean {
    const destructiveActions: ActionType[] = [
      'delete-note',
      'delete-folder',
      'replace-content'
    ];
    return destructiveActions.includes(action.action);
  }

  /**
   * Check if a create-note action would overwrite an existing file
   */
  wouldOverwriteExisting(action: VaultAction): boolean {
    if (action.action !== 'create-note') {
      return false;
    }

    let path = this.normalizePath(action.params.path);
    if (!path.endsWith('.md')) {
      path += '.md';
    }

    const existing = this.plugin.app.vault.getAbstractFileByPath(path);
    return existing !== null;
  }

  /**
   * Get all actions that would overwrite existing files
   */
  getOverwriteActions(actions: VaultAction[]): VaultAction[] {
    return actions.filter(action => this.wouldOverwriteExisting(action));
  }

  /**
   * Mark create-note actions to overwrite if file exists
   */
  markForOverwrite(actions: VaultAction[]): VaultAction[] {
    return actions.map(action => {
      if (action.action === 'create-note' && this.wouldOverwriteExisting(action)) {
        return {
          ...action,
          params: {
            ...action.params,
            overwrite: true
          }
        };
      }
      return action;
    });
  }
}
