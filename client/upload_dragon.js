import fs from 'fs';
import path from 'path';

const PUBLISHER_URL = 'https://publisher.walrus-testnet.walrus.space';

async function uploadFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    try {
        console.log(`Uploading ${path.basename(filePath)}...`);
        const fileData = fs.readFileSync(filePath);

        const response = await fetch(`${PUBLISHER_URL}/v1/blobs?epochs=5`, {
            method: 'PUT',
            body: fileData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        const blobId = data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;

        console.log(`Success! Blob ID: ${blobId}`);
        return blobId;
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
}

async function main() {
    const file = 'C:/Users/Administrator.DESKTOP-M0KCUVC/.gemini/antigravity/brain/9dd81caa-9cb9-4f9c-873a-7552f1355660/uploaded_media_1769448642120.png';
    const id = await uploadFile(file);
    if (id) {
        console.log("\nNEW DRAGON BLOB ID:");
        console.log(id);
    }
}

main();
