module 0x0::slide_marketplace {
    use std::string::String;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ============ Errors ============
    const ENotOwner: u64 = 0;
    const EInsufficientPayment: u64 = 1;
    const ESlideNotListed: u64 = 2;
    const ENotSeller: u64 = 3;
    const ESlideNotForSale: u64 = 4;

    // ============ Structs ============

    /// The master slide asset - Shared object so anyone can call buy functions
    public struct SlideObject has key, store {
        id: UID,
        owner: address,       // Current owner of the slide
        title: String,
        content_url: String,  // IPFS hash pointing to JSON data
        thumbnail_url: String,
        price: u64,           // Price for a usage license in MIST
        is_listed: bool,      // Whether available for license purchase
        sale_price: u64,      // Price for full ownership transfer in MIST
        is_for_sale: bool,    // Whether available for full ownership purchase
    }

    /// Usage license token - allows viewing/presenting but not editing
    public struct SlideLicense has key, store {
        id: UID,
        slide_id: ID,         // Reference to original SlideObject
        slide_title: String,  // Cached for display
        buyer: address,
    }

    // ============ Events ============

    public struct SlideMinted has copy, drop {
        slide_id: ID,
        owner: address,
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

    public struct SlideSold has copy, drop {
        slide_id: ID,
        seller: address,
        buyer: address,
        price: u64,
    }

    public struct SlideDeleted has copy, drop {
        slide_id: ID,
        owner: address,
        title: String,
    }

    // ============ Mint & License Functions ============

    /// Mint a new slide as a Shared SUI Object
    public entry fun mint_slide(
        title: String,
        content_url: String,
        thumbnail_url: String,
        price: u64,
        sale_price: u64,
        is_for_sale: bool,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        
        let slide = SlideObject {
            id: object::new(ctx),
            owner: sender,
            title,
            content_url,
            thumbnail_url,
            price,
            is_listed: true,
            sale_price,
            is_for_sale,
        };

        event::emit(SlideMinted {
            slide_id: object::id(&slide),
            owner: sender,
            title: slide.title,
        });

        // Share the object so anyone can buy licenses or ownership
        transfer::share_object(slide);
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
        
        // Transfer payment to owner
        transfer::public_transfer(paid, slide.owner);
        
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

    /// Buy full ownership of a slide
    public entry fun buy_slide(
        slide: &mut SlideObject,
        mut payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Check slide is for sale
        assert!(slide.is_for_sale, ESlideNotForSale);
        
        // Check payment is sufficient
        assert!(coin::value(&payment) >= slide.sale_price, EInsufficientPayment);

        let buyer = ctx.sender();
        let seller = slide.owner;
        let price = slide.sale_price;
        
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

        // Update slide owner to new owner and take off sale
        slide.owner = buyer;
        slide.is_for_sale = false;

        event::emit(SlideSold {
            slide_id: object::id(slide),
            seller,
            buyer,
            price,
        });
    }

    // ============ Update Functions ============

    /// Update slide content (only owner)
    public entry fun update_slide(
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

        event::emit(SlideUpdated {
            slide_id: object::id(slide),
            new_content_url,
        });
    }

    /// Update prices (only owner)
    public entry fun update_listing_status(
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

    /// Delete a slide (only owner can delete)
    public entry fun delete_slide(
        slide: SlideObject,
        ctx: &TxContext
    ) {
        // Verify ownership
        assert!(slide.owner == ctx.sender(), ENotOwner);
        
        let SlideObject { 
            id, 
            owner, 
            title, 
            content_url: _, 
            thumbnail_url: _, 
            price: _, 
            is_listed: _,
            sale_price: _,
            is_for_sale: _
        } = slide;

        // Emit deletion event before destroying
        event::emit(SlideDeleted {
            slide_id: object::uid_to_inner(&id),
            owner,
            title,
        });
        
        // Delete the object
        object::delete(id);
    }
}
