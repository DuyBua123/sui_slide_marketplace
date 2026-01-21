# Setup Guide: Save to Blockchain Feature

## Quick Setup (5 minutes)

### 1. Update Environment Variables
Create/update `.env` in the `client/` directory:

```env
# SUI Network Configuration
VITE_PACKAGE_ID=0x<your-deployed-contract-address>

# IPFS (Pinata) Configuration - Optional
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_API_SECRET=your_secret_here
```

**How to get Pinata keys:**
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up or login
3. Navigate to "API Keys" 
4. Create a new API key
5. Copy the API Key and Secret

### 2. Deploy Smart Contract (if not already done)

```bash
cd blockchain
sui client publish --gas-budget 100000000
```

After deployment:
- Copy the package ID from the deployment output
- Update `VITE_PACKAGE_ID` in `.env`

### 3. Install Dependencies (if needed)

```bash
cd client
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## Testing the Feature

1. **Open the app** and navigate to the editor
2. **Design a slide** with text, shapes, or images
3. **Click "Mint"** button to mint the slide as an NFT
   - Wait for confirmation
   - "Mint Slide" button becomes "Save Chain"
4. **Make some changes** to the slide
5. **Click "Save Chain"** button
   - Status: "Saving to blockchain..."
   - After ~2-3 seconds: "Saved to blockchain" ✓

## What Happens Behind the Scenes

When you click "Save Chain":

```
1. Slide data is packaged (title, slides array, metadata)
2. Uploaded to IPFS via Pinata API
3. Smart contract's update_slide() is called with new IPFS hash
4. Transaction is signed by wallet
5. SUI network confirms transaction
6. Event SlideUpdated is emitted
7. UI shows success message
```

## Troubleshooting

### Issue: "Save Chain" button doesn't appear
**Solution:** 
- Ensure slide is minted first (click Mint button)
- Check browser console (F12) for errors
- Verify wallet is connected

### Issue: Transaction fails with "Insufficient gas"
**Solution:**
- Fund wallet with more SUI from faucet
- Testnet faucet: https://discordapp.com/channels/916379725201563648/1037811694409256970
- On mainnet: purchase SUI from exchange

### Issue: IPFS upload fails
**Solution:**
- Verify Pinata API keys are correct in `.env`
- Check Pinata account has active subscription
- Check file size is < 5MB
- Restart dev server after updating `.env`

### Issue: Smart contract function not found
**Solution:**
- Verify VITE_PACKAGE_ID matches your deployed contract
- Ensure Move code has `update_slide` function (it should)
- Rebuild contract: `sui move build`

## File Structure

```
client/
├── src/
│   ├── hooks/
│   │   └── useUpdateSlide.js          ← New: Hook for blockchain updates
│   ├── components/
│   │   └── Editor/
│   │       ├── EditorLayout.jsx       ← Modified: Added blockchain save logic
│   │       └── TopHeader.jsx          ← Modified: Added "Save Chain" button
│   └── services/
│       ├── blockchain/
│       │   └── blockchainSave.js      ← New: Blockchain save orchestration
│       └── exports/
│           └── exportToIPFS.js        ← New: IPFS upload service
├── .env                                ← Create: Environment variables
└── package.json
```

## Key Files to Review

1. **[useUpdateSlide.js](./client/src/hooks/useUpdateSlide.js)** - Smart contract interaction
2. **[blockchainSave.js](./client/src/services/blockchain/blockchainSave.js)** - Save orchestration
3. **[EditorLayout.jsx](./client/src/components/Editor/EditorLayout.jsx)** - Main editor integration
4. **[TopHeader.jsx](./client/src/components/Editor/TopHeader.jsx)** - UI controls

## Next Steps

1. ✅ Set up environment variables
2. ✅ Deploy or update smart contract
3. ✅ Test minting a slide
4. ✅ Test saving to blockchain
5. 🚀 Deploy frontend to production
6. 🚀 Update mainnet contract address in `.env`

## Support

For issues or questions:
- Check [BLOCKCHAIN_SAVE.md](./BLOCKCHAIN_SAVE.md) for detailed documentation
- Review browser console (F12) for error messages
- Check smart contract logs on SUI Explorer

Happy building! 🎨⛓️
