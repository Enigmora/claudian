/**
 * Model Orchestrator System for Claudian
 *
 * Routes tasks to the optimal Claude model based on complexity:
 * - Automatic: Smart routing (Haiku for simple, Sonnet for complex, Opus for deep analysis)
 * - Economic: Everything to Haiku
 * - Maximum Quality: Everything to Opus
 */

import { t } from './i18n';

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
  patterns: string[];
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
// Task Classifier
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Heuristic-based task classifier
 * Analyzes user messages to determine task complexity
 */
export class TaskClassifier {
  // Simple file operations (Haiku-appropriate)
  private readonly simplePatterns: RegExp[] = [
    // List operations
    /^(?:list|lista|listar|show|mostrar|ver|muestra)\s+(?:files?|archivos?|notes?|notas?|folders?|carpetas?)/i,
    /(?:what|qué|cuáles?)\s+(?:files?|archivos?|notes?|notas?)\s+(?:are|hay|tengo)/i,

    // Copy/move file operations (flexible patterns)
    /^copia\s+(?:todos?\s+)?(?:los?\s+)?(?:archivos?|notas?|ficheros?)/i,
    /^copy\s+(?:all\s+)?(?:the\s+)?(?:files?|notes?)/i,
    /^(?:mueve|mover|move)\s+(?:todos?\s+)?(?:los?\s+)?(?:archivos?|notas?|ficheros?)/i,
    /(?:copy|copiar|copia)\s+(?:archivos?|files?|notas?|notes?)\s+(?:de|from|to|a|en)/i,
    /(?:move|mover|mueve)\s+(?:archivos?|files?|notas?|notes?)\s+(?:de|from|to|a|en)/i,

    // Simple single file operations
    /^(?:copy|copiar|move|mover|rename|renombrar|delete|eliminar|borrar)\s+(?:the\s+)?(?:file|archivo|note|nota)\b/i,
    /^(?:create|crear|crea)\s+(?:una?\s+)?(?:folder|carpeta)/i,

    // Simple read operations
    /^(?:read|leer|lee|open|abrir|abre)\s+(?:the\s+|la\s+|el\s+)?(?:file|archivo|note|nota)/i,

    // Status/info queries
    /(?:how\s+many|cuántas?|cuántos?)\s+(?:files?|archivos?|notes?|notas?)/i,

    // Folder content operations
    /(?:archivos?|files?|notas?|notes?)\s+(?:en|in|de|from|contenidos?\s+en)\s+(?:la\s+)?(?:carpeta|folder)/i,
  ];

  // Content creation (Sonnet-appropriate)
  private readonly moderatePatterns: RegExp[] = [
    // Create with content
    /(?:create|crear|write|escribir|generate|generar)\s+(?:a\s+)?(?:note|nota|summary|resumen|document|documento)/i,
    /(?:summarize|resumir|summarise)\s+/i,
    /(?:translate|traducir)\s+/i,

    // Organize/restructure
    /(?:organize|organizar|reorganize|reorganizar|structure|estructurar)/i,
    /(?:categorize|categorizar|classify|clasificar)/i,

    // Simple analysis
    /(?:find|encontrar|buscar)\s+(?:all|todos?|todas?)\s+(?:notes?|notas?)\s+(?:with|con|about|sobre)/i,
    /(?:search|buscar)\s+(?:for|por)?\s+/i,
  ];

  // Complex multi-step operations (Sonnet with careful routing)
  private readonly complexPatterns: RegExp[] = [
    // Batch operations
    /(?:all|todos?|todas?|every|cada)\s+(?:files?|archivos?|notes?|notas?)\s+(?:in|en)/i,
    /(?:batch|lote|bulk|masivo)/i,

    // Cross-reference operations
    /(?:link|enlazar|connect|conectar|relate|relacionar)\s+(?:all|todos?)/i,
    /(?:find\s+)?(?:connections?|conexiones?|relationships?|relaciones)/i,

    // Complex transformations
    /(?:refactor|refactorizar|restructure|reestructurar)/i,
    /(?:merge|fusionar|combine|combinar|consolidate|consolidar)/i,
  ];

  // Deep analysis tasks (Opus-appropriate)
  private readonly deepPatterns: RegExp[] = [
    // Explicit deep analysis requests
    /(?:analyze|analizar|analyse)\s+(?:deeply|profundamente|thoroughly|exhaustivamente|in\s+depth|en\s+profundidad)/i,
    /(?:comprehensive|completo|exhaustive|exhaustivo)\s+(?:analysis|análisis|review|revisión)/i,

    // Complex reasoning requests
    /(?:explain|explicar)\s+(?:in\s+detail|en\s+detalle|thoroughly|detalladamente)/i,
    /(?:evaluate|evaluar|assess|valorar)\s+(?:all|todos?|the\s+entire|todo\s+el)/i,

    // Knowledge synthesis
    /(?:synthesize|sintetizar|integrate|integrar)\s+(?:knowledge|conocimiento|information|información)/i,
    /(?:concept\s+map|mapa\s+conceptual|knowledge\s+graph|grafo\s+de\s+conocimiento)/i,

    // Strategic/planning requests
    /(?:plan|planificar|strategy|estrategia|roadmap|hoja\s+de\s+ruta)/i,
  ];

  /**
   * Classify a user message based on heuristic patterns
   */
  classify(message: string, isAgentMode: boolean): TaskClassification {
    const matchedPatterns: string[] = [];
    let complexity: ComplexityLevel = 'moderate';
    let confidence = 0.5;
    let reasoning = '';

    // Check patterns in order of complexity (highest first)
    const deepMatches = this.matchPatterns(message, this.deepPatterns);
    if (deepMatches.length > 0) {
      complexity = 'deep';
      confidence = 0.8 + (deepMatches.length * 0.05);
      matchedPatterns.push(...deepMatches);
      reasoning = 'Deep analysis indicators detected';
    } else {
      const complexMatches = this.matchPatterns(message, this.complexPatterns);
      if (complexMatches.length > 0) {
        complexity = 'complex';
        confidence = 0.7 + (complexMatches.length * 0.05);
        matchedPatterns.push(...complexMatches);
        reasoning = 'Complex multi-step operation detected';
      } else {
        const moderateMatches = this.matchPatterns(message, this.moderatePatterns);
        const simpleMatches = this.matchPatterns(message, this.simplePatterns);

        if (simpleMatches.length > 0 && simpleMatches.length >= moderateMatches.length) {
          complexity = 'simple';
          confidence = 0.75 + (simpleMatches.length * 0.05);
          matchedPatterns.push(...simpleMatches);
          reasoning = 'Simple file operation detected';
        } else if (moderateMatches.length > 0) {
          complexity = 'moderate';
          confidence = 0.65 + (moderateMatches.length * 0.05);
          matchedPatterns.push(...moderateMatches);
          reasoning = 'Content creation or moderate complexity detected';
        }
      }
    }

    // Adjust for message length (longer messages tend to be more complex)
    if (message.length > 500 && complexity === 'simple') {
      complexity = 'moderate';
      reasoning += '; adjusted for message length';
    }
    if (message.length > 1000 && complexity === 'moderate') {
      complexity = 'complex';
      reasoning += '; adjusted for message length';
    }

    // Agent mode adjustments
    if (isAgentMode) {
      // In agent mode, give slightly more weight to simple operations
      // since the JSON format makes them more structured
      if (complexity === 'moderate' && matchedPatterns.some(p =>
        p.includes('list') || p.includes('copy') || p.includes('move')
      )) {
        complexity = 'simple';
        reasoning += '; agent mode adjustment for structured operation';
      }
    }

    // Default reasoning if none matched
    if (!reasoning) {
      reasoning = 'Default classification based on conversational context';
    }

    // Cap confidence at 0.95
    confidence = Math.min(confidence, 0.95);

    const suggestedModel = MODEL_MATRIX.automatic[complexity];

    return {
      complexity,
      suggestedModel,
      confidence,
      reasoning,
      patterns: matchedPatterns,
    };
  }

  /**
   * Match message against a set of patterns and return matched pattern descriptions
   */
  private matchPatterns(message: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        matches.push(pattern.source.slice(0, 30) + '...');
      }
    }
    return matches;
  }
}

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
  select(classification: TaskClassification, mode: ExecutionMode): ModelId {
    return MODEL_MATRIX[mode][classification.complexity];
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
 * Coordinates task classification and model selection
 */
export class ModelOrchestrator {
  private classifier: TaskClassifier;
  private selector: ModelSelector;
  private mode: ExecutionMode;

  constructor(mode: ExecutionMode = 'automatic') {
    this.classifier = new TaskClassifier();
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
   */
  routeRequest(message: string, isAgentMode: boolean = false): RouteResult {
    // In non-automatic modes, skip classification
    if (this.mode === 'economic') {
      return {
        model: MODELS.HAIKU,
        classification: {
          complexity: 'simple',
          suggestedModel: MODELS.HAIKU,
          confidence: 1.0,
          reasoning: 'Economic mode: all requests routed to Haiku',
          patterns: [],
        },
        mode: this.mode,
      };
    }

    if (this.mode === 'maximum_quality') {
      return {
        model: MODELS.OPUS,
        classification: {
          complexity: 'deep',
          suggestedModel: MODELS.OPUS,
          confidence: 1.0,
          reasoning: 'Maximum quality mode: all requests routed to Opus',
          patterns: [],
        },
        mode: this.mode,
      };
    }

    // Automatic mode: classify and route
    const classification = this.classifier.classify(message, isAgentMode);
    const model = this.selector.select(classification, this.mode);

    return {
      model,
      classification,
      mode: this.mode,
    };
  }

  /**
   * Check if a model is appropriate for agent mode
   * Haiku requires a more verbose prompt
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
