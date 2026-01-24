# Configuration

Complete reference for all Claudian settings. Access settings via **Settings > Claudian**.

---

## General Settings

### Language

| Setting | Description |
|---------|-------------|
| **Name** | Language |
| **Description** | Interface language for the plugin |
| **Default** | Auto (follows Obsidian's language) |
| **Options** | Auto, English, Español, 中文, Deutsch, Français, 日本語 |

The plugin automatically detects Obsidian's language setting, or you can manually override it.

---

### API Key

| Setting | Description |
|---------|-------------|
| **Name** | API Key |
| **Description** | Your Anthropic API key for Claude |
| **Default** | Empty |
| **Required** | Yes |

Get your API key from [console.anthropic.com](https://console.anthropic.com). The key is stored locally in your vault's plugin data file and is never sent to external servers (except Anthropic's API).

---

### Execution Mode

| Setting | Description |
|---------|-------------|
| **Name** | Execution Mode |
| **Description** | How Claudian selects the optimal model for each task |
| **Default** | Automatic |
| **Options** | Automatic, Economic, Maximum Quality |

**Mode Comparison:**

| Mode | Description | Best For |
|------|-------------|----------|
| **Automatic** | Haiku analyzes each task and routes to the optimal model | Most users - balances cost and quality |
| **Economic** | All tasks use Haiku | Budget-conscious users, simple tasks |
| **Maximum Quality** | All tasks use Opus | Complex reasoning, critical work |

**How Automatic Mode Works:**

The Model Orchestrator uses Haiku (fast and cheap) to classify each task's complexity:

| Complexity | Model Used | Example Tasks |
|------------|------------|---------------|
| Simple | Haiku 4.5 | List files, copy, move, delete, placeholder content |
| Moderate | Sonnet 4 | Write content, summarize, translate, explain |
| Complex | Sonnet 4 | Multi-file operations, batch processing, refactoring |
| Deep | Opus 4 | Analysis, strategic planning, knowledge synthesis |

This intelligent routing optimizes costs while ensuring quality where it matters.

---

### Notes Folder

| Setting | Description |
|---------|-------------|
| **Name** | Notes folder |
| **Description** | Destination folder for generated notes |
| **Default** | `Claude Notes` |

Notes created from chat responses will be saved in this folder. The folder will be created automatically if it doesn't exist.

---

### Max Tokens

| Setting | Description |
|---------|-------------|
| **Name** | Max tokens |
| **Description** | Maximum tokens in Claude's responses |
| **Default** | 4096 |
| **Range** | 1000 - 8192 |

Higher values allow longer responses but may increase API costs.

---

### Custom Instructions

| Setting | Description |
|---------|-------------|
| **Name** | Custom instructions |
| **Description** | Additional instructions for Claude |
| **Default** | Empty |

Add your own instructions to customize Claude's behavior. These instructions are **appended** to the built-in system prompt, so core functionality is always preserved. Click **Clear** to remove all custom instructions.

**Examples of custom instructions:**
- "Always respond in formal English"
- "Prefer using bullet points over paragraphs"
- "When creating notes, always add a 'status: draft' field"

**Note:** You cannot override Claude's core identity or base functionality. Custom instructions supplement the default behavior.

---

## Note Processing

These settings control how notes are analyzed when using the "Process active note" command.

### Notes in Context

| Setting | Description |
|---------|-------------|
| **Name** | Notes in context |
| **Description** | Number of note titles to include for wikilink suggestions |
| **Default** | 100 |
| **Range** | 10 - 500 |

Higher values provide more potential wikilink targets but increase API token usage.

---

### Tags in Context

| Setting | Description |
|---------|-------------|
| **Name** | Tags in context |
| **Description** | Number of existing tags to include for tag suggestions |
| **Default** | 50 |
| **Range** | 10 - 200 |

Includes your vault's existing tags so Claude can suggest relevant ones.

---

## Agent Mode

Settings for natural language vault management.

### Enable Agent Mode

| Setting | Description |
|---------|-------------|
| **Name** | Enable agent mode by default |
| **Description** | Start new chats with agent mode enabled |
| **Default** | Off |

When enabled, new chat sessions will have agent mode active. You can always toggle it in the chat header.

---

### Confirm Destructive Actions

| Setting | Description |
|---------|-------------|
| **Name** | Confirm destructive actions |
| **Description** | Show confirmation dialog before delete operations |
| **Default** | On |

**Strongly recommended to keep enabled.** This prevents accidental deletion of notes or folders.

---

### Protected Folders

| Setting | Description |
|---------|-------------|
| **Name** | Protected folders |
| **Description** | Folders that cannot be modified by agent mode |
| **Default** | `.obsidian, templates, _templates` |

Comma-separated list of folder paths. Agent mode will refuse to modify files in these folders.

---

### Max Actions Per Message

| Setting | Description |
|---------|-------------|
| **Name** | Max actions per message |
| **Description** | Maximum vault operations per agent response |
| **Default** | 25 |
| **Range** | 1 - 50 |

Limits the number of actions Claude can execute in a single response to prevent runaway operations.

---

### Auto-Continue

| Setting | Description |
|---------|-------------|
| **Name** | Auto-continue |
| **Description** | Automatically continue truncated responses |
| **Default** | On |

When enabled, if Claude's response is cut off due to token limits, the plugin will automatically request a continuation. This ensures complete responses for complex tasks.

---

### Auto-Plan

| Setting | Description |
|---------|-------------|
| **Name** | Auto-plan |
| **Description** | Automatically decompose complex tasks into steps |
| **Default** | On |

When enabled, Claude will break down complex requests into a series of manageable steps before execution. This improves reliability for multi-step operations.

---

### Context Reinforcement

| Setting | Description |
|---------|-------------|
| **Name** | Context reinforcement |
| **Description** | Reinforce agent context in long conversations |
| **Default** | On |

When enabled, the agent's system context is periodically reinforced during long conversations to maintain consistent behavior and prevent context drift.

---

## Token Tracking

Settings for monitoring API token usage.

### Show Token Indicator

| Setting | Description |
|---------|-------------|
| **Name** | Show token indicator |
| **Description** | Display token usage in chat footer |
| **Default** | On |

When enabled, shows the current session's token usage in the chat footer. Click the indicator to view detailed usage history.

**Token indicator shows:**
- Input tokens (sent to Claude)
- Output tokens (received from Claude)
- Session totals
- Click to expand usage history modal

---

## Context Management

Settings for automatic conversation optimization to reduce token usage.

### Automatic Context Management

| Setting | Description |
|---------|-------------|
| **Name** | Automatic context management |
| **Description** | Automatically summarize conversation history when it gets long |
| **Default** | On |

When enabled, Claudian automatically summarizes older messages when conversations become long. This reduces token usage while preserving important context, allowing for longer conversations without hitting token limits.

**How it works:**
- Monitors conversation length
- When threshold is reached, older messages are summarized
- Recent messages remain in full detail
- Summary context is included in new requests

---

### Summarize After Messages

| Setting | Description |
|---------|-------------|
| **Name** | Summarize after messages |
| **Description** | Number of messages before triggering automatic summarization |
| **Default** | 20 |
| **Range** | 10 - 50 |

Lower values summarize more frequently (more token savings, less context). Higher values keep more full messages before summarizing.

---

### Max Active Messages

| Setting | Description |
|---------|-------------|
| **Name** | Max active messages |
| **Description** | Maximum messages to keep in active context after summarization |
| **Default** | 50 |
| **Range** | 20 - 100 |

After summarization, this many recent messages are kept in full detail. Older messages are compressed into a summary.

**Token savings estimates:**

| Conversation Length | Without Summarization | With Summarization | Savings |
|---------------------|----------------------|-------------------|---------|
| 30 messages | ~7,500 tokens | ~3,000 tokens | 60% |
| 50 messages | ~12,500 tokens | ~3,500 tokens | 72% |
| 100 messages | ~25,000 tokens | ~4,000 tokens | 84% |

---

## Settings File Location

All settings are stored locally in your vault at:

```
.obsidian/plugins/claudian/data.json
```

This file contains your configuration including the API key. **Do not share this file publicly.**

---

## Recommended Configuration

### For General Use
- Execution Mode: Automatic
- Max tokens: 4096
- Confirm destructive actions: On

### For Large Vaults (1000+ notes)
- Execution Mode: Automatic
- Notes in context: 200-300
- Tags in context: 100

### For Budget-Conscious Users
- Execution Mode: Economic
- Max tokens: 2048

### For Critical Work
- Execution Mode: Maximum Quality
- Max tokens: 8192
