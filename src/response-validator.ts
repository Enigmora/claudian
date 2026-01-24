/**
 * Response Validator
 * Validates coherence between what the model claims to have done
 * and the actual actions it provided in JSON format.
 */

import { AgentResponse } from './agent-mode';
import { t } from './i18n';

export interface ValidationResult {
  isValid: boolean;
  hasActionClaims: boolean;
  hasActionJson: boolean;
  claimedActions: string[];
  actualActions: string[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationWarning {
  type: 'missing_json' | 'empty_actions' | 'claim_mismatch' | 'incomplete_json' | 'confusion';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export class ResponseValidator {
  // Patterns indicating the model CLAIMS to have performed actions
  private static readonly ACTION_CLAIM_PATTERNS: Array<{ pattern: RegExp; action: string }> = [
    // Creation claims - Spanish/English
    { pattern: /(?:he |i have |i've |ya he |acabo de )(?:creado|created|generado|generated)/i, action: 'create' },
    { pattern: /(?:creé|created|hice|made)\s+(?:el|la|the|a)?\s*(?:archivo|file|nota|note|carpeta|folder)/i, action: 'create' },
    // Creation claims - Chinese
    { pattern: /(?:我[已经]?|已[经]?)(?:创建|生成)了?/, action: 'create' },
    { pattern: /(?:创建|生成)了?\s*(?:文件|笔记|文件夹)/, action: 'create' },

    // Move claims - Spanish/English
    { pattern: /(?:he |i have |i've |ya he )(?:movido|moved)/i, action: 'move' },
    { pattern: /(?:moví|moved)\s+(?:el|la|the)?\s*(?:archivo|file|nota|note)/i, action: 'move' },
    // Move claims - Chinese
    { pattern: /(?:我[已经]?|已[经]?)移动了?/, action: 'move' },

    // Delete claims - Spanish/English
    { pattern: /(?:he |i have |i've |ya he )(?:eliminado|deleted|borrado|removed)/i, action: 'delete' },
    { pattern: /(?:eliminé|deleted|borré)\s+(?:el|la|the)?\s*(?:archivo|file|nota|note|carpeta|folder)/i, action: 'delete' },
    // Delete claims - Chinese
    { pattern: /(?:我[已经]?|已[经]?)(?:删除|移除)了?/, action: 'delete' },

    // Rename claims - Spanish/English
    { pattern: /(?:he |i have |i've |ya he )(?:renombrado|renamed)/i, action: 'rename' },
    { pattern: /(?:renombré|renamed)\s+(?:el|la|the)?\s*(?:archivo|file|nota|note)/i, action: 'rename' },
    // Rename claims - Chinese
    { pattern: /(?:我[已经]?|已[经]?)重命名了?/, action: 'rename' },

    // Update claims - Spanish/English
    { pattern: /(?:he |i have |i've |ya he )(?:actualizado|updated|modificado|modified)/i, action: 'update' },
    { pattern: /(?:actualicé|updated|modifiqué|modified)\s+(?:el|la|the)?\s*(?:archivo|file|nota|note|contenido|content)/i, action: 'update' },
    // Update claims - Chinese
    { pattern: /(?:我[已经]?|已[经]?)(?:更新|修改)了?/, action: 'update' },

    // Completion claims - Spanish/English
    { pattern: /(?:listo|done|completado|completed|terminado|finished)/i, action: 'completed' },
    { pattern: /(?:aquí está|here is|here's|te presento)/i, action: 'present' },
    // Completion claims - Chinese
    { pattern: /(?:完成|已完成|搞定)/, action: 'completed' },
    { pattern: /(?:这是|给你|这里是)/, action: 'present' },
  ];

  // Patterns indicating confusion about capabilities
  private static readonly CONFUSION_PATTERNS = [
    // Spanish/English
    /(?:no puedo|cannot|can't|i'm unable to|no tengo la capacidad de)\s+(?:crear|create|escribir|write|generar|generate)/i,
    /(?:como\s+(?:un\s+)?(?:modelo|asistente|ia)|as\s+an?\s+(?:ai|assistant|model|language model))/i,
    /(?:no tengo acceso|don't have access|cannot access)/i,
    /(?:solo puedo|i can only)\s+(?:proporcionar|provide|dar|give|sugerir|suggest)/i,
    // Chinese
    /(?:我不能|无法|我没有能力)\s*(?:创建|写|生成)/,
    /(?:作为[一个]?(?:模型|助手|AI)|我是[一个]?(?:AI|助手))/,
    /(?:我没有访问权限|无法访问)/,
    /(?:我只能)\s*(?:提供|给|建议)/,
  ];

  /**
   * Validate a response for coherence between claims and actions
   */
  static validate(response: string, parsedResponse: AgentResponse | null): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Detect action claims in the text
    const claims = this.detectActionClaims(response);
    const hasActionClaims = claims.length > 0;

    // Check for actual JSON actions
    const hasActionJson = parsedResponse !== null &&
      Array.isArray(parsedResponse.actions) &&
      parsedResponse.actions.length > 0;

    const actualActions = hasActionJson
      ? parsedResponse!.actions.map(a => a.action)
      : [];

    // Check for confusion patterns
    const showsConfusion = this.detectConfusion(response);

    if (showsConfusion) {
      warnings.push({
        type: 'confusion',
        message: t('warning.modelConfusion'),
        severity: 'error'
      });
      suggestions.push(t('suggestion.remindAgentMode'));
    }

    // Main validation: claims actions but no JSON
    if (hasActionClaims && !hasActionJson) {
      warnings.push({
        type: 'missing_json',
        message: t('warning.actionClaimsNoJson'),
        severity: 'error'
      });
      suggestions.push(t('suggestion.requestJsonFormat'));
    }

    // Has JSON but empty actions array
    if (parsedResponse && Array.isArray(parsedResponse.actions) && parsedResponse.actions.length === 0) {
      if (hasActionClaims) {
        warnings.push({
          type: 'empty_actions',
          message: t('warning.emptyActionsArray'),
          severity: 'warning'
        });
      }
    }

    // Check for incomplete JSON (partial parse)
    if (!hasActionJson && this.looksLikeIncompleteJson(response)) {
      warnings.push({
        type: 'incomplete_json',
        message: t('warning.incompleteJson'),
        severity: 'warning'
      });
      suggestions.push(t('suggestion.requestContinuation'));
    }

    // Mismatch between claimed and actual actions
    if (hasActionClaims && hasActionJson) {
      const mismatches = this.findMismatches(claims, actualActions);
      if (mismatches.length > 0) {
        warnings.push({
          type: 'claim_mismatch',
          message: t('warning.actionMismatch', { mismatches: mismatches.join(', ') }),
          severity: 'info'
        });
      }
    }

    return {
      isValid: !showsConfusion && (hasActionJson || !hasActionClaims),
      hasActionClaims,
      hasActionJson,
      claimedActions: claims,
      actualActions,
      warnings,
      suggestions
    };
  }

  /**
   * Detect action claims in the response text
   */
  private static detectActionClaims(response: string): string[] {
    const claims: string[] = [];

    for (const { pattern, action } of this.ACTION_CLAIM_PATTERNS) {
      if (pattern.test(response)) {
        if (!claims.includes(action)) {
          claims.push(action);
        }
      }
    }

    return claims;
  }

  /**
   * Detect if the model shows confusion about its capabilities
   */
  private static detectConfusion(response: string): boolean {
    return this.CONFUSION_PATTERNS.some(pattern => pattern.test(response));
  }

  /**
   * Check if response looks like incomplete JSON
   */
  private static looksLikeIncompleteJson(response: string): boolean {
    const trimmed = response.trim();

    // Has JSON markers but isn't valid
    if (/"actions"/.test(trimmed) || trimmed.startsWith('{')) {
      try {
        JSON.parse(trimmed);
        return false; // Valid JSON
      } catch {
        // Count brackets
        const openBraces = (trimmed.match(/\{/g) || []).length;
        const closeBraces = (trimmed.match(/\}/g) || []).length;
        const openBrackets = (trimmed.match(/\[/g) || []).length;
        const closeBrackets = (trimmed.match(/\]/g) || []).length;

        return openBraces !== closeBraces || openBrackets !== closeBrackets;
      }
    }

    return false;
  }

  /**
   * Find mismatches between claimed and actual actions
   */
  private static findMismatches(claims: string[], actualActions: string[]): string[] {
    const mismatches: string[] = [];

    // Map claim types to action types
    const claimToActionMap: Record<string, string[]> = {
      'create': ['create-note', 'create-folder'],
      'move': ['move-note'],
      'delete': ['delete-note', 'delete-folder'],
      'rename': ['rename-note'],
      'update': ['replace-content', 'append-content', 'prepend-content', 'update-frontmatter'],
      'completed': [], // Generic, matches anything
      'present': []    // Generic, matches anything
    };

    for (const claim of claims) {
      const expectedActions = claimToActionMap[claim] || [];

      // Skip generic claims
      if (expectedActions.length === 0) {
        continue;
      }

      // Check if any expected action exists
      const hasMatchingAction = expectedActions.some(ea =>
        actualActions.some(aa => aa === ea)
      );

      if (!hasMatchingAction) {
        mismatches.push(claim);
      }
    }

    return mismatches;
  }

  /**
   * Generate a prompt to request proper JSON format
   */
  static generateRetryPrompt(originalResponse: string, validation: ValidationResult): string {
    const context = originalResponse.substring(0, 300);

    if (validation.warnings.some(w => w.type === 'confusion')) {
      return t('agent.retryPrompt.confusion');
    }

    if (validation.warnings.some(w => w.type === 'missing_json')) {
      return t('agent.retryPrompt.missingJson', { context });
    }

    if (validation.warnings.some(w => w.type === 'incomplete_json')) {
      return t('agent.retryPrompt.incompleteJson');
    }

    return t('agent.retryPrompt.generic');
  }

  /**
   * Check if validation result suggests we should retry
   */
  static shouldRetry(validation: ValidationResult): boolean {
    // Retry if there are actionable warnings
    return validation.warnings.some(w =>
      w.severity === 'error' &&
      (w.type === 'missing_json' || w.type === 'confusion')
    );
  }

  /**
   * Get human-readable summary of validation issues
   */
  static getSummary(validation: ValidationResult): string {
    if (validation.isValid && validation.warnings.length === 0) {
      return t('validation.valid');
    }

    const issues = validation.warnings
      .filter(w => w.severity !== 'info')
      .map(w => w.message);

    if (issues.length === 0) {
      return t('validation.validWithNotes');
    }

    return issues.join('\n');
  }
}
