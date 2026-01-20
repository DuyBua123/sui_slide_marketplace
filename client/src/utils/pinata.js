/**
 * Pinata IPFS Integration
 * 
 * Handles uploading files to IPFS via Pinata's pinning service.
 * Uses JWT authentication for secure uploads.
 */

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

// Get JWT from environment
const getJWT = () => import.meta.env.VITE_PINATA_JWT;

/**
 * Upload a file to Pinata IPFS
 * @param {File} file - The file to upload
 * @param {string} name - Optional name for the file
 * @returns {Promise<{hash: string, url: string}>} - IPFS hash and gateway URL
 */
export const uploadToPinata = async (file, name) => {
    const jwt = getJWT();

    if (!jwt) {
        throw new Error('Pinata JWT not configured. Add VITE_PINATA_JWT to .env');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
        name: name || file.name,
        keyvalues: {
            app: 'sui-slide-marketplace',
            uploadedAt: new Date().toISOString(),
        },
    });
    formData.append('pinataMetadata', metadata);

    // Pin options
    const options = JSON.stringify({
        cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    try {
        const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload to Pinata');
        }

        const result = await response.json();

        return {
            hash: result.IpfsHash,
            url: `${PINATA_GATEWAY}/${result.IpfsHash}`,
            size: result.PinSize,
            timestamp: result.Timestamp,
        };
    } catch (error) {
        console.error('Pinata upload error:', error);
        throw error;
    }
};

/**
 * Upload JSON data to Pinata IPFS
 * @param {object} data - JSON data to upload
 * @param {string} name - Name for the JSON file
 * @returns {Promise<{hash: string, url: string}>}
 */
export const uploadJSONToPinata = async (data, name) => {
    const jwt = getJWT();

    if (!jwt) {
        throw new Error('Pinata JWT not configured. Add VITE_PINATA_JWT to .env');
    }

    try {
        const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                pinataContent: data,
                pinataMetadata: {
                    name: name || 'slide-data.json',
                    keyvalues: {
                        app: 'sui-slide-marketplace',
                        uploadedAt: new Date().toISOString(),
                    },
                },
                pinataOptions: {
                    cidVersion: 1,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload JSON to Pinata');
        }

        const result = await response.json();

        return {
            hash: result.IpfsHash,
            url: `${PINATA_GATEWAY}/${result.IpfsHash}`,
        };
    } catch (error) {
        console.error('Pinata JSON upload error:', error);
        throw error;
    }
};

/**
 * Upload an image from a data URL (base64)
 * @param {string} dataUrl - Base64 data URL of the image
 * @param {string} name - Name for the image file
 * @returns {Promise<{hash: string, url: string}>}
 */
export const uploadDataUrlToPinata = async (dataUrl, name) => {
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create File from Blob
    const file = new File([blob], name || 'image.png', { type: blob.type });

    return uploadToPinata(file, name);
};

/**
 * Get IPFS gateway URL from hash
 * @param {string} hash - IPFS hash
 * @returns {string} - Gateway URL
 */
export const getIPFSUrl = (hash) => {
    if (!hash) return '';
    // Handle if already a full URL
    if (hash.startsWith('http')) return hash;
    // Handle ipfs:// protocol
    if (hash.startsWith('ipfs://')) {
        return `${PINATA_GATEWAY}/${hash.replace('ipfs://', '')}`;
    }
    return `${PINATA_GATEWAY}/${hash}`;
};

export default {
    uploadToPinata,
    uploadJSONToPinata,
    uploadDataUrlToPinata,
    getIPFSUrl,
};
