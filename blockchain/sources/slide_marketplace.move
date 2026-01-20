/// SUI Slide Marketplace - Smart Contract
/// 
/// This module implements a decentralized marketplace for slide presentations.
/// Users can:
/// - Mint slides as NFT-like objects (SlideObject)
/// - Sell usage licenses (SlideLicense) without transferring ownership
/// - List slides for sale (full ownership transfer)
/// - Update their own slides
module slide_marketplace::slide_marketplace {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ============ Errors ============
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ESlideNotListed: u64 = 2;
    const ENotSeller: u64 = 3;

    // ============ Structs ============

    /// The master slide asset - only owner can edit
    public struct SlideObject has key, store {
        id: UID,
        creator: address,
        title: String,
        content_url: String,  // IPFS hash pointing to JSON data
        thumbnail_url: String,
        price: u64,           // Price for a usage license in MIST
        is_listed: bool,      // Whether available for license purchase
    }

    /// Usage license token - allows viewing/presenting but not editing
    public struct SlideLicense has key, store {
        id: UID,
        slide_id: ID,         // Reference to original SlideObject
        slide_title: String,  // Cached for display
        buyer: address,
    }

    /// Marketplace Listing - Shared object for full ownership transfer
    /// Wraps SlideObject while listed for sale
    public struct Listing has key {
        id: UID,
        slide: SlideObject,
        seller: address,
        price: u64,           // Price for full ownership transfer in MIST
    }

    // ============ Events ============

    public struct SlideMinted has copy, drop {
        slide_id: ID,
        creator: address,
        title: String,
    }

    public struct LicensePurchased has copy, drop {
        license_id: ID,
        slide_id: ID,
        buyer: address,
        price: u64,
    }

    public struct SlideUpdated has copy, drop {
        slide_id: ID,
        new_content_url: String,
    }

    public struct SlideListed has copy, drop {
        listing_id: ID,
        slide_id: ID,
        seller: address,
        price: u64,
    }

    public struct SlideSold has copy, drop {
        listing_id: ID,
        slide_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    public struct SlideDelisted has copy, drop {
        listing_id: ID,
        slide_id: ID,
        seller: address,
    }

    // ============ Mint & License Functions ============

    /// Mint a new slide as a SUI Object
    public entry fun mint_slide(
        title: String,
        content_url: String,
        thumbnail_url: String,
        price: u64,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        
        let slide = SlideObject {
            id: object::new(ctx),
            creator: sender,
            title,
            content_url,
            thumbnail_url,
            price,
            is_listed: true,
        };

        event::emit(SlideMinted {
            slide_id: object::id(&slide),
            creator: sender,
            title: slide.title,
        });

        transfer::transfer(slide, sender);
    }

    /// Buy a license to view/present a slide (does not transfer ownership)
    public entry fun buy_license(
        slide: &SlideObject,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Check slide is listed for licensing
        assert!(slide.is_listed, ESlideNotListed);
        
        // Check payment is sufficient
        assert!(coin::value(&payment) >= slide.price, EInsufficientPayment);

        let buyer = ctx.sender();
        
        // Split exact amount if overpaid
        let paid = coin::split(&mut payment, slide.price, ctx);
        
        // Transfer payment to creator
        transfer::public_transfer(paid, slide.creator);
        
        // Return change if any
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        // Create license for buyer
        let license = SlideLicense {
            id: object::new(ctx),
            slide_id: object::id(slide),
            slide_title: slide.title,
            buyer,
        };

        event::emit(LicensePurchased {
            license_id: object::id(&license),
            slide_id: object::id(slide),
            buyer,
            price: slide.price,
        });

        transfer::transfer(license, buyer);
    }

    // ============ Marketplace Functions (Full Ownership Transfer) ============

    /// List a slide for sale (full ownership transfer)
    /// The slide is wrapped into a shared Listing object
    public entry fun list_slide(
        slide: SlideObject,
        price: u64,
        ctx: &mut TxContext
    ) {
        let seller = ctx.sender();
        let slide_id = object::id(&slide);

        let listing = Listing {
            id: object::new(ctx),
            slide,
            seller,
            price,
        };

        event::emit(SlideListed {
            listing_id: object::id(&listing),
            slide_id,
            seller,
            price,
        });

        // Share the listing so anyone can buy
        transfer::share_object(listing);
    }

    /// Buy a listed slide (full ownership transfer from seller to buyer)
    public entry fun buy_slide(
        listing: Listing,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let Listing { id, mut slide, seller, price } = listing;
        
        // Check payment is sufficient
        assert!(coin::value(&payment) >= price, EInsufficientPayment);

        let buyer = ctx.sender();
        
        // Split exact amount if overpaid
        let paid = coin::split(&mut payment, price, ctx);
        
        // Transfer payment to seller
        transfer::public_transfer(paid, seller);
        
        // Return change if any
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, buyer);
        } else {
            coin::destroy_zero(payment);
        };

        // Update slide creator to new owner
        slide.creator = buyer;

        event::emit(SlideSold {
            listing_id: object::uid_to_inner(&id),
            slide_id: object::id(&slide),
            seller,
            buyer,
            price,
        });

        // Delete the listing object
        object::delete(id);

        // Transfer slide to buyer
        transfer::transfer(slide, buyer);
    }

    /// Delist a slide and return it to the seller
    public entry fun delist_slide(
        listing: Listing,
        ctx: &TxContext
    ) {
        let Listing { id, slide, seller, price: _ } = listing;
        
        // Only seller can delist
        assert!(seller == ctx.sender(), ENotSeller);

        event::emit(SlideDelisted {
            listing_id: object::uid_to_inner(&id),
            slide_id: object::id(&slide),
            seller,
        });

        // Delete the listing object
        object::delete(id);

        // Return slide to seller
        transfer::transfer(slide, seller);
    }

    // ============ Update Functions ============

    /// Update slide content (only owner)
    public entry fun update_slide(
        slide: &mut SlideObject,
        new_content_url: String,
        new_thumbnail_url: String,
        ctx: &TxContext
    ) {
        assert!(slide.creator == ctx.sender(), ENotOwner);
        
        slide.content_url = new_content_url;
        slide.thumbnail_url = new_thumbnail_url;

        event::emit(SlideUpdated {
            slide_id: object::id(slide),
            new_content_url,
        });
    }

    /// Update slide license price (only owner)
    public entry fun update_price(
        slide: &mut SlideObject,
        new_price: u64,
        ctx: &TxContext
    ) {
        assert!(slide.creator == ctx.sender(), ENotOwner);
        slide.price = new_price;
    }

    /// Toggle listing status for licenses (only owner)
    public entry fun toggle_listing(
        slide: &mut SlideObject,
        ctx: &TxContext
    ) {
        assert!(slide.creator == ctx.sender(), ENotOwner);
        slide.is_listed = !slide.is_listed;
    }

    // ============ View Functions ============

    public fun get_slide_info(slide: &SlideObject): (address, String, String, String, u64, bool) {
        (
            slide.creator,
            slide.title,
            slide.content_url,
            slide.thumbnail_url,
            slide.price,
            slide.is_listed
        )
    }

    public fun get_license_info(license: &SlideLicense): (ID, String, address) {
        (
            license.slide_id,
            license.slide_title,
            license.buyer
        )
    }

    public fun get_listing_info(listing: &Listing): (address, u64, String) {
        (
            listing.seller,
            listing.price,
            listing.slide.title
        )
    }

    public fun get_slide_price(slide: &SlideObject): u64 {
        slide.price
    }

    public fun is_slide_listed(slide: &SlideObject): bool {
        slide.is_listed
    }

    public fun get_listing_price(listing: &Listing): u64 {
        listing.price
    }
}
