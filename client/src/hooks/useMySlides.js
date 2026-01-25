import { useEffect, useState, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { isSlideDeleted } from '../utils/deletedSlidesTracker';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

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
            const userAddr = account.address.replace('0x', '').toLowerCase();

            // 1. Fetch Shared SlideObjects by querying SlideMinted events
            // We fetch all minted slides and filter by current ownership field
            console.log('[BLOCKCHAIN] Querying SlideMinted events for ownership check');
            const mintedEvents = await client.queryEvents({
                query: {
                    MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideMinted`,
                },
                limit: 100,
                order: 'descending',
            });

            const slideOwnershipMap = new Map();
            if (mintedEvents?.data) {
                for (const event of mintedEvents.data) {
                    const slideId = event.parsedJson?.slide_id;
                    if (slideId && !slideOwnershipMap.has(slideId)) {
                        try {
                            const obj = await client.getObject({
                                id: slideId,
                                options: { showContent: true },
                            });

                            if (obj.data?.content?.dataType === 'moveObject') {
                                const fields = obj.data.content.fields;
                                const owner = fields.owner?.replace('0x', '').toLowerCase();

                                if (owner === userAddr && !isSlideDeleted(slideId)) {
                                    slideOwnershipMap.set(slideId, {
                                        id: slideId,
                                        objectId: slideId,
                                        title: fields.title || 'Untitled Slide',
                                        contentUrl: fields.content_url || '',
                                        thumbnail: fields.thumbnail_url || '',
                                        price: fields.monthly_price || 0,
                                        monthlyPrice: fields.monthly_price || 0,
                                        yearlyPrice: fields.yearly_price || 0,
                                        lifetimePrice: fields.lifetime_price || 0,
                                        isListed: fields.is_listed || false,
                                        owner: fields.owner,
                                        isOwner: true,
                                        createdAt: new Date().toISOString(),
                                        source: 'blockchain',
                                        suiObjectId: slideId
                                    });
                                }
                            }
                        } catch (e) {
                            console.warn(`[BLOCKCHAIN] Failed to check ownership for slide ${slideId}:`, e);
                        }
                    }
                }
            }

            // 2. Fetch Owned SlideLicenses
            console.log('[BLOCKCHAIN] Querying owned licenses');
            const response = await client.getOwnedObjects({
                owner: account.address,
                options: {
                    showContent: true,
                    showType: true,
                },
            });

            const parsedLicensedSlides = [];
            if (response.data) {
                for (const obj of response.data) {
                    const type = obj.data?.type || '';
                    const isDeleted = isSlideDeleted(obj.data.objectId);
                    if (isDeleted) continue;

                    if (type.includes('SlideLicense')) {
                        const fields = obj.data?.content?.fields || obj.data?.content?.data?.fields;
                        const slideId = fields?.slide_id;

                        if (slideId && !slideOwnershipMap.has(slideId)) {
                            try {
                                const slideObj = await client.getObject({
                                    id: slideId,
                                    options: { showContent: true },
                                });

                                if (slideObj.data?.content?.fields) {
                                    const sFields = slideObj.data.content.fields;
                                    const now = Date.now();
                                    const expiresAt = Number(fields.expires_at || 0);
                                    const isExpired = expiresAt !== 0 && now > expiresAt;
                                    const remainingMs = expiresAt === 0 ? Infinity : expiresAt - now;
                                    const remainingDays = expiresAt === 0 ? Infinity : Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

                                    parsedLicensedSlides.push({
                                        id: slideId,
                                        licenseId: obj.data.objectId,
                                        objectId: slideId,
                                        title: sFields.title || fields.slide_title || 'Untitled Slide',
                                        contentUrl: sFields.content_url || '',
                                        thumbnail: sFields.thumbnail_url || '',
                                        price: sFields.monthly_price || 0,
                                        owner: sFields.owner,
                                        isOwner: false,
                                        isLicensed: true,
                                        isExpired,
                                        remainingDays: remainingDays === Infinity ? '∞' : remainingDays,
                                        issuedAt: fields.issued_at,
                                        expiresAt: fields.expires_at,
                                        durationType: fields.duration_type,
                                        createdAt: new Date().toISOString(),
                                        source: 'blockchain'
                                    });
                                }
                            } catch (e) {
                                console.warn(`[BLOCKCHAIN] Failed to fetch licensed slide ${slideId}:`, e);
                            }
                        }
                    }
                }
            }

            const ownedSlides = Array.from(slideOwnershipMap.values());
            const allSlides = [...ownedSlides, ...parsedLicensedSlides];

            console.log(`[BLOCKCHAIN] Total assets: ${allSlides.length} (${ownedSlides.length} owned, ${parsedLicensedSlides.length} licensed)`);
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
