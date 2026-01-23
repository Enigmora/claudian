# Model Orchestrator System - Technical Specification

## 1. Executive Summary

This document specifies the Model Orchestrator system for Claudian, an intelligent routing layer that automatically selects the optimal Claude model based on task complexity. This replaces the manual model selector with three execution modes: **Automatic**, **Economic**, and **Maximum Quality**.

## 2. Motivation

### Problem
- Single model selection doesn't optimize for cost/quality tradeoffs
- Simple file operations (copy, list, move) don't need expensive models
- Complex analysis tasks benefit from more capable models
- Users shouldn't need to manually switch models per task

### Solution
An orchestration layer that:
1. Classifies incoming tasks by complexity
2. Routes to the optimal model based on execution mode
3. Supports mixed tasks by using Sonnet as orchestrator to divide work

## 3. Execution Modes

### 3.1 Automatic (Default)
The orchestrator analyzes each request and routes to the best model:

| Task Complexity | Model Used | Examples |
|-----------------|------------|----------|
| Simple | Haiku 4.5 | list-folder, copy-note, move-note, delete, rename |
| Complex | Sonnet 4 | create with content, summarize, translate, generate |
| Deep Analysis | Opus 4 | "analyze thoroughly", research, long documents |
| Mixed | Sonnet → subtasks | "copy files and summarize each" |

### 3.2 Economic
All tasks routed to Haiku 4.5 for minimum cost. Best for:
- Users with limited API budgets
- High-volume simple operations
- Speed over quality

### 3.3 Maximum Quality
All tasks routed to Opus 4 for best results. Best for:
- Critical analysis tasks
- Important content generation
- When quality matters more than cost

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         chat-view.ts                             │
│                    (Message Entry Point)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ModelOrchestrator                            │
│                  (src/model-orchestrator.ts)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   TaskClassifier                          │   │
│  │                                                           │   │
│  │  Input: User message, conversation context                │   │
│  │  Output: TaskClassification                               │   │
│  │                                                           │   │
│  │  Methods:                                                 │   │
│  │  - classifyTask(message, isAgentMode)                     │   │
│  │  - isSimpleFileOperation(message)                         │   │
│  │  - isDeepAnalysisRequest(message)                         │   │
│  │  - isContentGeneration(message)                           │   │
│  │  - isMixedTask(message)                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ModelSelector                          │   │
│  │                                                           │   │
│  │  Input: TaskClassification, ExecutionMode                 │   │
│  │  Output: ModelId, SystemPrompt                            │   │
│  │                                                           │   │
│  │  Methods:                                                 │   │
│  │  - selectModel(classification, mode)                      │   │
│  │  - getModelSystemPrompt(modelId, isAgentMode)             │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌─────────┐
        │  Haiku  │   │ Sonnet  │   │  Opus   │
        │  4.5    │   │    4    │   │    4    │
        │ $1/$5M  │   │ $3/$15M │   │ $15/$75M│
        └─────────┘   └─────────┘   └─────────┘
              │             │             │
              └─────────────┼─────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ClaudeClient                               │
│              (Modified to accept model parameter)                │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Data Structures

### 5.1 Types

```typescript
// Execution modes available to users
type ExecutionMode = 'automatic' | 'economic' | 'maximum_quality';

// Internal complexity classification
type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'deep_analysis';

// Supported model IDs
type ModelId =
  | 'claude-sonnet-4-20250514'
  | 'claude-opus-4-20250514'
  | 'claude-haiku-4-5-20251001';
```

### 5.2 Interfaces

```typescript
interface TaskClassification {
  complexity: TaskComplexity;
  isFileOperation: boolean;
  isContentGeneration: boolean;
  isAnalysis: boolean;
  isDeepAnalysis: boolean;
  isMixed: boolean;
  suggestedModel: ModelId;
  reasoning: string;
}

interface RoutingDecision {
  model: ModelId;
  systemPrompt: string;
  classification: TaskClassification;
}

interface OrchestratorConfig {
  executionMode: ExecutionMode;
  enableSubtaskDecomposition: boolean;
}
```

## 6. Classification Heuristics

### 6.1 Simple File Operations (→ Haiku)

```typescript
const SIMPLE_FILE_PATTERNS = [
  /\b(?:list|listar|enumerar)\s+(?:archivos|files|carpeta|folder)/i,
  /\b(?:copy|copiar|copia)\s+(?:archivos?|files?|notas?|notes?)/i,
  /\b(?:move|mover|mueve)\s+(?:archivos?|files?|notas?|notes?)/i,
  /\b(?:delete|eliminar|borra|remove)\s+(?:archivos?|files?|notas?|notes?)/i,
  /\b(?:rename|renombrar|renombra)/i,
  /\b(?:create|crear|crea)\s+(?:carpeta|folder)/i,
];
```

### 6.2 Deep Analysis (→ Opus)

```typescript
const DEEP_ANALYSIS_PATTERNS = [
  /\b(?:analiza|analyze)\s+(?:profunda|deeply|exhaustiva|thoroughly)/i,
  /\b(?:examina|examine)\s+(?:en\s+detalle|in\s+detail|detenida)/i,
  /\b(?:investiga|investigate|research)\b/i,
  /\b(?:comprehensive|exhaustive|thorough)\s+(?:analysis|review)/i,
];
```

### 6.3 Content Generation (→ Sonnet)

```typescript
const CONTENT_GENERATION_PATTERNS = [
  /\b(?:create|crear|crea|genera|generate)\s+(?:nota|note|contenido|content)/i,
  /\b(?:write|escribe|redacta)/i,
  /\b(?:summarize|resume|resumen)/i,
  /\b(?:translate|traduce|traducir)/i,
  /\b(?:rewrite|reescribe)/i,
];
```

### 6.4 Mixed Task Detection

A task is mixed if it matches BOTH simple file patterns AND content generation patterns.

## 7. Model-Specific Prompts

### 7.1 Haiku Prompt Strategy

Haiku requires more explicit, verbose prompts. The compact optimized prompt that works well for Sonnet caused Haiku to:
- Make more API calls (7 vs 2)
- Use more tokens (10.9K vs 2.6K)
- Divide tasks unnecessarily

**Solution**: Maintain two prompt versions:
- `prompt.agentMode` - Compact, optimized (Sonnet/Opus)
- `prompt.agentModeHaiku` - Verbose, explicit (Haiku)

### 7.2 Prompt Selection

```typescript
getModelSystemPrompt(modelId: ModelId, isAgentMode: boolean): string {
  if (!isAgentMode) {
    return t('prompt.baseIdentity');
  }

  if (modelId === 'claude-haiku-4-5-20251001') {
    return this.buildHaikuAgentPrompt();  // Verbose version
  }

  return this.buildStandardAgentPrompt(); // Compact version
}
```

## 8. Settings Migration

### 8.1 Old Format
```json
{
  "model": "claude-sonnet-4-20250514",
  ...
}
```

### 8.2 New Format
```json
{
  "executionMode": "automatic",
  ...
}
```

### 8.3 Migration Logic
```typescript
async migrateSettings() {
  if (this.settings.model && !this.settings.executionMode) {
    if (this.settings.model.includes('haiku')) {
      this.settings.executionMode = 'economic';
    } else if (this.settings.model.includes('opus')) {
      this.settings.executionMode = 'maximum_quality';
    } else {
      this.settings.executionMode = 'automatic';
    }
    delete this.settings.model;
    await this.saveSettings();
  }
}
```

## 9. Token Tracking Enhancement

Track tokens per model for cost analysis:

```typescript
interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}

interface TokenUsageHistory {
  daily: Record<string, TokenStats>;
  weekly: Record<string, TokenStats>;
  monthly: Record<string, TokenStats>;
  allTime: TokenStats;
  byModel: Record<ModelId, TokenStats>;  // NEW
}
```

## 10. Implementation Phases

### Phase 1: Core Infrastructure (4-6 hours)
- Create `model-orchestrator.ts`
- Modify `claude-client.ts` for model parameter
- Update settings interface

### Phase 2: Task Classification (3-4 hours)
- Implement heuristic patterns
- Test classification accuracy

### Phase 3: Settings UI (2-3 hours)
- New execution mode dropdown
- i18n translations
- Migration logic

### Phase 4: Agent Integration (4-5 hours)
- Orchestrator integration in chat-view
- Haiku-optimized prompt
- Testing

### Phase 5: Polish (3-4 hours)
- Per-model token tracking
- Documentation
- Edge case handling

## 11. Testing Matrix

| Scenario | Mode | Expected Model | Verify |
|----------|------|----------------|--------|
| "List files in Notes" | Auto | Haiku | Low tokens, 2 calls |
| "Create note about AI" | Auto | Sonnet | Content generated |
| "Analyze doc thoroughly" | Auto | Opus | Deep analysis |
| "Copy files and summarize" | Auto | Sonnet | Mixed handling |
| Any task | Economic | Haiku | Always Haiku |
| Any task | Max Quality | Opus | Always Opus |

## 12. Future Enhancements

1. **Learning from usage**: Track which model produces better results per task type
2. **Cost budgets**: Set daily/monthly token limits per model
3. **Hybrid routing**: Start with Haiku, escalate to Sonnet if response is poor
4. **User feedback**: Allow rating responses to improve routing

## 13. References

- [Anthropic Model Pricing](https://www.anthropic.com/pricing)
- [Claude Model Comparison](https://docs.anthropic.com/en/docs/about-claude/models)
- Claudian existing architecture: `src/chat-view.ts`, `src/claude-client.ts`
