import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const DIGEST = '6ws1bVyu3F8wGy1fPHhrc2v8UyWiGbRAAuek8SwikKPD';

async function main() {
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });

    console.log(`Inspecting TX: ${DIGEST}...`);
    const tx = await client.getTransactionBlock({
        digest: DIGEST,
        options: { showEffects: true, showObjectChanges: true }
    });

    if (tx.objectChanges) {
        const tracker = tx.objectChanges.find(c =>
            c.objectType && c.objectType.includes('::event::EventTracker')
        );
        if (tracker) {
            console.log("TRACKER ID:", tracker.objectId);
        } else {
            console.log("Tracker not found in changes. All changes:");
            console.log(JSON.stringify(tx.objectChanges, null, 2));
        }
    }
}
main();
