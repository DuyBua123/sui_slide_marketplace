import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState, useEffect } from 'react';
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

    useEffect(() => {
        const fetchMarketplaceSlides = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (!client || PACKAGE_ID === '0x0') {
                    throw new Error(
                        'Package ID not configured. Please set VITE_PACKAGE_ID in environment variables.'
                    );
                }

                const formattedSlides = [];

                try {
                    // Query for SlideMinted events
                    const mintedEventsResponse = await client.queryEvents({
                        query: {
                            MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideMinted`,
                        },
                        limit: 50,
                        order: 'descending',
                    });

                    // Process minted slides from events
                    if (mintedEventsResponse?.data) {
                        for (const eventData of mintedEventsResponse.data) {
                            try {
                                const slideId = eventData.parsedJson?.slide_id;
                                if (slideId) {
                                    try {
                                        const obj = await client.getObject({
                                            id: slideId,
                                            options: {
                                                showContent: true,
                                            },
                                        });

                                        // Skip if object doesn't exist (deleted) or is not found
                                        if (!obj || !obj.data || obj.data.status === 'NotFound' || obj.data.status === 'Deleted') {
                                            console.log('Slide object not found or deleted:', slideId);
                                            continue;
                                        }

                                        if (
                                            obj.data?.content?.dataType ===
                                            'moveObject' &&
                                            obj.data.content.fields
                                        ) {
                                            const fields = obj.data.content.fields;

                                            // Only include if is_listed is true and not deleted locally
                                            if (fields.is_listed && !isSlideDeleted(slideId)) {
                                                formattedSlides.push({
                                                    id: slideId,
                                                    title: fields.title || 'Untitled Slide',
                                                    price: fields.price || 0,
                                                    owner: fields.creator,
                                                    contentUrl: fields.content_url,
                                                    thumbnail: fields.thumbnail_url,
                                                    creator: fields.creator,
                                                    isListed: true,
                                                    type: 'slideObject',
                                                });
                                            }
                                        }
                                    } catch (objErr) {
                                        // Object doesn't exist (deleted), skip it
                                        console.log('Error fetching slide object (likely deleted):', slideId, objErr.message);
                                        continue;
                                    }
                                }
                            } catch (err) {
                                console.warn('Error processing minted slide:', err);
                            }
                        }
                    }

                    // Query for SlideListed events
                    const listedEventsResponse = await client.queryEvents({
                        query: {
                            MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideListed`,
                        },
                        limit: 50,
                        order: 'descending',
                    });

                    // Process listed slides from events
                    if (listedEventsResponse?.data) {
                        for (const eventData of listedEventsResponse.data) {
                            try {
                                const listingId = eventData.parsedJson?.listing_id;
                                if (listingId) {
                                    try {
                                        const obj = await client.getObject({
                                            id: listingId,
                                            options: {
                                                showContent: true,
                                            },
                                        });

                                        // Skip if object doesn't exist (deleted) or is not found
                                        if (!obj || !obj.data || obj.data.status === 'NotFound' || obj.data.status === 'Deleted') {
                                            console.log('Listing object not found or deleted:', listingId);
                                            continue;
                                        }

                                        if (
                                            obj.data?.content?.dataType === 'moveObject' &&
                                            obj.data.content.fields
                                        ) {
                                            const fields = obj.data.content.fields;
                                            const slideFields = fields.slide || {};

                                            // Skip if the underlying slide is deleted
                                            const slideId = slideFields.id?.id || eventData.parsedJson?.slide_id;
                                            if (slideId && isSlideDeleted(slideId)) {
                                                console.log('Listing contains deleted slide:', slideId);
                                                continue;
                                            }

                                            formattedSlides.push({
                                                id: listingId,
                                                title: slideFields.title || 'Untitled Slide',
                                                price: fields.price || 0,
                                                owner: fields.seller,
                                                contentUrl: slideFields.content_url,
                                                thumbnail: slideFields.thumbnail_url,
                                                creator: slideFields.creator,
                                                isListed: true,
                                                type: 'listing',
                                            });
                                        }
                                    } catch (objErr) {
                                        // Object doesn't exist (deleted), skip it
                                        console.log('Error fetching listing object (likely deleted):', listingId, objErr.message);
                                        continue;
                                    }
                                }
                            } catch (err) {
                                console.warn('Error processing listed slide:', err);
                            }
                        }
                    }
                } catch (apiErr) {
                    console.warn('API query failed:', apiErr);
                    throw apiErr;
                }

                setSlides(formattedSlides);
            } catch (err) {
                console.error('Error fetching marketplace slides:', err);
                setError(err.message);

                // Fallback to localStorage mock for development
                const mockSlides = JSON.parse(localStorage.getItem('slides') || '[]');
                setSlides(mockSlides);
            } finally {
                setIsLoading(false);
            }
        };

        if (client) {
            fetchMarketplaceSlides();
        }
    }, [client]);

    const refetch = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (!client || PACKAGE_ID === '0x0') {
                throw new Error(
                    'Package ID not configured. Please set VITE_PACKAGE_ID in environment variables.'
                );
            }

            const formattedSlides = [];

            try {
                // Query for SlideMinted events
                const mintedEventsResponse = await client.queryEvents({
                    query: {
                        MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideMinted`,
                    },
                    limit: 50,
                    order: 'descending',
                });

                // Process minted slides from events
                if (mintedEventsResponse?.data) {
                    for (const eventData of mintedEventsResponse.data) {
                        try {
                            const slideId = eventData.parsedJson?.slide_id;
                            if (slideId) {
                                try {
                                    const obj = await client.getObject({
                                        id: slideId,
                                        options: {
                                            showContent: true,
                                        },
                                    });

                                    // Skip if object doesn't exist (deleted) or is not found
                                    if (!obj || !obj.data || obj.data.status === 'NotFound' || obj.data.status === 'Deleted') {
                                        console.log('Slide object not found or deleted:', slideId);
                                        continue;
                                    }

                                    if (
                                        obj.data?.content?.dataType === 'moveObject' &&
                                        obj.data.content.fields
                                    ) {
                                        const fields = obj.data.content.fields;

                                        // Only include if is_listed is true and not deleted locally
                                        if (fields.is_listed && !isSlideDeleted(slideId)) {
                                            formattedSlides.push({
                                                id: slideId,
                                                title: fields.title || 'Untitled Slide',
                                                price: fields.price || 0,
                                                owner: fields.creator,
                                                contentUrl: fields.content_url,
                                                thumbnail: fields.thumbnail_url,
                                                creator: fields.creator,
                                                isListed: true,
                                                type: 'slideObject',
                                            });
                                        }
                                    }
                                } catch (objErr) {
                                    console.log('Error fetching slide object (likely deleted):', slideId, objErr.message);
                                    continue;
                                }
                            }
                        } catch (err) {
                            console.warn('Error processing minted slide:', err);
                        }
                    }
                }

                // Query for SlideListed events
                const listedEventsResponse = await client.queryEvents({
                    query: {
                        MoveEventType: `${PACKAGE_ID}::slide_marketplace::SlideListed`,
                    },
                    limit: 50,
                    order: 'descending',
                });

                // Process listed slides from events
                if (listedEventsResponse?.data) {
                    for (const eventData of listedEventsResponse.data) {
                        try {
                            const listingId = eventData.parsedJson?.listing_id;
                            if (listingId) {
                                try {
                                    const obj = await client.getObject({
                                        id: listingId,
                                        options: {
                                            showContent: true,
                                        },
                                    });

                                    // Skip if object doesn't exist (deleted) or is not found
                                    if (!obj || !obj.data || obj.data.status === 'NotFound' || obj.data.status === 'Deleted') {
                                        console.log('Listing object not found or deleted:', listingId);
                                        continue;
                                    }

                                    if (
                                        obj.data?.content?.dataType === 'moveObject' &&
                                        obj.data.content.fields
                                    ) {
                                        const fields = obj.data.content.fields;
                                        const slideFields = fields.slide || {};

                                        // Skip if the underlying slide is deleted
                                        const slideId = slideFields.id?.id || eventData.parsedJson?.slide_id;
                                        if (slideId && isSlideDeleted(slideId)) {
                                            console.log('Listing contains deleted slide:', slideId);
                                            continue;
                                        }

                                        formattedSlides.push({
                                            id: listingId,
                                            title: slideFields.title || 'Untitled Slide',
                                            price: fields.price || 0,
                                            owner: fields.seller,
                                            contentUrl: slideFields.content_url,
                                            thumbnail: slideFields.thumbnail_url,
                                            creator: slideFields.creator,
                                            isListed: true,
                                            type: 'listing',
                                        });
                                    }
                                } catch (objErr) {
                                    console.log('Error fetching listing object (likely deleted):', listingId, objErr.message);
                                    continue;
                                }
                            }
                        } catch (err) {
                            console.warn('Error processing listed slide:', err);
                        }
                    }
                }
            } catch (apiErr) {
                console.warn('API query failed:', apiErr);
                throw apiErr;
            }

            setSlides(formattedSlides);
        } catch (err) {
            console.error('Error refetching marketplace slides:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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
