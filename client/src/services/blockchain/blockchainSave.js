/**
 * Blockchain Save Service
 * 
 * Handles exporting slide data to Walrus and preparing it for blockchain storage
 */

import React from 'react';
import { exportToWalrus } from '../exports/exportToWalrus';

/**
 * Prepare slide data for blockchain storage
 * @param {Object} params
 * @param {string} params.title - Slide title
 * @param {Array} params.slides - Array of slides
 * @returns {Promise<Object>} { contentUrl, thumbnailUrl, slideData }
 */
export const prepareSlideDraftData = async ({ title, slides, thumbnail }) => {
    try {
        const slideData = {
            title,
            slides,
            version: '1.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Export to Walrus
        const contentUrl = await exportToWalrus(slideData);

        let validThumbnailUrl = null;

        if (thumbnail) {
            // Check if it's already a Walrus/HTTP URL or Data URL
            if (thumbnail.startsWith('http') || thumbnail.startsWith('walrus')) {
                validThumbnailUrl = thumbnail;
            } else if (thumbnail.startsWith('data:')) {
                // Upload data URL to Walrus
                const { uploadDataUrlToWalrus } = await import('../../utils/walrus');
                const result = await uploadDataUrlToWalrus(thumbnail);
                validThumbnailUrl = result.url;
            }
        }

        // Fallback: If no valid thumbnail, avoid setting it to contentUrl (JSON)
        // Pass empty string or keep it null

        return {
            contentUrl,
            thumbnailUrl: validThumbnailUrl || '',
            slideData,
        };
    } catch (error) {
        console.error('Error preparing slide data for blockchain:', error);
        throw new Error(`Failed to prepare slide data: ${error.message}`);
    }
};

/**
 * Save slide draft changes to blockchain
 * @param {Object} params
 * @param {Object} params.suiObjectId - The slide object ID on blockchain
 * @param {string} params.title - Slide title
 * @param {Array} params.slides - Array of slides
 * @param {Function} params.onUpdate - Callback with updateSlide function
 * @returns {Promise<Object>} Transaction result
 */
export const saveSlideToBlockchain = async ({
    suiObjectId,
    title,
    slides,
    thumbnail,
    onUpdate,
}) => {
    try {
        // Prepare the data for blockchain
        const { contentUrl, thumbnailUrl } = await prepareSlideDraftData({
            title,
            slides,
            thumbnail,
        });

        if (!suiObjectId) {
            throw new Error('Slide object ID is required to update');
        }

        // Call the update function
        const result = await onUpdate({
            slideObject: { id: suiObjectId },
            title,
            contentUrl,
            thumbnailUrl,
        });

        return {
            success: true,
            txDigest: result.digest,
            contentUrl,
            thumbnailUrl,
        };
    } catch (error) {
        console.error('Error saving slide to blockchain:', error);
        throw error;
    }
};

/**
 * Auto-save to blockchain with debounce
 * @param {Object} params
 * @param {string} params.suiObjectId - The slide object ID
 * @param {string} params.title - Slide title
 * @param {Array} params.slides - Slide data
 * @param {Function} params.updateSlide - Update slide function
 * @param {number} params.debounceMs - Debounce time in milliseconds
 * @returns {Object} { saveToBlockchain, cancel, isPending }
 */
export const useBlockchainAutoSave = () => {
    const timeoutRef = React.useRef(null);
    const [isPending, setIsPending] = React.useState(false);

    const saveToBlockchain = React.useCallback(async (params) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsPending(true);

        return new Promise((resolve, reject) => {
            timeoutRef.current = setTimeout(async () => {
                try {
                    const result = await saveSlideToBlockchain(params);
                    setIsPending(false);
                    resolve(result);
                } catch (error) {
                    setIsPending(false);
                    reject(error);
                }
            }, params.debounceMs || 5000);
        });
    }, []);

    const cancel = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            setIsPending(false);
        }
    }, []);

    return { saveToBlockchain, cancel, isPending };
};
