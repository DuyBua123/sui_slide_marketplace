import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

// Search by AdminCap instead of TreasuryCap
const INPUT_OBJ = '0x6ab68fffed6655745c134bb708d319410dd79d89738c64b7cb1200395b93a175';

async function main() {
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });

    console.log(`Searching for TX using InputObject: ${INPUT_OBJ}...`);
    const txs = await client.queryTransactionBlocks({
        filter: { InputObject: INPUT_OBJ },
        options: { showEffects: true, showObjectChanges: true }
    });

    if (txs.data.length === 0) {
        console.log("No usage found for TreasuryCap.");
        return;
    }

    const tx = txs.data[0];
    console.log("Found TX:", tx.digest);

    if (tx.objectChanges) {
        const tracker = tx.objectChanges.find(c =>
            c.objectType && c.objectType.includes('::event::EventTracker')
        );
        if (tracker) {
            console.log("TRACKER ID:", tracker.objectId);
        } else {
            console.log("Changes:", JSON.stringify(tx.objectChanges, null, 2));
        }
    }
}
main();
