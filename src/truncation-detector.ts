/**
 * Truncation Detector
 * Detects when Claude's response has been truncated due to token limits
 * and provides information to enable auto-continuation.
 */

export interface TruncationDetectionResult {
  isTruncated: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  suggestedContinuationPrompt?: string;
}

export interface TruncationContext {
  response: string;
  maxTokens: number;
  isAgentMode: boolean;
}

export class TruncationDetector {
  // Patterns indicating truncated response (incomplete structures)
  private static readonly TRUNCATION_PATTERNS: Array<{ pattern: RegExp; weight: number; description: string }> = [
    // JSON structures
    { pattern: /\{[^}]*$/, weight: 0.9, description: 'Unclosed JSON object' },
    { pattern: /\[[^\]]*$/, weight: 0.9, description: 'Unclosed JSON array' },
    { pattern: /"[^"]*$/, weight: 0.8, description: 'Unclosed string' },
    { pattern: /"content":\s*"[^"]*$/, weight: 0.95, description: 'Unclosed content field' },
    { pattern: /"actions":\s*\[[^\]]*$/, weight: 0.95, description: 'Unclosed actions array' },

    // Markdown structures
    { pattern: /```[^`]*$/, weight: 0.85, description: 'Unclosed code block' },
    { pattern: /\n#+\s+[^\n]*$/, weight: 0.5, description: 'Ends with header' },

    // Lists
    { pattern: /\n\d+\.\s+[^.\n]*$/, weight: 0.6, description: 'Incomplete numbered list item' },
    { pattern: /\n[-*]\s+[^.\n]*$/, weight: 0.5, description: 'Incomplete bullet list item' },

    // Sentence structure
    { pattern: /[,;:]\s*$/, weight: 0.7, description: 'Ends with continuation punctuation' },
    { pattern: /\b(and|or|but|the|a|an|to|of|in|for|with)\s*$/i, weight: 0.75, description: 'Ends with conjunction/article' },
  ];

  // Patterns indicating complete response
  private static readonly COMPLETION_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
    { pattern: /\}\s*$/, weight: 0.8 },                                    // Closed JSON
    { pattern: /```\s*$/, weight: 0.7 },                                   // Closed code block
    { pattern: /[.!?]\s*$/, weight: 0.6 },                                 // Ends with sentence
    { pattern: /"requiresConfirmation":\s*(true|false)\s*\}\s*$/, weight: 0.95 }, // Complete agent response
    { pattern: /\]\s*\}\s*$/, weight: 0.9 },                               // Closed actions array and object
  ];

  // Agent mode specific patterns
  private static readonly AGENT_INCOMPLETE_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
    { pattern: /"actions":\s*\[$/, weight: 0.95 },                         // Empty actions array started
    { pattern: /"action":\s*"[^"]*",\s*"params":\s*\{[^}]*$/, weight: 0.9 }, // Incomplete action params
    { pattern: /"message":\s*"[^"]*$/, weight: 0.85 },                     // Incomplete message field
  ];

  /**
   * Detect if a response appears to be truncated
   */
  static detect(context: TruncationContext): TruncationDetectionResult {
    const { response, maxTokens, isAgentMode } = context;
    const trimmed = response.trim();

    // Empty response is not truncated, just empty
    if (!trimmed) {
      return {
        isTruncated: false,
        confidence: 'high',
        reason: 'Empty response'
      };
    }

    // Estimate tokens (approximately 4 characters per token)
    const estimatedTokens = response.length / 4;
    const tokenRatio = estimatedTokens / maxTokens;
    const nearLimit = tokenRatio > 0.85;
    const atLimit = tokenRatio > 0.95;

    // Calculate truncation score
    let truncationScore = 0;
    let completionScore = 0;
    let matchedPatterns: string[] = [];

    // Check truncation patterns
    for (const { pattern, weight, description } of this.TRUNCATION_PATTERNS) {
      if (pattern.test(trimmed)) {
        truncationScore += weight;
        matchedPatterns.push(description);
      }
    }

    // Check agent-specific patterns if in agent mode
    if (isAgentMode) {
      for (const { pattern, weight } of this.AGENT_INCOMPLETE_PATTERNS) {
        if (pattern.test(trimmed)) {
          truncationScore += weight;
          matchedPatterns.push('Incomplete agent JSON structure');
        }
      }
    }

    // Check completion patterns
    for (const { pattern, weight } of this.COMPLETION_PATTERNS) {
      if (pattern.test(trimmed)) {
        completionScore += weight;
      }
    }

    // Boost truncation score if near token limit
    if (nearLimit) {
      truncationScore *= 1.3;
    }
    if (atLimit) {
      truncationScore *= 1.5;
    }

    // Determine result
    const netScore = truncationScore - completionScore;

    if (netScore > 0.8 || (atLimit && truncationScore > 0.5)) {
      return {
        isTruncated: true,
        confidence: netScore > 1.2 ? 'high' : 'medium',
        reason: matchedPatterns.join('; ') || 'Near token limit with incomplete structure',
        suggestedContinuationPrompt: this.generateContinuationPrompt(trimmed, isAgentMode)
      };
    }

    if (netScore > 0.3 && nearLimit) {
      return {
        isTruncated: true,
        confidence: 'low',
        reason: 'Near token limit, possibly incomplete',
        suggestedContinuationPrompt: this.generateContinuationPrompt(trimmed, isAgentMode)
      };
    }

    return {
      isTruncated: false,
      confidence: completionScore > 0.5 ? 'high' : 'medium',
      reason: 'Response appears complete'
    };
  }

  /**
   * Generate an appropriate continuation prompt based on the truncated content
   */
  private static generateContinuationPrompt(truncatedResponse: string, isAgentMode: boolean): string {
    const lastChars = truncatedResponse.slice(-100);

    if (isAgentMode) {
      // Check what part of the JSON is incomplete
      if (/"actions":\s*\[/.test(truncatedResponse) && !/\]\s*,?\s*"message"/.test(truncatedResponse)) {
        return 'Continue completing the actions array. Remember to close with ] and include "message" and "requiresConfirmation" fields.';
      }

      if (/"content":\s*"[^"]*$/.test(lastChars)) {
        return 'Continue from where you stopped. Complete the content field and finish the JSON structure.';
      }

      return 'Continue from where you stopped. Complete the JSON response with all required fields: actions, message, and requiresConfirmation.';
    }

    // Non-agent mode
    if (/```[^`]*$/.test(truncatedResponse)) {
      return 'Continue from where you stopped. Complete the code block.';
    }

    if (/\d+\.\s+[^.]*$/.test(lastChars)) {
      return 'Continue from where you stopped. Complete the numbered list.';
    }

    return 'Continue from where you stopped.';
  }

  /**
   * Attempt to merge a truncated response with its continuation
   */
  static mergeResponses(original: string, continuation: string): string {
    const trimmedOriginal = original.trimEnd();
    const trimmedContinuation = continuation.trimStart();

    // Try to find overlap
    const overlapLength = this.findOverlap(trimmedOriginal, trimmedContinuation);

    if (overlapLength > 0) {
      return trimmedOriginal + trimmedContinuation.slice(overlapLength);
    }

    // Check if continuation starts with expected characters
    const lastChar = trimmedOriginal.slice(-1);
    const firstChar = trimmedContinuation.charAt(0);

    // Handle JSON continuation
    if (lastChar === '"' && firstChar === '"') {
      // Likely continuing a string that got split
      return trimmedOriginal.slice(0, -1) + trimmedContinuation.slice(1);
    }

    // Default: simple concatenation
    return trimmedOriginal + trimmedContinuation;
  }

  /**
   * Find overlapping text between end of first string and start of second
   */
  private static findOverlap(str1: string, str2: string): number {
    const maxOverlap = Math.min(50, str1.length, str2.length);

    for (let i = maxOverlap; i > 0; i--) {
      const end = str1.slice(-i);
      const start = str2.slice(0, i);

      if (end === start) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Check if a response looks like it was meant to be JSON but isn't valid
   */
  static isCorruptedJson(response: string): boolean {
    const trimmed = response.trim();

    // Looks like it should be JSON
    const looksLikeJson = trimmed.startsWith('{') || /"actions"/.test(trimmed);

    if (!looksLikeJson) {
      return false;
    }

    // Try to parse
    try {
      JSON.parse(trimmed);
      return false; // Valid JSON
    } catch {
      // Check if it's close to valid
      const bracketBalance = this.countBracketBalance(trimmed);
      return bracketBalance !== 0;
    }
  }

  /**
   * Count bracket balance to detect unclosed structures
   */
  private static countBracketBalance(str: string): number {
    let balance = 0;
    let inString = false;
    let escapeNext = false;

    for (const char of str) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\' && inString) {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{' || char === '[') {
          balance++;
        } else if (char === '}' || char === ']') {
          balance--;
        }
      }
    }

    return balance;
  }
}
