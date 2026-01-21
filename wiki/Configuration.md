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
| **Options** | Auto, English, Spanish |

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

### Model

| Setting | Description |
|---------|-------------|
| **Name** | Model |
| **Description** | Claude model to use for responses |
| **Default** | Claude Sonnet 4 |
| **Options** | Claude Sonnet 4, Claude Opus 4, Claude 3.5 Sonnet, Claude 3.5 Haiku |

**Model Comparison:**

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| Claude Sonnet 4 | General use, balanced performance | Fast | Medium |
| Claude Opus 4 | Complex reasoning, long documents | Slower | Higher |
| Claude 3.5 Sonnet | Previous generation, reliable | Fast | Medium |
| Claude 3.5 Haiku | Quick tasks, simple queries | Fastest | Lower |

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

### System Prompt

| Setting | Description |
|---------|-------------|
| **Name** | System prompt |
| **Description** | Custom instructions for Claude |
| **Default** | Built-in Obsidian-aware prompt |

You can customize Claude's behavior by modifying the system prompt. Click **Restore default** to reset to the original prompt.

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
| **Default** | 20 |
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

## Settings File Location

All settings are stored locally in your vault at:

```
.obsidian/plugins/claudian/data.json
```

This file contains your configuration including the API key. **Do not share this file publicly.**

---

## Recommended Configuration

### For General Use
- Model: Claude Sonnet 4
- Max tokens: 4096
- Confirm destructive actions: On

### For Large Vaults (1000+ notes)
- Notes in context: 200-300
- Tags in context: 100
- Consider using Claude Opus 4 for complex queries

### For Quick Tasks
- Model: Claude 3.5 Haiku
- Max tokens: 2048
