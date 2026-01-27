# Prompt Caching Analysis for Claudian

> **Status:** Not recommended for current implementation
> **Date:** 2026-01-27
> **Author:** Claude Code research

## Executive Summary

This document analyzes the feasibility of implementing [Anthropic's Prompt Caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching) feature in Claudian to optimize token consumption. After thorough analysis, **prompt caching is not recommended at this time** due to Claudian's compact prompt design being below the minimum cacheable threshold for most models.

---

## What is Prompt Caching?

Prompt caching allows storing frequently used context between API calls, reducing both costs and latency for repetitive tasks.

### Key Benefits

| Benefit | Impact |
|---------|--------|
| Cost reduction | Up to 90% savings on cached tokens (cache hits cost 10% of base price) |
| Latency improvement | Up to 85% faster responses |
| Cache write cost | 25% premium over base input tokens |
| Default TTL | 5 minutes (refreshed on each use, no extra cost) |
| Extended TTL | 1 hour available at additional cost |

### Pricing Structure (per million tokens)

| Model | Base Input | Cache Write (5m) | Cache Hit |
|-------|------------|------------------|-----------|
| Claude Opus 4.5 | $5 | $6.25 | $0.50 |
| Claude Sonnet 4.5 | $3 | $3.75 | $0.30 |
| Claude Haiku 4.5 | $1 | $1.25 | $0.10 |

### Minimum Token Requirements

| Model | Minimum Tokens |
|-------|---------------|
| Claude Haiku 4.5 | 4,096 |
| Claude Opus 4.5 | 4,096 |
| Claude Sonnet 4/4.5, Opus 4/4.1 | 1,024 |
| Claude Haiku 3/3.5 | 2,048 |

---

## Current Claudian Architecture

### System Prompt Structure

Claudian builds system prompts from multiple components:

```
┌─────────────────────────────────────┐
│ prompt.baseIdentity (~30 tokens)    │  ← Static
├─────────────────────────────────────┤
│ prompt.chatMode (~80 tokens)        │  ← Static
│   OR                                │
│ prompt.agentMode (~800 tokens)      │  ← Static
│   OR                                │
│ prompt.agentModeHaiku (~1200 tokens)│  ← Static (verbose for Haiku)
├─────────────────────────────────────┤
│ Vault Context (~100-300 tokens)     │  ← DYNAMIC (changes frequently)
│ - noteCount, folders, tags          │
├─────────────────────────────────────┤
│ Custom Instructions (variable)      │  ← User-configurable
└─────────────────────────────────────┘
         Total: ~1,000-1,600 tokens
```

### Prompt Sizes by Mode

| Mode | Estimated Size |
|------|---------------|
| Chat Mode | ~400-600 tokens |
| Agent Mode (Sonnet/Opus) | ~1,000-1,200 tokens |
| Agent Mode (Haiku) | ~1,400-1,600 tokens |

### Relevant Source Files

- `src/claude-client.ts` - API calls and prompt construction
- `src/agent-mode.ts` - Agent system prompt generation
- `src/i18n/locales/*.ts` - Prompt text definitions

---

## Feasibility Analysis

### Why Caching Won't Help Currently

| Factor | Impact |
|--------|--------|
| **Prompts below minimum** | Total prompts (~1,000-1,600 tokens) are near or below the minimum threshold, especially for Haiku (4,096 required) |
| **Dynamic vault context** | System prompt includes `noteCount`, `folders`, `tags` that change, causing cache invalidation |
| **Conversation history changes** | Each turn adds/modifies messages, partially invalidating cache |
| **Existing optimizations** | Model Orchestrator already routes simple tasks to Haiku; Context Management summarizes long conversations |

### Model-Specific Analysis

| Model | Min Required | Claudian Prompt | Cacheable? |
|-------|-------------|-----------------|------------|
| Haiku 4.5 | 4,096 | ~1,600 | ❌ No |
| Sonnet 4.5 | 1,024 | ~1,200 | ⚠️ Marginal |
| Opus 4 | 1,024 | ~1,200 | ⚠️ Marginal |

### Cost-Benefit Summary

```
Current approach (no caching):
- System prompt: ~1,200 tokens × $3/MTok = $0.0036 per request (Sonnet)

With caching (if it worked):
- First request: 1,200 tokens × $3.75/MTok = $0.0045 (cache write)
- Subsequent: 1,200 tokens × $0.30/MTok = $0.00036 (cache hit)

Savings per request after first: ~$0.003 (90%)
BUT: Cache invalidation from dynamic context would cause frequent cache misses
```

---

## Scenarios Where Caching Would Help

Prompt caching **would be valuable** if Claudian evolves to support:

1. **RAG with full documents** - Embedding complete note contents in context
2. **Extensive custom instructions** - Users configuring prompts of thousands of tokens
3. **Full vault indexing** - Including many note titles/contents in context
4. **Long conversation persistence** - Maintaining very long conversation histories

---

## Implementation Guide (Future Reference)

If caching becomes beneficial in the future, here's how to implement it:

### 1. Change System Prompt Structure

```typescript
// Current (string format)
system: systemPrompt

// With caching (array of content blocks)
system: [
  {
    type: "text",
    text: staticInstructions, // Base identity + mode instructions
    cache_control: { type: "ephemeral" }
  },
  {
    type: "text",
    text: dynamicContext // Vault context (not cached)
  }
]
```

### 2. Cache Conversation History

```typescript
messages: history.map((msg, i, arr) => ({
  role: msg.role,
  content: i === arr.length - 1
    ? msg.content  // Last message: no cache
    : [{
        type: "text",
        text: msg.content,
        cache_control: { type: "ephemeral" }
      }]
}))
```

### 3. Track Cache Performance

```typescript
// In StreamCallbacks
onUsage?: (usage: {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;  // New tokens cached
  cache_read_input_tokens?: number;       // Tokens read from cache
}) => void;
```

### 4. Separate Static and Dynamic Content

```typescript
// agent-mode.ts
getSystemPrompt(model?: ModelId): { static: string; dynamic: string } {
  const staticPart = t('prompt.baseIdentity') + '\n\n' + t('prompt.agentMode');
  const dynamicPart = `VAULT: ${noteCount} notes | Folders: ${folders}`;

  return { static: staticPart, dynamic: dynamicPart };
}
```

### 5. API Implementation Example

```typescript
// claude-client.ts
async sendMessageStream(
  userMessage: string,
  callbacks: StreamCallbacks,
  modelOverride?: ModelId
): Promise<void> {
  const { static: staticPrompt, dynamic: dynamicPrompt } = this.getPromptParts();
  const shouldCache = staticPrompt.length > 1024; // Token estimate

  const systemContent = shouldCache
    ? [
        { type: "text", text: staticPrompt, cache_control: { type: "ephemeral" } },
        { type: "text", text: dynamicPrompt }
      ]
    : staticPrompt + '\n\n' + dynamicPrompt;

  const stream = this.client.messages.stream({
    model: modelToUse,
    max_tokens: this.settings.maxTokens,
    system: systemContent,
    messages: this.prepareCacheableMessages(messages)
  });

  // ... rest of implementation
}
```

---

## Recommendations

### Current State: No Implementation Needed

1. **Keep current architecture** - Compact prompts are efficient
2. **Continue using Model Orchestrator** - Routes simple tasks to Haiku (cost-effective)
3. **Leverage Context Management** - Automatic summarization handles long conversations

### Future Triggers for Re-evaluation

Consider implementing caching when:

- [ ] System prompts consistently exceed 4,000 tokens
- [ ] RAG feature is added with full document embedding
- [ ] Users report high API costs from repetitive long prompts
- [ ] Vault context is expanded to include note contents

### Alternative Optimizations (Already Implemented)

| Optimization | Status | Impact |
|--------------|--------|--------|
| Model Orchestrator | ✅ Active | Routes simple tasks to Haiku |
| Context Management | ✅ Active | Summarizes long conversations |
| Compact prompts | ✅ Active | Minimizes token usage |
| Streaming responses | ✅ Active | Improves perceived latency |

---

## References

- [Anthropic Prompt Caching Documentation](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [Anthropic Prompt Caching Blog Post](https://www.anthropic.com/news/prompt-caching)
- [Anthropic API Pricing](https://www.anthropic.com/pricing)

---

## Appendix: Useful Code Patterns

### Check if Content is Cacheable

```typescript
function isCacheableLength(text: string, model: ModelId): boolean {
  // Rough estimate: 1 token ≈ 4 characters for English
  const estimatedTokens = Math.ceil(text.length / 4);

  const minimums: Record<string, number> = {
    'claude-haiku-4-5': 4096,
    'claude-sonnet-4-5': 1024,
    'claude-opus-4': 1024,
  };

  return estimatedTokens >= (minimums[model] || 1024);
}
```

### Cache Usage Tracking

```typescript
interface CacheUsageStats {
  totalCacheWrites: number;
  totalCacheReads: number;
  cacheHitRate: number;
  estimatedSavings: number;
}

function trackCacheUsage(usage: ApiUsage): void {
  const writes = usage.cache_creation_input_tokens || 0;
  const reads = usage.cache_read_input_tokens || 0;

  // Log for analysis
  logger.debug('Cache stats:', {
    writes,
    reads,
    hitRate: reads / (writes + reads) || 0
  });
}
```
