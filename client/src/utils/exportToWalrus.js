import { uploadToWalrus, getWalrusUrl } from './walrus';

/**
 * Upload presentation JSON to Walrus
 * Returns permanent Walrus aggregator URL
 */
export const uploadToWalrus_ = async (presentationData, title = 'Presentation') => {
    try {
        // Convert JSON to Blob
        const jsonString = JSON.stringify(presentationData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create File object
        const file = new File([blob], `${title || 'presentation'}.json`, {
            type: 'application/json',
        });

        // Upload to Walrus
        const response = await uploadToWalrus(file);

        // Return aggregator URL
        return response.url;
    } catch (error) {
        console.error('Walrus upload failed:', error);
        throw new Error('Failed to upload to Walrus');
    }
};

// Primary export
export const uploadPresentationToWalrus = uploadToWalrus_;
