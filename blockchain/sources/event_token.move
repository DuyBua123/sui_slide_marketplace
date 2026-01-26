module 0x0::event_token {
    use sui::coin::{Self, TreasuryCap};
    use sui::url;

    /// The OTW (One-Time Witness) for the coin
    public struct EVENT_TOKEN has drop {}

    fun init(witness: EVENT_TOKEN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            0, 
            b"ET", 
            b"EventToken", 
            b"Reward token for unique sales in the Tet Event", 
            option::some(url::new_unsafe_from_bytes(b"https://example.com/et-icon.png")), 
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }

    /// Manager Only: Mint new tokens
    public fun mint(
        treasury_cap: &mut TreasuryCap<EVENT_TOKEN>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }
}
