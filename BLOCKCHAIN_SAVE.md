# Blockchain Save Implementation Guide

## Overview
This implementation adds the ability to save slide changes directly to the SUI blockchain. Users can mint slides as NFTs and then save updates to the blockchain through the "Save Chain" button.

## Architecture

### Components

#### 1. **useUpdateSlide Hook** (`src/hooks/useUpdateSlide.js`)
- Calls the `update_slide` smart contract function
- Takes a slide object ID and new content/thumbnail URLs
- Executes the transaction and waits for confirmation
- Returns transaction digest on success

**Usage:**
```javascript
const { updateSlide, isLoading, error, txDigest } = useUpdateSlide();
await updateSlide({
  slideObject: { id: suiObjectId },
  contentUrl: 'ipfs://hash',
  thumbnailUrl: 'ipfs://hash'
});
```

#### 2. **Blockchain Save Service** (`src/services/blockchain/blockchainSave.js`)
Orchestrates the save process:
- `prepareSlideDraftData()` - Prepares slide data for storage
- `saveSlideToBlockchain()` - Main function to save to blockchain
- `useBlockchainAutoSave()` - Auto-save with debounce (optional)

**Workflow:**
1. Package slide data (title, slides array)
2. Export to IPFS via Pinata
3. Call `updateSlide` with new content URL
4. Return transaction digest

#### 3. **IPFS Export Service** (`src/services/exports/exportToIPFS.js`)
- `exportToIPFS()` - Upload JSON slide data to IPFS
- `fetchFromIPFS()` - Retrieve slide data from IPFS
- Uses Pinata as IPFS provider
- Fallback to local storage if API keys not configured

### Smart Contract Updates

The existing `update_slide` function in [slide_marketplace.move](../../blockchain/sources/slide_marketplace.move) handles:
- Owner verification
- Content URL update
- Thumbnail URL update
- Event emission

## User Flow

### 1. Mint Slide
- User designs slide in editor
- Clicks "Mint" button
- Smart contract creates `SlideObject` and returns object ID
- UI stores object ID in state (`suiObjectId`)

### 2. Make Changes
- User continues editing
- Changes auto-save to localStorage every 2 seconds
- UI shows "Saved" status

### 3. Save to Blockchain
- User clicks "Save Chain" button (appears after minting)
- Slide data is exported to IPFS
- `updateSlide` smart contract function is called
- Transaction is signed and executed
- UI shows "Saving to blockchain..." status
- On success: "Saved to blockchain" status (3 second flash)

## Configuration

### Environment Variables

Add to `.env`:
```
VITE_PACKAGE_ID=0x<your-deployed-package-id>
VITE_PINATA_API_KEY=<your-pinata-api-key>
VITE_PINATA_API_SECRET=<your-pinata-secret>
```

### Without Pinata (Development)
If Pinata keys are not configured, the system falls back to local storage URLs:
```
local://slide-1705854000123
```

This allows development without requiring IPFS setup.

## UI Changes

### TopHeader Component
- New "Save Chain" button appears after slide is minted
- Shows blockchain save status with visual indicators:
  - **Saving...** (blue, pulsing) - Transaction in progress
  - **Saved to blockchain** (green checkmark) - Success
  - **Blockchain error** (red alert) - Failed transaction
- Auto-hides success message after 3 seconds
- Button is disabled during transaction

### EditorLayout
- Added state management for blockchain save status
- Passes callbacks to TopHeader
- Handles save logic with error handling

## Data Flow

```
User clicks "Save Chain"
    ↓
prepareSlideDraftData()
    ├─ Package slide data
    └─ Upload to IPFS → returns contentUrl
    ↓
updateSlide() smart contract call
    ├─ Verify ownership
    ├─ Update content_url
    ├─ Update thumbnail_url
    └─ Emit SlideUpdated event
    ↓
Transaction signed and confirmed
    ↓
UI updates: "Saved to blockchain"
```

## Error Handling

### Validation
- Slide must be minted before saving to blockchain
- Owner must be wallet account that created slide
- IPFS export must succeed before contract call

### Error Messages
- **"Slide must be minted before saving to blockchain"** - Click Mint first
- **"Slide object ID is required"** - Contact support, may be UI state issue
- **"Failed to export to IPFS"** - Check Pinata API configuration
- **"Failed to update slide"** - Check wallet balance, contract state

## Testing

### Local Testing
1. Set VITE_PACKAGE_ID to your test contract address
2. Connect to SUI testnet wallet
3. Create and mint a slide
4. Make changes and click "Save Chain"
5. Monitor browser console for detailed logs

### Production Deployment
1. Deploy smart contract to mainnet
2. Update VITE_PACKAGE_ID environment variable
3. Ensure Pinata API keys are configured
4. Monitor blockchain for successful transactions

## Future Enhancements

1. **Auto-save to blockchain** - Debounced auto-save similar to localStorage
2. **Batch updates** - Save multiple changes in single transaction
3. **Thumbnail generation** - Auto-generate thumbnails instead of duplicating content URL
4. **Version history** - Keep track of all updates on-chain
5. **Collaborative editing** - Multi-user updates with conflict resolution
6. **Decentralized storage** - Support other IPFS providers (Arweave, Walrus)

## Troubleshooting

### "Save Chain" button doesn't appear
- Confirm slide has been minted (watch for MintSlideModal confirmation)
- Check browser console for errors
- Verify wallet is connected

### Transaction fails with insufficient balance
- Ensure wallet has SUI for gas fees
- Mainnet gas is typically 1000-2000 MIST per transaction

### IPFS upload fails
- Verify Pinata API keys in `.env`
- Check Pinata account has active plan
- Verify JSON data size is reasonable (<5MB)

### "Slide object ID is required"
- This indicates UI state issue
- Try refreshing page
- Re-mint the slide if needed

## Code References

- **Smart Contract**: [slide_marketplace.move#L275-L290](../../blockchain/sources/slide_marketplace.move#L275-L290)
- **Hook**: [useUpdateSlide.js](./useUpdateSlide.js)
- **Service**: [blockchainSave.js](../services/blockchain/blockchainSave.js)
- **Editor**: [EditorLayout.jsx](./components/Editor/EditorLayout.jsx)
- **Header**: [TopHeader.jsx](./components/Editor/TopHeader.jsx)
