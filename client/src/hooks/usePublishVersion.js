import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to publish a new version of a slide asset
 * @returns {Object} { publishVersion, isLoading, error }
 */
export const usePublishVersion = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    /**
     * Publish current slide draft as a new marketplace version
     * @param {string} slideObjectId - The ID of the SlideObject
     */
    const publishVersion = async (slideObjectId) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::publish_version`,
                arguments: [
                    tx.object(slideObjectId),
                    tx.object('0x6'), // SUI Clock object
                ],
            });

            const result = await signAndExecute({
                transaction: tx,
            });

            await client.waitForTransaction({ digest: result.digest });
            return result;
        } catch (err) {
            console.error('Publish version error:', err);
            setError(err.message || 'Failed to publish version');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { publishVersion, isLoading, error };
};
