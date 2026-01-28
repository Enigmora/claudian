/**
 * Type declarations for Obsidian's internal APIs
 * These are not part of the official API but are used for advanced functionality
 */

import { App, Command, TAbstractFile, View } from 'obsidian';

/**
 * Extended App interface with internal APIs
 */
export interface ObsidianAppInternal extends App {
  commands: ObsidianCommands;
  plugins: ObsidianPlugins;
  hotkeyManager: ObsidianHotkeyManager;
  internalPlugins: InternalPluginsManager;
}

/**
 * Internal plugins manager
 */
export interface InternalPluginsManager {
  plugins: Record<string, InternalPlugin>;
}

/**
 * Internal plugin interface
 */
export interface InternalPlugin {
  enabled: boolean;
  instance?: DailyNotesInstance | TemplatesInstance | BookmarksInstance;
}

/**
 * Daily Notes plugin instance
 */
export interface DailyNotesInstance {
  options?: {
    format?: string;
    folder?: string;
    template?: string;
  };
}

/**
 * Templates plugin instance
 */
export interface TemplatesInstance {
  options?: {
    folder?: string;
  };
}

/**
 * Bookmarks plugin instance
 */
export interface BookmarksInstance {
  items?: BookmarkItem[];
  addItem?(item: { type: string; path: string }): Promise<void>;
  saveData?(): void;
}

/**
 * Bookmark item
 */
export interface BookmarkItem {
  type: 'file' | 'group';
  path?: string;
  items?: BookmarkItem[];
}

/**
 * Moment.js type (available globally in Obsidian)
 */
export interface MomentInstance {
  (): MomentObject;
  (date: string): MomentObject;
}

export interface MomentObject {
  format(formatString: string): string;
}

/**
 * Commands manager interface
 */
export interface ObsidianCommands {
  commands: Record<string, Command>;
  executeCommandById(id: string): boolean;
}

/**
 * Plugins manager interface
 */
export interface ObsidianPlugins {
  plugins: Record<string, ObsidianPlugin>;
}

/**
 * Plugin instance interface
 */
export interface ObsidianPlugin {
  enabled: boolean;
  instance?: {
    insertTemplate?: (template: TAbstractFile) => void;
  };
}

/**
 * Hotkey manager interface
 */
export interface ObsidianHotkeyManager {
  getHotkeys(commandId: string): ObsidianHotkey[];
}

/**
 * Hotkey definition
 */
export interface ObsidianHotkey {
  modifiers: string[];
  key: string;
}

/**
 * Search view interface
 */
export interface ObsidianSearchView extends View {
  setQuery(query: string): void;
}

/**
 * File explorer view interface
 */
export interface ObsidianExplorerView extends View {
  revealInFolder(file: TAbstractFile): void;
}

/**
 * Canvas view interface
 */
export interface ObsidianCanvasView extends View {
  canvas?: ObsidianCanvas;
}

/**
 * Canvas data interface
 */
export interface ObsidianCanvas {
  nodes: Map<string, CanvasNode>;
  edges: Map<string, CanvasEdge>;
  selection?: Set<CanvasNode>;
  requestSave(): void;
  selectAll(): void;
  zoomToFit(): void;
  createTextNode(options: CanvasTextNodeOptions): CanvasNode;
  createFileNode(options: CanvasFileNodeOptions): CanvasNode;
  createLinkNode(options: CanvasLinkNodeOptions): CanvasNode;
  createGroupNode(options: CanvasGroupNodeOptions): CanvasNode;
  addEdge(edge: CanvasEdgeData): CanvasEdge;
  createEdge(options: CanvasEdgeCreateOptions): CanvasEdge;
}

/**
 * Canvas edge creation options (uses node objects)
 */
export interface CanvasEdgeCreateOptions {
  fromNode: CanvasNode;
  toNode: CanvasNode;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Canvas node interface
 */
export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Canvas edge interface
 */
export interface CanvasEdge {
  id: string;
  from: { node: CanvasNode };
  to: { node: CanvasNode };
}

/**
 * Canvas text node creation options
 */
export interface CanvasTextNodeOptions {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  text: string;
}

/**
 * Canvas file node creation options
 */
export interface CanvasFileNodeOptions {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  file: TAbstractFile;
}

/**
 * Canvas link node creation options
 */
export interface CanvasLinkNodeOptions {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  url: string;
}

/**
 * Canvas group node creation options
 */
export interface CanvasGroupNodeOptions {
  pos: { x: number; y: number };
  size: { width: number; height: number };
  label?: string;
}

/**
 * Canvas edge data for creation
 */
export interface CanvasEdgeData {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Frontmatter with known properties
 */
export interface NoteFrontmatter {
  tags?: string | string[];
  aliases?: string[];
  [key: string]: unknown;
}

/**
 * Editor with internal methods
 */
export interface ObsidianEditorInternal {
  getLine(line: number): string;
  setLine(line: number, text: string): void;
  undo(): void;
  redo(): void;
}
