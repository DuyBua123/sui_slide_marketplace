import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const SENDER = '0x8adb25330e748d1b5ae2359dd89eaaf49701f2c386b012188371091d365a8763';

async function main() {
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });

    console.log(`Searching for TXs from sender: ${SENDER}...`);
    const txs = await client.queryTransactionBlocks({
        filter: { FromAddress: SENDER },
        options: { showEffects: true, showObjectChanges: true },
        limit: 10,
        order: 'descending'
    });

    console.log(`Found ${txs.data.length} transactions.`);

    for (const tx of txs.data) {
        console.log(`- Digest: ${tx.digest}`);

        // Check for EventTracker creation
        if (tx.objectChanges) {
            const tracker = tx.objectChanges.find(c =>
                c.type === 'created' && c.objectType.includes('::event::EventTracker')
            );
            if (tracker) {
                console.log("!!! FOUND TRACKER ID !!!Info:", tracker.objectId);
                console.log("TX Digest:", tx.digest);
                return;
            }
        }
    }
    console.log("Tracker creation not found in recent transactions.");
}
main();
