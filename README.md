# SlideSui - Decentralized Presentation Marketplace

A blockchain-powered presentation marketplace built on **Sui Network**. Create, sell, and collect presentation slides with Web3 ownership and licensing.

![Sui Network](https://img.shields.io/badge/Sui-Testnet-blue)
![Move](https://img.shields.io/badge/Move-Language-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)

## 🌟 Features

### Core Platform
- **Slide Editor**: Create beautiful presentations with drag-and-drop elements
- **Marketplace**: Buy and sell slides with SUI tokens
- **Dual Licensing**: Offer License (view-only) or Ownership (full rights) tiers
- **Premium Pass**: Subscription-based premium features

### 🧧 Tết Event (Lunar New Year)
- **Lucky Box System**: Spend Event Tokens (ET) to open mystery boxes
- **Collectible Assets**: Win Stickers, Animations, and Videos with rarity tiers
- **Fusion Lab**: Combine 5 Rare assets to craft Epic items
- **Asset Marketplace**: Trade event items with other players

### Web3 Integration
- **Sui Wallet Support**: Connect with Sui Wallet, Suiet, or Enoki zkLogin
- **On-Chain Ownership**: All slides and assets are NFTs on Sui
- **Walrus Storage**: Decentralized media storage for presentations

---

## 📁 Project Structure

```
SUI/
├── blockchain/           # Move smart contracts
│   └── sources/
│       ├── slide_marketplace.move   # Core marketplace logic
│       ├── premium_pass.move        # Premium subscription
│       ├── event.move               # Event token & tracking
│       ├── event_token.move         # ET coin definition
│       ├── lucky_box.move           # Lucky box mechanics
│       ├── asset.move               # Tet assets (Stickers, etc.)
│       ├── event_market.move        # Asset trading
│       ├── fusion_system.move       # Asset crafting
│       └── game_config.move         # Dynamic probabilities
│
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # React Query hooks
│   │   ├── pages/        # Route pages
│   │   └── store/        # Zustand state
│   └── .env              # Environment config
│
├── scripts/              # Utility scripts
│   └── sync-config.js    # Sync blockchain IDs to client
│
└── global.config.json    # Shared configuration
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Sui CLI](https://docs.sui.io/build/install) v1.63+
- Sui Wallet Extension

### 1. Clone & Install
```bash
git clone <repository-url>
cd SUI

# Install client dependencies
cd client
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your deployed contract IDs
# Or run sync script after deployment:
cd ../scripts && node sync-config.js
```

### 3. Run Development Server
```bash
cd client
npm run dev
```

Open [http://localhost:5174](http://localhost:5174)

---

## 🔧 Blockchain Deployment

### Deploy to Testnet
```bash
cd blockchain
sui client publish --gas-budget 500000000
```

### Initialize Shared Objects
After deployment, initialize required shared objects:

```bash
# Initialize Event Tracker (for ET rewards)
sui client call --package <PACKAGE_ID> --module event --function initialize_tracker \
  --args <ADMIN_CAP_ID> <TREASURY_CAP_ID> --gas-budget 50000000

# Update game probabilities (optional)
sui client call --package <PACKAGE_ID> --module game_config --function set_probabilities \
  --args <CONFIG_ADMIN_CAP_ID> <GAME_CONFIG_ID> [50,20,10,10,10] --gas-budget 10000000
```

### Sync IDs to Client
```bash
node scripts/sync-config.js
```

---

## 📦 Key Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_PACKAGE_ID` | Deployed Move package address |
| `VITE_PREMIUM_CONFIG` | PremiumConfig shared object ID |
| `VITE_GAME_CONFIG_ID` | GameConfig for Lucky Box probabilities |
| `VITE_EVENT_TRACKER_ID` | EventTracker for ET rewards |
| `VITE_SUI_NETWORK` | `testnet` or `mainnet` |
| `VITE_WALRUS_PUBLISHER` | Walrus blob upload endpoint |
| `VITE_ENOKI_API_KEY` | Enoki zkLogin API key |

---

## 🎮 Cheat Scripts (Testing Only)

### Mint Event Tokens
```bash
cd client
node cheat_et.js <RECIPIENT_ADDRESS>
# Copy the output command and run it
```

### Batch Mint 10 ET
```bash
node mint_many.js
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Sui Network (Move) |
| Frontend | React 18, Vite, TailwindCSS |
| State | Zustand, TanStack Query |
| Wallet | @mysten/dapp-kit, Enoki |
| Storage | Walrus (decentralized) |
| Auth | Google OAuth + zkLogin |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

**Built with ❤️ on Sui Network**
