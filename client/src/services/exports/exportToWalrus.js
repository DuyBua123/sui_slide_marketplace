/**
 * Export slide data to Walrus (SUI-native decentralized storage)
 */
import { uploadToWalrus, getWalrusUrl } from '../../utils/walrus';

const AGGREGATOR_URL = import.meta.env.VITE_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Upload JSON data to Walrus
 * @param {Object} data - Data to upload
 * @returns {Promise<string>} Walrus blob URL
 */
export const exportToWalrus = async (data) => {
    try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const result = await uploadToWalrus(blob);

        const walrusUrl = `walrus://${result.blobId}`;
        console.log('Slide uploaded to Walrus:', walrusUrl);
        return walrusUrl;
    } catch (error) {
        console.error('Error uploading to Walrus:', error);
        throw error;
    }
};

/**
 * Fetch slide data from Walrus
 * @param {string} walrusUrl - Walrus URL (walrus://blobId or blobId)
 * @returns {Promise<Object>} Slide data
 */
export const fetchFromWalrus = async (walrusUrl) => {
    try {
        if (!walrusUrl) return null;

        // Skip legacy local URLs
        if (walrusUrl.startsWith('local://')) {
            console.warn('Skipping legacy local URL:', walrusUrl);
            return null;
        }

        // Handle legacy IPFS URLs (graceful fallback during migration)
        if (walrusUrl.startsWith('ipfs://') || walrusUrl.includes('/ipfs/')) {
            console.warn('Legacy IPFS URL detected. Migration required:', walrusUrl);
            return null;
        }

        // Extract blob ID
        let blobId = walrusUrl;
        if (walrusUrl.startsWith('walrus://')) {
            blobId = walrusUrl.substring(9);
        } else if (walrusUrl.includes('/v1/blobs/')) {
            const parts = walrusUrl.split('/v1/blobs/');
            blobId = parts[parts.length - 1];
        }

        // Clean up blobId
        blobId = blobId.split(/[?#]/)[0].replace(/\/$/, '');

        console.log('Fetching from Walrus, blobId:', blobId);

        const url = `${AGGREGATOR_URL}/v1/blobs/${blobId}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Walrus fetch failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching from Walrus:', error);
        throw error;
    }
};
