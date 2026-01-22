/**
 * Export slide data to IPFS using Pinata or similar service
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} data - Data to upload
 * @returns {Promise<string>} IPFS hash/URL
 */
export const exportToIPFS = async (data) => {
    try {
        if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
            throw new Error('Pinata authentication is not configured. Please add VITE_PINATA_JWT or (VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET) to your .env file.');
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

        const headers = PINATA_JWT 
            ? { 'Authorization': `Bearer ${PINATA_JWT}` }
            : {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_API_SECRET,
            };

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        const ipfsHash = result.IpfsHash;
        const ipfsUrl = `ipfs://${ipfsHash}`;

        console.log('Slide uploaded to IPFS:', ipfsUrl);
        return ipfsUrl;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw error;
    }
};

/**
 * Fetch slide data from IPFS
 * @param {string} ipfsUrl - IPFS URL (ipfs://hash or ipfs hash)
 * @returns {Promise<Object>} Slide data
 */
export const fetchFromIPFS = async (ipfsUrl) => {
    try {
        if (!ipfsUrl) return null;

        // Skip if it's a legacy local URL from previous mock implementation
        if (ipfsUrl.startsWith('local://')) {
            console.warn('Skipping legacy local URL:', ipfsUrl);
            return null;
        }

        // Handle different IPFS URL formats and extract only the CID/hash
        let hash = ipfsUrl;
        
        // 1. Handle ipfs:// protocol
        if (ipfsUrl.startsWith('ipfs://')) {
            hash = ipfsUrl.substring(7);
        } 
        // 2. Handle full HTTP/HTTPS gateway URLs (e.g. https://gateway.pinata.cloud/ipfs/CID)
        else if (ipfsUrl.includes('/ipfs/')) {
            const parts = ipfsUrl.split('/ipfs/');
            hash = parts[parts.length - 1]; // Get the last part after /ipfs/
        }
        
        // Clean up hash (remove trailing slashes or queries if any)
        hash = hash.split(/[?#]/)[0].replace(/\/$/, '');

        console.log('Extracted IPFS CID:', hash);

        // Standard IPFS gateways
        const gateways = [
            `https://gateway.pinata.cloud/ipfs/${hash}`,
            `https://ipfs.io/ipfs/${hash}`,
            `https://cloudflare-ipfs.com/ipfs/${hash}`
        ];

        let lastError = null;
        for (const url of gateways) {
            try {
                console.log(`Fetching from IPFS gateway: ${url}`);
                
                // Add a timeout to the fetch call
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (response.ok) {
                    return await response.json();
                }
                console.warn(`Gateway ${url} returned status: ${response.status}`);
            } catch (err) {
                const errorMessage = err.name === 'AbortError' ? 'Fetch timed out' : err.message;
                console.warn(`Gateway ${url} failed to fetch:`, errorMessage);
                lastError = new Error(errorMessage);
            }
        }

        throw new Error(lastError?.message || 'Failed to fetch content from any IPFS gateway. Please check your internet connection and the IPFS hash.');
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw error;
    }
};
