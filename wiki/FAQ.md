# Frequently Asked Questions

Common questions about Claudian.

---

## General

### What is Claudian?

Claudian is an Obsidian plugin that integrates Claude AI directly into your note-taking workflow. It provides a chat interface, note processing, and vault management through natural language.

---

### Is Claudian free?

Claudian itself is free and open source under the MIT license. However, you need an Anthropic API key to use Claude, which has associated costs based on usage.

---

### Which Claude models are supported?

Claudian uses intelligent model orchestration with these Claude 4 models:
- **Claude Haiku 4.5** (fastest, lowest cost)
- **Claude Sonnet 4** (balanced)
- **Claude Opus 4** (highest quality, complex tasks)

---

### Does Claudian work offline?

No. Claudian requires an internet connection to communicate with Claude's API.

---

## Privacy & Security

### Is my data sent to external servers?

Your messages are sent to Anthropic's API to generate responses. Anthropic's privacy policy applies to this data. Your API key and settings are stored locally in your vault.

---

### Where is my API key stored?

Your API key is stored in your vault at:
```
.obsidian/plugins/claudian/data.json
```

It is never sent anywhere except Anthropic's API for authentication.

---

### Can Claude read all my notes?

Only when you explicitly:
- Process a specific note
- Use batch processing on selected notes
- Enable vault context for Agent Mode

Claude doesn't have continuous access to your vault.

---

### Are my conversations stored?

Chat history is kept in memory during your session. When you close Obsidian or clear the chat, the conversation is lost. We don't store your conversations externally.

---

## API & Costs

### How do I get an API key?

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new key

---

### How much does it cost to use Claude?

Costs depend on:
- The model you use
- Number of tokens in your messages
- Frequency of use

Check [Anthropic's pricing page](https://www.anthropic.com/pricing) for current rates.

---

### How can I reduce API costs?

- Use **Economic** execution mode (routes all tasks to Haiku 4.5)
- Reduce max tokens in settings
- Be concise in your messages
- Reduce notes/tags in context

---

## Features

### What is Agent Mode?

Agent Mode allows Claude to execute actions on your vault through natural language. For example:
- "Create a new folder called Projects"
- "Move all notes about Python to Programming/"
- "Copy my notes to Archive/"
- "Delete empty notes in Drafts/"

See [Agent Mode](Features/Agent-Mode) for details.

---

### Why does the agent summarize instead of copying?

Agent Mode distinguishes between **file operations** (copy, move, backup) and **content transformations** (summarize, translate). If you ask to "copy" or "backup" a note, the content should be preserved exactly. If the agent is summarizing when you expect a copy, try being more explicit:

- Say "copy this note exactly to Archive/" instead of "put this in Archive"
- Use words like "copy", "backup", "duplicate" for exact copies
- Use words like "summarize", "translate", "rewrite" only when you want changes

---

### How do I stop a request in progress?

While Claude is generating a response, the Send button changes to a **Stop** button (with a red color). Click it to immediately cancel the request. This is useful for:
- Stopping long responses you no longer need
- Canceling a request to correct your prompt
- Freeing up to send a new message

---

### Can Claude create notes?

Yes, in two ways:
1. Click "Create note" on any chat response to save it as a note
2. Use Agent Mode to create notes directly: "Create a note about meeting notes"

---

### What is batch processing?

Batch processing lets you analyze multiple notes at once using templates like:
- Extract key ideas
- Executive summary
- Identify questions
- Extract action items

See [Batch Processing](Features/Batch-Processing) for details.

---

### What are concept maps?

Concept maps analyze a set of notes and generate a visual diagram showing:
- Main concepts
- Relationships between concepts
- Cross-cutting themes

The output uses Mermaid format for visualization.

---

## Compatibility

### What Obsidian version is required?

Claudian requires Obsidian v1.0.0 or higher.

---

### Does Claudian work on mobile?

Claudian should work on Obsidian mobile, but experience may vary. The desktop version is the primary development target.

---

### Are there any conflicting plugins?

No known conflicts. If you experience issues with other plugins, please report them on GitHub.

---

## Troubleshooting

### The chat is not responding

Check:
1. API key is configured
2. Internet connection is working
3. Anthropic API is operational

See [Troubleshooting](Troubleshooting) for detailed solutions.

---

### Agent Mode won't modify certain files

Some folders are protected by default:
- `.obsidian`
- `templates`
- `_templates`

Check **Settings > Protected folders** to adjust.

---

## Contributing

### Is Claudian open source?

Yes! Claudian is MIT licensed. Source code is available at [github.com/Enigmora/claudian](https://github.com/Enigmora/claudian).

---

### How can I contribute?

- Report bugs via [GitHub Issues](https://github.com/Enigmora/claudian/issues)
- Submit feature requests
- Create pull requests for improvements
- Help with translations

---

### Can I request features?

Yes! Open an issue on GitHub with the "feature request" label describing your idea.
