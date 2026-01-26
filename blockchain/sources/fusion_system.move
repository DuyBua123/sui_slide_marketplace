#[allow(lint(public_random), lint(public_entry))]
module 0x0::fusion_system {
    use std::vector;
    use std::string::{Self, String};
    use sui::event;
    use 0x0::asset::{Self, Asset};
    use sui::random::{Self, Random};

    // ============ Errors ============
    const EFusionInvalidCount: u64 = 1;
    const EFusionInvalidRarity: u64 = 2;

    // ============ Events ============
    public struct FusionResult has copy, drop {
        user: address,
        success: bool,
        message: String,
    }

    // ============ Functions ============

    /// Craft an Epic Asset by fusing 5 Rare Assets.
    public entry fun craft_epic_asset(
        mut assets: vector<Asset>,
        r: &Random,
        ctx: &mut TxContext
    ) {
        assert!(vector::length(&assets) == 5, EFusionInvalidCount);

        // Burn all input assets
        while (!vector::is_empty(&assets)) {
            let asset = vector::pop_back(&mut assets);
            // Verify it is Rare
            assert!(asset::rarity(&asset) == string::utf8(b"Rare"), EFusionInvalidRarity);
            // Internal package helper to burn
            asset::burn_asset(asset);
        };
        vector::destroy_empty(assets);

        // Calculate Success (50%) - True Random
        let mut generator = random::new_generator(r, ctx);
        let rng = random::generate_u8_in_range(&mut generator, 0, 99); // 0-99

        let success = rng < 50;
        let sender = ctx.sender();

        if (success) {
            // Mint Epic Asset
            let asset = asset::mint_asset(
                string::utf8(b"Fireworks Loop"),
                string::utf8(b"Animation"),
                string::utf8(b"ipfs://tet-fireworks-anim"),
                string::utf8(b"Epic"),
                ctx
            );
            transfer::public_transfer(asset, sender);

            event::emit(FusionResult {
                user: sender,
                success: true,
                message: string::utf8(b"Fusion Successful! Received Epic Animation."),
            });
        } else {
            // Failed
            event::emit(FusionResult {
                user: sender,
                success: false,
                message: string::utf8(b"Fusion Failed. Assets Lost."),
            });
        };
    }
}
