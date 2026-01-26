module 0x0::utils {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // ============ Math Utils ============

    /// Safe subtraction that returns 0 instead of aborting on underflow
    public fun safe_sub(a: u64, b: u64): u64 {
        if (b > a) 0 else a - b
    }

    /// Calculate percentage (e.g. 50% = 50) of an amount.
    /// Result is floored.
    public fun percent_of(amount: u64, percent: u64): u64 {
        (amount * percent) / 100
    }

    /// Return the smaller of two numbers
    public fun min(a: u64, b: u64): u64 {
        if (a < b) a else b
    }

    /// Return the larger of two numbers
    public fun max(a: u64, b: u64): u64 {
        if (a > b) a else b
    }

    // ============ Validation/Payment Utils ============

    /// Check if payment is sufficient, split the exact required amount, and return it.
    /// The remainder stays in the `payment` mutable reference.
    /// Aborts with `error_code` if insufficient.
    public fun handle_payment(
        payment: &mut Coin<SUI>,
        required: u64,
        error_code: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        assert!(coin::value(payment) >= required, error_code);
        coin::split(payment, required, ctx)
    }
}
