import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState, useEffect, useCallback } from 'react';
import { isSlideDeleted } from '../utils/deletedSlidesTracker';

const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';

/**
 * Hook to fetch marketplace slides using events
 * Listens to SlideMinted and SlideListed events to get available slides
 */
export const useMarketplaceSlides = () => {
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

            const slideMap = new Map();

            // 1. Fetch Minted Slides (for Licensing)
            try {
                const mintedEventsResponse = await client.queryEvents({
                    query: {
                        MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideMinted`,
                    },
                    limit: 50,
                    order: 'descending',
                });

                if (mintedEventsResponse?.data) {
                    for (const eventData of mintedEventsResponse.data) {
                        const slideId = eventData.parsedJson?.slide_id;
                        if (slideId && !slideMap.has(slideId)) {
                            try {
                                const obj = await client.getObject({
                                    id: slideId,
                                    options: { showContent: true },
                                });

                                if (obj.data?.content?.dataType === 'moveObject') {
                                    const fields = obj.data.content.fields;
                                    if (fields.is_listed && !isSlideDeleted(slideId)) {
                                        slideMap.set(slideId, {
                                            id: slideId,
                                            title: fields.title || 'Untitled Slide',
                                            price: fields.price || 0,
                                            owner: fields.creator,
                                            author: fields.creator,
                                            contentUrl: fields.content_url,
                                            thumbnail: fields.thumbnail_url,
                                            creator: fields.creator,
                                            isListed: true,
                                            type: 'slideObject',
                                        });
                                    }
                                }
                            } catch { /* ignore deleted objects */ }
                        }
                    }
                }
            } catch (e) { console.warn('Fetch minted events failed', e); }

            // 2. Fetch Listed Slides (for Full Ownership Sale)
            try {
                const listedEventsResponse = await client.queryEvents({
                    query: {
                        MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideListed`,
                    },
                    limit: 50,
                    order: 'descending',
                });

                if (listedEventsResponse?.data) {
                    for (const eventData of listedEventsResponse.data) {
                        const listingId = eventData.parsedJson?.listing_id;
                        if (listingId && !slideMap.has(listingId)) {
                            try {
                                const obj = await client.getObject({
                                    id: listingId,
                                    options: { showContent: true },
                                });

                                if (obj.data?.content?.dataType === 'moveObject') {
                                    const fields = obj.data.content.fields;
                                    const slideFields = fields.slide?.fields || fields.slide || {};
                                    const originalSlideId = slideFields.id?.id || eventData.parsedJson?.slide_id;

                                    if (originalSlideId && !isSlideDeleted(originalSlideId)) {
                                        slideMap.set(listingId, {
                                            id: listingId,
                                            originalSlideId,
                                            title: slideFields.title || 'Untitled Slide',
                                            price: fields.price || 0,
                                            owner: fields.seller,
                                            author: fields.seller,
                                            contentUrl: slideFields.content_url,
                                            thumbnail: slideFields.thumbnail_url,
                                            creator: slideFields.creator,
                                            isListed: true,
                                            type: 'listing',
                                        });
                                    }
                                }
                            } catch { /* ignore deleted objects */ }
                        }
                    }
                }
            } catch (e) { console.warn('Fetch listed events failed', e); }

            setSlides(Array.from(slideMap.values()));
        } catch (err) {
            console.error('Error fetching marketplace slides:', err);
            setError(err.message);
            const mockSlides = JSON.parse(localStorage.getItem('slides') || '[]');
            setSlides(mockSlides);
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    useEffect(() => {
        if (client) {
            fetchMarketplaceSlides();
        }
    }, [client, fetchMarketplaceSlides]);

    const refetch = () => fetchMarketplaceSlides(true);

    return { slides, isLoading, error, refetch };
};

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
