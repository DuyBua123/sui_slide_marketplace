# Visual Guide: Save to Blockchain Feature

## UI Components Overview

### Before Minting
```
┌─────────────────────────────────────────────────────────────────┐
│  ← | Title Input... | Resize | Templates | ... Share | Present  │
│         (no blockchain status)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### After Minting
```
┌─────────────────────────────────────────────────────────────────┐
│  ← | Title Input... | Resize | Templates | ... | [Save Chain] | │
│                                    Share | Present               │
│        Auto-save Status    Blockchain Status                     │
│     Last saved just now    (appears when minted)                │
└─────────────────────────────────────────────────────────────────┘
```

## Status Indicators

### Auto-Save Status (existing)
Located in TopHeader, shows local storage save status:
- 💛 **Saving...** (blue pulse) - Writing to localStorage
- ✅ **Saved** (green checkmark) - Successfully saved
- ❌ **Save failed** (red alert) - Error in localStorage
- ⏰ **Last saved 2 minutes ago** - Time since last save

### Blockchain Status (new)
Appears below auto-save status when slide is minted:
- 🔵 **Saving to blockchain...** (blue pulse) - Transaction pending
- ✅ **Saved to blockchain** (green checkmark) - Transaction confirmed
- ❌ **Blockchain error** (red alert, 3 sec timeout) - Transaction failed

## Button States

### "Save Chain" Button
**Disabled State:**
- During blockchain save
- When slide not yet minted

**Normal State:**
- Enabled after successful mint
- Clickable and ready for use

**Action:**
```
User Click → "Saving to blockchain..." → ✅ "Saved to blockchain" → Back to normal
                    (2-3 sec)                      (3 sec flash)
```

## File Organization

```
client/src/
├── hooks/
│   ├── useUpdateSlide.js                    ← NEW
│   │   • updateSlide(slideObject, urls)
│   │   • isLoading, error, txDigest states
│   │
│   └── useAutoSave.js                       (existing)
│
├── services/
│   ├── blockchain/                          ← NEW FOLDER
│   │   └── blockchainSave.js
│   │       • prepareSlideDraftData()
│   │       • saveSlideToBlockchain()
│   │       • useBlockchainAutoSave()
│   │
│   └── exports/                             ← NEW FOLDER
│       └── exportToIPFS.js
│           • exportToIPFS()
│           • fetchFromIPFS()
│
└── components/Editor/
    ├── EditorLayout.jsx                     ← MODIFIED
    │   • Added blockchain save logic
    │   • New state: blockchainSaveStatus
    │   • New handler: handleSaveToBlockchain
    │   • Pass callbacks to TopHeader
    │
    └── TopHeader.jsx                        ← MODIFIED
        • Added "Save Chain" button
        • Display blockchain status
        • Handle button click
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                            │
│                       (React Components)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Slide Store (Zustand)                           │
│                  { title, slides, ... }                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    handleSaveToBlockchain()
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              blockchainSave.saveSlideToBlockchain()              │
│                                                                   │
│  1. prepareSlideDraftData()                                       │
│     └─ Package { title, slides, version, timestamps }            │
│                                                                   │
│  2. exportToIPFS()                                                │
│     └─ Upload to Pinata → Returns IPFS hash                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              useUpdateSlide() hook                                │
│                                                                   │
│  1. Build transaction                                             │
│  2. Call updateSlide smart contract                              │
│  3. Sign with user's wallet                                      │
│  4. Execute on SUI blockchain                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               SUI Blockchain Network                              │
│                                                                   │
│  Contract: slide_marketplace::update_slide                       │
│  ├─ Verify ownership                                             │
│  ├─ Update content_url                                           │
│  ├─ Update thumbnail_url                                         │
│  └─ Emit SlideUpdated event                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   IPFS (Pinata Network)                           │
│                                                                   │
│  Stores: {                                                        │
│    "title": "My Awesome Slide",                                  │
│    "slides": [...],                                              │
│    "version": "1.0",                                             │
│    "createdAt": "...",                                           │
│    "updatedAt": "..."                                            │
│  }                                                                │
│                                                                   │
│  Returns: ipfs://QmXxxx...                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                      Transaction Confirmed
                              ↓
                    UI: "Saved to blockchain" ✅
```

## State Machine: Save Button

```
                    ┌─────────────────┐
                    │   NOT MINTED    │
                    │  (Button Hidden)│
                    └────────┬────────┘
                             │ User clicks Mint
                             ↓
                    ┌─────────────────┐
                    │    MINTED       │
                    │(Button Visible) │
                    └────────┬────────┘
                             │ User clicks "Save Chain"
                             ↓
                    ┌─────────────────┐
                    │   SAVING        │
                    │ (Button Disabled)│
                    │ Status: Spinning│
                    └────────┬────────┘
                    ╱        ╲
                   ╱          ╲
                  ↙            ↘
         ┌──────────────┐  ┌──────────────┐
         │   SUCCESS    │  │    ERROR     │
         │ (3s flash)   │  │ (Show msg)   │
         └──────┬───────┘  └──────┬───────┘
                │                 │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │     READY       │
                │  (Button Active)│
                └─────────────────┘
```

## Transaction Flow Timeline

```
User clicks "Save Chain"
     |
     ↓ (0ms)
Status: "saving"
Button: disabled
Display: "Saving to blockchain..."

     ↓ (500ms)
Packaging slide data...

     ↓ (1000-2000ms)
Uploading to IPFS...
[████████░░░░░░░░░░░░] 40%

     ↓ (2000-3000ms)
IPFS Upload Complete
contentUrl: ipfs://QmXxxx

     ↓ (3000-3500ms)
Signing transaction...
[████████████████░░░░] 80%

     ↓ (3500-5000ms)
Executing on blockchain...

     ↓ (5000-8000ms)
Waiting for confirmation...
[████████████████████] 100%

     ↓ (8000ms)
Status: "success" ✅
Display: "Saved to blockchain"

     ↓ (3 seconds later)
Status: null
Back to ready state
```

## Error Scenarios

### Scenario 1: Not Minted Yet
```
User: "Why is the Save button disabled?"
System: (Button doesn't appear)
Solution: Click "Mint" button first
```

### Scenario 2: IPFS Upload Fails
```
Error: "Failed to export to IPFS: Pinata upload failed"
Cause: Invalid API keys or account issue
Fix: Check .env VITE_PINATA_* variables
```

### Scenario 3: Insufficient Gas
```
Error: "Failed to update slide"
Cause: Wallet doesn't have enough SUI for gas fees
Fix: Get SUI from faucet or exchange
Amount needed: ~0.002 - 0.005 SUI
```

### Scenario 4: Ownership Verification Fails
```
Error: "Failed to update slide"
Cause: Only original creator can update
Fix: Use the original wallet that minted the slide
```

## Configuration Flowchart

```
┌─────────────────────┐
│  Project Start      │
└────────┬────────────┘
         │
         ↓
    Need to set up:
    1. VITE_PACKAGE_ID
    2. VITE_PINATA_API_KEY (optional)
    3. VITE_PINATA_API_SECRET (optional)
         │
         ↓ All set? 
     ┌───┴──────┐
     │          │
    YES        NO
     │          │
     ↓          ↓
   Ready    Use Local
   (IPFS)    Storage
             (Fallback)
     │          │
     └────┬─────┘
          ↓
    Start Development
    npm run dev
          │
          ↓
    Test Feature
```

---

**Need clarification?** Check the detailed docs:
- Technical details → `BLOCKCHAIN_SAVE.md`
- Setup instructions → `SETUP_BLOCKCHAIN_SAVE.md`
- Implementation code → `src/hooks/useUpdateSlide.js` etc.
