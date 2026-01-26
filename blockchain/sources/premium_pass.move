module 0x0::premium_pass {
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ===== Errors =====
    const EInsufficientPayment: u64 = 0;
    const ENotOwner: u64 = 1;

    // ===== Constants =====
    const PREMIUM_PRICE: u64 = 1_000_000; // 0.001 SUI

    // ===== Structs =====

    /// Premium Pass - Soulbound token (non-transferable)
    public struct PremiumPass has key {
        id: UID,
        owner: address,
        purchased_at: u64,
        expires_at: u64, // 0 = lifetime access
    }

    /// Admin capability for managing the premium system
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Shared configuration object
    public struct PremiumConfig has key {
        id: UID,
        admin_address: address,
        price: u64,
        total_passes_sold: u64,
    }

    // ===== Events =====

    /// Emitted when a premium pass is purchased
    public struct PassPurchased has copy, drop {
        buyer: address,
        pass_id: ID,
        price: u64,
        timestamp: u64,
    }

    /// Emitted when price is updated
    public struct PriceUpdated has copy, drop {
        old_price: u64,
        new_price: u64,
    }

    // ===== Functions =====

    /// Initialize the module - called once on publish
    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        
        // Transfer admin capability to publisher
        transfer::transfer(AdminCap {
            id: object::new(ctx),
        }, admin);

        // Create shared config object
        transfer::share_object(PremiumConfig {
            id: object::new(ctx),
            admin_address: admin,
            price: PREMIUM_PRICE,
            total_passes_sold: 0,
        });
    }

    /// Purchase a premium pass
    public entry fun buy_premium(
        config: &mut PremiumConfig,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify payment amount
        let amount = coin::value(&payment);
        assert!(amount >= config.price, EInsufficientPayment);

        // Transfer payment to admin
        transfer::public_transfer(payment, config.admin_address);

        // Create premium pass (soulbound)
        let pass = PremiumPass {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            purchased_at: tx_context::epoch(ctx),
            expires_at: 0, // Lifetime
        };

        // Emit purchase event
        event::emit(PassPurchased {
            buyer: tx_context::sender(ctx),
            pass_id: object::uid_to_inner(&pass.id),
            price: amount,
            timestamp: tx_context::epoch(ctx),
        });

        // Increment counter
        config.total_passes_sold = config.total_passes_sold + 1;

        // Transfer pass to buyer (non-transferable, they own it forever)
        transfer::transfer(pass, tx_context::sender(ctx));
    }

    /// Admin function to update price
    public entry fun update_price(
        _: &AdminCap,
        config: &mut PremiumConfig,
        new_price: u64,
    ) {
        event::emit(PriceUpdated {
            old_price: config.price,
            new_price,
        });
        config.price = new_price;
    }

    /// View function: Get current price
    public fun get_price(config: &PremiumConfig): u64 {
        config.price
    }

    /// View function: Get total passes sold
    public fun get_total_sold(config: &PremiumConfig): u64 {
        config.total_passes_sold
    }

    /// View function: Check if pass is valid (not expired)
    public fun is_pass_valid(pass: &PremiumPass, current_epoch: u64): bool {
        pass.expires_at == 0 || current_epoch < pass.expires_at
    }

    /// View function: Get pass owner
    public fun get_owner(pass: &PremiumPass): address {
        pass.owner
    }
}
