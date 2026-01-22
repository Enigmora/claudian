# Phase 5: Token Usage Tracking

## Overview

Add local token tracking to show users their API consumption within the plugin. This feature tracks raw token counts per session and historically, without cost estimation (as prices change frequently).

## Features

### 1. Session Tracking
- In-memory token counts for current session
- Resets when plugin reloads
- Tracks input/output tokens separately
- Counts API calls

### 2. Historical Tracking
- Persisted daily/weekly/monthly totals in `data.json`
- Aggregated statistics (total tokens, call count)
- Automatic cleanup of old data (optional)

### 3. Visual Indicator
- Minimal status bar below chat input
- Shows session token count (e.g., "1.2K tokens")
- Hover tooltip with details (input/output breakdown)
- Pulse animation on update
- Togglable via settings

### 4. Improved Error Handling
- Better detection of 400/429 quota errors
- More informative error messages for billing issues

## Architecture

```
API Call → stream.finalMessage().usage → TokenTracker → UI Update
                                              ↓
                                         data.json (debounced)
```

## Data Structures

### TokenUsage (per API call)
```typescript
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  timestamp: number;
  method?: 'chat' | 'agent' | 'process' | 'template' | 'conceptMap';
}
```

### TokenStats (aggregated)
```typescript
interface TokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}
```

### TokenUsageHistory (persisted)
```typescript
interface TokenUsageHistory {
  daily: Record<string, TokenStats>;   // YYYY-MM-DD
  weekly: Record<string, TokenStats>;  // YYYY-Www
  monthly: Record<string, TokenStats>; // YYYY-MM
  allTime: TokenStats;
  lastUpdated: number;
}
```

### SessionTokenStats (in-memory)
```typescript
interface SessionTokenStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
  startTime: number;
}
```

## Files Created

### `src/token-tracker.ts`
Main tracking module with:
- `TokenUsageTracker` class
- Session statistics management
- Historical data aggregation
- Persistence with debouncing
- Format helpers (e.g., "1.2K", "3.5M")

## Files Modified

### `src/claude-client.ts`
- Add `onUsage?: (usage: TokenUsage) => void` to `StreamCallbacks`
- Extract usage from `stream.finalMessage()` in all streaming methods:
  - `sendMessageStream()`
  - `processNoteStream()`
  - `processWithTemplate()`
  - `generateConceptMap()`
  - `sendAgentMessageStream()`
- Improve error handling for quota/billing errors (400/429)

### `src/chat-view.ts`
- Add token footer element below input area
- Wire callbacks to update indicator after each response
- Show/hide based on settings

### `src/settings.ts`
- Add `tokenUsageHistory: TokenUsageHistory` to persisted data
- Add `showTokenIndicator: boolean` toggle setting

### `src/main.ts`
- Initialize `TokenUsageTracker` on plugin load
- Make tracker accessible to other components

### `styles.css`
- Token footer styles
- Status indicator styles
- Pulse animation on update
- Tooltip styling

### `src/i18n/types.ts` + locales
New translation keys:
- `tokens.sessionCount`
- `tokens.tooltip`
- `tokens.inputLabel`
- `tokens.outputLabel`
- `tokens.callsLabel`
- `settings.showTokens.name`
- `settings.showTokens.desc`
- `error.quotaExhausted`
- `error.billingIssue`

## UI Design

```
┌─────────────────────────────────────────┐
│ [textarea input area                  ] │
│ [Send]                                  │
├─────────────────────────────────────────┤
│                        📊 1.2K tokens   │  ← Small, right-aligned
└─────────────────────────────────────────┘
```

Hover tooltip:
```
Input: 800 | Output: 400 | Calls: 3
```

## Implementation Notes

### Token Extraction
The Anthropic SDK provides usage information in the final message:
```typescript
const stream = client.messages.stream({...});
const finalMessage = await stream.finalMessage();
// finalMessage.usage = { input_tokens: number, output_tokens: number }
```

### Persistence Strategy
- Debounce writes to data.json (500ms)
- Only persist history, not session stats
- Merge with existing settings on save

### Date Key Formats
- Daily: `2025-01-21` (ISO date)
- Weekly: `2025-W03` (ISO week)
- Monthly: `2025-01` (Year-month)

### Error Detection
Improve existing error handling:
- 400 with "billing" or "quota" keywords
- 429 with quota-specific messages
- Add new translated error messages

## Testing Checklist

1. [ ] Send a message in chat, verify token count appears
2. [ ] Send multiple messages, verify accumulation
3. [ ] Reload plugin, verify session resets but history persists
4. [ ] Check data.json for tokenUsageHistory structure
5. [ ] Trigger rate limit error, verify improved message
6. [ ] Toggle showTokenIndicator setting, verify UI hides/shows
7. [ ] Verify tooltip shows correct breakdown
8. [ ] Test in agent mode, verify tracking works
9. [ ] Test batch processing, verify tracking works
10. [ ] Verify animation on token update

## Future Enhancements (Not in Scope)

- Cost estimation (requires external price data)
- Usage limits/alerts
- Export usage data
- Per-conversation tracking
- Usage graphs/visualization
