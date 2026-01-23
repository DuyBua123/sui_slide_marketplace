/**
 * Walrus Storage Integration
 * 
 * Handles uploading files to Walrus (Sui-native storage) via Publisher and Aggregator nodes.
 */

const PUBLISHER_URL = import.meta.env.VITE_WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR_URL = import.meta.env.VITE_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Upload a file to Walrus
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<{blobId: string, url: string}>} - Blob ID and aggregator URL
 */
export const uploadToWalrus = async (file) => {
    try {
        const response = await fetch(`${PUBLISHER_URL}/v1/blobs?epochs=5`, {
            method: 'PUT',
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload to Walrus: ${response.statusText}`);
        }

        const data = await response.json();
        const blobId = data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;

        if (!blobId) {
            throw new Error('Invalid response from Walrus publisher');
        }

        return {
            blobId,
            url: `${AGGREGATOR_URL}/v1/blobs/${blobId}`,
            // Mimic Pinata response structure for compatibility where needed
            hash: blobId,
        };
    } catch (error) {
        console.error('Walrus upload error:', error);
        throw error;
    }
};

/**
 * Upload JSON data to Walrus
 * @param {object} data - JSON data to upload
 * @returns {Promise<{blobId: string, url: string}>}
 */
export const uploadJSONToWalrus = async (data) => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return uploadToWalrus(blob);
};

/**
 * Get Walrus URL from Blob ID
 * @param {string} blobId - Walrus Blob ID
 * @returns {string} - Aggregator URL
 */
export const getWalrusUrl = (blobId) => {
    if (!blobId) return '';
    if (blobId.startsWith('http')) return blobId;
    return `${AGGREGATOR_URL}/v1/blobs/${blobId}`;
};

/**
 * Upload an image from a data URL (base64) to Walrus
 * @param {string} dataUrl - Base64 data URL of the image
 * @returns {Promise<{blobId: string, url: string}>}
 */
export const uploadDataUrlToWalrus = async (dataUrl) => {
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return uploadToWalrus(blob);
};

export default {
    uploadToWalrus,
    uploadJSONToWalrus,
    uploadDataUrlToWalrus,
    getWalrusUrl,
};
