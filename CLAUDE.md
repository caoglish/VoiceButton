# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice Button Board is a vanilla JavaScript web application for recording and playing back voice snippets. It runs entirely in the browser with no build process or dependencies—just open `index.html` in a modern browser.

**Current Version**: 0.3.1 (Fixed cache invalidation for new recordings)

## Architecture

### File Structure

- **index.html** - Main HTML structure with modals and UI elements
- **app.js** - All JavaScript logic in an IIFE (Immediately Invoked Function Expression)
- **style.css** - All styling including responsive layouts and animations

### Core Modules (in app.js)

The application uses a modular pattern with isolated objects:

1. **Lang** - i18n system supporting Chinese/English, persisted to localStorage
2. **Icons** - SVG icon definitions as template strings
3. **DB** - IndexedDB wrapper for persistent storage (database name: `VoiceButtonDB`, store: `buttons`)
4. **AudioManager** - Manages MediaRecorder for recording and HTMLAudioElement for playback
   - `startPlayback(buttonId, blob)` - Legacy method using Blob + object URL
   - `startPlaybackFromURL(buttonId, dataURL)` - Preferred method for mobile (v0.3.0+)
   - `stopPlayback()` / `stopPlaybackAsync()` - Cleanup and state management
5. **UI** - DOM manipulation and card state management
   - `_buttonData` - Map cache for button data with prepared data URLs (runtime only)

### Button Types

**Single-Voice Button** (`type: 'single'`):
- Stores one audio recording in `audioBlob`, `audioDuration`, `mimeType` fields
- Clicking in button mode plays the single recording

**Multi-Voice Button** (`type: 'multi'`):
- Stores up to 10 recordings in `recordings[]` array
- Each recording: `{id, blob, duration, mimeType, createdAt}`
- Clicking in button mode plays a **random** recording with smart history avoidance
- Uses `playHistory[]` to prevent recent repeats (see Play History System below)

### Data Model

Each button stored in IndexedDB has this structure:
```javascript
{
  id: 'btn_timestamp_random',
  label: 'Button Label',
  type: 'single' | 'multi',
  order: timestamp, // for drag-drop ordering
  createdAt: ISO timestamp,
  hasAudio: boolean,

  // Single-voice fields:
  audioArrayBuffer: ArrayBuffer,  // Current format (v0.2.0+)
  audioBlob: Blob | null,         // Legacy format (still supported)
  audioDataURL: string,            // Runtime cache (not persisted)
  audioDuration: number,
  mimeType: string,

  // Multi-voice fields:
  recordings: [{
    id,
    arrayBuffer: ArrayBuffer,      // Current format (v0.2.0+)
    blob: Blob,                    // Legacy format (still supported)
    dataURL: string,               // Runtime cache (not persisted)
    duration,
    mimeType,
    createdAt
  }],
  playHistory: [recordingId1, recordingId2, ...] // tracks recently played
}
```

**Storage Format Notes:**
- **v0.2.0+**: Audio stored as `ArrayBuffer` for better mobile compatibility
- **Legacy**: Old buttons with `Blob` are automatically converted to `dataURL` on first play
- **Runtime Cache**: `dataURL` fields are generated lazily and cached in `UI._buttonData` Map for performance

### Play History System

Multi-voice buttons use intelligent randomization to avoid repetition:
- **For ≥3 recordings**: Keeps last 2 plays in history (prevents repeat within 2-3 clicks)
- **For 2 recordings**: Keeps last 1 play in history (prevents consecutive duplicates)
- When all recordings are in history, it resets automatically
- History is persisted to IndexedDB on each play

This logic is in `handlePlay()`.

### Mobile Compatibility & Data URL Approach (v0.3.0)

**Critical Mobile Issue**: Mobile browsers (especially iOS Safari) have strict limitations on IndexedDB object references. Both `Blob` and `ArrayBuffer` objects retrieved from IndexedDB can become invalid after first use, causing `DOMException` errors on subsequent plays.

**Solution**: Convert to data URLs for playback (implemented in v0.3.0):

1. **Storage**: Audio saved as `ArrayBuffer` to IndexedDB (more reliable than Blob)
2. **First Play**: When button is played, `prepareRecordingsWithDataURL()` converts `ArrayBuffer` → base64 data URL
3. **Caching**: Data URL is cached in memory (`UI._buttonData` Map, not persisted to DB)
4. **Subsequent Plays**: Use cached data URL directly via `AudioManager.startPlaybackFromURL()`

**Key Functions**:
- `arrayBufferToDataURL(buffer, mimeType)` - Converts ArrayBuffer to base64 data URL string
- `prepareRecordingsWithDataURL(data)` - Lazy conversion, handles both Blob and ArrayBuffer formats
- `AudioManager.startPlaybackFromURL(buttonId, dataURL)` - Plays audio from data URL (no Blob creation)

**Benefits**:
- No IndexedDB reference issues (data URLs are simple strings)
- Works reliably on all mobile browsers
- Backward compatible with old Blob-based buttons
- Memory efficient (lazy conversion, only on first play)

**Cache Invalidation (v0.3.1)**:
To ensure cache consistency, `UI._buttonData` cache is cleared in these operations:
- After saving new recording (both single and multi-voice)
- After deleting a recording from multi-voice button
- After deleting entire button
This forces next playback to reload fresh data from IndexedDB with all recordings properly prepared.

### Two Modes

**Edit Mode** (default, `big-mode` class absent):
- Shows record/play action buttons
- Drag-and-drop reordering enabled (desktop & touch)
- Delete button visible in top-right of cards
- Double-click label to edit inline
- Multi-voice buttons show scrollable list of recordings with individual play/delete actions

**Button Mode** (toggle on, `big-mode` class present):
- Cards are larger and clickable
- No action buttons shown
- Clicking card triggers: empty→record, recording→stop, has-audio→play, playing→stop
- Delete buttons hidden
- Drag-and-drop disabled

### Card States

Cards transition through states managed by `UI.getCardState()` and `UI.setCardState()`:
- `empty` - No recording yet (dashed border)
- `recording` - Currently recording (red border, pulsing animation)
- `has-audio` - Recording exists (blue border)
- `playing` - Audio playing (blue background, speaker icon animates)
- `error` - Temporary error state (auto-reverts after 3s)

CSS classes: `.state-empty`, `.state-recording`, `.state-has-audio`, `.state-playing`, `.state-error`

### Responsive Breakpoints

- **Mobile** (`≤560px`): Single column, larger tap targets (44px min-height)
- **Tablet** (`561px-960px`): Single column, centered at 400px max-width
- **Desktop** (`>960px`): Multi-column grid (auto-fill minmax(220px, 1fr))

Button mode overrides:
- Mobile: 2 columns
- Tablet/Desktop: 3 columns (tablet also stays single column per recent changes)

### MediaRecorder Supported Formats

The app detects browser support in this order (first supported is used):
1. `audio/webm;codecs=opus`
2. `audio/webm`
3. `audio/ogg;codecs=opus`
4. `audio/mp4`

Recordings shorter than `MIN_RECORDING_MS` (200ms) are auto-discarded.

### Drag-and-Drop Implementation

Two separate implementations:
1. **Desktop**: Native HTML5 drag events (`dragstart`, `dragover`, `dragend`)
2. **Touch**: Custom touch handling (`touchstart`, `touchmove`, `touchend`) with 200ms activation delay

Both update `order` field in database on drop. Dragging is disabled in button mode and while editing labels.

### Storage & Quotas

Uses browser's IndexedDB storage. Footer displays:
- Remaining storage in MB/GB
- Approximate recording minutes (rough estimate: 1MB ≈ 1 minute)

Calculated via `navigator.storage.estimate()` API.

## Common Modifications

### Adding New Translations

Edit `translations` object (line 13) with new keys in both `zh` and `en` objects. Use `Lang.get('key')` or `Lang.get('key', {param: value})` for parameterized strings.

### Changing Limits

- `MAX_BUTTONS = 9` (line 7) - Maximum voice buttons
- `MAX_MULTI_RECORDINGS = 10` (line 9) - Maximum recordings per multi-voice button
- `MIN_RECORDING_MS = 200` (line 8) - Minimum recording duration

### Modifying Card Layout

Card grid uses CSS Grid with `auto-fill` and `minmax()`. Edit `.button-grid` in style.css (line 156) and responsive overrides at bottom.

### Changing Play History Behavior

Modify the history size logic in `handlePlay()` around line 988:
```javascript
const historySize = data.recordings.length >= 3 ? 2 : 1;
```

## Important Implementation Notes

- **No transpilation or bundling** - Code must be ES5-compatible or target modern browsers only
- **All data is local** - No backend, no cloud sync, pure client-side
- **Audio cleanup** - `URL.revokeObjectURL()` is called to prevent memory leaks when playback stops
- **Recording timer** - Uses `setInterval` at 100ms for smooth timer updates during recording
- **Backward compatibility** - Buttons without `type` field default to `'single'`

### Critical Mobile Considerations

**DO NOT** directly use Blob or ArrayBuffer from IndexedDB for playback on mobile:
```javascript
// ❌ BAD - IndexedDB references cause DOMException on mobile
const blob = recording.blob;
audio.src = URL.createObjectURL(blob);

// ❌ BAD - ArrayBuffer copying also fails on mobile
const buffer = recording.arrayBuffer.slice(0);
const blob = new Blob([buffer]);

// ✅ GOOD - Use data URLs via helper functions
const dataURL = recording.dataURL || arrayBufferToDataURL(recording.arrayBuffer, mimeType);
AudioManager.startPlaybackFromURL(buttonId, dataURL);
```

**Always test mobile changes on actual devices** - Desktop browsers do not exhibit the same IndexedDB reference issues that mobile Safari/Chrome have.

## Browser Requirements

- IndexedDB support (for storage)
- MediaDevices API + getUserMedia (for recording)
- MediaRecorder API (for audio encoding)
- HTTPS or localhost (for microphone access)

Browser warnings are shown at top if APIs are unavailable.

## Development Workflow

Since this is a static site with no build process:

1. **Edit code** - Modify HTML, CSS, or JS directly
2. **Test** - Open/refresh `index.html` in browser
3. **Commit** - Use git normally

### Local Development Servers

**HTTP Server** (desktop testing):
```bash
# Python 3
python -m http.server 8000
# Access at http://localhost:8000
```

**HTTPS Server** (required for mobile testing - microphone requires HTTPS):
```bash
# Use the included simple_https.py server
python simple_https.py
# Access at https://192.168.0.3:8443 (or your local IP)
```

The HTTPS server uses self-signed certificates (`cert.pem`, `key.pem`). On first mobile access, you'll need to accept the certificate warning in your browser.

### Mobile Testing & Debugging

**Mobile Debug Console** (Eruda):
- Already included in `index.html` via CDN
- Console automatically initializes on page load
- Access full DevTools on mobile device (console, network, elements, etc.)
- Toggle with floating button on screen

**Remote Debugging** (weinre):
- Commented script tag in `index.html` for weinre debugging
- Useful for debugging on devices that don't support Eruda well

## Key Event Flows

### Recording Flow
1. User clicks record → `handleStartRecording(buttonId)`
2. Requests microphone → `AudioManager.startRecording()`
3. MediaRecorder starts, timer begins
4. User clicks stop → `handleStopRecording()`
5. Validates duration (≥200ms)
6. Saves to DB (single: replaces blob, multi: appends to array)
7. UI refreshes via `UI.setCardState()`

### Playback Flow (Multi-Voice)
1. User clicks play → `handlePlay(buttonId)`
2. Checks `UI._buttonData` cache, loads from DB if needed
3. Converts to data URL if not cached: `prepareRecordingsWithDataURL()`
4. Filters recordings not in `playHistory`
5. Selects random from available
6. Updates `playHistory` and saves to DB (async, non-blocking)
7. Plays via `AudioManager.startPlaybackFromURL(buttonId, recording.dataURL)`
8. On ended/error, calls `stopPlayback()` and updates UI

### Drag-and-Drop Reorder
1. User drags card → sets `draggedCard` reference
2. Dragover calculates midpoint and insert position
3. DOM updates in real-time (visual feedback)
4. Drop → persists new `order` values to all affected cards in DB
