# Phase 6: Context Management Integration

## Overview

Phase 6 integrates the existing `ContextManager` and `ContextStorage` systems with the chat flow to automatically reduce token consumption through conversation summarization when conversations become long.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              ChatView                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  sendMessage() ──► checkAndPerformSummarization()               │   │
│  │       │                      │                                   │   │
│  │       │                      ▼                                   │   │
│  │       │           shouldSummarize() > threshold?                 │   │
│  │       │                      │                                   │   │
│  │       │              YES ◄───┴───► NO                           │   │
│  │       │               │             │                            │   │
│  │       │               ▼             │                            │   │
│  │       │      generateSummary()      │                            │   │
│  │       │               │             │                            │   │
│  │       │               ▼             │                            │   │
│  │       │    summarizeAndOffload()    │                            │   │
│  │       │               │             │                            │   │
│  │       │               └─────────────┘                            │   │
│  │       ▼                                                          │   │
│  │  ClaudeClient.sendMessageStream()                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ClaudeClient                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  getHistory() ──► ContextManager.getActiveMessages()            │   │
│  │                          │                                       │   │
│  │  getSummaryContext() ──► ContextManager.getSummaryContext()     │   │
│  │                          │                                       │   │
│  │  addMessageToHistory() ──► ContextManager.addMessage()          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ContextManager                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Active Messages (limited by maxActiveContextMessages)          │   │
│  │  ┌─────┬─────┬─────┬─────┬─────┬─────┐                         │   │
│  │  │ M46 │ M47 │ M48 │ M49 │ M50 │ ... │                         │   │
│  │  └─────┴─────┴─────┴─────┴─────┴─────┘                         │   │
│  │                                                                  │   │
│  │  Summaries (compressed older messages)                          │   │
│  │  ┌───────────────────────────────────────┐                      │   │
│  │  │ Summary 1: Messages 1-20              │                      │   │
│  │  │ Summary 2: Messages 21-45             │                      │   │
│  │  └───────────────────────────────────────┘                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ContextStorage                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  .obsidian/plugins/claudian/temp/                               │   │
│  │  ├── session-xxx.json (active session data)                     │   │
│  │  ├── context-xxx.json (offloaded messages)                      │   │
│  │  └── ...                                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Sends Message

```
User types message and presses Enter
        │
        ▼
┌─────────────────────────┐
│ ChatView.sendMessage()  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ checkAndPerformSummarization()  │
│ ¿Messages > threshold?          │
│   YES → summarizeAndOffload()   │
│        • Save old messages      │
│        • Generate summary       │
│        • Keep recent N messages │
└───────────┬─────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ ClaudeClient.sendMessageStream()│
│ • Uses getActiveMessages()      │
│ • Sends only active messages    │
│ • + summary context in prompt   │
└───────────┬─────────────────────┘
            │
            ▼
      Anthropic API
   (reduced tokens)
```

### 2. Summarization Process

When `messages.length >= summarizeThreshold`:

1. **Separate Messages**
   - Recent: Last `maxActiveContextMessages` messages
   - Old: Everything before that

2. **Generate Summary**
   - Call Claude with summary prompt
   - Extract key topics, actions, and brief summary
   - Parse JSON response

3. **Store Summary**
   - Save old messages to `ContextStorage`
   - Create `ConversationSummary` object
   - Update session metadata

4. **Update Active Context**
   - Replace `currentSession.messages` with recent only
   - Add summary to `currentSession.summaries`

## Configuration Options

### Settings (src/settings.ts)

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| `autoContextManagement` | boolean | true | - | Enable/disable automatic context management |
| `messageSummarizeThreshold` | number | 20 | 10-50 | Messages before triggering summarization |
| `maxActiveContextMessages` | number | 50 | 20-100 | Messages to keep after summarization |

### UI Location

Settings > Claudian > Context Management section

## Token Savings Estimation

| Messages | Without Integration | With Integration | Savings |
|----------|---------------------|------------------|---------|
| 10       | ~2,500 tokens       | ~2,500 tokens    | 0%      |
| 30       | ~7,500 tokens       | ~3,000 tokens    | 60%     |
| 50       | ~12,500 tokens      | ~3,500 tokens    | 72%     |
| 100      | ~25,000 tokens      | ~4,000 tokens    | 84%     |

*Estimates based on ~250 tokens per message average*

## Modified Files

| File | Changes |
|------|---------|
| `src/settings.ts` | +3 settings, +1 UI section |
| `src/i18n/types.ts` | +11 translation keys |
| `src/i18n/locales/en.ts` | +11 English translations |
| `src/i18n/locales/es.ts` | +11 Spanish translations |
| `src/context-manager.ts` | Configurable thresholds, new methods |
| `src/claude-client.ts` | ContextManager integration |
| `src/chat-view.ts` | Session lifecycle, summarization |
| `src/main.ts` | Settings passed to ContextManager |

## New Methods

### ContextManager

```typescript
// Update thresholds at runtime
updateThresholds(options: ContextManagerOptions): void

// Get current threshold values
getThresholds(): { maxMessagesInContext: number; summarizeThreshold: number }

// Get active messages for API
getActiveMessages(): Message[]

// Sync from existing history
syncFromHistory(messages: Message[]): Promise<void>

// Get summary context string
getSummaryContext(): string | null

// Check if ready
isReady(): boolean
```

### ClaudeClient

```typescript
// Set context manager
setContextManager(manager: ContextManager | null, enabled: boolean): void

// Check if active
isContextManagementActive(): boolean

// Get context manager reference
getContextManager(): ContextManager | null

// Add message with sync
private addMessageToHistory(message: Message): Promise<void>

// Check and summarize
checkAndSummarize(generateSummary: Function): Promise<boolean>

// Get summary context
getSummaryContext(): string | null
```

### ChatView

```typescript
// Initialize session
private initializeContextSession(): Promise<void>

// End session
private endContextSession(): Promise<void>

// Check and summarize
private checkAndPerformSummarization(): Promise<boolean>

// Generate summary via Claude
private generateSummary(messages: Message[]): Promise<string>
```

## Error Handling

The system is designed to fail gracefully:

1. **Initialization Error**: Context management is disabled, chat works normally
2. **Summarization Error**: Returns false, continues with full history
3. **Storage Error**: Silently handled, no user impact

```typescript
try {
  const summarized = await this.client.checkAndSummarize(...);
} catch (error) {
  console.error('[Claudian] Error during summarization:', error);
  return false; // Continue normally
}
```

## Testing Checklist

### Basic Test
1. Open chat, send 25+ messages
2. Verify in console: `[Claudian] Conversation history summarized`
3. Verify chat continues working normally

### Configuration Test
1. Disable "Automatic context management" in settings
2. Verify behavior returns to normal (no summarization)
3. Re-enable and verify summarization works

### Persistence Test
1. Send messages, close/reopen ChatView
2. Verify history is restored correctly
3. Verify summaries are preserved

### Clear Test
1. Use "Clear chat" button
2. Verify both ClaudeClient and ContextManager are cleared
3. Verify new session starts fresh

## Security Considerations

- API key is never persisted in temp files
- Session data contains only conversation content
- Temp files are periodically purged (30min interval)
- Summary generation uses same API key as main chat

## Future Improvements

1. **Configurable Summary Model**: Use cheaper model for summarization
2. **Manual Summarization**: Button to trigger summarization on demand
3. **Summary Preview**: Show summary content in UI
4. **Export/Import**: Save/load conversation with summaries
