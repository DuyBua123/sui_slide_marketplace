import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

// TODO: Update with deployed package ID
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';
const SLIDE_OBJECT_TYPE = `${PACKAGE_ID}::slide_marketplace::SlideObject`;
const SLIDE_LICENSE_TYPE = `${PACKAGE_ID}::slide_marketplace::SlideLicense`;

/**
 * Hook to fetch owned slides and licenses for the current user
 * @returns {Object} { slides, licenses, isLoading, error, refetch }
 */
export const useOwnedSlides = () => {
    const client = useSuiClient();
    const account = useCurrentAccount();

    const { data: slides, isLoading: slidesLoading, error: slidesError, refetch: refetchSlides } = useQuery({
        queryKey: ['ownedSlides', account?.address],
        queryFn: async () => {
            if (!account?.address) return [];

            const objects = await client.getOwnedObjects({
                owner: account.address,
                filter: {
                    StructType: SLIDE_OBJECT_TYPE,
                },
                options: {
                    showContent: true,
                    showDisplay: true,
                },
            });

            return objects.data.map((obj) => {
                const content = obj.data?.content;
                if (content?.dataType === 'moveObject') {
                    return {
                        id: obj.data?.objectId,
                        ...content.fields,
                    };
                }
                return null;
            }).filter(Boolean);
        },
        enabled: !!account?.address && PACKAGE_ID !== '0x0',
        staleTime: 30000, // 30 seconds
    });

    const { data: licenses, isLoading: licensesLoading, error: licensesError, refetch: refetchLicenses } = useQuery({
        queryKey: ['ownedLicenses', account?.address],
        queryFn: async () => {
            if (!account?.address) return [];

            const objects = await client.getOwnedObjects({
                owner: account.address,
                filter: {
                    StructType: SLIDE_LICENSE_TYPE,
                },
                options: {
                    showContent: true,
                },
            });

            return objects.data.map((obj) => {
                const content = obj.data?.content;
                if (content?.dataType === 'moveObject') {
                    return {
                        id: obj.data?.objectId,
                        ...content.fields,
                    };
                }
                return null;
            }).filter(Boolean);
        },
        enabled: !!account?.address && PACKAGE_ID !== '0x0',
        staleTime: 30000,
    });

    const refetch = () => {
        refetchSlides();
        refetchLicenses();
    };

    return {
        slides: slides || [],
        licenses: licenses || [],
        isLoading: slidesLoading || licensesLoading,
        error: slidesError || licensesError,
        refetch,
    };
};

/**
 * Hook to check if user has access to a specific slide
 * @param {string} slideId - Object ID of the slide
 * @returns {Object} { hasAccess, isOwner, hasLicense, isLoading }
 */
export const useSlideAccess = (slideId) => {
    const { slides, licenses, isLoading } = useOwnedSlides();

    const isOwner = slides.some((s) => s.id === slideId);
    const hasLicense = licenses.some((l) => l.slide_id === slideId);
    const hasAccess = isOwner || hasLicense;

    return {
        hasAccess,
        isOwner,
        hasLicense,
        isLoading,
    };
};
