import { useEffect, useState, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { isSlideDeleted } from '../utils/deletedSlidesTracker';

/**
 * Hook to fetch user's slides from blockchain
 * @returns {Object} { slides, isLoading, error, refetch }
 */
export const useMySlides = () => {
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const account = useCurrentAccount();
    const client = useSuiClient();

    const fetchMySlides = useCallback(async () => {
        if (!account?.address) {
            console.log('[BLOCKCHAIN] No account connected');
            setSlides([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('[BLOCKCHAIN] Fetching assets for account:', account.address);

            // 1. Fetch ALL objects owned by the user
            const response = await client.getOwnedObjects({
                owner: account.address,
                options: {
                    showContent: true,
                    showType: true,
                },
            });

            if (!response.data) {
                setSlides([]);
                setIsLoading(false);
                return;
            }

            const ownedSlides = [];
            const licenses = [];

            // 2. Sort objects into slides and licenses
            for (const obj of response.data) {
                const type = obj.data?.type || '';
                const isDeleted = isSlideDeleted(obj.data.objectId);
                if (isDeleted) continue;

                if (type.includes('SlideObject')) {
                    ownedSlides.push(obj);
                } else if (type.includes('SlideLicense')) {
                    licenses.push(obj);
                }
            }

            console.log(`[BLOCKCHAIN] Found ${ownedSlides.length} owned slides and ${licenses.length} licenses`);

            // 3. Parse owned slides
            const parsedOwnedSlides = ownedSlides.map((obj) => {
                const fields = obj.data?.content?.fields;
                return {
                    id: obj.data.objectId,
                    objectId: obj.data.objectId,
                    title: fields.title || 'Untitled Slide',
                    contentUrl: fields.content_url || '',
                    thumbnailUrl: fields.thumbnail_url || '',
                    price: fields.price || 0,
                    isListed: fields.is_listed || false,
                    owner: account.address,
                    isOwner: true,
                    createdAt: new Date().toISOString(),
                    source: 'blockchain',
                    suiObjectId: obj.data.objectId // Ensure this exists for deletion logic
                };
            });

            // 4. Resolve licenses to SlideObjects
            const parsedLicensedSlides = [];
            for (const license of licenses) {
                const fields = license.data?.content?.fields;
                const slideId = fields?.slide_id;
                if (!slideId) continue;

                try {
                    const slideObj = await client.getObject({
                        id: slideId,
                        options: { showContent: true },
                    });

                    if (slideObj.data?.content?.fields) {
                        const sFields = slideObj.data.content.fields;
                        parsedLicensedSlides.push({
                            id: slideId, // Use original slide ID for navigation
                            licenseId: license.data.objectId,
                            objectId: slideId,
                            title: sFields.title || fields.slide_title || 'Untitled Slide',
                            contentUrl: sFields.content_url || '',
                            thumbnailUrl: sFields.thumbnail_url || '',
                            price: sFields.price || 0,
                            owner: sFields.owner,
                            isOwner: false, // User only has a license
                            isLicensed: true,
                            createdAt: new Date().toISOString(),
                            source: 'blockchain'
                        });
                    }
                } catch (e) {
                    console.warn(`[BLOCKCHAIN] Failed to fetch licensed slide ${slideId}:`, e);
                }
            }

            const allSlides = [...parsedOwnedSlides, ...parsedLicensedSlides];
            console.log('[BLOCKCHAIN] Total assets parsed:', allSlides.length);
            setSlides(allSlides);
        } catch (err) {
            console.error('[BLOCKCHAIN] Error fetching assets:', err);
            setError(err.message || 'Failed to fetch assets from blockchain');
            setSlides([]);
        } finally {
            setIsLoading(false);
        }
    }, [account?.address, client]);

    useEffect(() => {
        fetchMySlides();
    }, [fetchMySlides]);

    const refetch = () => {
        fetchMySlides();
    };

    return { slides, isLoading, error, refetch };
};

export default useMySlides;
