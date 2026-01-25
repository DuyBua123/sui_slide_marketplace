import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to purchase full ownership of a slide asset
 * @returns {Object} { buyOwnership, isLoading, error }
 */
export const useBuyOwnership = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    /**
     * Buy full ownership of a slide
     * @param {Object} slide - The SlideObject metadata (must contain id and sale_price)
     */
    const buyOwnership = async (slide) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            // Split coins for payment
            const [coin] = tx.splitCoins(tx.gas, [slide.sale_price]);

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::buy_ownership`,
                arguments: [
                    tx.object(slide.id),
                    coin,
                ],
            });

            const result = await signAndExecute({
                transaction: tx,
            });

            await client.waitForTransaction({ digest: result.digest });
            return result;
        } catch (err) {
            console.error('Buy ownership error:', err);
            setError(err.message || 'Failed to purchase ownership');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { buyOwnership, isLoading, error };
};
