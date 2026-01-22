import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

// TODO: Update with deployed package ID
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to update an existing slide's content on the blockchain
 * @returns {Object} { updateSlide, isLoading, error, txDigest }
 */
export const useUpdateSlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txDigest, setTxDigest] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    /**
     * Update an existing slide on the blockchain
     * @param {Object} params
     * @param {Object} params.slideObject - The slide object to update
     * @param {string} params.title - New title for the slide
     * @param {string} params.contentUrl - New IPFS URL to slide JSON data
     * @param {string} params.thumbnailUrl - New URL to thumbnail image
     */
    const updateSlide = async ({ slideObject, title, contentUrl, thumbnailUrl }) => {
        setIsLoading(true);
        setError(null);
        setTxDigest(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::update_slide`,
                arguments: [
                    tx.object(slideObject.id || slideObject),
                    tx.pure.string(title),
                    tx.pure.string(contentUrl),
                    tx.pure.string(thumbnailUrl),
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
            console.error('Update slide error:', err);
            setError(err.message || 'Failed to update slide');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateSlide, isLoading, error, txDigest };
};

export default useUpdateSlide;
