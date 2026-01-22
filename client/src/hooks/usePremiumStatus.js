import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

// Replace with your deployed package ID
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x...';

/**
 * Hook to check if current user has Premium Pass
 * @returns {{isPremium: boolean, loading: boolean, refetch: Function}}
 */
export const usePremiumStatus = () => {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkPremiumStatus = async () => {
        if (!account?.address) {
            setIsPremium(false);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Query for PremiumPass objects owned by user
            const { data } = await suiClient.getOwnedObjects({
                owner: account.address,
                filter: {
                    StructType: `${PACKAGE_ID}::premium_pass::PremiumPass`
                },
                options: {
                    showContent: true,
                    showOwner: true,
                },
            });

            // User is premium if they own at least one PremiumPass
            setIsPremium(data.length > 0);

        } catch (error) {
            console.error('Failed to check premium status:', error);
            setIsPremium(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkPremiumStatus();
    }, [account?.address]);

    return {
        isPremium,
        loading,
        refetch: checkPremiumStatus,
    };
};
