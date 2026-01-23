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
     * @param {number} params.price - License price in MIST
     */
    const buyLicense = async ({ slideId, price }) => {
        setIsLoading(true);
        setError(null);
        setTxDigest(null);

        try {
            if (!PACKAGE_ID || PACKAGE_ID === '0x0') {
                throw new Error('Package ID not configured. Please set VITE_PACKAGE_ID in your .env file.');
            }

            console.log(`[BUY_LICENSE] Purchasing license for slide: ${slideId} at price: ${price} MIST`);
            const tx = new Transaction();

            // Split coin for payment
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::buy_license`,
                arguments: [
                    tx.object(slideId),
                    coin,
                ],
            });

            const result = await signAndExecute({
                transaction: tx,
            });

            // Wait for transaction to be confirmed
            console.log(`[BUY_LICENSE] Transaction submitted: ${result.digest}. Waiting for confirmation...`);
            await client.waitForTransaction({ digest: result.digest });

            setTxDigest(result.digest);
            return result;
        } catch (err) {
            console.error('[BUY_LICENSE] Error:', err);
            setError(err.message || 'Failed to buy license');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { buyLicense, isLoading, error, txDigest };
};
