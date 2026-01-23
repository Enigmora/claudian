/**
 * Model Orchestrator System for Claudian
 *
 * Routes tasks to the optimal Claude model based on complexity:
 * - Automatic: Haiku classifies task, then routes to appropriate model
 * - Economic: Everything to Haiku
 * - Maximum Quality: Everything to Opus
 */

import type { ClaudeClient } from './claude-client';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Execution modes for the orchestrator
 */
export type ExecutionMode = 'automatic' | 'economic' | 'maximum_quality';

/**
 * Available Claude model IDs
 */
export type ModelId =
  | 'claude-haiku-4-5-20251001'
  | 'claude-sonnet-4-20250514'
  | 'claude-opus-4-20250514';

/**
 * Task complexity levels
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'deep';

/**
 * Task classification result
 */
export interface TaskClassification {
  complexity: ComplexityLevel;
  suggestedModel: ModelId;
  confidence: number;
  reasoning: string;
  source: 'haiku' | 'fallback';
}

/**
 * Route request result
 */
export interface RouteResult {
  model: ModelId;
  classification: TaskClassification;
  mode: ExecutionMode;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

export const MODELS = {
  HAIKU: 'claude-haiku-4-5-20251001' as ModelId,
  SONNET: 'claude-sonnet-4-20250514' as ModelId,
  OPUS: 'claude-opus-4-20250514' as ModelId,
};

/**
 * Model selection matrix based on mode and complexity
 */
const MODEL_MATRIX: Record<ExecutionMode, Record<ComplexityLevel, ModelId>> = {
  automatic: {
    simple: MODELS.HAIKU,
    moderate: MODELS.SONNET,
    complex: MODELS.SONNET,
    deep: MODELS.OPUS,
  },
  economic: {
    simple: MODELS.HAIKU,
    moderate: MODELS.HAIKU,
    complex: MODELS.HAIKU,
    deep: MODELS.HAIKU,
  },
  maximum_quality: {
    simple: MODELS.OPUS,
    moderate: MODELS.OPUS,
    complex: MODELS.OPUS,
    deep: MODELS.OPUS,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Model Selector
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Selects the appropriate model based on classification and mode
 */
export class ModelSelector {
  /**
   * Select model based on complexity and execution mode
   */
  select(complexity: ComplexityLevel, mode: ExecutionMode): ModelId {
    return MODEL_MATRIX[mode][complexity];
  }

  /**
   * Get model display name for UI
   */
  getModelDisplayName(modelId: ModelId): string {
    switch (modelId) {
      case MODELS.HAIKU:
        return 'Haiku 4.5';
      case MODELS.SONNET:
        return 'Sonnet 4';
      case MODELS.OPUS:
        return 'Opus 4';
      default:
        return modelId;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Model Orchestrator
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main orchestration class
 * Coordinates task classification (via ClaudeClient) and model selection
 */
export class ModelOrchestrator {
  private client: ClaudeClient;
  private selector: ModelSelector;
  private mode: ExecutionMode;

  constructor(client: ClaudeClient, mode: ExecutionMode = 'automatic') {
    this.client = client;
    this.selector = new ModelSelector();
    this.mode = mode;
  }

  /**
   * Update the execution mode
   */
  setMode(mode: ExecutionMode): void {
    this.mode = mode;
  }

  /**
   * Get current execution mode
   */
  getMode(): ExecutionMode {
    return this.mode;
  }

  /**
   * Route a request to the appropriate model
   * Uses Haiku (via ClaudeClient) to classify in automatic mode
   */
  async routeRequest(message: string, isAgentMode: boolean = false): Promise<RouteResult> {
    // In non-automatic modes, skip classification (no API call needed)
    if (this.mode === 'economic') {
      return this.createResult('simple', 'Economic mode: all requests routed to Haiku', 'fallback');
    }

    if (this.mode === 'maximum_quality') {
      return this.createResult('deep', 'Maximum quality mode: all requests routed to Opus', 'fallback');
    }

    // Automatic mode: use Haiku to classify via ClaudeClient
    const result = await this.client.classifyTask(message);

    if (result) {
      const complexity = this.validateComplexity(result.complexity);
      const routeResult = this.createResult(complexity, result.reasoning, 'haiku');
      const keyword = result.reasoning ? ` (${result.reasoning})` : '';

      console.log(`[Orchestrator] ${complexity}${keyword} → ${this.selector.getModelDisplayName(routeResult.model)}`);

      return routeResult;
    }

    // Fallback if Haiku classification fails
    const fallbackResult = this.classifyWithFallback(message);
    console.log(`[Orchestrator] ${fallbackResult.classification.complexity} (fallback) → ${this.selector.getModelDisplayName(fallbackResult.model)}`);

    return fallbackResult;
  }

  /**
   * Create a route result from complexity level
   */
  private createResult(complexity: ComplexityLevel, reasoning: string, source: 'haiku' | 'fallback'): RouteResult {
    const model = this.selector.select(complexity, this.mode);
    return {
      model,
      classification: {
        complexity,
        suggestedModel: model,
        confidence: source === 'haiku' ? 0.85 : 0.5,
        reasoning,
        source,
      },
      mode: this.mode,
    };
  }

  /**
   * Validate complexity level
   */
  private validateComplexity(value: string): ComplexityLevel {
    const valid: ComplexityLevel[] = ['simple', 'moderate', 'complex', 'deep'];
    return valid.includes(value as ComplexityLevel)
      ? (value as ComplexityLevel)
      : 'moderate';
  }

  /**
   * Fallback classification using simple heuristics
   * Used when Haiku classification fails
   */
  private classifyWithFallback(message: string): RouteResult {
    const lower = message.toLowerCase();

    // Simple patterns
    if (/^(list|lista|copy|copia|move|mueve|delete|elimina|rename|renombra)/.test(lower)) {
      return this.createResult('simple', 'Fallback: file operation keyword', 'fallback');
    }

    // Deep patterns
    if (/(analy[sz]e deeply|analizar profundamente|comprehensive|exhaustive)/.test(lower)) {
      return this.createResult('deep', 'Fallback: deep analysis keyword', 'fallback');
    }

    // Complex patterns
    if (/(batch|lote|all files|todos los archivos|refactor|merge|fusionar)/.test(lower)) {
      return this.createResult('complex', 'Fallback: complex operation keyword', 'fallback');
    }

    // Default to moderate
    return this.createResult('moderate', 'Fallback: default classification', 'fallback');
  }

  /**
   * Check if a model requires verbose prompt (Haiku needs more explicit instructions)
   */
  requiresVerbosePrompt(modelId: ModelId): boolean {
    return modelId === MODELS.HAIKU;
  }

  /**
   * Get the selector for display names
   */
  getSelector(): ModelSelector {
    return this.selector;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Execution Mode Options
// ═══════════════════════════════════════════════════════════════════════════

export interface ExecutionModeOption {
  id: ExecutionMode;
  nameKey: 'settings.executionMode.automatic' | 'settings.executionMode.economic' | 'settings.executionMode.maxQuality';
  descKey: 'settings.executionMode.automaticDesc' | 'settings.executionMode.economicDesc' | 'settings.executionMode.maxQualityDesc';
}

export const EXECUTION_MODES: ExecutionModeOption[] = [
  {
    id: 'automatic',
    nameKey: 'settings.executionMode.automatic',
    descKey: 'settings.executionMode.automaticDesc',
  },
  {
    id: 'economic',
    nameKey: 'settings.executionMode.economic',
    descKey: 'settings.executionMode.economicDesc',
  },
  {
    id: 'maximum_quality',
    nameKey: 'settings.executionMode.maxQuality',
    descKey: 'settings.executionMode.maxQualityDesc',
  },
];
