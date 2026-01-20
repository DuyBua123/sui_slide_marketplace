import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

// TODO: Update with deployed package ID
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to buy a license for a slide
 * @returns {Object} { buyLicense, isLoading, error, txDigest }
 */
export const useBuyLicense = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txDigest, setTxDigest] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    /**
     * Buy a license for a slide
     * @param {Object} params
     * @param {string} params.slideId - Object ID of the SlideObject
     * @param {string} params.marketplaceId - Object ID of the Marketplace
     * @param {number} params.price - License price in MIST
     */
    const buyLicense = async ({ slideId, marketplaceId, price }) => {
        setIsLoading(true);
        setError(null);
        setTxDigest(null);

        try {
            const tx = new Transaction();

            // Split coin for payment
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::buy_license`,
                arguments: [
                    tx.object(marketplaceId),
                    tx.object(slideId),
                    coin,
                ],
            });

            const result = await signAndExecute({
                transaction: tx,
            });

            // Wait for transaction to be confirmed
            await client.waitForTransaction({ digest: result.digest });

            setTxDigest(result.digest);
            return result;
        } catch (err) {
            console.error('Buy license error:', err);
            setError(err.message || 'Failed to buy license');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { buyLicense, isLoading, error, txDigest };
};
