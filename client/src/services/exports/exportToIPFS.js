/**
 * Export slide data to IPFS using Pinata or similar service
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} data - Data to upload
 * @returns {Promise<string>} IPFS hash/URL
 */
export const exportToIPFS = async (data) => {
    try {
        if (!PINATA_API_KEY || !PINATA_API_SECRET) {
            console.warn('Pinata API keys not configured, using local storage fallback');
            return `local://slide-${Date.now()}`;
        }

        const formData = new FormData();
        formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }), 'slide-data.json');

        const metadata = {
            name: `Slide-${new Date().toISOString()}`,
            keyvalues: {
                type: 'slide',
                version: '1.0',
            },
        };

        formData.append('pinataMetadata', JSON.stringify(metadata));

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_API_SECRET,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        const ipfsHash = result.IpfsHash;
        const ipfsUrl = `ipfs://${ipfsHash}`;

        console.log('Slide uploaded to IPFS:', ipfsUrl);
        return ipfsUrl;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error(`Failed to export to IPFS: ${error.message}`);
    }
};

/**
 * Fetch slide data from IPFS
 * @param {string} ipfsUrl - IPFS URL (ipfs://hash or ipfs hash)
 * @returns {Promise<Object>} Slide data
 */
export const fetchFromIPFS = async (ipfsUrl) => {
    try {
        // Handle different IPFS URL formats
        let hash = ipfsUrl;
        if (ipfsUrl.startsWith('ipfs://')) {
            hash = ipfsUrl.substring(7);
        }

        const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw error;
    }
};
