<p align="center">
  <img src="assets/logo-2.svg" alt="Claudian" width="400">
</p>

<p align="center">
  <strong>The ultimate Claude AI integration for Obsidian</strong>
</p>

<p align="center">
  <a href="https://enigmora.com"><img src="https://img.shields.io/badge/by-Enigmora-purple.svg?style=flat-square" alt="by Enigmora"></a>
  <a href="https://obsidian.md"><img src="https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=flat-square&logo=obsidian&logoColor=white" alt="Obsidian Plugin"></a>
  <a href="https://anthropic.com"><img src="https://img.shields.io/badge/Powered%20by-Claude-FF6B35?style=flat-square" alt="Powered by Claude"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License"></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#features">Features</a> •
  <a href="https://github.com/Enigmora/claudian/wiki">Documentation</a> •
  <a href="README_ES.md">Español</a> •
  <a href="README_ZH.md">中文</a> •
  <a href="README_DE.md">Deutsch</a> •
  <a href="README_FR.md">Français</a> •
  <a href="README_JA.md">日本語</a>
</p>

---

<p align="center">
  <img src="docs/images/preview.png" alt="Claudian Preview" width="700">
</p>

---

## What is Claudian?

Claudian brings **Claude AI** directly into your Obsidian vault. Chat with Claude in a dedicated side panel, process your notes to get smart suggestions, and use **Agent Mode** to manage your entire vault with natural language commands.

Your API key stays on your device. Your notes never leave your vault unless you ask Claude to analyze them.

---

## Features

### 💬 Integrated Chat
Converse with Claude without leaving Obsidian. Responses stream in real-time, and you can stop any request mid-generation.

### 📝 Smart Note Processing
Analyze your notes and receive intelligent suggestions for **tags**, **wikilinks**, and **atomic concepts** based on your vault's existing structure.

### 🤖 Agent Mode
Manage your vault with natural language:
- *"Create a Projects/2025 folder with subfolders for each quarter"*
- *"Move all notes tagged #archive to the Archive folder"*
- *"Translate this note to Spanish"*

**52 actions** across file management, editor control, templates, bookmarks, canvas, and more.

### 📊 Batch Processing
Process multiple notes at once with extraction templates:
- Key ideas & summaries
- Questions & action items
- Concepts & connections

### 🗺️ Concept Maps
Generate visual concept maps from selected notes, rendered in Mermaid format.

### 🧠 Intelligent Model Selection
Automatic model orchestration routes each task to the optimal Claude model:
- Simple tasks → Haiku (fast & economical)
- Content creation → Sonnet (balanced)
- Deep analysis → Opus (maximum quality)

### 🌍 Multilingual
Full support for **English**, **Spanish**, **Chinese**, **German**, **French**, and **Japanese**. More languages coming soon.

---

## Installation

### From Community Plugins (Recommended)
1. Open **Settings → Community Plugins**
2. Click **Browse** and search for "Claudian"
3. Click **Install**, then **Enable**

### Manual Installation
1. Download the latest release from [Releases](https://github.com/Enigmora/claudian/releases)
2. Extract to `.obsidian/plugins/claudian/` in your vault
3. Enable in **Settings → Community Plugins**

---

## Quick Start

1. Get your API key at [console.anthropic.com](https://console.anthropic.com/)
2. Open **Settings → Claudian** and enter your key
3. Click the Claudian icon in the ribbon or use the command palette
4. Start chatting!

> **Note:** This plugin requires an API key from Anthropic. API usage may incur costs based on [Anthropic's pricing](https://www.anthropic.com/pricing). Claudian is not affiliated with Anthropic.

For detailed configuration options, see the [Configuration Guide](https://github.com/Enigmora/claudian/wiki/Configuration).

---

## Documentation

Visit the **[Wiki](https://github.com/Enigmora/claudian/wiki)** for complete documentation:

- [Getting Started](https://github.com/Enigmora/claudian/wiki/Getting-Started)
- [Chat Interface](https://github.com/Enigmora/claudian/wiki/Features/Chat-Interface)
- [Agent Mode](https://github.com/Enigmora/claudian/wiki/Features/Agent-Mode)
- [Batch Processing](https://github.com/Enigmora/claudian/wiki/Features/Batch-Processing)
- [Troubleshooting](https://github.com/Enigmora/claudian/wiki/Troubleshooting)

---

## Privacy & Security

- **Network usage**: This plugin connects to [Anthropic's API](https://api.anthropic.com) to process your requests. Note content is only sent when you explicitly ask Claude to analyze it.
- **Local storage**: Your API key is stored only on your device in Obsidian's plugin data
- **No telemetry**: We don't collect any usage data or analytics
- **Open source**: 100% auditable code under [MIT License](LICENSE)

---

## Contributing

Contributions are welcome! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
git clone https://github.com/Enigmora/claudian.git
cd claudian && npm install
npm run dev
```

---

## License

[MIT License](LICENSE) — use it freely in your projects.

---

<p align="center">
  <img src="assets/logo.svg" alt="Claudian" width="48">
</p>

<p align="center">
  <strong>Claudian</strong><br>
  <sub>Developed by <a href="https://github.com/Enigmora">Enigmora</a></sub>
</p>
