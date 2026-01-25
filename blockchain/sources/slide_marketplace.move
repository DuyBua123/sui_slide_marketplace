module 0x0::slide_marketplace {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};

    // ============ Errors ============
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ESlideNotListed: u64 = 2;
    const ENotSeller: u64 = 3;
    const ESlideNotForSale: u64 = 4;
    const EAccessRevoked: u64 = 5;

    // ============ Structs ============

    /// Represents a snapshot of a slide version
    public struct SlideVersion has store, drop {
        version: u64,
        content_url: String,
        timestamp: u64,
    }

    /// The master slide asset - Shared object
    public struct SlideObject has key, store {
        id: UID,
        owner: address,
        title: String,
        
        // Draft/Current State
        content_url: String,  
        thumbnail_url: String,
        
        // Versioning
        published_version: u64,     // Version available on marketplace
        versions: vector<SlideVersion>, // History of published versions
        
        // Licensing
        price: u64,
        is_listed: bool,
        blocked_buyers: Table<address, bool>, // Ownership right: revoke/ban specific users

        // Ownership Sale
        sale_price: u64,
        is_for_sale: bool,
    }

    /// Usage license token
    public struct SlideLicense has key, store {
        id: UID,
        slide_id: ID,
        version: u64,        // Binds license to a specific version
        slide_title: String,
        buyer: address,
    }

    // ============ Events ============

    public struct SlideMinted has copy, drop {
        slide_id: ID,
        owner: address,
        title: String,
    }

    public struct VersionPublished has copy, drop {
        slide_id: ID,
        version: u64,
        content_url: String,
    }

    public struct LicensePurchased has copy, drop {
        license_id: ID,
        slide_id: ID,
        version: u64,
        buyer: address,
        price: u64,
    }

    public struct OwnershipTransferred has copy, drop {
        slide_id: ID,
        old_owner: address,
        new_owner: address,
        price: u64,
    }

    public struct AccessRevoked has copy, drop {
        slide_id: ID,
        target: address,
    }

    // ============ Functions ============

    /// Mint a new slide. Initializes with Version 1 published.
    public entry fun mint_slide(
        title: String,
        content_url: String,
        thumbnail_url: String,
        price: u64,
        sale_price: u64,
        is_for_sale: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        
        // Create initial version
        let v1 = SlideVersion {
            version: 1,
            content_url: content_url,
            timestamp: clock::timestamp_ms(clock),
        };

        let mut versions = vector::empty();
        vector::push_back(&mut versions, v1);

        let slide = SlideObject {
            id: object::new(ctx),
            owner: sender,
            title,
            content_url, // Current draft matches v1
            thumbnail_url,
            published_version: 1,
            versions,
            price,
            is_listed: true,
            blocked_buyers: table::new(ctx),
            sale_price,
            is_for_sale,
        };

        event::emit(SlideMinted {
            slide_id: object::id(&slide),
            owner: sender,
            title: slide.title,
        });

        transfer::share_object(slide);
    }

    /// Publish the current content_url as a new version for the marketplace
    public entry fun publish_version(
        slide: &mut SlideObject,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(slide.owner == ctx.sender(), ENotOwner);

        // Increment version
        let new_version_num = slide.published_version + 1;

        let new_version = SlideVersion {
            version: new_version_num,
            content_url: slide.content_url,
            timestamp: clock::timestamp_ms(clock),
        };

        vector::push_back(&mut slide.versions, new_version);
        slide.published_version = new_version_num;

        event::emit(VersionPublished {
            slide_id: object::id(slide),
            version: new_version_num,
            content_url: slide.content_url,
        });
    }

    /// Buy a usage license for the CURRENT published version
    public entry fun buy_license(
        slide: &SlideObject,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let buyer = ctx.sender();

        // Checks
        assert!(slide.is_listed, ESlideNotListed);
        assert!(!table::contains(&slide.blocked_buyers, buyer), EAccessRevoked);
        assert!(coin::value(&payment) >= slide.price, EInsufficientPayment);

        // Payment
        let paid = coin::split(&mut payment, slide.price, ctx);
        transfer::public_transfer(paid, slide.owner);
        
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        // Mint License
        let license = SlideLicense {
            id: object::new(ctx),
            slide_id: object::id(slide),
            version: slide.published_version, // Tied to specific version
            slide_title: slide.title,
            buyer,
        };

        event::emit(LicensePurchased {
            license_id: object::id(&license),
            slide_id: object::id(slide),
            version: slide.published_version,
            buyer,
            price: slide.price,
        });

        transfer::transfer(license, buyer);
    }

    /// Buy Full Ownership
    public entry fun buy_ownership(
        slide: &mut SlideObject,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(slide.is_for_sale, ESlideNotForSale);
        assert!(coin::value(&payment) >= slide.sale_price, EInsufficientPayment);

        let buyer = ctx.sender();
        let seller = slide.owner;
        let price = slide.sale_price;

        let paid = coin::split(&mut payment, price, ctx);
        transfer::public_transfer(paid, seller);
        
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        // Transfer Ownership
        slide.owner = buyer;
        slide.is_for_sale = false; // Reset sale status

        event::emit(OwnershipTransferred {
            slide_id: object::id(slide),
            old_owner: seller,
            new_owner: buyer,
            price,
        });
    }

    /// Owner: Revoke access for a specific buyer (Bans them from future license buys or validity checks)
    public entry fun revoke_access(
        slide: &mut SlideObject,
        target: address,
        ctx: &TxContext
    ) {
        assert!(slide.owner == ctx.sender(), ENotOwner);
        if (!table::contains(&slide.blocked_buyers, target)) {
            table::add(&mut slide.blocked_buyers, target, true);
        };

        event::emit(AccessRevoked {
            slide_id: object::id(slide),
            target,
        });
    }

    /// Owner: Update Draft Logic (Only updates local state, doesn't publish)
    public entry fun update_slide_content(
        slide: &mut SlideObject,
        new_title: String,
        new_content_url: String,
        new_thumbnail_url: String,
        ctx: &TxContext
    ) {
        assert!(slide.owner == ctx.sender(), ENotOwner);
        slide.title = new_title;
        slide.content_url = new_content_url;
        slide.thumbnail_url = new_thumbnail_url;
        // Does NOT auto-publish version
    }

    public entry fun set_listing_status(
        slide: &mut SlideObject,
        price: u64,
        is_listed: bool,
        sale_price: u64,
        is_for_sale: bool,
        ctx: &TxContext
    ) {
        assert!(slide.owner == ctx.sender(), ENotOwner);
        slide.price = price;
        slide.is_listed = is_listed;
        slide.sale_price = sale_price;
        slide.is_for_sale = is_for_sale;
    }

    // ============ View Functions ============

    public fun get_latest_version(slide: &SlideObject): u64 {
        slide.published_version
    }

    public fun is_blocked(slide: &SlideObject, user: address): bool {
        table::contains(&slide.blocked_buyers, user)
    }
}
