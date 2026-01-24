import CryptoJS from 'crypto-js';
import { uploadToWalrus } from '../utils/walrus';

/**
 * SealAssetService - Encryption service for premium assets
 * Encrypts assets before uploading to Walrus (SUI-native storage)
 */
class SealAssetService {
    /**
     * Encrypt and upload asset to Walrus
     * @param {File|Blob} file - Asset file to encrypt
     * @param {Object} metadata - Asset metadata
     * @returns {Promise<{blobId: string, encryptionKey: string, metadata: Object}>}
     */
    async sealAndUpload(file, metadata = {}) {
        try {
            // 1. Generate random encryption key (256-bit)
            const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();

            // 2. Read file as base64
            const fileData = await this.readFileAsBase64(file);

            // 3. Encrypt data with AES-256
            const encrypted = CryptoJS.AES.encrypt(fileData, encryptionKey).toString();

            // 4. Create encrypted blob
            const encryptedBlob = new Blob([encrypted], {
                type: 'application/octet-stream'
            });

            // 5. Upload encrypted blob to Walrus
            // Note: Walrus uses a simple blob upload model without custom metadata.
            const uploadResult = await uploadToWalrus(encryptedBlob);

            // 6. Return Blob ID + encryption key
            return {
                cid: uploadResult.blobId, // Keeping 'cid' key for compatibility, but value is blobId
                encryptionKey, // IMPORTANT: Store this securely!
                metadata: {
                    ...metadata,
                    encrypted: true,
                    uploadedAt: Date.now(),
                },
            };
        } catch (error) {
            console.error('Seal and upload failed:', error);
            throw new Error('Failed to encrypt and upload asset');
        }
    }

    /**
     * Decrypt and retrieve asset from Walrus
     * @param {string} blobId - Walrus Blob ID
     * @param {string} encryptionKey - Decryption key
     * @returns {Promise<string>} - Decrypted data URL
     */
    async unseal(blobId, encryptionKey) {
        try {
            // 1. Fetch encrypted data from Walrus
            const aggregatorUrl = import.meta.env.VITE_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';
            const response = await fetch(`${aggregatorUrl}/v1/blobs/${blobId}`);
            const encryptedData = await response.text();

            // 2. Decrypt with AES-256
            const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
            const originalData = decrypted.toString(CryptoJS.enc.Utf8);

            if (!originalData) {
                throw new Error('Decryption failed - invalid key');
            }

            // 3. Return decrypted data (base64 data URL)
            return originalData;
        } catch (error) {
            console.error('Unseal failed:', error);
            throw new Error('Failed to decrypt asset');
        }
    }

    /**
     * Read file as base64 data URL
     * @private
     */
    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Convert base64 to Blob
     * @private
     */
    base64ToBlob(base64Data) {
        const [header, data] = base64Data.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const binary = atob(data);
        const array = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }

        return new Blob([array], { type: mime });
    }

    /**
     * Verify encryption key validity
     * @param {string} key - Encryption key to verify
     * @returns {boolean}
     */
    isValidKey(key) {
        return typeof key === 'string' && key.length === 64; // 32 bytes = 64 hex chars
    }
}

// Export singleton instance
export const sealAssetService = new SealAssetService();
