import { TFile, TFolder, TAbstractFile, Notice, MarkdownView, Editor, ItemView } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { t } from './i18n';
import { logger } from './logger';

export type ActionType =
  // === Existing (16 actions) ===
  | 'create-folder' | 'delete-folder' | 'list-folder'
  | 'create-note' | 'read-note' | 'delete-note' | 'rename-note' | 'move-note' | 'copy-note'
  | 'append-content' | 'prepend-content' | 'replace-content' | 'update-frontmatter'
  | 'search-notes' | 'get-note-info' | 'find-links'
  // === Editor API (10 actions) ===
  | 'editor-get-content' | 'editor-set-content'
  | 'editor-get-selection' | 'editor-replace-selection' | 'editor-insert-at-cursor'
  | 'editor-get-line' | 'editor-set-line' | 'editor-go-to-line'
  | 'editor-undo' | 'editor-redo'
  // === Commands API (3 actions) ===
  | 'execute-command' | 'list-commands' | 'get-command-info'
  // === Daily Notes (2 actions) ===
  | 'open-daily-note' | 'create-daily-note'
  // === Templates (2 actions) ===
  | 'insert-template' | 'list-templates'
  // === Bookmarks (3 actions) ===
  | 'add-bookmark' | 'remove-bookmark' | 'list-bookmarks'
  // === Canvas API (7 actions) ===
  | 'canvas-create-text-node' | 'canvas-create-file-node' | 'canvas-create-link-node'
  | 'canvas-create-group' | 'canvas-add-edge' | 'canvas-select-all' | 'canvas-zoom-to-fit'
  // === Enhanced Search (4 actions) ===
  | 'search-by-heading' | 'search-by-block' | 'get-all-tags' | 'open-search'
  // === Workspace (5 actions) ===
  | 'open-file' | 'reveal-in-explorer' | 'get-active-file' | 'close-active-leaf' | 'split-leaf';

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
        error: error instanceof Error ? error.message : t('error.unknownError')
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
        logger.warn(`Action failed: ${action.action}`, result.error);
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

      case 'copy-note':
        return this.copyNote(params.from, params.to);

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

      // ==================== Editor API ====================
      case 'editor-get-content':
        return this.editorGetContent();

      case 'editor-set-content':
        return this.editorSetContent(params.content);

      case 'editor-get-selection':
        return this.editorGetSelection();

      case 'editor-replace-selection':
        return this.editorReplaceSelection(params.text);

      case 'editor-insert-at-cursor':
        return this.editorInsertAtCursor(params.text);

      case 'editor-get-line':
        return this.editorGetLine(params.line);

      case 'editor-set-line':
        return this.editorSetLine(params.line, params.text);

      case 'editor-go-to-line':
        return this.editorGoToLine(params.line);

      case 'editor-undo':
        return this.editorUndo();

      case 'editor-redo':
        return this.editorRedo();

      // ==================== Commands API ====================
      case 'execute-command':
        return this.executeCommand(params.commandId);

      case 'list-commands':
        return this.listCommands(params.filter);

      case 'get-command-info':
        return this.getCommandInfo(params.commandId);

      // ==================== Daily Notes ====================
      case 'open-daily-note':
        return this.openDailyNote();

      case 'create-daily-note':
        return this.createDailyNote(params.date);

      // ==================== Templates ====================
      case 'insert-template':
        return this.insertTemplate(params.templateName);

      case 'list-templates':
        return this.listTemplates();

      // ==================== Bookmarks ====================
      case 'add-bookmark':
        return this.addBookmark(params.path);

      case 'remove-bookmark':
        return this.removeBookmark(params.path);

      case 'list-bookmarks':
        return this.listBookmarks();

      // ==================== Canvas API ====================
      case 'canvas-create-text-node':
        return this.canvasCreateTextNode(params.text, params.x, params.y);

      case 'canvas-create-file-node':
        return this.canvasCreateFileNode(params.file, params.x, params.y);

      case 'canvas-create-link-node':
        return this.canvasCreateLinkNode(params.url, params.x, params.y);

      case 'canvas-create-group':
        return this.canvasCreateGroup(params.label);

      case 'canvas-add-edge':
        return this.canvasAddEdge(params.fromNode, params.toNode);

      case 'canvas-select-all':
        return this.canvasSelectAll();

      case 'canvas-zoom-to-fit':
        return this.canvasZoomToFit();

      // ==================== Enhanced Search ====================
      case 'search-by-heading':
        return this.searchByHeading(params.heading, params.folder);

      case 'search-by-block':
        return this.searchByBlock(params.blockId);

      case 'get-all-tags':
        return this.getAllTags();

      case 'open-search':
        return this.openSearch(params.query);

      // ==================== Workspace ====================
      case 'open-file':
        return this.openFile(params.path, params.mode);

      case 'reveal-in-explorer':
        return this.revealInExplorer(params.path);

      case 'get-active-file':
        return this.getActiveFile();

      case 'close-active-leaf':
        return this.closeActiveLeaf();

      case 'split-leaf':
        return this.splitLeaf(params.direction);

      default:
        throw new Error(t('agent.genericAction', { action: action.action }));
    }
  }

  // ==================== Gestión de Carpetas ====================

  private async createFolder(path: string): Promise<{ created: boolean; path: string }> {
    // Sanitize path to prevent filesystem issues
    const normalizedPath = this.sanitizePath(path);

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(t('error.protectedPath', { path: normalizedPath }));
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
      throw new Error(t('error.protectedPath', { path: normalizedPath }));
    }

    const folder = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (!folder || !(folder instanceof TFolder)) {
      throw new Error(t('error.folderNotFound', { path: normalizedPath }));
    }

    if (folder.children.length > 0) {
      throw new Error(t('error.folderNotEmpty', { path: normalizedPath }));
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
      throw new Error(t('error.folderNotFound', { path: normalizedPath || '/' }));
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
      throw new Error(t('error.protectedPath', { path: normalizedPath }));
    }

    // Verificar si ya existe
    const existing = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (existing) {
      if (!overwrite) {
        throw new Error(t('error.fileAlreadyExists', { path: normalizedPath }));
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
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
    }

    const content = await this.plugin.app.vault.read(file);
    const cache = this.plugin.app.metadataCache.getFileCache(file);

    return {
      content,
      frontmatter: cache?.frontmatter || {}
    };
  }

  private async deleteNote(path: string): Promise<{ deleted: boolean }> {
    const normalizedPath = this.normalizeNotePath(path);

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(t('error.protectedPath', { path: normalizedPath }));
    }

    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
    }

    await this.plugin.app.vault.delete(file);
    return { deleted: true };
  }

  private async renameNote(from: string, to: string): Promise<{ from: string; to: string }> {
    const normalizedFrom = this.normalizeNotePath(from);
    // Sanitize destination path
    let normalizedTo = this.sanitizePath(to);
    if (!normalizedTo.endsWith('.md')) {
      normalizedTo += '.md';
    }

    if (this.isProtectedPath(normalizedFrom) || this.isProtectedPath(normalizedTo)) {
      throw new Error(t('error.protectedPath', { path: normalizedFrom }));
    }

    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedFrom);
    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedFrom }));
    }

    await this.plugin.app.fileManager.renameFile(file, normalizedTo);
    return { from: normalizedFrom, to: normalizedTo };
  }

  private async moveNote(from: string, to: string): Promise<{ from: string; to: string }> {
    return this.renameNote(from, to);
  }

  /**
   * Copy a note to a new location, preserving content exactly
   */
  private async copyNote(from: string, to: string): Promise<{ from: string; to: string; copied: boolean }> {
    const normalizedFrom = this.normalizeNotePath(from);
    let normalizedTo = this.sanitizePath(to);
    if (!normalizedTo.endsWith('.md')) {
      normalizedTo += '.md';
    }

    if (this.isProtectedPath(normalizedTo)) {
      throw new Error(t('error.protectedPath', { path: normalizedTo }));
    }

    // Read source file
    const sourceFile = this.plugin.app.vault.getAbstractFileByPath(normalizedFrom);
    if (!sourceFile || !(sourceFile instanceof TFile)) {
      throw new Error(t('error.sourceNoteNotFound', { path: normalizedFrom }));
    }

    // Read exact content
    const content = await this.plugin.app.vault.read(sourceFile);

    // Ensure destination folder exists
    const parentPath = normalizedTo.substring(0, normalizedTo.lastIndexOf('/'));
    if (parentPath) {
      await this.ensureFolderExists(parentPath);
    }

    // Check if destination exists
    const existing = this.plugin.app.vault.getAbstractFileByPath(normalizedTo);
    if (existing) {
      // Overwrite existing file
      if (existing instanceof TFile) {
        await this.plugin.app.vault.modify(existing, content);
        return { from: normalizedFrom, to: normalizedTo, copied: true };
      }
    }

    // Create new file with exact content
    await this.plugin.app.vault.create(normalizedTo, content);
    return { from: normalizedFrom, to: normalizedTo, copied: true };
  }

  // ==================== Modificación de Contenido ====================

  private async appendContent(path: string, content: string): Promise<{ appended: boolean }> {
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
    }

    await this.plugin.app.vault.process(file, (data) => {
      return data + '\n' + content;
    });

    return { appended: true };
  }

  private async prependContent(path: string, content: string): Promise<{ prepended: boolean }> {
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
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
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
    }

    if (this.isProtectedPath(normalizedPath)) {
      throw new Error(t('error.protectedPath', { path: normalizedPath }));
    }

    await this.plugin.app.vault.modify(file, content);
    return { replaced: true };
  }

  private async updateFrontmatter(
    path: string,
    fields: Record<string, any>
  ): Promise<{ updated: boolean }> {
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
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
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.noteNotFound', { path: normalizedPath }));
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
   * Normalize a note path, ensuring it has .md extension
   */
  private normalizeNotePath(path: string): string {
    let normalized = this.normalizePath(path);
    if (!normalized.endsWith('.md')) {
      normalized += '.md';
    }
    return normalized;
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
      'replace-content',
      'editor-set-content'
    ];
    return destructiveActions.includes(action.action);
  }

  // ==================== Editor API ====================

  private getActiveEditor(): Editor | null {
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    return view?.editor || null;
  }

  private async editorGetContent(): Promise<{ content: string }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    return { content: editor.getValue() };
  }

  private async editorSetContent(content: string): Promise<{ set: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    editor.setValue(content);
    return { set: true };
  }

  private async editorGetSelection(): Promise<{ selection: string; hasSelection: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    const selection = editor.getSelection();
    return { selection, hasSelection: selection.length > 0 };
  }

  private async editorReplaceSelection(text: string): Promise<{ replaced: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    editor.replaceSelection(text);
    return { replaced: true };
  }

  private async editorInsertAtCursor(text: string): Promise<{ inserted: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    const cursor = editor.getCursor();
    editor.replaceRange(text, cursor);
    return { inserted: true };
  }

  private async editorGetLine(line: number): Promise<{ line: number; text: string }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    const text = editor.getLine(line);
    return { line, text };
  }

  private async editorSetLine(line: number, text: string): Promise<{ set: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    editor.setLine(line, text);
    return { set: true };
  }

  private async editorGoToLine(line: number): Promise<{ navigated: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    editor.setCursor({ line, ch: 0 });
    return { navigated: true };
  }

  private async editorUndo(): Promise<{ undone: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    // Access the CodeMirror editor instance for undo
    (editor as any).undo();
    return { undone: true };
  }

  private async editorRedo(): Promise<{ redone: boolean }> {
    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }
    // Access the CodeMirror editor instance for redo
    (editor as any).redo();
    return { redone: true };
  }

  // ==================== Commands API ====================

  private async executeCommand(commandId: string): Promise<{ executed: boolean; commandId: string }> {
    const command = (this.plugin.app as any).commands?.commands?.[commandId];
    if (!command) {
      throw new Error(t('error.commandNotFound', { commandId }));
    }
    await (this.plugin.app as any).commands.executeCommandById(commandId);
    return { executed: true, commandId };
  }

  private async listCommands(filter?: string): Promise<{ commands: Array<{ id: string; name: string }> }> {
    const commands = (this.plugin.app as any).commands?.commands || {};
    let commandList = Object.entries(commands).map(([id, cmd]: [string, any]) => ({
      id,
      name: cmd.name || id
    }));

    if (filter) {
      const filterLower = filter.toLowerCase();
      commandList = commandList.filter(cmd =>
        cmd.id.toLowerCase().includes(filterLower) ||
        cmd.name.toLowerCase().includes(filterLower)
      );
    }

    return { commands: commandList };
  }

  private async getCommandInfo(commandId: string): Promise<{
    id: string;
    name: string;
    hotkeys?: string[];
  }> {
    const command = (this.plugin.app as any).commands?.commands?.[commandId];
    if (!command) {
      throw new Error(t('error.commandNotFound', { commandId }));
    }

    const hotkeys = (this.plugin.app as any).hotkeyManager?.getHotkeys?.(commandId) || [];
    return {
      id: commandId,
      name: command.name || commandId,
      hotkeys: hotkeys.map((h: any) => h.modifiers?.join('+') + '+' + h.key)
    };
  }

  // ==================== Internal Plugins: Daily Notes ====================

  private getDailyNotesPlugin(): any {
    const internalPlugins = (this.plugin.app as any).internalPlugins;
    const plugin = internalPlugins?.plugins?.['daily-notes'];
    return plugin?.enabled ? plugin.instance : null;
  }

  private async openDailyNote(): Promise<{ opened: boolean; path?: string }> {
    const dailyNotes = this.getDailyNotesPlugin();
    if (!dailyNotes) {
      throw new Error(t('error.pluginNotEnabled', { plugin: 'Daily Notes' }));
    }

    // Try to get today's daily note
    const moment = (window as any).moment;
    if (!moment) {
      throw new Error(t('error.momentNotAvailable'));
    }

    const format = dailyNotes.options?.format || 'YYYY-MM-DD';
    const folder = dailyNotes.options?.folder || '';
    const filename = moment().format(format) + '.md';
    const path = folder ? `${folder}/${filename}` : filename;

    // Check if it exists, if not create it
    let file = this.plugin.app.vault.getAbstractFileByPath(path);
    if (!file) {
      // Ensure folder exists
      if (folder) {
        await this.ensureFolderExists(folder);
      }
      file = await this.plugin.app.vault.create(path, '');
    }

    // Open the file
    await this.plugin.app.workspace.openLinkText(path, '', false);
    return { opened: true, path };
  }

  private async createDailyNote(date?: string): Promise<{ created: boolean; path: string }> {
    const dailyNotes = this.getDailyNotesPlugin();
    if (!dailyNotes) {
      throw new Error(t('error.pluginNotEnabled', { plugin: 'Daily Notes' }));
    }

    const moment = (window as any).moment;
    if (!moment) {
      throw new Error(t('error.momentNotAvailable'));
    }

    const format = dailyNotes.options?.format || 'YYYY-MM-DD';
    const folder = dailyNotes.options?.folder || '';
    const dateObj = date ? moment(date) : moment();
    const filename = dateObj.format(format) + '.md';
    const path = folder ? `${folder}/${filename}` : filename;

    // Ensure folder exists
    if (folder) {
      await this.ensureFolderExists(folder);
    }

    // Check if already exists
    const existing = this.plugin.app.vault.getAbstractFileByPath(path);
    if (existing) {
      return { created: false, path };
    }

    // Create the note with template if available
    const template = dailyNotes.options?.template;
    let content = '';
    if (template) {
      const templateFile = this.plugin.app.vault.getAbstractFileByPath(template);
      if (templateFile instanceof TFile) {
        content = await this.plugin.app.vault.read(templateFile);
      }
    }

    await this.plugin.app.vault.create(path, content);
    return { created: true, path };
  }

  // ==================== Internal Plugins: Templates ====================

  private getTemplatesPlugin(): any {
    const internalPlugins = (this.plugin.app as any).internalPlugins;
    const plugin = internalPlugins?.plugins?.['templates'];
    return plugin?.enabled ? plugin.instance : null;
  }

  private async insertTemplate(templateName?: string): Promise<{ inserted: boolean; templateName?: string }> {
    const templates = this.getTemplatesPlugin();
    if (!templates) {
      throw new Error(t('error.pluginNotEnabled', { plugin: 'Templates' }));
    }

    const editor = this.getActiveEditor();
    if (!editor) {
      throw new Error(t('error.noActiveEditor'));
    }

    const templateFolder = templates.options?.folder || 'templates';

    if (templateName) {
      // Find specific template
      const templatePath = `${templateFolder}/${templateName}.md`;
      const templateFile = this.plugin.app.vault.getAbstractFileByPath(templatePath);
      if (!templateFile || !(templateFile instanceof TFile)) {
        throw new Error(t('error.templateNotFound', { templateName }));
      }

      const content = await this.plugin.app.vault.read(templateFile);
      editor.replaceSelection(content);
      return { inserted: true, templateName };
    } else {
      // Open template picker (execute the insert template command)
      await (this.plugin.app as any).commands.executeCommandById('templates:insert-template');
      return { inserted: true };
    }
  }

  private async listTemplates(): Promise<{ templates: string[]; folder: string }> {
    const templatesPlugin = this.getTemplatesPlugin();
    const templateFolder = templatesPlugin?.options?.folder || 'templates';

    const folder = this.plugin.app.vault.getAbstractFileByPath(templateFolder);
    if (!folder || !(folder instanceof TFolder)) {
      return { templates: [], folder: templateFolder };
    }

    const templates: string[] = [];
    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'md') {
        templates.push(child.basename);
      }
    }

    return { templates, folder: templateFolder };
  }

  // ==================== Internal Plugins: Bookmarks ====================

  private getBookmarksPlugin(): any {
    const internalPlugins = (this.plugin.app as any).internalPlugins;
    const plugin = internalPlugins?.plugins?.['bookmarks'];
    return plugin?.enabled ? plugin.instance : null;
  }

  private async addBookmark(path: string): Promise<{ added: boolean; path: string }> {
    const bookmarks = this.getBookmarksPlugin();
    if (!bookmarks) {
      throw new Error(t('error.pluginNotEnabled', { plugin: 'Bookmarks' }));
    }

    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (!file) {
      throw new Error(t('error.fileNotFound', { path: normalizedPath }));
    }

    // Add bookmark via the bookmarks instance
    if (bookmarks.addItem) {
      await bookmarks.addItem({ type: 'file', path: normalizedPath });
    } else {
      // Fallback: use command
      await (this.plugin.app as any).commands.executeCommandById('bookmarks:bookmark-current-view');
    }

    return { added: true, path: normalizedPath };
  }

  private async removeBookmark(path: string): Promise<{ removed: boolean; path: string }> {
    const bookmarks = this.getBookmarksPlugin();
    if (!bookmarks) {
      throw new Error(t('error.pluginNotEnabled', { plugin: 'Bookmarks' }));
    }

    const normalizedPath = this.normalizeNotePath(path);

    // Find and remove bookmark
    if (bookmarks.items) {
      const items = bookmarks.items;
      const findAndRemove = (itemList: any[]): boolean => {
        for (let i = 0; i < itemList.length; i++) {
          const item = itemList[i];
          if (item.type === 'file' && item.path === normalizedPath) {
            itemList.splice(i, 1);
            return true;
          }
          if (item.type === 'group' && item.items) {
            if (findAndRemove(item.items)) return true;
          }
        }
        return false;
      };

      if (findAndRemove(items)) {
        bookmarks.saveData();
        return { removed: true, path: normalizedPath };
      }
    }

    throw new Error(t('error.bookmarkNotFound', { path: normalizedPath }));
  }

  private async listBookmarks(): Promise<{ bookmarks: Array<{ type: string; path?: string; title?: string }> }> {
    const bookmarksPlugin = this.getBookmarksPlugin();
    if (!bookmarksPlugin) {
      throw new Error(t('error.pluginNotEnabled', { plugin: 'Bookmarks' }));
    }

    const items = bookmarksPlugin.items || [];
    const result: Array<{ type: string; path?: string; title?: string }> = [];

    const extractBookmarks = (itemList: any[]) => {
      for (const item of itemList) {
        if (item.type === 'file') {
          result.push({ type: 'file', path: item.path, title: item.title });
        } else if (item.type === 'group') {
          result.push({ type: 'group', title: item.title });
          if (item.items) {
            extractBookmarks(item.items);
          }
        }
      }
    };

    extractBookmarks(items);
    return { bookmarks: result };
  }

  // ==================== Canvas API ====================

  private getActiveCanvas(): any {
    const view = this.plugin.app.workspace.getActiveViewOfType(ItemView);
    if (view?.getViewType() === 'canvas') {
      return (view as any).canvas;
    }
    return null;
  }

  private async canvasCreateTextNode(
    text: string,
    x?: number,
    y?: number
  ): Promise<{ created: boolean; nodeId: string }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    const node = canvas.createTextNode({
      pos: { x: x ?? 0, y: y ?? 0 },
      text: text,
      size: { width: 250, height: 100 }
    });

    return { created: true, nodeId: node.id };
  }

  private async canvasCreateFileNode(
    file: string,
    x?: number,
    y?: number
  ): Promise<{ created: boolean; nodeId: string }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    const normalizedPath = this.normalizeNotePath(file);
    const fileObj = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);
    if (!fileObj || !(fileObj instanceof TFile)) {
      throw new Error(t('error.fileNotFound', { path: normalizedPath }));
    }

    const node = canvas.createFileNode({
      pos: { x: x ?? 0, y: y ?? 0 },
      file: fileObj,
      size: { width: 400, height: 300 }
    });

    return { created: true, nodeId: node.id };
  }

  private async canvasCreateLinkNode(
    url: string,
    x?: number,
    y?: number
  ): Promise<{ created: boolean; nodeId: string }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    const node = canvas.createLinkNode({
      pos: { x: x ?? 0, y: y ?? 0 },
      url: url,
      size: { width: 400, height: 300 }
    });

    return { created: true, nodeId: node.id };
  }

  private async canvasCreateGroup(label?: string): Promise<{ created: boolean; groupId: string }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    const group = canvas.createGroupNode({
      pos: { x: 0, y: 0 },
      size: { width: 500, height: 400 },
      label: label || ''
    });

    return { created: true, groupId: group.id };
  }

  private async canvasAddEdge(
    fromNode: string,
    toNode: string
  ): Promise<{ created: boolean }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    const nodes = canvas.nodes;
    const fromNodeObj = nodes.get(fromNode);
    const toNodeObj = nodes.get(toNode);

    if (!fromNodeObj) {
      throw new Error(t('error.canvasNodeNotFound', { nodeId: fromNode }));
    }
    if (!toNodeObj) {
      throw new Error(t('error.canvasNodeNotFound', { nodeId: toNode }));
    }

    canvas.createEdge({
      fromNode: fromNodeObj,
      toNode: toNodeObj,
      fromSide: 'right',
      toSide: 'left'
    });

    return { created: true };
  }

  private async canvasSelectAll(): Promise<{ selected: number }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    canvas.selectAll();
    const selectedCount = canvas.selection?.size || 0;
    return { selected: selectedCount };
  }

  private async canvasZoomToFit(): Promise<{ zoomed: boolean }> {
    const canvas = this.getActiveCanvas();
    if (!canvas) {
      throw new Error(t('error.noActiveCanvas'));
    }

    canvas.zoomToFit();
    return { zoomed: true };
  }

  // ==================== Enhanced Search ====================

  private async searchByHeading(
    heading: string,
    folder?: string
  ): Promise<{ matches: Array<{ path: string; title: string; heading: string; level: number }> }> {
    const files = this.plugin.app.vault.getMarkdownFiles();
    const matches: Array<{ path: string; title: string; heading: string; level: number }> = [];
    const headingLower = heading.toLowerCase();

    for (const file of files) {
      if (folder && !file.path.startsWith(folder)) {
        continue;
      }

      const cache = this.plugin.app.metadataCache.getFileCache(file);
      if (cache?.headings) {
        for (const h of cache.headings) {
          if (h.heading.toLowerCase().includes(headingLower)) {
            matches.push({
              path: file.path,
              title: file.basename,
              heading: h.heading,
              level: h.level
            });
          }
        }
      }
    }

    return { matches };
  }

  private async searchByBlock(blockId: string): Promise<{
    found: boolean;
    path?: string;
    title?: string;
  }> {
    const files = this.plugin.app.vault.getMarkdownFiles();

    for (const file of files) {
      const cache = this.plugin.app.metadataCache.getFileCache(file);
      if (cache?.blocks && cache.blocks[blockId]) {
        return {
          found: true,
          path: file.path,
          title: file.basename
        };
      }
    }

    return { found: false };
  }

  private async getAllTags(): Promise<{ tags: string[]; count: number }> {
    const tags = new Set<string>();

    const files = this.plugin.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.plugin.app.metadataCache.getFileCache(file);

      // Tags in content
      if (cache?.tags) {
        for (const tag of cache.tags) {
          tags.add(tag.tag.replace(/^#/, ''));
        }
      }

      // Tags in frontmatter
      if (cache?.frontmatter?.tags) {
        const fmTags = cache.frontmatter.tags;
        if (Array.isArray(fmTags)) {
          fmTags.forEach((t: string) => tags.add(t.replace(/^#/, '')));
        } else if (typeof fmTags === 'string') {
          tags.add(fmTags.replace(/^#/, ''));
        }
      }
    }

    const tagArray = Array.from(tags).sort();
    return { tags: tagArray, count: tagArray.length };
  }

  private async openSearch(query: string): Promise<{ opened: boolean; query: string }> {
    // Open the global search with the query
    const searchLeaf = this.plugin.app.workspace.getLeavesOfType('search')[0];

    if (searchLeaf) {
      this.plugin.app.workspace.revealLeaf(searchLeaf);
      const searchView = searchLeaf.view as any;
      if (searchView?.setQuery) {
        searchView.setQuery(query);
      }
    } else {
      // Execute the search command and set query
      await (this.plugin.app as any).commands.executeCommandById('global-search:open');
      // Small delay to let the search pane open
      await new Promise(resolve => setTimeout(resolve, 100));
      const newSearchLeaf = this.plugin.app.workspace.getLeavesOfType('search')[0];
      if (newSearchLeaf) {
        const searchView = newSearchLeaf.view as any;
        if (searchView?.setQuery) {
          searchView.setQuery(query);
        }
      }
    }

    return { opened: true, query };
  }

  // ==================== Workspace ====================

  private async openFile(
    path: string,
    mode?: 'source' | 'preview'
  ): Promise<{ opened: boolean; path: string }> {
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file || !(file instanceof TFile)) {
      throw new Error(t('error.fileNotFound', { path: normalizedPath }));
    }

    const leaf = this.plugin.app.workspace.getLeaf(false);
    await leaf.openFile(file);

    // Set view mode if specified
    if (mode) {
      const view = leaf.view;
      if (view instanceof MarkdownView) {
        const state = view.getState();
        state.mode = mode;
        await view.setState(state, { history: false });
      }
    }

    return { opened: true, path: normalizedPath };
  }

  private async revealInExplorer(path: string): Promise<{ revealed: boolean; path: string }> {
    const normalizedPath = this.normalizeNotePath(path);
    const file = this.plugin.app.vault.getAbstractFileByPath(normalizedPath);

    if (!file) {
      throw new Error(t('error.fileNotFound', { path: normalizedPath }));
    }

    // Get the file explorer leaf
    const explorerLeaf = this.plugin.app.workspace.getLeavesOfType('file-explorer')[0];
    if (explorerLeaf) {
      this.plugin.app.workspace.revealLeaf(explorerLeaf);
      const explorerView = explorerLeaf.view as any;
      if (explorerView?.revealInFolder) {
        explorerView.revealInFolder(file);
      }
    }

    return { revealed: true, path: normalizedPath };
  }

  private async getActiveFile(): Promise<{
    path: string | null;
    title: string | null;
    isMarkdown: boolean;
  }> {
    const activeFile = this.plugin.app.workspace.getActiveFile();

    if (!activeFile) {
      return { path: null, title: null, isMarkdown: false };
    }

    return {
      path: activeFile.path,
      title: activeFile.basename,
      isMarkdown: activeFile.extension === 'md'
    };
  }

  private async closeActiveLeaf(): Promise<{ closed: boolean }> {
    const activeLeaf = this.plugin.app.workspace.activeLeaf;
    if (activeLeaf) {
      activeLeaf.detach();
      return { closed: true };
    }
    return { closed: false };
  }

  private async splitLeaf(direction: 'horizontal' | 'vertical'): Promise<{
    split: boolean;
    direction: string;
  }> {
    const activeLeaf = this.plugin.app.workspace.activeLeaf;
    if (!activeLeaf) {
      throw new Error(t('error.noActiveLeafToSplit'));
    }

    const newLeaf = this.plugin.app.workspace.createLeafBySplit(
      activeLeaf,
      direction
    );

    return { split: !!newLeaf, direction };
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
