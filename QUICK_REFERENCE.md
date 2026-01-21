# Quick Reference Card: Save to Blockchain

## 🚀 Quick Start (5 Minutes)

### 1. Configure Environment
```bash
# In client/.env
VITE_PACKAGE_ID=0x<your-contract-address>
VITE_PINATA_API_KEY=<your-key>
VITE_PINATA_API_SECRET=<your-secret>
```

### 2. Deploy Contract
```bash
cd blockchain
sui client publish --gas-budget 100000000
# Copy the package ID from output
```

### 3. Start App
```bash
cd client
npm run dev
```

### 4. Test Feature
1. Open app → Editor
2. Create slide
3. Click "Mint"
4. Edit slide
5. Click "Save Chain"
6. Wait for ✅ confirmation

---

## 🎯 Feature Overview

**What**: Save slide edits to SUI blockchain  
**When**: After minting a slide  
**Where**: "Save Chain" button in TopHeader  
**Why**: Immutable, decentralized storage  

---

## 📁 New Files (Read-Only Reference)

```
client/src/
├── hooks/useUpdateSlide.js          ← Contract calls
├── services/
│   ├── blockchain/blockchainSave.js ← Orchestration
│   └── exports/exportToIPFS.js      ← Storage
└── components/Editor/
    ├── EditorLayout.jsx (modified)  ← Integration
    └── TopHeader.jsx (modified)     ← UI
```

---

## 🔧 API Reference

### useUpdateSlide Hook
```javascript
const { updateSlide, isLoading, error } = useUpdateSlide();

await updateSlide({
  slideObject: { id: suiObjectId },
  contentUrl: 'ipfs://hash',
  thumbnailUrl: 'ipfs://hash'
});
```

### saveSlideToBlockchain Service
```javascript
const result = await saveSlideToBlockchain({
  suiObjectId: '0x...',
  title: 'My Slide',
  slides: [...],
  onUpdate: updateSlide
});
// Returns: { success: true, txDigest, contentUrl, thumbnailUrl }
```

### exportToIPFS Service
```javascript
const hash = await exportToIPFS(slideData);
// Returns: ipfs://QmXxxx...

const data = await fetchFromIPFS('ipfs://QmXxxx...');
```

---

## 🎨 UI States

| State | Display | Button |
|-------|---------|--------|
| Pre-mint | Hidden | N/A |
| Ready | "Save Chain" | Blue, Enabled |
| Saving | "Saving..." | Blue, Disabled, Spinning |
| Success | "✅ Saved" | Blue, 3s flash |
| Error | "❌ Error" | Red, Show message |

---

## ⚙️ Config Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_PACKAGE_ID` | Yes | Contract address | `0xabc...` |
| `VITE_PINATA_API_KEY` | No | IPFS upload key | `xyz123...` |
| `VITE_PINATA_API_SECRET` | No | IPFS upload secret | `abc456...` |

**Without Pinata keys**: Uses local storage fallback (`local://...`)

---

## 🔌 Integration Points

### EditorLayout.jsx
```javascript
const { updateSlide, isLoading: isUpdating } = useUpdateSlide();
const [blockchainSaveStatus, setBlockchainSaveStatus] = useState(null);

const handleSaveToBlockchain = async () => {
  setBlockchainSaveStatus('saving');
  try {
    await saveSlideToBlockchain({
      suiObjectId,
      title,
      slides,
      onUpdate: updateSlide
    });
    setBlockchainSaveStatus('success');
  } catch (error) {
    setBlockchainSaveStatus('error');
  }
};

// Pass to TopHeader
<TopHeader
  onSaveToBlockchain={handleSaveToBlockchain}
  blockchainSaveStatus={blockchainSaveStatus}
  isMinted={isMinted}
  isUpdating={isUpdating}
/>
```

### TopHeader.jsx
```javascript
<button
  onClick={onSaveToBlockchain}
  disabled={isUpdating || blockchainSaveStatus === 'saving'}
>
  {blockchainSaveStatus === 'saving' ? 'Saving...' : 'Save Chain'}
</button>
```

---

## 📊 Data Flow

```
Slide Data → IPFS Upload → Content URL
                            ↓
                    updateSlide() Call
                            ↓
                    Sign with Wallet
                            ↓
                    SUI Blockchain
                            ↓
                    SlideUpdated Event
```

---

## ✅ Checklist

- [ ] `.env` configured with `VITE_PACKAGE_ID`
- [ ] Smart contract deployed
- [ ] App starts without errors: `npm run dev`
- [ ] Can mint a slide
- [ ] "Save Chain" button appears after mint
- [ ] Can make changes and save
- [ ] Transaction shows in wallet
- [ ] SUI Explorer shows transaction

---

## 🐛 Troubleshooting

### Button doesn't appear
→ Mint slide first

### IPFS upload fails
→ Check Pinata API keys in `.env`

### Transaction fails
→ Check wallet balance, contract address

### "Slide not found" error
→ Refresh page, try again

### See more: `SETUP_BLOCKCHAIN_SAVE.md`

---

## 📚 Documentation

- **Start here**: `SETUP_BLOCKCHAIN_SAVE.md` (5 min read)
- **Details**: `BLOCKCHAIN_SAVE.md` (complete guide)
- **Overview**: `IMPLEMENTATION_SUMMARY.md`
- **UI Guide**: `VISUAL_GUIDE.md`
- **Deploy**: `DEPLOYMENT_CHECKLIST.md`

---

## 🔗 Useful Links

- **SUI Docs**: https://docs.sui.io/
- **dApp Kit**: https://sdk.mysten.io/dapp-kit
- **Pinata**: https://pinata.cloud/
- **SUI Explorer**: https://suiscan.xyz/

---

## 💡 Key Points

✅ Only creator can update slide  
✅ Data stored on IPFS, hash on blockchain  
✅ Immutable transaction history  
✅ No private keys handled in frontend  
✅ Wallet signs every transaction  

---

## 🎓 Learn More

**How blockchain save works:**
1. User clicks "Save Chain"
2. Slide data packaged as JSON
3. JSON uploaded to IPFS (via Pinata)
4. IPFS hash returned
5. Smart contract called with hash
6. Transaction signed by user
7. Blockchain confirms update
8. SlideUpdated event emitted

**What's immutable:**
- Slide ID
- Creator address
- Update history (via events)
- IPFS hashes (permanent)

**What can change:**
- Content (new IPFS hash)
- Thumbnail (new IPFS hash)
- Licensed/unlicensed status
- Price (separate function)

---

**Status**: ✅ Ready  
**Version**: 1.0  
**Last Updated**: 2026-01-21  

**Questions?** Open an issue or check the full docs above.
