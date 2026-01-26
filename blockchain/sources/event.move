module 0x0::event {
    use sui::table::{Self, Table};
    use sui::coin::{Self, TreasuryCap};
    use 0x0::event_token::EVENT_TOKEN;

    // ============ Errors ============

    // ============ Structs ============

    /// The central tracking object for the event.
    /// This is a Shared Object.
    public struct EventTracker has key {
        id: UID,
        /// The TreasuryCap allows this tracker to mint rewards programmatically.
        /// It is wrapped inside the tracker so no external user can access it directly.
        treasury_cap: TreasuryCap<EVENT_TOKEN>,
        
        /// ANTI-CHEAT MECHANISM: Unique Buyer Tracking
        ///
        /// Data Structure: Table<SellerAddress, Table<BuyerAddress, HasPurchased>>
        /// 
        /// Logic:
        /// We want to reward sellers for acquiring NEW customers, not for farming volume with the same buyer.
        /// 
        /// 1. The outer table maps a Seller's address to their personal record of buyers.
        /// 2. The inner table maps a Buyer's address to a boolean (always true if present).
        /// 
        /// When a sale happens:
        /// - We check `purchases[seller][buyer]`.
        /// - If it exists -> This implies strictly a repeat purchase. NO REWARD.
        /// - If it does not exist -> This is a unique/new customer interaction. MINT REWARD.
        /// 
        /// Efficiency:
        /// - Table lookups are O(1).
        /// - We only store data for successful unique interactions.
        purchases: Table<address, Table<address, bool>>,
    }

    /// Admin Capability to initialize the tracker
    public struct AdminCap has key, store {
        id: UID,
    }

    // ============ Functions ============

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
    }

    /// Initialize the tracker. 
    /// Requires the Admin to deposit the TreasuryCap of the EventToken into this object.
    /// This effectively "locks" the minting power into this contract logic.
    public entry fun initialize_tracker(
        _: &AdminCap,
        treasury_cap: TreasuryCap<EVENT_TOKEN>,
        ctx: &mut TxContext
    ) {
        let tracker = EventTracker {
            id: object::new(ctx),
            treasury_cap,
            purchases: table::new(ctx),
        };
        transfer::share_object(tracker);
    }

    /// Called by the Marketplace to record a sale and potentially reward the seller.
    /// 
    /// Logic:
    /// 1. Checks if this specific (Seller, Buyer) pair has been recorded.
    /// 2. If NOT recorded:
    ///    - Mint 1 ET to the Seller.
    ///    - Record the pair in the Anti-Cheat Table.
    /// 3. If ALREADY recorded:
    ///    - Do nothing (Anti-Cheat triggered).
    public fun record_event_sale(
        tracker: &mut EventTracker,
        seller: address,
        buyer: address,
        ctx: &mut TxContext
    ) {
        // 1. Initialize seller's buyer-table if it doesn't exist yet
        if (!table::contains(&tracker.purchases, seller)) {
            table::add(&mut tracker.purchases, seller, table::new(ctx));
        };

        // 2. Access the seller's specific buyer-table
        let buyers_record = table::borrow_mut(&mut tracker.purchases, seller);

        // 3. ANTI-CHEAT CHECK: Has this buyer purchased from this seller before?
        if (!table::contains(buyers_record, buyer)) {
            // == NEW UNIQUE BUYER DISCOVERED ==
            
            // A. Mark as "Counted" to prevent future farming
            table::add(buyers_record, buyer, true);

            // B. Reward the Seller (Mint 1 ET)
            // Note: detailed decimals should be handled in real apps, assuming 0 decimals for simplicity or 1 unit.
            let reward_coin = coin::mint(&mut tracker.treasury_cap, 1, ctx);
            transfer::public_transfer(reward_coin, seller);
        };
        // Else: Repeat purchase, ignored for rewards.
    }
}
