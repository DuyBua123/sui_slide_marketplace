import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to list a slide for sale (full ownership transfer)
 */
export const useListSlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txDigest, setTxDigest] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const listSlide = async ({ slideId, price }) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::list_slide`,
                arguments: [
                    tx.object(slideId),
                    tx.pure.u64(price),
                ],
            });

            const result = await signAndExecute({ transaction: tx });
            await client.waitForTransaction({ digest: result.digest });

            setTxDigest(result.digest);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { listSlide, isLoading, error, txDigest };
};

/**
 * Hook to buy a listed slide (full ownership transfer)
 */
export const useBuySlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txDigest, setTxDigest] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const buySlide = async ({ listingId, price }) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::buy_slide`,
                arguments: [
                    tx.object(listingId),
                    coin,
                ],
            });

            const result = await signAndExecute({ transaction: tx });
            await client.waitForTransaction({ digest: result.digest });

            setTxDigest(result.digest);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { buySlide, isLoading, error, txDigest };
};

/**
 * Hook to delist a slide (cancel sale)
 */
export const useDelistSlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const delistSlide = async ({ listingId }) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::delist_slide`,
                arguments: [
                    tx.object(listingId),
                ],
            });

            const result = await signAndExecute({ transaction: tx });
            await client.waitForTransaction({ digest: result.digest });

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { delistSlide, isLoading, error };
};
