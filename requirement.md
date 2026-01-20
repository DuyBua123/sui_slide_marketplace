1. Project Overview
Build a decentralized application (dApp) on the SUI Network that functions as a Slide Presentation Marketplace.

Core Value: Users can create slides using a "Canva-like" editor, mint them as SUI Objects (NFTs), and sell Usage Rights (Licenses) to other users without transferring the original Ownership/Editing Rights.

Platform: Web-based.

2. Tech Stack Requirements
Blockchain: SUI Network (Mainnet/Testnet).

Smart Contract: Move Language.

Frontend: React (Vite), TypeScript.

State Management: Zustand or React Context.

UI Library: Tailwind CSS, shadcn/ui (for standard components).

Canvas/Editor Engine: React Konva (Strict requirement).

Wallet Integration: @mysten/dapp-kit, @mysten/sui.js.

Storage (Optional/Recommended): IPFS or Walrus (for storing heavy JSON slide data), storing the Hash/URL on-chain.

3. Core Features & Architecture
Module A: The Slide Editor (React Konva)
Goal: A WYSIWYG editor allowing users to design slides. Requirements:

Canvas Stage:

Implement a responsive Stage and Layer using React Konva.

Fixed aspect ratio (16:9).

Toolbox (Drag & Drop):

Text: Add headings, paragraphs (draggable, resizable, editable color/font).

Shapes: Rectangles, Circles, Lines (configurable fill/stroke).

Images: Upload from local -> Render on Canvas.

Interactivity:

Use Transformer from React Konva for selecting, resizing, and rotating objects.

Support Z-index layering (Bring to front/Send to back).

Data Serialization:

Save: Function to export the Canvas state to a JSON object.

Load: Function to clear Canvas and re-render from a JSON object.

Preview: Generate a thumbnail (Base64/Blob) from the canvas stage.

Module B: Smart Contracts (SUI Move)
Goal: Manage ownership, licensing, and marketplace logic. Data Structures (Structs):

SlideObject (The Master Asset)

id: UID.

creator: address.

title: String.

content_url: String (IPFS Hash pointing to the JSON data).

thumbnail_url: String.

price: u64 (Price for a usage license).

Rights: Only the owner of this object can update the content_url.

SlideLicense (The Usage Token)

id: UID.

slide_id: ID (Reference to the original SlideObject).

buyer: address.

Rights: Allows the holder to View and Present the slide, but NOT edit or resell (unless specified).

Marketplace (Shared Object)

Stores listings of slides.

Functions:

mint_slide: Create a new SlideObject.

buy_license: A user pays SUI to mint a SlideLicense linked to a specific SlideObject.

update_slide: Only SlideObject owner can call this to update metadata.

Module C: Integration Logic (The "Rights" Flow)
Creation: User designs in React Konva -> Clicks "Mint Slide" -> JSON uploaded to IPFS -> Hash stored on SUI -> SlideObject appears in User's Wallet.

Viewing (Owner): Detects SlideObject in wallet -> Unlocks "Edit Mode".

Viewing (Buyer): Detects SlideLicense in wallet -> Unlocks "View/Present Mode" (ReadOnly).

Viewing (Stranger): No Object/License -> Only sees Thumbnail/Blur preview + "Buy License" button.

4. User Stories & Implementation Steps for Agent
Phase 1: Setup & Smart Contract
Initialize a SUI Move project.

Define SlideObject struct with fields for storage (IPFS hash).

Implement mint function to create the slide.

Implement buy_license function to transfer SUI coins to the creator and mint a SlideLicense to the buyer.

Deploy to SUI Testnet.

Phase 2: Frontend Editor (React Konva)
Setup React + Vite + Tailwind.

Create Editor component:

Left Sidebar: Draggable items (Text, Shape).

Center: Drop zone (<Stage>).

Right Sidebar: Properties (Color, Size).

Implement useSlideStore (Zustand) to manage the array of shapes on the canvas.

Implement Transformer logic for handling click-to-select.

Phase 3: Web3 Integration
Integrate dapp-kit for Wallet Connect.

Mint Flow:

Button "Save to SUI".

stage.toJSON() to get data.

Upload JSON to IPFS (mock this step or use a service like Pinata/Walrus).

Call moveCall to mint_slide with the IPFS URL.

Fetch Flow:

Query owned objects using getOwnedObjects.

Filter by SlideObject type.

Display "My Slides".

Phase 4: Marketplace & Licensing
Create a "Marketplace" page displaying all slides (fetched via Event Indexing or API).

If user owns SlideLicense -> Show "Open Presentation" button.

If user owns nothing -> Show "Buy for X SUI" button.

"Open Presentation" renders the Konva Stage in pointerEvents="none" (ReadOnly) mode.

5. Constraints & Guidelines
Code Quality: Component-based architecture. Use Custom Hooks for SUI logic (e.g., useMintSlide, useBuyLicense).

UX: Provide loading states when signing transactions.

Security: Ensure the JSON content structure is validated before rendering to prevent XSS (though React Konva is relatively safe).