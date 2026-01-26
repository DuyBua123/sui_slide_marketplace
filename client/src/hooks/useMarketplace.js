import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState, useEffect, useCallback } from 'react';
import { isSlideDeleted } from '../utils/deletedSlidesTracker';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to fetch marketplace slides using events
 */
export const useMarketplaceSlides = () => {
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const account = useCurrentAccount();
    const client = useSuiClient();

    const fetchMarketplaceSlides = useCallback(async (isRefetch = false) => {
        if (!isRefetch) setIsLoading(true);
        setError(null);

        try {
            if (!client || PACKAGE_ID === '0x0') {
                throw new Error(
                    'Package ID not configured. Please set VITE_PACKAGE_ID in environment variables.'
                );
            }

            console.log('[MARKETPLACE] Fetching slides from package:', PACKAGE_ID);
            const slideMap = new Map();

            // 1. Fetch user's licenses if logged in
            const userLicenses = new Set();
            if (account?.address) {
                try {
                    const ownedObjects = await client.getOwnedObjects({
                        owner: account.address,
                        options: { showContent: true, showType: true },
                    });

                    if (ownedObjects?.data) {
                        for (const obj of ownedObjects.data) {
                            const type = obj.data?.type || '';
                            if (type.includes('SlideLicense')) {
                                const fields = obj.data?.content?.fields || obj.data?.content?.data?.fields;
                                const slideId = fields?.slide_id;
                                if (slideId) {
                                    // Normalize ID (remove 0x, lowercase)
                                    userLicenses.add(slideId.replace('0x', '').toLowerCase());
                                }
                            }
                        }
                    }
                    console.log(`[MARKETPLACE] Found ${userLicenses.size} licenses for user`);
                } catch (e) {
                    console.warn('[MARKETPLACE] Failed to fetch user licenses:', e);
                }
            }

            // 2. Fetch SlideMinted events
            try {
                const mintedEventsResponse = await client.queryEvents({
                    query: {
                        MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideMinted`,
                    },
                    limit: 100,
                    order: 'descending',
                });

                if (mintedEventsResponse?.data) {
                    for (const eventData of mintedEventsResponse.data) {
                        const slideId = eventData.parsedJson?.slide_id;
                        if (slideId && !slideMap.has(slideId)) {
                            // Normalize slideId for set check
                            const normSlideId = slideId.replace('0x', '').toLowerCase();

                            // Skip if user already has a license for this slide
                            if (userLicenses.has(normSlideId)) {
                                console.log(`[MARKETPLACE] Skipping slide ${slideId} (user has license)`);
                                continue;
                            }

                            try {
                                const obj = await client.getObject({
                                    id: slideId,
                                    options: { showContent: true },
                                });

                                if (obj.data?.content?.dataType === 'moveObject') {
                                    const fields = obj.data.content.fields;

                                    // Skip if user is the owner (normalize addresses)
                                    const ownerAddr = fields.owner?.replace('0x', '').toLowerCase();
                                    const userAddr = account?.address?.replace('0x', '').toLowerCase();

                                    if (userAddr && ownerAddr === userAddr) {
                                        console.log(`[MARKETPLACE] Skipping slide ${slideId} (user is owner)`);
                                        continue;
                                    }

                                    // A slide is visible in marketplace if it's listed for license OR for sale
                                    if ((fields.is_listed || fields.is_for_sale) && !isSlideDeleted(slideId)) {
                                        slideMap.set(slideId, {
                                            id: slideId,
                                            title: fields.title || 'Untitled Slide',
                                            price: fields.monthly_price || 0, // Fallback for legacy code
                                            monthlyPrice: fields.monthly_price || 0,
                                            yearlyPrice: fields.yearly_price || 0,
                                            lifetimePrice: fields.lifetime_price || 0,
                                            salePrice: fields.sale_price || 0,
                                            isListed: fields.is_listed,
                                            isForSale: fields.is_for_sale,
                                            owner: fields.owner,
                                            author: fields.owner,
                                            contentUrl: fields.content_url,
                                            thumbnail: fields.thumbnail_url,
                                            type: fields.is_for_sale ? 'listing' : 'slideObject',
                                            source: 'blockchain'
                                        });
                                    }
                                }
                            } catch (e) {
                                console.warn(`[MARKETPLACE] Failed to fetch object ${slideId}:`, e);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('[MARKETPLACE] Fetch events failed:', e.message);
                throw e;
            }

            const results = Array.from(slideMap.values());
            console.log(`[MARKETPLACE] Total interactive slides found: ${results.length}`);
            setSlides(results);
        } catch (err) {
            console.warn('[MARKETPLACE] Fetch failed, falling back to local storage:', err.message);
            setError(`Sync failed: ${err.message}. Showing local slides.`);

            const userAddr = account?.address?.replace('0x', '').toLowerCase();
            const mockSlides = JSON.parse(localStorage.getItem('slides') || '[]');

            // Filter local slides if possible
            const filteredLocal = mockSlides
                .map(s => ({ ...s, source: 'local' }))
                .filter(s => {
                    const ownerAddr = s.owner?.replace('0x', '').toLowerCase();
                    return !userAddr || ownerAddr !== userAddr;
                });

            setSlides(filteredLocal);
        } finally {
            setIsLoading(false);
        }
    }, [client, account?.address]);

    useEffect(() => {
        if (client) {
            fetchMarketplaceSlides();
        }
    }, [client, fetchMarketplaceSlides, account?.address]);

    const refetch = () => fetchMarketplaceSlides(true);

    return { slides, isLoading, error, refetch };
};

/**
 * Hook to sell a slide (enable full ownership transfer)
 */
export const useListSlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const listSlide = async ({ slideId, price, isForSale = true, monthlyPrice = 0, yearlyPrice = 0, lifetimePrice = 0, isListed = true }) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::set_listing_status`,
                arguments: [
                    tx.object(slideId),
                    tx.pure.u64(monthlyPrice),
                    tx.pure.u64(yearlyPrice),
                    tx.pure.u64(lifetimePrice),
                    tx.pure.bool(isListed),
                    tx.pure.u64(price),
                    tx.pure.bool(isForSale),
                ],
            });

            const result = await signAndExecute({ transaction: tx });
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { listSlide, updateListing: listSlide, isLoading, error };
};

const EVENT_TRACKER_ID = import.meta.env.VITE_EVENT_TRACKER_ID || '0x0';

/**
 * Hook to buy full ownership of a slide
 */
export const useBuySlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const client = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const buySlide = async ({ slideId, price }) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::buy_ownership`,
                arguments: [
                    tx.object(slideId),
                    tx.object(EVENT_TRACKER_ID),
                    coin,
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

    return { buySlide, isLoading, error };
};

/**
 * Hook to delist a slide (stop full ownership sale)
 */
export const useDelistSlide = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const delistSlide = async ({ slideId, currentLicensePrice, currentIsListed }) => {
        setIsLoading(true);
        setError(null);

        try {
            const tx = new Transaction();

            // Stop full ownership sale but keep license settings
            tx.moveCall({
                target: `${PACKAGE_ID}::slide_marketplace::set_listing_status`,
                arguments: [
                    tx.object(slideId),
                    tx.pure.u64(currentLicensePrice || 0), // monthly
                    tx.pure.u64(0), // yearly
                    tx.pure.u64(0), // lifetime
                    tx.pure.bool(currentIsListed || false),
                    tx.pure.u64(0), // sale_price
                    tx.pure.bool(false), // is_for_sale
                ],
            });

            const result = await signAndExecute({ transaction: tx });
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
