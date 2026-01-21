# Getting Started

Welcome to Claudian! This guide will help you install and configure the plugin to start chatting with Claude in Obsidian.

---

## Prerequisites

Before installing Claudian, make sure you have:

1. **Obsidian** v1.0.0 or higher installed
2. An **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)

---

## Installation

### Manual Installation

1. Download the latest release files from [GitHub Releases](https://github.com/Enigmora/claudian/releases):
   - `main.js`
   - `manifest.json`
   - `styles.css`

2. Create the plugin folder in your vault:
   ```
   .obsidian/plugins/claudian/
   ```

3. Copy the downloaded files into the `claudian` folder

4. Restart Obsidian or reload with `Ctrl/Cmd + R`

5. Go to **Settings > Community Plugins** and enable **Claudian**

### From Community Plugins (Coming Soon)

Once published to the Obsidian community plugins:

1. Open **Settings > Community Plugins**
2. Click **Browse** and search for "Claudian"
3. Click **Install**, then **Enable**

---

## Initial Setup

### 1. Get Your API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in to your Anthropic account
3. Navigate to **API Keys**
4. Create a new key and copy it

### 2. Configure Claudian

1. Open Obsidian **Settings**
2. Navigate to **Claudian** in the left sidebar
3. Paste your API key in the **API Key** field
4. Select your preferred **Model** (Claude Sonnet 4 recommended for most uses)

![Settings Panel](images/settings-panel.png)

### 3. Open the Chat

1. Click the Claudian icon in the left ribbon, or
2. Use the command palette (`Ctrl/Cmd + P`) and search for **"Open chat with Claude"**

---

## First Conversation

1. Type a message in the input area at the bottom of the chat panel
2. Press `Enter` or click **Send**
3. Watch Claude's response appear in real-time with streaming

![Chat Interface](images/chat-interface.png)

### Create a Note from Response

1. After receiving a response, click **Create note** button
2. Edit the suggested title and tags
3. The note will be saved with proper formatting (YAML frontmatter, wikilinks)

---

## Next Steps

Now that you're up and running:

- [Configure](Configuration) additional settings like notes folder and context limits
- Explore [Chat Interface](Features/Chat-Interface) features in detail
- Try [Agent Mode](Features/Agent-Mode) for natural language vault management
- Process multiple notes with [Batch Processing](Features/Batch-Processing)

---

## Uninstallation

To remove Claudian:

1. Go to **Settings > Community Plugins**
2. Find **Claudian** and click **Uninstall**
3. Optionally, delete the plugin folder:
   ```
   .obsidian/plugins/claudian/
   ```

Your notes and vault content will not be affected.
