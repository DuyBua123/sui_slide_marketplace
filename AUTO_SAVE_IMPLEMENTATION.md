# Auto-Save Implementation Guide

## Overview
A comprehensive auto-save and recovery system has been implemented for the SUI Slide Marketplace editor. This system automatically saves your work and provides recovery options if the application crashes or closes unexpectedly.

## Features Implemented

### 1. **Enhanced Auto-Save Hook** (`useAutoSave.js`)
- **Automatic saving on every edit** with debouncing (2 seconds by default)
- **Dual storage**: Saves to both `current_project` and `slides` localStorage keys
- **Save status tracking**: Shows real-time feedback (saving, saved, error)
- **Last saved timestamp**: Displays when data was last successfully saved
- **Data integrity checking**: Verifies slides array before recovery
- **Error handling**: Gracefully handles save failures

### 2. **Auto-Recovery Hook** (`useAutoRecover.js`)
- **Crash detection**: Automatically detects when app closes unexpectedly
- **Smart recovery**: Only shows recovery for data updated within the last hour
- **Manual control**: Users can choose to recover, dismiss, or clear recovery data
- **Data validation**: Ensures recovered data is valid before offering recovery

### 3. **Auto-Recovery Banner** (`AutoRecoveryBanner.jsx`)
A visual UI component that appears when recovery data is available:
- Shows time elapsed since last save
- Provides three actions:
  - **Recover**: Restore your previous work
  - **Dismiss**: Skip recovery for now
  - **Clear**: Permanently delete recovery data

### 4. **Enhanced Top Header** (`TopHeader.jsx`)
Integrated save status display showing:
- **Saving...** (yellow pulse) - Currently saving
- **Saved** (green checkmark) - Successfully saved
- **Error** (red alert) - Save failed
- **Last saved time** (gray) - Timestamp of last successful save

## How It Works

### On Edit
1. You make any change to your slides (text, elements, design, etc.)
2. The `useAutoSave` hook detects the change
3. After 2 seconds of inactivity, the data is automatically saved
4. Status updates show "Saving..." then "Saved" in the header
5. Data is saved to both localStorage keys for redundancy

### On Recovery
1. When you open the editor after a crash/close
2. The `useAutoRecover` hook checks for recent unsaved data
3. If found and recent (< 1 hour old), recovery banner appears
4. Click "Recover" to restore your work
5. Click "Dismiss" to ignore recovery (data stays saved)
6. Click "X" to clear recovery data permanently

## Files Modified/Created

### New Files
- [`src/hooks/useAutoRecover.js`](src/hooks/useAutoRecover.js) - Recovery detection hook
- [`src/components/Editor/AutoRecoveryBanner.jsx`](src/components/Editor/AutoRecoveryBanner.jsx) - Recovery UI

### Modified Files
- [`src/hooks/useAutoSave.js`](src/hooks/useAutoSave.js) - Enhanced with recovery support
- [`src/components/Editor/EditorLayout.jsx`](src/components/Editor/EditorLayout.jsx) - Integrated recovery
- [`src/components/Editor/TopHeader.jsx`](src/components/Editor/TopHeader.jsx) - Added save status display

## Configuration

### Debounce Time
Default: 2000ms (2 seconds)
Change in `EditorLayout.jsx`:
```jsx
const { saveStatus, lastSavedTime } = useAutoSave(id, 5000); // 5 seconds
```

### Recovery Window
Default: 60 minutes
Change in `useAutoRecover.js`:
```javascript
if (minutesAgo < 120) { // 120 minutes
    setRecoveryData(data);
    setHasRecovery(true);
}
```

## LocalStorage Structure

### `current_project`
```json
{
  "id": "project_id_or_current_project",
  "title": "Presentation Title",
  "slides": [{ /* slide data */ }],
  "updatedAt": "2024-01-21T10:30:00.000Z",
  "saveCount": 15
}
```

### `slides`
```json
[
  {
    "id": "slide_id",
    "title": "Slide Title",
    "slideCount": 3,
    "data": { /* full project data */ },
    "thumbnail": null,
    "createdAt": "2024-01-20T14:00:00.000Z",
    "updatedAt": "2024-01-21T10:30:00.000Z"
  }
]
```

## Usage Tips

1. **Auto-save is transparent** - No action needed, it happens automatically
2. **Watch the save indicator** - Green checkmark confirms saves are working
3. **Recovery is optional** - You choose whether to recover or discard old data
4. **Check localStorage** - Open DevTools > Application > localStorage to verify saves
5. **No manual save needed** - Unlike Canva, there's no explicit "Save" button

## Troubleshooting

### Data not saving?
- Check browser's localStorage limit (usually 5-10MB per domain)
- Clear old localStorage entries if space is full
- Check browser console for error messages

### Recovery banner won't appear?
- Data must be < 1 hour old
- Browser localStorage must be enabled
- Check that data is valid JSON

### Lost data?
- Recovery banner shows for up to 1 hour after app close
- You can manually check `localStorage.getItem('current_project')` in console
- Previous project versions are stored in `slides` array

## Browser Compatibility
Works in all modern browsers that support:
- localStorage API
- ES6 modules
- React hooks (16.8+)

## Performance Notes
- Saving is debounced to avoid excessive writes
- Only changed data triggers new saves
- Minimal performance impact on editing
- Browser handles localStorage efficiently for typical project sizes
