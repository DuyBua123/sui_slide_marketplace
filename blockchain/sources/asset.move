module 0x0::asset {
    use std::string::{String};
    use sui::package;
    use sui::display;
    use sui::transfer;

    // ============ Structs ============
    
    /// OTW for Package Publisher
    public struct ASSET has drop {}

    /// A permanent asset won from the box.
    /// E.g. Sticker, Animation, Video.
    public struct Asset has key, store {
        id: UID,
        name: String,
        asset_type: String, // "Sticker", "Animation", "Video"
        url: String, // walrus URL
        rarity: String, // "Common", "Rare", "Epic", "Legendary"
    }

    /// A discount voucher NFT (20% chance).
    public struct DiscountVoucher has key, store {
        id: UID,
        amount_percent: u64,
    }

    // ============ Accessors ============

    public fun rarity(asset: &Asset): String {
        asset.rarity
    }

    // ============ Init w/ Publisher & Display ============
    
    fun init(otw: ASSET, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        // Setup Display for Asset
        let mut display = display::new_with_fields<Asset>(
            &publisher,
            vector[
                b"name".to_string(),
                b"image_url".to_string(),
                b"description".to_string(),
                b"rarity".to_string(),
            ],
            vector[
                b"{name}".to_string(),
                b"{url}".to_string(),
                b"{asset_type} - {rarity}".to_string(),
                b"{rarity}".to_string(),
            ],
            ctx
        );
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ============ Package-Internal Functions ============

    /// Allow other modules in the same package (lucky_box, fusion_system) to mint assets.
    public(package) fun mint_asset(
        name: String,
        asset_type: String,
        url: String,
        rarity: String,
        ctx: &mut TxContext
    ): Asset {
        Asset {
            id: object::new(ctx),
            name,
            asset_type,
            url,
            rarity
        }
    }

    /// Allow other modules to mint vouchers.
    public(package) fun mint_voucher(
        amount_percent: u64,
        ctx: &mut TxContext
    ): DiscountVoucher {
        DiscountVoucher {
            id: object::new(ctx),
            amount_percent
        }
    }

    /// Allow fusion_system to burn assets.
    public(package) fun burn_asset(asset: Asset) {
        let Asset { id, name: _, asset_type: _, url: _, rarity: _ } = asset;
        object::delete(id);
    }
}
