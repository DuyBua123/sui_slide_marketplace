/// Event Marketplace Module
/// 
/// Provides a secondary market for trading Tet Event items:
/// - LuckyBox (unopened boxes)
/// - TetAsset (Stickers, Animations, Videos)
/// 
/// Users can list their items for sale in SUI and others can buy them.
module 0x0::event_market {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::dynamic_object_field as dof;
    
    use 0x0::lucky_box::LuckyBox;
    use 0x0::asset::Asset;

    // ============ Errors ============
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const EItemNotListed: u64 = 2;

    // ============ Structs ============

    /// Marketplace shared object that holds all listings
    public struct EventMarketplace has key {
        id: UID,
        /// Fee percentage (basis points, e.g., 250 = 2.5%)
        fee_bps: u64,
        /// Fee recipient
        fee_recipient: address,
    }

    /// A listing for a LuckyBox
    public struct BoxListing has key, store {
        id: UID,
        seller: address,
        price: u64,
        box: LuckyBox,
    }

    /// A listing for a TetAsset
    public struct AssetListing has key, store {
        id: UID,
        seller: address,
        price: u64,
        asset: Asset,
    }

    // ============ Events ============

    public struct BoxListed has copy, drop {
        listing_id: ID,
        seller: address,
        price: u64,
    }

    public struct BoxSold has copy, drop {
        listing_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    public struct AssetListed has copy, drop {
        listing_id: ID,
        seller: address,
        price: u64,
    }

    public struct AssetSold has copy, drop {
        listing_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    // ============ Init ============

    fun init(ctx: &mut TxContext) {
        let marketplace = EventMarketplace {
            id: object::new(ctx),
            fee_bps: 250, // 2.5% fee
            fee_recipient: ctx.sender(),
        };
        transfer::share_object(marketplace);
    }

    // ============ Box Functions ============

    /// List a LuckyBox for sale
    public entry fun list_box(
        box: LuckyBox,
        price: u64,
        ctx: &mut TxContext
    ) {
        let seller = ctx.sender();
        let listing = BoxListing {
            id: object::new(ctx),
            seller,
            price,
            box,
        };
        
        event::emit(BoxListed {
            listing_id: object::id(&listing),
            seller,
            price,
        });

        transfer::share_object(listing);
    }

    /// Buy a listed LuckyBox
    public entry fun buy_box(
        listing: BoxListing,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let BoxListing { id, seller, price, box } = listing;
        
        assert!(coin::value(&payment) >= price, EInsufficientPayment);

        let buyer = ctx.sender();

        // Transfer payment to seller
        let paid = coin::split(&mut payment, price, ctx);
        transfer::public_transfer(paid, seller);

        // Return change
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        event::emit(BoxSold {
            listing_id: object::uid_to_inner(&id),
            seller,
            buyer,
            price,
        });

        // Transfer box to buyer
        transfer::public_transfer(box, buyer);
        object::delete(id);
    }

    /// Delist a LuckyBox (seller only)
    public entry fun delist_box(
        listing: BoxListing,
        ctx: &TxContext
    ) {
        let BoxListing { id, seller, price: _, box } = listing;
        assert!(seller == ctx.sender(), ENotOwner);
        
        transfer::public_transfer(box, seller);
        object::delete(id);
    }

    // ============ Asset Functions ============

    /// List a TetAsset for sale
    public entry fun list_asset(
        asset: Asset,
        price: u64,
        ctx: &mut TxContext
    ) {
        let seller = ctx.sender();
        let listing = AssetListing {
            id: object::new(ctx),
            seller,
            price,
            asset,
        };

        event::emit(AssetListed {
            listing_id: object::id(&listing),
            seller,
            price,
        });

        transfer::share_object(listing);
    }

    /// Buy a listed TetAsset
    public entry fun buy_asset(
        listing: AssetListing,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let AssetListing { id, seller, price, asset } = listing;
        
        assert!(coin::value(&payment) >= price, EInsufficientPayment);

        let buyer = ctx.sender();

        // Transfer payment to seller
        let paid = coin::split(&mut payment, price, ctx);
        transfer::public_transfer(paid, seller);

        // Return change
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        event::emit(AssetSold {
            listing_id: object::uid_to_inner(&id),
            seller,
            buyer,
            price,
        });

        // Transfer asset to buyer
        transfer::public_transfer(asset, buyer);
        object::delete(id);
    }

    /// Delist a TetAsset (seller only)
    public entry fun delist_asset(
        listing: AssetListing,
        ctx: &TxContext
    ) {
        let AssetListing { id, seller, price: _, asset } = listing;
        assert!(seller == ctx.sender(), ENotOwner);
        
        transfer::public_transfer(asset, seller);
        object::delete(id);
    }
}
