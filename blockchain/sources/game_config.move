module 0x0::game_config {
    use std::vector;
    use sui::event;

    // ============ Errors ============
    const ENotAuthorized: u64 = 0;
    const EInvalidProbabilities: u64 = 1;

    // ============ Structs ============

    /// Shared Object holding game configuration.
    /// Admin can update this to change box price, probabilities, etc.
    public struct GameConfig has key {
        id: UID,
        admin: address,
        
        // Lucky Box Config
        box_price: u64,
        
        // Probabilities (Total must be 100)
        // 0: Miss
        // 1: Voucher
        // 2: Rare (Sticker)
        // 3: Epic (Animation)
        // 4: Legendary (Video)
        probs: vector<u8>, 
    }

    /// Admin Cap for Game Config (if we want separate admin from package publisher)
    public struct ConfigAdminCap has key, store {
        id: UID,
    }

    // ============ Events ============
    public struct ConfigUpdated has copy, drop {
        admin: address,
        new_price: u64,
        new_probs: vector<u8>,
    }

    // ============ Functions ============

    fun init(ctx: &mut TxContext) {
        let admin = ctx.sender();
        
        // Default Config
        // 50% Miss, 20% Voucher, 10% Rare, 10% Epic, 10% Legendary
        let probs = vector[50, 20, 10, 10, 10]; 

        let config = GameConfig {
            id: object::new(ctx),
            admin,
            box_price: 50_000_000, // 0.05 SUI
            probs,
        };
        
        transfer::share_object(config);
        transfer::transfer(ConfigAdminCap { id: object::new(ctx) }, admin);
    }

    /// Update configuration. Only Admin can call.
    public entry fun update_config(
        _: &ConfigAdminCap,
        config: &mut GameConfig,
        new_price: u64,
        new_probs: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Validate probabilities sum to 100
        let mut sum = 0u64;
        let mut i = 0;
        let len = vector::length(&new_probs);
        while (i < len) {
            sum = sum + (*vector::borrow(&new_probs, i) as u64);
            i = i + 1;
        };
        assert!(sum == 100, EInvalidProbabilities);

        config.box_price = new_price;
        config.probs = new_probs;

        event::emit(ConfigUpdated {
            admin: ctx.sender(),
            new_price,
            new_probs
        });
    }

    // ============ Accessors (Read-Only) ============

    public fun box_price(config: &GameConfig): u64 {
        config.box_price
    }

    public fun get_probability(config: &GameConfig, index: u64): u8 {
        *vector::borrow(&config.probs, index)
    }
}
