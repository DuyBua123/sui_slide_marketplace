module 0x0::slide_marketplace {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use 0x0::event as event_tracker;
    use 0x0::event::EventTracker;

    // ============ Errors ============
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ESlideNotListed: u64 = 2;
    const ESlideNotForSale: u64 = 4;
    const EAccessRevoked: u64 = 5;
    const EInvalidDuration: u64 = 6;
    const ERevocationTooEarly: u64 = 7;

    // ============ Constants ============
    const DURATION_MONTH: u64 = 2592000000; // 30 days in ms
    const DURATION_YEAR: u64 = 31536000000;  // 365 days in ms
    
    // Duration Types
    const TYPE_MONTH: u8 = 1;
    const TYPE_YEAR: u8 = 2;
    const TYPE_LIFETIME: u8 = 3;

    // ============ Structs ============

    /// Represents a snapshot of a slide version
    public struct SlideVersion has store, drop {
        version: u64,
        content_url: String,
        timestamp: u64,
    }

    /// Metadata about a user's license to track 30% rule
    public struct LicenseRecord has store, drop {
        issued_at: u64,
        duration_type: u8,
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
        
        // Licensing (Multi-Tier)
        monthly_price: u64,
        yearly_price: u64,
        lifetime_price: u64,
        
        is_listed: bool,
        blocked_buyers: Table<address, bool>, // Ownership right: revoke/ban specific users
        active_licenses: Table<address, LicenseRecord>, // Track for 30% rule

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
        issued_at: u64,      // Timestamp ms
        expires_at: u64,     // Timestamp ms (0 = lifetime)
        duration_type: u8,   // 1=Month, 2=Year, 3=Lifetime
        price_paid: u64,     // For refund calc
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
        duration_type: u8,
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
        monthly_price: u64,
        yearly_price: u64,
        lifetime_price: u64,
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
            monthly_price,
            yearly_price,
            lifetime_price,
            is_listed: false,
            blocked_buyers: table::new(ctx),
            active_licenses: table::new(ctx),
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
        slide: &mut SlideObject,
        tracker: &mut EventTracker, // Added EventTracker
        duration_type: u8,
        mut payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let buyer = ctx.sender();
        let now = clock::timestamp_ms(clock);

        // Selection
        let price = if (duration_type == TYPE_MONTH) {
            slide.monthly_price
        } else if (duration_type == TYPE_YEAR) {
            slide.yearly_price
        } else if (duration_type == TYPE_LIFETIME) {
            slide.lifetime_price
        } else {
            abort EInvalidDuration
        };

        let expires_at = if (duration_type == TYPE_MONTH) {
            now + DURATION_MONTH
        } else if (duration_type == TYPE_YEAR) {
            now + DURATION_YEAR
        } else {
            0 // Lifetime
        };

        // Checks
        assert!(slide.is_listed, ESlideNotListed);
        assert!(!table::contains(&slide.blocked_buyers, buyer), EAccessRevoked);
        assert!(coin::value(&payment) >= price, EInsufficientPayment);

        // Payment
        let paid = coin::split(&mut payment, price, ctx);
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
            version: slide.published_version,
            slide_title: slide.title,
            buyer,
            issued_at: now,
            expires_at,
            duration_type,
            price_paid: price,
        };

        // Update tracking for 30% rule
        let record = LicenseRecord { issued_at: now, duration_type };
        if (table::contains(&slide.active_licenses, buyer)) {
            let old = table::remove(&mut slide.active_licenses, buyer);
            let _ = old; // drop it
        };
        table::add(&mut slide.active_licenses, buyer, record);

        event::emit(LicensePurchased {
            license_id: object::id(&license),
            slide_id: object::id(slide),
            version: slide.published_version,
            buyer,
            price,
            duration_type,
        });

        // Trigger Tet Event Reward Logic
        event_tracker::record_event_sale(tracker, slide.owner, buyer, ctx);

        transfer::transfer(license, buyer);
    }

    /// Buy Full Ownership
    public entry fun buy_ownership(
        slide: &mut SlideObject,
        tracker: &mut EventTracker, // Added EventTracker
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

        // Trigger Tet Event Reward Logic
        event_tracker::record_event_sale(tracker, seller, buyer, ctx);

        event::emit(OwnershipTransferred {
            slide_id: object::id(slide),
            old_owner: seller,
            new_owner: buyer,
            price,
        });
    }

    /// Upgrade License to Ownership (Article 1.5)
    /// - Before 50% duration: Refund 70% of license price.
    /// - After 50%: Refund 30%.
    public entry fun upgrade_to_ownership(
        slide: &mut SlideObject,
        tracker: &mut EventTracker,
        license: SlideLicense,
        mut payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(slide.is_for_sale, ESlideNotForSale);
        assert!(license.slide_id == object::id(slide), ESlideNotListed); // reusing error for mismatch
        assert!(is_license_valid(&license, clock), EAccessRevoked); // reusing error for expired

        let now = clock::timestamp_ms(clock);
        let elapsed = now - license.issued_at;
        
        let duration = if (license.duration_type == TYPE_MONTH) {
            DURATION_MONTH
        } else if (license.duration_type == TYPE_YEAR) {
            DURATION_YEAR
        } else {
            0 // Lifetime/Special
        };

        // Refund Logic
        // For Lifetime (duration == 0), effective duration is infinite, so elapsed < duration/2 is always true. 
        // Therefore Lifetime licenses always get 70% refund when upgrading.
        let is_early = if (duration == 0) { true } else { elapsed < (duration / 2) };
        
        let refund_rate = if (is_early) {
            70
        } else {
            30 
        };

        let refund_amount = (license.price_paid * refund_rate) / 100;
        
        // Calculate remaining to pay
        // Ensure refund doesn't exceed sale price (unlikely but possible)
        let price_to_pay = if (slide.sale_price > refund_amount) {
            slide.sale_price - refund_amount
        } else {
            0
        };

        assert!(coin::value(&payment) >= price_to_pay, EInsufficientPayment);

        let buyer = ctx.sender();
        let seller = slide.owner;

        // Process Payment
        if (price_to_pay > 0) {
            let paid = coin::split(&mut payment, price_to_pay, ctx);
            transfer::public_transfer(paid, seller);
        };
        
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        // Burn License
        let SlideLicense { id, slide_id: _, version: _, slide_title: _, buyer: _, issued_at: _, expires_at: _, duration_type: _, price_paid: _ } = license;
        object::delete(id);

        // Transfer Ownership
        slide.owner = buyer;
        slide.is_for_sale = false;

        // Trigger Tet Event Reward Logic (on the paid amount or full value? Usually paid amount)
        event_tracker::record_event_sale(tracker, seller, buyer, ctx);

        event::emit(OwnershipTransferred {
            slide_id: object::id(slide),
            old_owner: seller,
            new_owner: buyer,
            price: price_to_pay,
        });
    }

    /// Owner: Revoke access for a specific buyer (Bans them from future license buys or validity checks)
    public entry fun revoke_access(
        slide: &mut SlideObject,
        target: address,
        clock: &Clock,
        ctx: &TxContext
    ) {
        assert!(slide.owner == ctx.sender(), ENotOwner);

        // Check 30% rule - REMOVED per New Terms Art 1.6
        // Owner has full right to revoke (or handled off-chain for breach)
        // Access is automatically terminated on expiry.
        // if (table::contains(&slide.active_licenses, target)) { ... }
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
        monthly_price: u64,
        yearly_price: u64,
        lifetime_price: u64,
        is_listed: bool,
        sale_price: u64,
        is_for_sale: bool,
        ctx: &TxContext
    ) {
        assert!(slide.owner == ctx.sender(), ENotOwner);
        slide.monthly_price = monthly_price;
        slide.yearly_price = yearly_price;
        slide.lifetime_price = lifetime_price;
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

    /// Check if license is chemically valid (time-based only)
    public fun is_license_valid(license: &SlideLicense, clock: &Clock): bool {
        let now = clock::timestamp_ms(clock);
        license.expires_at == 0 || now < license.expires_at
    }

    /// Comprehensive access check:
    /// 1. License matches Slide
    /// 2. User is not revoked/blocked
    /// 3. License is not expired
    public fun check_access(slide: &SlideObject, license: &SlideLicense, clock: &Clock): bool {
        // 1. Match Slide ID
        if (object::id(slide) != license.slide_id) { return false };
        
        // 2. Blocked Check
        if (table::contains(&slide.blocked_buyers, license.buyer)) { return false };

        // 3. Time Check
        is_license_valid(license, clock)
    }

    public entry fun delete_slide(slide: SlideObject, ctx: &TxContext) {
        let SlideObject { 
            id, 
            owner, 
            title: _, 
            content_url: _, 
            thumbnail_url: _, 
            published_version: _, 
            versions: _, 
            monthly_price: _, 
            yearly_price: _, 
            lifetime_price: _, 
            is_listed: _, 
            blocked_buyers, 
            active_licenses,
            sale_price: _, 
            is_for_sale: _ 
        } = slide;

        assert!(owner == ctx.sender(), ENotOwner);
        
        table::drop(blocked_buyers);
        table::drop(active_licenses);
        object::delete(id);
    }
}
