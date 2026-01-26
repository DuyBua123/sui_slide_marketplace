#[allow(lint(public_random), lint(public_entry))]
module 0x0::lucky_box {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use 0x0::asset; // Import Asset module
    
    use sui::random::{Self, Random};
    use 0x0::game_config::{Self, GameConfig};
    
    use sui::package;
    use sui::display;

    // ============ Errors ============
    const EInsufficientPayment: u64 = 0;

    // ============ Constants ============
    const BOX_PRICE: u64 = 50_000_000; // 0.05 SUI

    // ============ Structs ============

    /// OTW for Package Publisher
    public struct LUCKY_BOX has drop {}

    /// The Lucky Box Asset.
    public struct LuckyBox has key, store {
        id: UID,
    }

    // ============ Events ============

    public struct BoxOpened has copy, drop {
        opener: address,
        outcome: String, // "Miss", "Voucher", "Sticker", "Animation", "Video"
    }
    
    // ============ Init ============
    
    fun init(otw: LUCKY_BOX, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        let mut display = display::new_with_fields<LuckyBox>(
            &publisher,
            vector[
                b"name".to_string(),
                b"image_url".to_string(),
                b"description".to_string(),
            ],
            vector[
                b"Tet Lucky Box".to_string(),
                b"ipfs://tet-lucky-box-closed".to_string(),
                b"A mysterious box containing Tet rewards!".to_string(),
            ],
            ctx
        );
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ============ Functions ============

    /// Buy a Lucky Box for 0.05 SUI
    public entry fun buy_box(
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(payment) >= BOX_PRICE, EInsufficientPayment);

        // Split payment & Burn
        let paid = coin::split(payment, BOX_PRICE, ctx);
        transfer::public_transfer(paid, @0x0); // Burn address

        let box = LuckyBox {
            id: object::new(ctx)
        };
        transfer::public_transfer(box, ctx.sender());
    }

    /// Open individual box using True Randomness (VRF)
    public entry fun open_box(
        box: LuckyBox,
        r: &Random,
        config: &GameConfig,
        ctx: &mut TxContext
    ) {
        let LuckyBox { id } = box;
        object::delete(id); // Burn the box

        let sender = ctx.sender();
        
        // secure randomness
        let mut generator = random::new_generator(r, ctx);
        let rng = random::generate_u8_in_range(&mut generator, 0, 99); // 0-99

        // Dynamic Probabilities from Config
        let p_miss = game_config::get_probability(config, 0);
        let p_voucher = game_config::get_probability(config, 1);
        let p_rare = game_config::get_probability(config, 2);
        let p_epic = game_config::get_probability(config, 3);
        
        let miss_threshold = p_miss;
        let voucher_threshold = miss_threshold + p_voucher;
        let rare_threshold = voucher_threshold + p_rare;
        let epic_threshold = rare_threshold + p_epic;

        let outcome_str;

        if (rng < miss_threshold) {
             // Miss
            outcome_str = string::utf8(b"Good Luck Next Time");
        } else if (rng < voucher_threshold) {
             // Voucher
            let voucher = asset::mint_voucher(10, ctx);
            transfer::public_transfer(voucher, sender);
            outcome_str = string::utf8(b"Discount Voucher");
        } else if (rng < rare_threshold) {
             // Rare
            let asset = asset::mint_asset(
                string::utf8(b"Golden Dragon Sticker"),
                string::utf8(b"Sticker"),
                string::utf8(b"ipfs://tet-dragon-sticker"),
                string::utf8(b"Rare"),
                ctx
            );
            transfer::public_transfer(asset, sender);
            outcome_str = string::utf8(b"Golden Dragon Sticker (Rare)");
        } else if (rng < epic_threshold) {
             // Epic
             let asset = asset::mint_asset(
                string::utf8(b"Fireworks Loop"),
                string::utf8(b"Animation"),
                string::utf8(b"ipfs://tet-fireworks-anim"),
                string::utf8(b"Epic"),
                ctx
            );
            transfer::public_transfer(asset, sender);
            outcome_str = string::utf8(b"Fireworks Loop (Epic)");
        } else {
             // Legendary
            let asset = asset::mint_asset(
                string::utf8(b"Happy New Year Intro"),
                string::utf8(b"Video"),
                string::utf8(b"ipfs://tet-intro-video"),
                string::utf8(b"Legendary"),
                ctx
            );
            transfer::public_transfer(asset, sender);
            outcome_str = string::utf8(b"Happy New Year Intro (Legendary)");
        };

        event::emit(BoxOpened {
            opener: sender,
            outcome: outcome_str,
        });
    }
}
