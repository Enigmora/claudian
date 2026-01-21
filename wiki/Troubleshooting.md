# Troubleshooting

Solutions to common issues with Claudian.

---

## API Issues

### "API key not configured"

**Problem:** The chat shows an error about missing API key.

**Solution:**
1. Go to **Settings > Claudian**
2. Enter your API key from [console.anthropic.com](https://console.anthropic.com)
3. Try sending a message again

---

### "Invalid API key"

**Problem:** Claude returns an authentication error.

**Solution:**
1. Verify your API key is correct (no extra spaces)
2. Check that your key hasn't expired or been revoked
3. Create a new key if needed at [console.anthropic.com](https://console.anthropic.com)

---

### Rate Limiting Errors

**Problem:** Messages fail with rate limit or quota errors.

**Solution:**
1. Wait a few minutes before retrying
2. Check your usage limits at [console.anthropic.com](https://console.anthropic.com)
3. Consider upgrading your Anthropic plan if you need higher limits

---

### Connection Errors

**Problem:** "Network error" or "Failed to fetch" messages.

**Solution:**
1. Check your internet connection
2. Verify Anthropic's API status at [status.anthropic.com](https://status.anthropic.com)
3. Try disabling VPN or proxy if applicable
4. Restart Obsidian

---

## Chat Issues

### Chat Panel Not Opening

**Problem:** Clicking the ribbon icon or using the command doesn't open the chat.

**Solution:**
1. Check if the plugin is enabled in **Settings > Community Plugins**
2. Try disabling and re-enabling Claudian
3. Restart Obsidian with `Ctrl/Cmd + R`

---

### Messages Not Appearing

**Problem:** You send a message but nothing happens.

**Solution:**
1. Check the console for errors (`Ctrl/Cmd + Shift + I`)
2. Verify your API key is configured
3. Check your internet connection
4. Try a simpler message like "Hello"

---

### Streaming Not Working

**Problem:** Responses appear all at once instead of streaming.

**Solution:**
1. This is usually a network issue
2. Check if a firewall is blocking streaming connections
3. Try switching networks

---

## Agent Mode Issues

### Actions Not Executing

**Problem:** Agent mode responds but doesn't perform actions.

**Solution:**
1. Make sure agent mode is enabled (toggle in chat header)
2. Check if the target folder is in the protected folders list
3. Verify your request is clear and actionable

---

### Confirmation Dialog Appears for Everything

**Problem:** Even non-destructive actions require confirmation.

**Solution:**
1. This is by design for safety
2. Only delete/modify operations should require confirmation
3. If you're sure, you can adjust this in settings

---

### Protected Folder Errors

**Problem:** Agent refuses to modify files in a specific folder.

**Solution:**
1. Check **Settings > Claudian > Protected folders**
2. Remove the folder from the list if modification is intended
3. Note: `.obsidian` should always stay protected

---

## Note Processing Issues

### Processing Takes Too Long

**Problem:** Processing a note seems to hang or take very long.

**Solution:**
1. Large notes take more time
2. Reduce the number of notes/tags in context in settings
3. Try using a faster model (Claude 3.5 Haiku)

---

### Suggestions Not Appearing

**Problem:** After processing, no suggestions modal appears.

**Solution:**
1. Make sure you have an active note open
2. Check the console for errors (`Ctrl/Cmd + Shift + I`)
3. The note might be too short for meaningful suggestions

---

## General Issues

### Plugin Not Loading

**Problem:** Claudian doesn't appear in settings or commands.

**Solution:**
1. Verify files are in `.obsidian/plugins/claudian/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Check Community Plugins is enabled in settings
3. Restart Obsidian

---

### Settings Not Saving

**Problem:** Configuration changes are lost after restart.

**Solution:**
1. Check file permissions for `.obsidian/plugins/claudian/data.json`
2. Try deleting `data.json` and reconfiguring
3. Make sure your vault is not in a read-only location

---

### Styling Issues

**Problem:** Chat or modals look broken or unstyled.

**Solution:**
1. Verify `styles.css` exists in the plugin folder
2. Try switching between light and dark theme
3. Disable conflicting CSS snippets

---

## Getting More Help

If none of these solutions work:

1. **Check Console Errors**
   - Open Developer Tools: `Ctrl/Cmd + Shift + I`
   - Go to Console tab
   - Look for error messages when the issue occurs

2. **Report an Issue**
   - Go to [GitHub Issues](https://github.com/Enigmora/claudian/issues)
   - Include:
     - Obsidian version
     - Claudian version
     - Steps to reproduce
     - Console error messages (if any)

3. **Debug Information**
   - Claudian version: Check `manifest.json`
   - Obsidian version: **Settings > About**
   - OS: Your operating system
