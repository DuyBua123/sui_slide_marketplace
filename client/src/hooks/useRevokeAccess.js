import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to revoke a buyer's access to a slide
 * @returns {Object} { revokeAccess, isLoading, error }
 */
export const useRevokeAccess = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    /**
     * Revoke access for a specific address
     * @param {string} slideObjectId - The ID of the SlideObject
     * @param {string} targetAddress - The SUI address to block
     */
    const revokeAccess = async (slideObjectId, targetAddress) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::revoke_access`,
                arguments: [
                    tx.object(slideObjectId),
                    tx.pure.address(targetAddress),
                ],
            });

            const result = await signAndExecute({
                transaction: tx,
            });

            await client.waitForTransaction({ digest: result.digest });
            return result;
        } catch (err) {
            console.error('Revoke access error:', err);
            setError(err.message || 'Failed to revoke access');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { revokeAccess, isLoading, error };
};
