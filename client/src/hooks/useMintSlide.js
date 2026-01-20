import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

// TODO: Update with deployed package ID
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to mint a new slide as a SUI Object (NFT)
 * @returns {Object} { mintSlide, isLoading, error, txDigest }
 */
export const useMintSlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txDigest, setTxDigest] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    /**
     * Mint a new slide on the blockchain
     * @param {Object} params
     * @param {string} params.title - Slide title
     * @param {string} params.contentUrl - IPFS URL to slide JSON data
     * @param {string} params.thumbnailUrl - URL to thumbnail image
     * @param {number} params.price - License price in MIST (1 SUI = 1e9 MIST)
     */
    const mintSlide = async ({ title, contentUrl, thumbnailUrl, price }) => {
        setIsLoading(true);
        setError(null);
        setTxDigest(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::mint_slide`,
                arguments: [
                    tx.pure.string(title),
                    tx.pure.string(contentUrl),
                    tx.pure.string(thumbnailUrl),
                    tx.pure.u64(price),
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
            console.error('Mint slide error:', err);
            setError(err.message || 'Failed to mint slide');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mintSlide, isLoading, error, txDigest };
};
