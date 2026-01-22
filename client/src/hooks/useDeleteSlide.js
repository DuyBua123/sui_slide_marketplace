import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

/**
 * Hook to delete a slide from blockchain
 * @returns {Object} { deleteSlide, isLoading, error }
 */
export const useDeleteSlide = () => {
    const { mutate: signAndExecute, isPending: isLoading } = useSignAndExecuteTransaction();

    const deleteSlide = async ({ slideObjectId, onSuccess, onError }) => {
        try {
            console.log('[DELETE] Starting delete slide transaction for:', slideObjectId);

            const tx = new Transaction();

            // Call the delete_slide function
            const packageId = import.meta.env.VITE_PACKAGE_ID;
            if (!packageId) {
                throw new Error('VITE_PACKAGE_ID not configured in environment');
            }

            console.log('[DELETE] Package ID:', packageId);
            console.log('[DELETE] Slide Object ID:', slideObjectId);

            // Pass the SlideObject as an object argument (not pure)
            tx.moveCall({
                target: `${packageId}::slide_marketplace::delete_slide`,
                arguments: [
                    tx.object(slideObjectId),  // Pass as object reference
                ],
            });

            console.log('[DELETE] Transaction created, executing...');
            console.log('[DELETE] Transaction bytes:', tx);

            signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log('[DELETE] Delete transaction successful:', result);
                        if (onSuccess) {
                            onSuccess(result);
                        }
                    },
                    onError: (error) => {
                        console.error('[DELETE] Delete transaction failed:', error);
                        console.error('[DELETE] Full error:', JSON.stringify(error, null, 2));
                        if (onError) {
                            onError(error);
                        }
                    },
                }
            );
        } catch (err) {
            console.error('[DELETE] Error preparing delete transaction:', err);
            console.error('[DELETE] Error stack:', err.stack);
            if (onError) {
                onError(err);
            }
        }
    };

    return {
        deleteSlide,
        isLoading,
    };
};
