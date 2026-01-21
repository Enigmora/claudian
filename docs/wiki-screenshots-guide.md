# Wiki Screenshots Guide

This document provides guidelines for capturing and maintaining screenshots for the Claudian wiki documentation.

## Screenshot Requirements

| Screenshot | Filename | Description | How to Capture |
|------------|----------|-------------|----------------|
| Chat Interface | `chat-interface.png` | Full chat panel with messages | Open chat, send a test message, capture panel |
| Settings Panel | `settings-panel.png` | Full settings page | Open Settings > Claudian, capture full view |
| Settings Header | `settings-header.png` | Logo + title + description | Crop from settings page header |
| Agent Toggle | `agent-mode-toggle.png` | Toggle button in chat header | Crop from chat header area |
| Agent Confirmation | `confirmation-modal.png` | Confirmation dialog for destructive actions | Trigger a delete action in agent mode |
| Batch Modal | `batch-modal.png` | Full batch processing modal | Open batch process command |
| Batch Progress | `batch-progress.png` | Progress bar during processing | During batch execution |
| Note Creator | `note-creator-modal.png` | Note creation dialog | Click "Create note" on any Claude response |
| Concept Map Result | `concept-map-result.png` | Generated concept map note | After generating a concept map |
| Concept Map Mermaid | `concept-map-mermaid.png` | Rendered Mermaid diagram | Preview mode showing the diagram |
| Suggestions Modal | `suggestions-modal.png` | Interactive suggestions with tags/links | After processing a note |

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
    ├── agent-mode-toggle.png
    ├── confirmation-modal.png
    ├── batch-modal.png
    ├── batch-progress.png
    ├── note-creator-modal.png
    ├── concept-map-result.png
    ├── concept-map-mermaid.png
    └── suggestions-modal.png
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

*Last updated: 2025-01-21*
