const PUBLISHER_URL = 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space';

async function testv1blobs() {
    const path = '/v1/blobs?epochs=5';
    const method = 'PUT';
    const body = 'This is a test content ' + Date.now();

    try {
        console.log(`Uploading to ${path}...`);
        const response = await fetch(`${PUBLISHER_URL}${path}`, {
            method,
            body,
        });

        if (!response.ok) {
            console.log('Upload failed:', response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log('Upload Response Body:', JSON.stringify(data).slice(0, 200));

        const blobId = data.newlyCreated?.blobObject?.id || data.alreadyCertified?.id;
        console.log('Blob ID:', blobId);

        if (blobId) {
            console.log(`Downloading from ${AGGREGATOR_URL}/v1/blobs/${blobId}...`);
            const dlResponse = await fetch(`${AGGREGATOR_URL}/v1/blobs/${blobId}`);

            console.log('Download Status:', dlResponse.status);
            console.log('Content-Type:', dlResponse.headers.get('content-type'));
            const text = await dlResponse.text();
            console.log('Downloaded Content:', text);

            if (text === body) {
                console.log('SUCCESS: Content matches!');
            } else {
                console.log('FAILURE: Content mismatch!');
            }
        }

    } catch (e) {
        console.log(`Error:`, e.message);
    }
}

testv1blobs();
