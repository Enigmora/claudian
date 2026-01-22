# README Images Guide

This document describes the images needed for the README.md file.

## Required Images

All images should be placed in `docs/images/`.

---

## 1. Logo Banner (`logo-banner.png`)

**Purpose:** Header image for the README

**Specifications:**
- **Dimensions:** 1200 x 300 px (4:1 aspect ratio)
- **Background:** Transparent or subtle gradient
- **Content:**
  - Claudian logo (centered or left-aligned)
  - "Claudian" text in large, clean typography
  - Optional: subtle tagline "The ultimate Claude AI integration for Obsidian"
- **Style:** Clean, modern, professional
- **Colors:** Use brand colors (#7F52FF purple, #E95D3C orange)

---

## 2. Preview Image (`preview.png`)

**Purpose:** Main showcase image demonstrating key features

**Specifications:**
- **Dimensions:** 1400 x 800 px (16:9 or similar)
- **Background:** Dark neutral (#1e1e1e) or Obsidian-like dark theme
- **Layout:** Grid or collage style with 4-6 feature panels

### Panel Structure

Each panel should contain:
1. **Screenshot fragment** (cropped to show the relevant feature)
2. **Feature title** (bold, white text)
3. **Brief description** (1 line, muted text)

### Suggested Panels

| Panel | Screenshot | Title | Description |
|-------|------------|-------|-------------|
| 1 | Chat interface with welcome screen | **Integrated Chat** | Converse with Claude in a side panel |
| 2 | Agent mode executing actions (with progress indicators) | **Agent Mode** | Manage your vault with natural language |
| 3 | Suggestions modal with tags/wikilinks | **Smart Suggestions** | Tags, wikilinks, and atomic concepts |
| 4 | Batch processing modal | **Batch Processing** | Process multiple notes at once |
| 5 | Token tracker in footer | **Usage Tracking** | Monitor your API token consumption |
| 6 | Settings panel | **Fully Configurable** | Customize everything to your workflow |

### Layout Options

**Option A: 2x3 Grid**
```
┌─────────────┬─────────────┬─────────────┐
│   Panel 1   │   Panel 2   │   Panel 3   │
├─────────────┼─────────────┼─────────────┤
│   Panel 4   │   Panel 5   │   Panel 6   │
└─────────────┴─────────────┴─────────────┘
```

**Option B: Featured + Grid**
```
┌─────────────────────────────────────────┐
│              Panel 1 (large)            │
├─────────────┬─────────────┬─────────────┤
│   Panel 2   │   Panel 3   │   Panel 4   │
└─────────────┴─────────────┴─────────────┘
```

**Option C: Asymmetric**
```
┌───────────────────┬─────────────────────┐
│     Panel 1       │       Panel 2       │
├─────────┬─────────┼─────────────────────┤
│ Panel 3 │ Panel 4 │       Panel 5       │
└─────────┴─────────┴─────────────────────┘
```

### Visual Style

- **Rounded corners** on screenshot fragments (8-12px radius)
- **Subtle shadow** or border to separate panels
- **Consistent padding** between elements
- **Typography:**
  - Title: 18-24px, bold, white (#ffffff)
  - Description: 12-14px, regular, muted (#888888)
- **Brand accent:** Use purple (#7F52FF) for highlights or borders

---

## 3. Alternative: Animated GIF (`preview.gif`)

If you prefer animation over a static image:

**Specifications:**
- **Dimensions:** 800 x 500 px
- **Duration:** 10-15 seconds total
- **Frame rate:** 15-20 fps
- **File size:** Keep under 5MB for fast loading

### Suggested Sequence

1. **0-3s:** Open Claudian panel, show welcome screen
2. **3-6s:** Type a message, show streaming response
3. **6-9s:** Enable agent mode, show action execution
4. **9-12s:** Show suggestions modal with tags
5. **12-15s:** Fade to logo/end card

### Tools for Creating GIFs

- [ScreenToGif](https://www.screentogif.com/) (Windows)
- [Gifox](https://gifox.io/) (macOS)
- [Peek](https://github.com/phw/peek) (Linux)
- [LICEcap](https://www.cockos.com/licecap/) (Cross-platform)

---

## Screenshot Capture Tips

1. **Use a clean vault** with sample notes that look professional
2. **Use dark theme** (matches most Obsidian users' preference)
3. **Resize window** to capture only the relevant portion
4. **Hide personal data** - use generic note names and content
5. **Consistent sizing** - all panel screenshots should have similar proportions

---

## File Checklist

```
docs/images/
├── logo-banner.png      # Header banner (1200x300)
├── preview.png          # Feature showcase collage (1400x800)
└── preview.gif          # Optional: animated demo (800x500)
```

---

## Design Tools

Recommended tools for creating the preview image:

- **Figma** (free, web-based) - Best for collaborative design
- **Canva** (free tier available) - Easy templates
- **Photoshop/GIMP** - Full control over composition
- **Excalidraw** - Quick mockups with hand-drawn style

---

## Notes

- Images are referenced from `docs/images/` in the README
- Keep file sizes reasonable (< 500KB for PNG, < 5MB for GIF)
- Test how images render on both light and dark GitHub themes
- Consider adding alt text for accessibility
