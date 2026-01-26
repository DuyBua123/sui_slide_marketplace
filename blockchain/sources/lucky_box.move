#[allow(lint(public_random), lint(public_entry))]
module 0x0::lucky_box {
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::event;
    use 0x0::asset; // Import Asset module
    use 0x0::event_token::EVENT_TOKEN; // Import Event Token
    
    use sui::random::{Self, Random};
    use 0x0::game_config::{Self, GameConfig};
    
    use sui::package;
    use sui::display;

    // ============ Errors ============
    const EInsufficientPayment: u64 = 0;

    // ============ Constants ============
    /// Price in Event Token (ET has 0 decimals, so 1 = 1 ET)
    const BOX_PRICE_ET: u64 = 1; // 1 ET per box

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
                b"RaZZHkUAfSKo21Jjrqe00AP73t-sujkvfCKh28ESp4U".to_string(), // Lucky Box Image
                b"A mysterious box containing Tet rewards!".to_string(),
            ],
            ctx
        );
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ============ Functions ============

    /// Buy a Lucky Box for 1 Event Token (ET)
    /// Users earn ET by selling slides to unique buyers.
    public entry fun buy_box(
        payment: &mut Coin<EVENT_TOKEN>,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(payment) >= BOX_PRICE_ET, EInsufficientPayment);

        // Split payment & Send to zero address (effective burn)
        let paid = coin::split(payment, BOX_PRICE_ET, ctx);
        transfer::public_transfer(paid, @0x0); // Transfer to zero address (burn)

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
                string::utf8(b"cuhKgk0O_fZvJZL_cpJDUeM72XC4U4pwqY3UP5_FfDE"),
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
                string::utf8(b"LF0izLZBNlFlE_bKObqX17GVtkfMfbzu9RBPavmkMSU"),
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
                string::utf8(b"LF0izLZBNlFlE_bKObqX17GVtkfMfbzu9RBPavmkMSU"), // Reusing for demo
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
