# Wiki Screenshots Guide

This document provides guidelines for capturing and maintaining screenshots for the Claudian wiki documentation.

## Screenshot Requirements

### Core Interface

| Screenshot | Filename | Description | How to Capture |
|------------|----------|-------------|----------------|
| Chat Interface | `chat-interface.png` | Full chat panel with messages | Open chat, send a test message, capture panel |
| Settings Panel | `settings-panel.png` | Full settings page | Open Settings > Claudian, capture full view |
| Settings Header | `settings-header.png` | Logo + title + description | Crop from settings page header |
| Note Creator | `note-creator-modal.png` | Note creation dialog | Click "Create note" on any Claude response |
| Suggestions Modal | `suggestions-modal.png` | Interactive suggestions with tags/links | After processing a note |

### Agent Mode

| Screenshot | Filename | Description | How to Capture |
|------------|----------|-------------|----------------|
| Agent Toggle | `agent-mode-toggle.png` | Toggle button in chat header | Crop from chat header area |
| Agent Confirmation | `confirmation-modal.png` | Confirmation dialog for destructive actions | Trigger a delete action in agent mode |
| Overwrite Confirmation | `overwrite-confirmation.png` | Confirmation when overwriting existing file | Copy/create note to existing path |
| Agent Progress | `agent-progress.png` | Real-time progress indicator during actions | During agent execution with multiple actions |
| Stop Button | `stop-button.png` | Red stop button during streaming | Send message, capture while response streams |

### Batch Processing

| Screenshot | Filename | Description | How to Capture |
|------------|----------|-------------|----------------|
| Batch Modal | `batch-modal.png` | Full batch processing modal | Open batch process command |
| Batch Progress | `batch-progress.png` | Progress bar during processing | During batch execution |

### Concept Maps

| Screenshot | Filename | Description | How to Capture |
|------------|----------|-------------|----------------|
| Concept Map Result | `concept-map-result.png` | Generated concept map note | After generating a concept map |
| Concept Map Mermaid | `concept-map-mermaid.png` | Rendered Mermaid diagram | Preview mode showing the diagram |

### Token Tracking

| Screenshot | Filename | Description | How to Capture |
|------------|----------|-------------|----------------|
| Token Indicator | `token-indicator.png` | Token usage indicator in chat footer | Send a message, capture the footer showing input/output tokens |
| Token History Modal | `token-history-modal.png` | Token usage history modal | Click on token indicator to open modal |

## Technical Specifications

### Dimensions
- **Recommended width**: 800px for consistency
- **Maximum width**: 1200px for detailed screenshots
- **Aspect ratio**: Maintain original proportions

### Format
- **File format**: PNG
- **Background**: Solid background (avoid transparency issues)
- **Quality**: High quality, no compression artifacts

### Theme Considerations
- **Primary**: Capture in Obsidian's default theme
- **Optional**: Provide both light and dark theme versions with suffixes:
  - `chat-interface-light.png`
  - `chat-interface-dark.png`

## File Organization

All screenshots are stored in `/wiki/images/` and shared across all language versions.

```
wiki/
└── images/
    ├── chat-interface.png
    ├── settings-panel.png
    ├── settings-header.png
    ├── agent-mode-toggle.png
    ├── confirmation-modal.png
    ├── overwrite-confirmation.png
    ├── agent-progress.png
    ├── stop-button.png
    ├── batch-modal.png
    ├── batch-progress.png
    ├── note-creator-modal.png
    ├── concept-map-result.png
    ├── concept-map-mermaid.png
    ├── suggestions-modal.png
    ├── token-indicator.png
    └── token-history-modal.png
```

## Capture Workflow

1. **Prepare environment**
   - Use a clean vault with representative content
   - Ensure plugin is properly configured
   - Hide sensitive information (API keys, personal notes)

2. **Capture screenshots**
   - Use your OS screenshot tool or a dedicated app
   - Capture at 1x or 2x resolution for retina displays
   - Include relevant context but avoid clutter

3. **Post-processing**
   - Resize to recommended dimensions if needed
   - Crop to focus on relevant UI elements
   - Add annotations if necessary (arrows, highlights)

4. **Naming convention**
   - Use lowercase kebab-case: `feature-name.png`
   - For variants: `feature-name-variant.png`
   - For themes: `feature-name-dark.png`, `feature-name-light.png`

## Updating Screenshots

When updating screenshots after UI changes:

1. Capture new version with same filename
2. Verify all wiki pages still display correctly
3. Commit with descriptive message: `docs: update chat-interface screenshot`

## Placeholder Images

Until actual screenshots are captured, wiki pages use image references that will display as broken links. This serves as a reminder to capture the required images.

To check which screenshots are missing, run:
```bash
ls wiki/images/ | sort
```

And compare against this guide.

---

## Capture Checklist

Use this checklist to track screenshot progress:

### Core Interface
- [ ] `chat-interface.png` - Full chat panel with messages
- [ ] `settings-panel.png` - Full settings page
- [ ] `settings-header.png` - Logo + title + description
- [ ] `note-creator-modal.png` - Note creation dialog
- [ ] `suggestions-modal.png` - Interactive suggestions modal

### Agent Mode (Priority: High)
- [ ] `agent-mode-toggle.png` - Toggle button in chat header
- [ ] `confirmation-modal.png` - Delete/destructive action confirmation
- [ ] `overwrite-confirmation.png` - File overwrite confirmation *(NEW)*
- [ ] `agent-progress.png` - Real-time progress indicator *(NEW)*
- [ ] `stop-button.png` - Red stop button during streaming *(NEW)*

### Batch Processing
- [ ] `batch-modal.png` - Batch processing selection modal
- [ ] `batch-progress.png` - Progress bar during execution

### Concept Maps
- [ ] `concept-map-result.png` - Generated concept map note
- [ ] `concept-map-mermaid.png` - Rendered Mermaid diagram

### Token Tracking
- [ ] `token-indicator.png` - Token usage indicator in chat footer
- [ ] `token-history-modal.png` - Token usage history modal

### Quick Capture Steps

1. **Stop Button** (`stop-button.png`)
   - Open chat, send any message
   - While streaming, capture the red Stop button

2. **Agent Progress** (`agent-progress.png`)
   - Enable Agent Mode
   - Request multiple actions: *"Create 3 folders: A, B, C"*
   - Capture the progress indicator showing items

3. **Overwrite Confirmation** (`overwrite-confirmation.png`)
   - Enable Agent Mode
   - Create a note that already exists
   - Capture the confirmation modal

4. **Token Indicator** (`token-indicator.png`)
   - Send any message in chat
   - Look at the footer showing "↑X ↓Y tokens"
   - Capture the token indicator area

5. **Token History Modal** (`token-history-modal.png`)
   - Click on the token indicator in the footer
   - Modal opens showing usage history
   - Capture the full modal

### Settings Panel Notes

The `settings-panel.png` screenshot should show:
- **Custom Instructions** field (replaced "System Prompt")
- **Token Tracking** section with "Show token indicator" toggle
- All Agent Mode settings (52 actions now available)

---

*Last updated: 2026-01-22*
