import { uploadFileToIPFS } from './pinata';

/**
 * Upload presentation JSON to IPFS
 * Returns permanent IPFS gateway URL
 */
export const uploadToIPFS = async (presentationData, title = 'Presentation') => {
    try {
        // Convert JSON to Blob
        const jsonString = JSON.stringify(presentationData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create File object
        const file = new File([blob], `${title || 'presentation'}.json`, {
            type: 'application/json',
        });

        // Upload to IPFS via Pinata
        const response = await uploadFileToIPFS(file);

        // Return gateway URL
        return response.url;
    } catch (error) {
        console.error('IPFS upload failed:', error);
        throw new Error('Failed to upload to IPFS');
    }
};
