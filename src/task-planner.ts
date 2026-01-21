/**
 * Task Planner
 * Detects complex tasks and breaks them into manageable subtasks
 * to avoid truncation and improve reliability.
 */

import { t } from './i18n';

export interface TaskAnalysis {
  isComplex: boolean;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedActions: number;
  reasons: string[];
  suggestPlanning: boolean;
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
    // Multiple items
    { pattern: /(?:crear?|create?|genera?r?)\s+(\d+|varios|multiple|many|muchos)/i, weight: 3, description: 'Multiple items requested' },
    { pattern: /(?:todos?|all)\s+(?:los?|the)?\s*(?:archivos?|files?|notas?|notes?)/i, weight: 4, description: 'All files/notes' },

    // Structure creation
    { pattern: /(?:estructura|structure)\s+(?:de\s+)?(?:proyecto|project|carpetas?|folders?)/i, weight: 3, description: 'Structure creation' },
    { pattern: /(?:árbol|tree)\s+(?:de\s+)?(?:carpetas?|folders?|directorios?)/i, weight: 3, description: 'Folder tree' },

    // Batch operations
    { pattern: /(?:organizar?|organize?|ordenar?|sort)\s+(?:todos?|all|las?|los?|the)/i, weight: 3, description: 'Batch organization' },
    { pattern: /(?:mover?|move?)\s+(?:todos?|all|múltiples?|multiple)/i, weight: 3, description: 'Batch move' },

    // Content generation
    { pattern: /(?:con\s+)?(?:contenido|content)\s+(?:sobre|about|de|on)/i, weight: 2, description: 'Content generation' },
    { pattern: /(?:escribe?|write?|genera?r?|generate?)\s+(?:un\s+)?(?:artículo|article|ensayo|essay|documento|document)/i, weight: 2, description: 'Document generation' },

    // Lists and series
    { pattern: /(?:lista|list)\s+(?:de\s+)?(?:\d+|\w+)\s+(?:archivos?|files?|notas?|notes?|items?)/i, weight: 2, description: 'List of items' },
    { pattern: /(?:serie|series)\s+(?:de\s+)?(?:notas?|notes?|archivos?|files?)/i, weight: 3, description: 'Series of files' },

    // Detailed content
    { pattern: /(?:detallado|detailed|completo|complete|exhaustivo|comprehensive)/i, weight: 2, description: 'Detailed content' },
    { pattern: /(?:historia|history|biografía|biography)\s+(?:de|of|sobre|about)/i, weight: 2, description: 'Historical content' },

    // With subfolders/subcategories
    { pattern: /(?:con\s+)?(?:subcarpetas?|subfolders?|subdirectorios?)/i, weight: 2, description: 'With subfolders' },
    { pattern: /(?:categorías?|categories?|secciones?|sections?)/i, weight: 1, description: 'Categories/sections' },
  ];

  // Action keywords for counting
  private static readonly ACTION_KEYWORDS = [
    /\b(?:crea|create|genera|generate|haz|make)\b/gi,
    /\b(?:mueve|move|mover)\b/gi,
    /\b(?:elimina|delete|borra|remove)\b/gi,
    /\b(?:renombra|rename)\b/gi,
    /\b(?:escribe|write|agrega|add)\b/gi,
  ];

  constructor(config: Partial<PlanningConfig> = {}) {
    this.config = { ...DEFAULT_PLANNING_CONFIG, ...config };
  }

  /**
   * Analyze a request to determine complexity
   */
  analyzeRequest(request: string): TaskAnalysis {
    const reasons: string[] = [];
    let complexityScore = 0;

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
    const suggestPlanning = isComplex && estimatedActions > this.config.maxActionsPerSubtask;

    return {
      isComplex,
      complexity,
      estimatedActions,
      reasons,
      suggestPlanning
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
      console.error('Error parsing planning response:', error);
      return null;
    }
  }

  /**
   * Create a simple plan for tasks that don't need model planning
   */
  createSimplePlan(request: string, analysis: TaskAnalysis): TaskPlan {
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
        prompt: `Now complete the main task: ${request}. The folder structure is ready.`,
        dependencies: ['subtask-1'],
        status: 'pending'
      });
    } else {
      // Single task
      subtasks.push({
        id: 'subtask-1',
        index: 0,
        description: request,
        prompt: request,
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
