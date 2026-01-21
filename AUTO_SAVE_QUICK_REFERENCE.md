# Auto-Save Implementation - Quick Reference

## What's New

### 1. **Real-Time Save Status** (Top Header)
Located in the center of the editor header:
```
▓▓▓ Resize  ⬜ Templates    ⏺ Saving... 
                           ✓ Saved
                           ⚠ Error
                           Last saved: 10:30:45 AM
```

### 2. **Auto-Recovery Banner** (Top of Editor)
Appears automatically if app crashed or closed:
```
┌─────────────────────────────────────────────────┐
│ ⚠ Recovery available                            │
│   Unsaved changes detected from 5 minutes ago   │
│                   [Recover] [Dismiss] [×]       │
└─────────────────────────────────────────────────┘
```

## Implementation Summary

```javascript
// In EditorLayout.jsx
const { saveStatus, lastSavedTime } = useAutoSave(id, 2000);
//      └─ 'idle' | 'saving' | 'saved' | 'error'
//         └─ ISO timestamp of last successful save

const { hasRecovery, recover, dismiss, clearRecovery } = useAutoRecover();
//      └─ Shows recovery banner if recent save found
```

## Key Features

✅ **Automatic on every edit** - No manual save needed
✅ **2 second debounce** - Waits for user to stop typing
✅ **Dual backup** - Saves to current_project and slides
✅ **Visual feedback** - See save status in real-time
✅ **Crash recovery** - Automatic detection + user control
✅ **Smart recovery** - Only shows for recent data (< 1 hour)
✅ **Error handling** - Gracefully handles save failures
✅ **No data loss** - Recovery data persists even after close

## What Gets Saved

- **Slide content**: All shapes, text, images
- **Styling**: Colors, fonts, animations
- **Layout**: Position, size, z-index of all elements
- **Project info**: Title, metadata, timestamps
- **History**: Save count for debugging

## Where It's Saved

**localStorage** (browser's local storage)
- Key: `current_project` (active work)
- Key: `slides` (project archive)
- Capacity: 5-10MB per domain
- Persistence: Survives browser close/reopen

## User Flows

### Normal Editing Flow
1. User makes edit
2. (2 second wait)
3. "Saving..." appears
4. Data saved to localStorage
5. "Saved" confirmation shown
6. Status clears after 2 seconds

### Crash/Close Recovery Flow
1. App crashes or user closes browser
2. User reopens app
3. Recovery banner appears (if data < 1 hour old)
4. User clicks "Recover"
5. Previous work restored
6. Banner closes

## Testing the Implementation

### Test 1: Auto-Save
1. Open editor
2. Add a text element with "Test"
3. Watch header - should show "Saving..." then "Saved"
4. Refresh page
5. Verify text is still there

### Test 2: Recovery
1. Add/modify slides
2. Force close: Press F12 → Console → `window.close()`
3. Reopen editor
4. Recovery banner should appear
5. Click "Recover" to restore
6. Or click "×" to clear

### Test 3: Error Handling
1. Disable localStorage: F12 → Console → `localStorage.clear()`
2. Try to edit
3. Header shows "Error"
4. Status reverts to idle after 3 seconds

## Configuration

### Change debounce time (default 2000ms)
File: `EditorLayout.jsx`
```javascript
const { saveStatus, lastSavedTime } = useAutoSave(id, 5000); // 5 seconds
```

### Change recovery window (default 60 minutes)
File: `useAutoRecover.js`
```javascript
if (minutesAgo < 120) { // Show recovery for 2 hours
    setRecoveryData(data);
    setHasRecovery(true);
}
```

## LocalStorage Management

### Check saved data (DevTools)
1. F12 → Application → Storage → Local Storage
2. Find `current_project` key
3. Value is JSON with full slide data

### Clear manually
```javascript
// In browser console
localStorage.removeItem('current_project');
localStorage.removeItem('slides');
```

## Known Limitations

- Storage limited to browser's localStorage (~5-10MB)
- Only saves to client (no cloud backup)
- Data lost if user clears browser storage
- No version history (only current + recovery)
- Works offline but requires localStorage enabled

## Future Enhancements

- [ ] Cloud backup to blockchain/IPFS
- [ ] Version history with rollback
- [ ] Conflict resolution for multi-device editing
- [ ] Export/import backup files
- [ ] Activity log of saves
- [ ] Automatic cleanup of old versions
