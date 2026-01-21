import { useEffect, useState } from 'react';
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

    const fetchMySlides = async () => {
        if (!account?.address) {
            console.log('[BLOCKCHAIN] No account connected');
            setSlides([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('[BLOCKCHAIN] Fetching slides for account:', account.address);

            // Query for all SlideObject owned by the current user
            // Using simpler filter structure compatible with SUI SDK
            const response = await client.getOwnedObjects({
                owner: account.address,
                options: {
                    showContent: true,
                    showDisplay: true,
                    showType: true,
                },
            });

            console.log('[BLOCKCHAIN] Query response:', response);

            if (!response.data || response.data.length === 0) {
                console.log('[BLOCKCHAIN] No objects found for user');
                setSlides([]);
                setIsLoading(false);
                return;
            }

            // Filter for SlideObject types and parse them
            const parsedSlides = response.data
                .filter((obj) => {
                    // Check if this is a SlideObject
                    const type = obj.data?.type || '';
                    // Also filter out locally deleted slides
                    const isDeleted = isSlideDeleted(obj.data.objectId);
                    if (isDeleted) {
                        console.log('[BLOCKCHAIN] Skipping locally deleted slide:', obj.data.objectId);
                    }
                    return (type.includes('SlideObject') || type.includes('slide_marketplace')) && !isDeleted;
                })
                .map((obj) => {
                    try {
                        const content = obj.data?.content;
                        if (!content) {
                            console.warn('[BLOCKCHAIN] No content in object:', obj.data.objectId);
                            return null;
                        }

                        // Extract fields from the Move struct
                        const fields = content.fields || content.data?.fields;
                        if (!fields) {
                            console.warn('[BLOCKCHAIN] No fields in object:', obj.data.objectId);
                            return null;
                        }

                        console.log('[BLOCKCHAIN] Parsing fields:', fields);

                        return {
                            id: obj.data.objectId,
                            objectId: obj.data.objectId,
                            title: fields.title || 'Untitled Slide',
                            contentUrl: fields.content_url || '',
                            thumbnailUrl: fields.thumbnail_url || '',
                            price: fields.price || 0,
                            isListed: fields.is_listed || false,
                            creator: fields.creator,
                            data: {
                                title: fields.title || 'Untitled Slide',
                                slides: [], // Will be fetched from IPFS if needed
                            },
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            owner: account.address,
                            suiObjectId: obj.data.objectId,
                            thumbnail: null, // Could fetch from thumbnail_url
                        };
                    } catch (err) {
                        console.error('[BLOCKCHAIN] Error parsing slide object:', err);
                        return null;
                    }
                })
                .filter((slide) => slide !== null);

            console.log('[BLOCKCHAIN] Parsed slides:', parsedSlides);
            setSlides(parsedSlides);
        } catch (err) {
            console.error('[BLOCKCHAIN] Error fetching slides:', err);
            console.error('[BLOCKCHAIN] Error details:', err.message, err.code);
            setError(err.message || 'Failed to fetch slides from blockchain');
            setSlides([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMySlides();
    }, [account?.address]);

    const refetch = () => {
        fetchMySlides();
    };

    return { slides, isLoading, error, refetch };
};

export default useMySlides;
