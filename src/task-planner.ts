/**
 * Task Planner
 * Detects complex tasks and breaks them into manageable subtasks
 * to avoid truncation and improve reliability.
 */

import { t } from './i18n';
import { logger } from './logger';

export interface TaskAnalysis {
  isComplex: boolean;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedActions: number;
  reasons: string[];
  suggestPlanning: boolean;
  multiFile?: {
    detected: boolean;
    items: string[];
    count: number;
  };
}

export interface Subtask {
  id: string;
  index: number;
  description: string;
  prompt: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: SubtaskResult;
  error?: string;
}

export interface SubtaskResult {
  success: boolean;
  actionsExecuted: number;
  message: string;
}

export interface TaskPlan {
  id: string;
  originalRequest: string;
  createdAt: number;
  subtasks: Subtask[];
  totalEstimatedActions: number;
  currentSubtaskIndex: number;
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'cancelled';
  summary?: string;
}

export interface PlanningConfig {
  maxActionsPerSubtask: number;
  maxSubtasks: number;
  enableAutoPlan: boolean;
}

export const DEFAULT_PLANNING_CONFIG: PlanningConfig = {
  maxActionsPerSubtask: 8,
  maxSubtasks: 10,
  enableAutoPlan: true
};

export class TaskPlanner {
  private config: PlanningConfig;

  // Patterns indicating complex tasks
  private static readonly COMPLEXITY_PATTERNS: Array<{
    pattern: RegExp;
    weight: number;
    description: string;
  }> = [
    // Multiple items - Spanish/English
    { pattern: /(?:crear?|create?|genera?r?)\s+(\d+|varios|multiple|many|muchos)/i, weight: 3, description: 'Multiple items requested' },
    { pattern: /(?:todos?|all)\s+(?:los?|the)?\s*(?:archivos?|files?|notas?|notes?)/i, weight: 4, description: 'All files/notes' },
    // Multiple items - Chinese
    { pattern: /(?:创建|生成)\s*(\d+|多个|许多|几个)/, weight: 3, description: 'Multiple items requested (Chinese)' },
    { pattern: /(?:所有|全部)\s*(?:的)?\s*(?:文件|笔记)/, weight: 4, description: 'All files/notes (Chinese)' },

    // Structure creation - Spanish/English
    { pattern: /(?:estructura|structure)\s+(?:de\s+)?(?:proyecto|project|carpetas?|folders?)/i, weight: 3, description: 'Structure creation' },
    { pattern: /(?:árbol|tree)\s+(?:de\s+)?(?:carpetas?|folders?|directorios?)/i, weight: 3, description: 'Folder tree' },
    // Structure creation - Chinese
    { pattern: /(?:结构|项目结构|文件夹结构)/, weight: 3, description: 'Structure creation (Chinese)' },
    { pattern: /(?:目录树|文件夹树)/, weight: 3, description: 'Folder tree (Chinese)' },

    // Batch operations - Spanish/English
    { pattern: /(?:organizar?|organize?|ordenar?|sort)\s+(?:todos?|all|las?|los?|the)/i, weight: 3, description: 'Batch organization' },
    { pattern: /(?:mover?|move?)\s+(?:todos?|all|múltiples?|multiple)/i, weight: 3, description: 'Batch move' },
    // Batch operations - Chinese
    { pattern: /(?:组织|整理|排序)\s*(?:所有|全部)/, weight: 3, description: 'Batch organization (Chinese)' },
    { pattern: /(?:移动)\s*(?:多个|全部|所有)/, weight: 3, description: 'Batch move (Chinese)' },

    // Content generation - Spanish/English
    { pattern: /(?:con\s+)?(?:contenido|content)\s+(?:sobre|about|de|on)/i, weight: 2, description: 'Content generation' },
    { pattern: /(?:escribe?|write?|genera?r?|generate?)\s+(?:un\s+)?(?:artículo|article|ensayo|essay|documento|document)/i, weight: 2, description: 'Document generation' },
    // Content generation - Chinese
    { pattern: /(?:内容|关于|涉及)/, weight: 2, description: 'Content generation (Chinese)' },
    { pattern: /(?:写|生成)\s*(?:一篇?)?\s*(?:文章|论文|文档)/, weight: 2, description: 'Document generation (Chinese)' },

    // Lists and series - Spanish/English
    { pattern: /(?:lista|list)\s+(?:de\s+)?(?:\d+|\w+)\s+(?:archivos?|files?|notas?|notes?|items?)/i, weight: 2, description: 'List of items' },
    { pattern: /(?:serie|series)\s+(?:de\s+)?(?:notas?|notes?|archivos?|files?)/i, weight: 3, description: 'Series of files' },
    // Lists and series - Chinese
    { pattern: /(?:列表|一[系串]列)\s*(?:\d+|多个)?\s*(?:文件|笔记)/, weight: 2, description: 'List of items (Chinese)' },
    { pattern: /(?:系列|一系列)\s*(?:笔记|文件)/, weight: 3, description: 'Series of files (Chinese)' },

    // Detailed content - Spanish/English
    { pattern: /(?:detallado|detailed|completo|complete|exhaustivo|comprehensive)/i, weight: 2, description: 'Detailed content' },
    { pattern: /(?:historia|history|biografía|biography)\s+(?:de|of|sobre|about)/i, weight: 2, description: 'Historical content' },
    // Detailed content - Chinese
    { pattern: /(?:详细|完整|全面|综合)/, weight: 2, description: 'Detailed content (Chinese)' },
    { pattern: /(?:历史|传记)\s*(?:关于)?/, weight: 2, description: 'Historical content (Chinese)' },

    // With subfolders/subcategories - Spanish/English
    { pattern: /(?:con\s+)?(?:subcarpetas?|subfolders?|subdirectorios?)/i, weight: 2, description: 'With subfolders' },
    { pattern: /(?:categorías?|categories?|secciones?|sections?)/i, weight: 1, description: 'Categories/sections' },
    // With subfolders/subcategories - Chinese
    { pattern: /(?:包含)?\s*(?:子文件夹|子目录)/, weight: 2, description: 'With subfolders (Chinese)' },
    { pattern: /(?:类别|分类|部分|章节)/, weight: 1, description: 'Categories/sections (Chinese)' },

    // German - Multiple items
    { pattern: /(?:erstell|generier)\s*(\d+|mehrere|viele|einige)/i, weight: 3, description: 'Multiple items (German)' },
    { pattern: /(?:alle|s[äa]mtliche)\s*(?:dateien|notizen)/i, weight: 4, description: 'All files/notes (German)' },
    // German - Structure creation
    { pattern: /(?:struktur|projektstruktur|ordnerstruktur)/i, weight: 3, description: 'Structure creation (German)' },
    { pattern: /(?:verzeichnisbaum|ordnerbaum)/i, weight: 3, description: 'Folder tree (German)' },
    // German - Batch operations
    { pattern: /(?:organisier|sortier|ordnen)\s*(?:alle|s[äa]mtliche)/i, weight: 3, description: 'Batch organization (German)' },
    { pattern: /(?:verschieb)\s*(?:mehrere|alle|s[äa]mtliche)/i, weight: 3, description: 'Batch move (German)' },
    // German - Content generation
    { pattern: /(?:inhalt|[üu]ber|bez[üu]glich)/i, weight: 2, description: 'Content generation (German)' },
    { pattern: /(?:schreib|generier)\s*(?:einen?)?\s*(?:artikel|aufsatz|dokument)/i, weight: 2, description: 'Document generation (German)' },
    // German - Lists and series
    { pattern: /(?:liste|reihe)\s*(?:von)?\s*(?:\d+|mehreren)?\s*(?:dateien|notizen)/i, weight: 2, description: 'List of items (German)' },
    { pattern: /(?:serie|reihe)\s*(?:von)?\s*(?:notizen|dateien)/i, weight: 3, description: 'Series of files (German)' },
    // German - Detailed content
    { pattern: /(?:detailliert|vollst[äa]ndig|umfassend|ausf[üu]hrlich)/i, weight: 2, description: 'Detailed content (German)' },
    { pattern: /(?:geschichte|biografie)\s*(?:[üu]ber|von)/i, weight: 2, description: 'Historical content (German)' },
    // German - With subfolders
    { pattern: /(?:mit)?\s*(?:unterordnern?|unterverzeichnissen?)/i, weight: 2, description: 'With subfolders (German)' },
    { pattern: /(?:kategorien?|abschnitte?|bereiche?)/i, weight: 1, description: 'Categories/sections (German)' },

    // French - Multiple items
    { pattern: /(?:cr[ée]e|g[ée]n[èe]re)\s*(\d+|plusieurs|beaucoup|quelques)/i, weight: 3, description: 'Multiple items (French)' },
    { pattern: /(?:tous?|toutes?)\s*(?:les)?\s*(?:fichiers?|notes?)/i, weight: 4, description: 'All files/notes (French)' },
    // French - Structure creation
    { pattern: /(?:structure|arborescence|hi[ée]rarchie)/i, weight: 3, description: 'Structure creation (French)' },
    { pattern: /(?:arbre\s+de\s+(?:dossiers?|r[ée]pertoires?))/i, weight: 3, description: 'Folder tree (French)' },
    // French - Batch operations
    { pattern: /(?:organise|trie|range)\s*(?:tous?|toutes?)/i, weight: 3, description: 'Batch organization (French)' },
    { pattern: /(?:d[ée]place)\s*(?:plusieurs|tous?|toutes?)/i, weight: 3, description: 'Batch move (French)' },
    // French - Content generation
    { pattern: /(?:contenu|[àa] propos de|concernant|sur)/i, weight: 2, description: 'Content generation (French)' },
    { pattern: /(?:[ée]cris|r[ée]dige|g[ée]n[èe]re)\s*(?:un[e]?)?\s*(?:article|essai|document)/i, weight: 2, description: 'Document generation (French)' },
    // French - Lists and series
    { pattern: /(?:liste|s[ée]rie)\s*(?:de)?\s*(?:\d+|plusieurs)?\s*(?:fichiers?|notes?)/i, weight: 2, description: 'List of items (French)' },
    { pattern: /(?:s[ée]rie)\s*(?:de)?\s*(?:notes?|fichiers?)/i, weight: 3, description: 'Series of files (French)' },
    // French - Detailed content
    { pattern: /(?:d[ée]taill[ée]|complet|exhaustif|approfondi)/i, weight: 2, description: 'Detailed content (French)' },
    { pattern: /(?:histoire|biographie)\s*(?:de|sur|[àa] propos)/i, weight: 2, description: 'Historical content (French)' },
    // French - With subfolders
    { pattern: /(?:avec)?\s*(?:sous-dossiers?|sous-r[ée]pertoires?)/i, weight: 2, description: 'With subfolders (French)' },
    { pattern: /(?:cat[ée]gories?|sections?|parties?)/i, weight: 1, description: 'Categories/sections (French)' },
  ];

  // Patterns to detect multi-file requests with explicit items
  private static readonly MULTI_FILE_PATTERNS: Array<{
    pattern: RegExp;
    extractor: (match: RegExpMatchArray, request: string) => string[];
  }> = [
    // Numbered lists: "create notes about: 1. Topic A, 2. Topic B, 3. Topic C"
    {
      pattern: /(?:notas?|notes?|archivos?|files?)\s*(?:sobre|about|de|for|:)\s*(.+)/i,
      extractor: (match, request) => {
        const content = match[1];
        // Try to extract items from numbered lists or comma-separated
        const items = content.split(/(?:\d+\.\s*|,\s*|\s+y\s+|\s+and\s+)/).filter(s => s.trim().length > 2);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    // "Create notes for X, Y, and Z"
    {
      pattern: /(?:crear?|create?|genera?r?)\s+(?:notas?|notes?)\s+(?:para|for|sobre|about)\s+(.+)/i,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|\s+y\s+|\s+and\s+)/).filter(s => s.trim().length > 2);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    // "Notes about artists: Elvis, Beatles, Madonna"
    {
      pattern: /(?:notas?|notes?)\s+(?:sobre|about|de)\s+(?:\w+)\s*:\s*(.+)/i,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|\s+y\s+|\s+and\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    // Count-based: "create 5 notes about..."
    {
      pattern: /(?:crear?|create?|genera?r?)\s+(\d+)\s+(?:notas?|notes?|archivos?|files?)/i,
      extractor: (match, request) => {
        const count = parseInt(match[1], 10);
        // Can't extract specific items, but we know the count
        return Array(Math.min(count, 10)).fill('').map((_, i) => `Item ${i + 1}`);
      }
    },
    // Chinese: "笔记关于..." or "创建笔记关于..."
    {
      pattern: /(?:笔记|文件)\s*(?:关于|涉及|对于)\s*(.+)/,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|，\s*|\s+和\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;，。；]$/, ''));
      }
    },
    {
      pattern: /(?:创建|生成)\s*(?:笔记)\s*(?:关于|对于)\s*(.+)/,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|，\s*|\s+和\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;，。；]$/, ''));
      }
    },
    // Chinese count-based: "创建5个笔记..."
    {
      pattern: /(?:创建|生成)\s*(\d+)\s*(?:个)?\s*(?:笔记|文件)/,
      extractor: (match) => {
        const count = parseInt(match[1], 10);
        return Array(Math.min(count, 10)).fill('').map((_, i) => `Item ${i + 1}`);
      }
    },
    // German: "Notizen über..." or "Erstelle Notizen über..."
    {
      pattern: /(?:notizen?|dateien?)\s*(?:[üu]ber|bez[üu]glich|zu)\s*(.+)/i,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|\s+und\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    {
      pattern: /(?:erstell|generier)\s*(?:notizen?)\s*(?:[üu]ber|zu)\s*(.+)/i,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|\s+und\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    // German count-based: "Erstelle 5 Notizen..."
    {
      pattern: /(?:erstell|generier)\s*(\d+)\s*(?:notizen?|dateien?)/i,
      extractor: (match) => {
        const count = parseInt(match[1], 10);
        return Array(Math.min(count, 10)).fill('').map((_, i) => `Item ${i + 1}`);
      }
    },
    // French: "Notes sur..." or "Crée des notes sur..."
    {
      pattern: /(?:notes?|fichiers?)\s*(?:sur|[àa] propos de|concernant)\s*(.+)/i,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|\s+et\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    {
      pattern: /(?:cr[ée]e|g[ée]n[èe]re)\s*(?:des\s+)?(?:notes?)\s*(?:sur|concernant)\s*(.+)/i,
      extractor: (match) => {
        const content = match[1];
        const items = content.split(/(?:,\s*|\s+et\s+)/).filter(s => s.trim().length > 1);
        return items.map(s => s.trim().replace(/[.,;]$/, ''));
      }
    },
    // French count-based: "Crée 5 notes..."
    {
      pattern: /(?:cr[ée]e|g[ée]n[èe]re)\s*(\d+)\s*(?:notes?|fichiers?)/i,
      extractor: (match) => {
        const count = parseInt(match[1], 10);
        return Array(Math.min(count, 10)).fill('').map((_, i) => `Item ${i + 1}`);
      }
    },
  ];

  // Action keywords for counting
  private static readonly ACTION_KEYWORDS = [
    // Spanish/English
    /\b(?:crea|create|genera|generate|haz|make)\b/gi,
    /\b(?:mueve|move|mover)\b/gi,
    /\b(?:elimina|delete|borra|remove)\b/gi,
    /\b(?:renombra|rename)\b/gi,
    /\b(?:escribe|write|agrega|add)\b/gi,
    // Chinese
    /(?:创建|生成|做|制作)/g,
    /(?:移动)/g,
    /(?:删除|移除|删掉)/g,
    /(?:重命名)/g,
    /(?:写|添加|追加)/g,
    // German
    /(?:erstell|generier|mach|anleg)/gi,
    /(?:verschieb|beweg)/gi,
    /(?:l[öo]sch|entfern)/gi,
    /(?:umbenennen)/gi,
    /(?:schreib|hinzuf[üu]g|anh[äa]ng)/gi,
    // French
    /(?:cr[ée]e|cr[ée]er|g[ée]n[èe]re|g[ée]n[ée]rer|fais|faire)/gi,
    /(?:d[ée]place|d[ée]placer|bouge|bouger)/gi,
    /(?:supprime|supprimer|efface|effacer)/gi,
    /(?:renomme|renommer)/gi,
    /(?:[ée]cris|[ée]crire|ajoute|ajouter)/gi,
  ];

  constructor(config: Partial<PlanningConfig> = {}) {
    this.config = { ...DEFAULT_PLANNING_CONFIG, ...config };
  }

  /**
   * Detect if request involves multiple files and extract items
   */
  detectMultiFileRequest(request: string): { isMultiFile: boolean; items: string[]; count: number } {
    for (const { pattern, extractor } of TaskPlanner.MULTI_FILE_PATTERNS) {
      const match = request.match(pattern);
      if (match) {
        const items = extractor(match, request);
        if (items.length >= 2) {
          return { isMultiFile: true, items, count: items.length };
        }
      }
    }

    // Also check for explicit numbers
    const numberMatch = request.match(/(\d+)\s+(?:notas?|notes?|archivos?|files?)/i);
    if (numberMatch) {
      const count = parseInt(numberMatch[1], 10);
      if (count >= 2) {
        return {
          isMultiFile: true,
          items: Array(Math.min(count, 10)).fill('').map((_, i) => `Item ${i + 1}`),
          count
        };
      }
    }

    return { isMultiFile: false, items: [], count: 0 };
  }

  /**
   * Create a multi-file plan that executes one file at a time
   */
  createMultiFilePlan(request: string, items: string[]): TaskPlan {
    const subtasks: Subtask[] = [];

    // First subtask: create folder structure if implied
    const needsFolder = /(?:carpeta|folder|estructura|structure)/i.test(request);
    if (needsFolder) {
      subtasks.push({
        id: 'subtask-folders',
        index: 0,
        description: t('agent.subtask.preparation'),
        prompt: `Create the necessary folder structure for: ${request}. Only create folders, no notes yet.`,
        dependencies: [],
        status: 'pending'
      });
    }

    // Create one subtask per file/item
    items.slice(0, this.config.maxSubtasks - (needsFolder ? 1 : 0)).forEach((item, idx) => {
      const subtaskIndex = needsFolder ? idx + 1 : idx;
      subtasks.push({
        id: `subtask-file-${idx + 1}`,
        index: subtaskIndex,
        description: `Create note: ${item}`,
        prompt: `Create ONE note about "${item}". Keep content concise (50-100 lines max). No elaborate formatting.`,
        dependencies: needsFolder ? ['subtask-folders'] : [],
        status: 'pending'
      });
    });

    return {
      id: `plan-${Date.now()}`,
      originalRequest: request,
      createdAt: Date.now(),
      subtasks,
      totalEstimatedActions: subtasks.length,
      currentSubtaskIndex: 0,
      status: 'executing'
    };
  }

  /**
   * Analyze a request to determine complexity
   */
  analyzeRequest(request: string): TaskAnalysis {
    const reasons: string[] = [];
    let complexityScore = 0;

    // Check for multi-file requests first - this is critical
    const multiFileResult = this.detectMultiFileRequest(request);
    if (multiFileResult.isMultiFile) {
      complexityScore += multiFileResult.count * 2;
      reasons.push(`Multi-file request: ${multiFileResult.count} items detected`);
    }

    // Check patterns
    for (const { pattern, weight, description } of TaskPlanner.COMPLEXITY_PATTERNS) {
      if (pattern.test(request)) {
        complexityScore += weight;
        reasons.push(description);
      }
    }

    // Count action keywords
    let actionKeywordCount = 0;
    for (const pattern of TaskPlanner.ACTION_KEYWORDS) {
      const matches = request.match(pattern);
      if (matches) {
        actionKeywordCount += matches.length;
      }
    }

    if (actionKeywordCount >= 3) {
      complexityScore += actionKeywordCount - 2;
      reasons.push(`${actionKeywordCount} action keywords`);
    }

    // Extract numbers that might indicate quantity
    const numbers = request.match(/\b(\d+)\b/g);
    if (numbers) {
      const maxNumber = Math.max(...numbers.map(Number));
      if (maxNumber > 3) {
        complexityScore += Math.min(maxNumber / 2, 5);
        reasons.push(`Quantity: ${maxNumber}`);
      }
    }

    // Estimate actions based on complexity
    const estimatedActions = this.estimateActions(request, complexityScore);

    // Determine complexity level
    let complexity: TaskAnalysis['complexity'];
    if (complexityScore <= 1) {
      complexity = 'simple';
    } else if (complexityScore <= 3) {
      complexity = 'moderate';
    } else if (complexityScore <= 6) {
      complexity = 'complex';
    } else {
      complexity = 'very_complex';
    }

    const isComplex = complexityScore >= 3;
    // IMPORTANT: Always suggest planning for multi-file requests
    const suggestPlanning = multiFileResult.isMultiFile || (isComplex && estimatedActions > this.config.maxActionsPerSubtask);

    return {
      isComplex,
      complexity,
      estimatedActions,
      reasons,
      suggestPlanning,
      multiFile: {
        detected: multiFileResult.isMultiFile,
        items: multiFileResult.items,
        count: multiFileResult.count
      }
    };
  }

  /**
   * Estimate number of actions needed
   */
  private estimateActions(request: string, complexityScore: number): number {
    // Base estimate from complexity
    let estimate = complexityScore * 2;

    // Add based on specific patterns
    const numbers = request.match(/\b(\d+)\b/g);
    if (numbers) {
      const maxNumber = Math.max(...numbers.map(Number));
      estimate += maxNumber;
    }

    // "Structure" or "tree" implies multiple folders
    if (/(?:estructura|structure|árbol|tree)/i.test(request)) {
      estimate += 5;
    }

    // "Content" implies create + write
    if (/(?:contenido|content)/i.test(request)) {
      estimate += 3;
    }

    return Math.max(1, Math.round(estimate));
  }

  /**
   * Generate a planning prompt to ask the model to break down the task
   */
  generatePlanningPrompt(request: string, analysis: TaskAnalysis): string {
    return t('agent.planningPrompt', {
      request,
      maxActions: String(this.config.maxActionsPerSubtask),
      maxSubtasks: String(this.config.maxSubtasks),
      estimatedActions: String(analysis.estimatedActions)
    });
  }

  /**
   * Parse a planning response from the model
   */
  parsePlanningResponse(response: string, originalRequest: string): TaskPlan | null {
    try {
      // Try to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*"subtasks"[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsed.subtasks) || parsed.subtasks.length === 0) {
        return null;
      }

      const subtasks: Subtask[] = parsed.subtasks.map((st: any, idx: number) => ({
        id: st.id || `subtask-${idx + 1}`,
        index: idx,
        description: st.description || `Subtask ${idx + 1}`,
        prompt: st.prompt || st.description,
        dependencies: Array.isArray(st.dependencies) ? st.dependencies : [],
        status: 'pending' as const
      }));

      // Limit subtasks
      const limitedSubtasks = subtasks.slice(0, this.config.maxSubtasks);

      return {
        id: `plan-${Date.now()}`,
        originalRequest,
        createdAt: Date.now(),
        subtasks: limitedSubtasks,
        totalEstimatedActions: parsed.estimatedTotalActions || limitedSubtasks.length * 5,
        currentSubtaskIndex: 0,
        status: 'planning'
      };
    } catch (error) {
      logger.error('Error parsing planning response:', error);
      return null;
    }
  }

  /**
   * Create a simple plan for tasks that don't need model planning
   */
  createSimplePlan(request: string, analysis: TaskAnalysis): TaskPlan {
    // Check for multi-file request first - this takes priority
    const multiFileResult = this.detectMultiFileRequest(request);
    if (multiFileResult.isMultiFile && multiFileResult.items.length >= 2) {
      return this.createMultiFilePlan(request, multiFileResult.items);
    }

    // For moderately complex tasks, create a simple 2-step plan
    const subtasks: Subtask[] = [];

    if (analysis.estimatedActions > this.config.maxActionsPerSubtask) {
      // Split into preparation and execution
      subtasks.push({
        id: 'subtask-1',
        index: 0,
        description: t('agent.subtask.preparation'),
        prompt: `First, prepare the structure needed for: ${request}. Create any necessary folders.`,
        dependencies: [],
        status: 'pending'
      });

      subtasks.push({
        id: 'subtask-2',
        index: 1,
        description: t('agent.subtask.execution'),
        prompt: `Now complete the main task: ${request}. The folder structure is ready. Keep content concise.`,
        dependencies: ['subtask-1'],
        status: 'pending'
      });
    } else {
      // Single task
      subtasks.push({
        id: 'subtask-1',
        index: 0,
        description: request,
        prompt: `${request}. Keep content concise and practical.`,
        dependencies: [],
        status: 'pending'
      });
    }

    return {
      id: `plan-${Date.now()}`,
      originalRequest: request,
      createdAt: Date.now(),
      subtasks,
      totalEstimatedActions: analysis.estimatedActions,
      currentSubtaskIndex: 0,
      status: 'executing'
    };
  }

  /**
   * Get next subtask to execute
   */
  getNextSubtask(plan: TaskPlan): Subtask | null {
    // Find first pending subtask with satisfied dependencies
    for (const subtask of plan.subtasks) {
      if (subtask.status !== 'pending') {
        continue;
      }

      // Check dependencies
      const dependenciesSatisfied = subtask.dependencies.every(depId => {
        const dep = plan.subtasks.find(st => st.id === depId);
        return dep && dep.status === 'completed';
      });

      if (dependenciesSatisfied) {
        return subtask;
      }
    }

    return null;
  }

  /**
   * Update subtask status
   */
  updateSubtaskStatus(
    plan: TaskPlan,
    subtaskId: string,
    status: Subtask['status'],
    result?: SubtaskResult,
    error?: string
  ): void {
    const subtask = plan.subtasks.find(st => st.id === subtaskId);
    if (subtask) {
      subtask.status = status;
      subtask.result = result;
      subtask.error = error;

      // Update plan status
      const allCompleted = plan.subtasks.every(st => st.status === 'completed');
      const anyFailed = plan.subtasks.some(st => st.status === 'failed');

      if (allCompleted) {
        plan.status = 'completed';
      } else if (anyFailed) {
        // Check if we can continue despite failure
        const canContinue = plan.subtasks.some(st =>
          st.status === 'pending' &&
          !st.dependencies.some(depId =>
            plan.subtasks.find(d => d.id === depId)?.status === 'failed'
          )
        );

        if (!canContinue) {
          plan.status = 'failed';
        }
      }
    }
  }

  /**
   * Get plan progress
   */
  getProgress(plan: TaskPlan): { completed: number; total: number; percentage: number } {
    const completed = plan.subtasks.filter(st => st.status === 'completed').length;
    const total = plan.subtasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  /**
   * Generate summary of plan execution
   */
  generateSummary(plan: TaskPlan): string {
    const progress = this.getProgress(plan);
    const successful = plan.subtasks.filter(st => st.status === 'completed');
    const failed = plan.subtasks.filter(st => st.status === 'failed');

    let summary = t('agent.planSummary.header', {
      completed: String(progress.completed),
      total: String(progress.total)
    });

    if (successful.length > 0) {
      summary += '\n\n' + t('agent.planSummary.successful');
      for (const st of successful) {
        const actions = st.result?.actionsExecuted || 0;
        summary += `\n- ${st.description} (${actions} actions)`;
      }
    }

    if (failed.length > 0) {
      summary += '\n\n' + t('agent.planSummary.failed');
      for (const st of failed) {
        summary += `\n- ${st.description}: ${st.error || 'Unknown error'}`;
      }
    }

    return summary;
  }
}
