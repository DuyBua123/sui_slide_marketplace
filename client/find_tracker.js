import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const ADMIN_ADDRESS = '0x8adb25330e748d1b5ae2359dd89eaaf49701f2c386b012188371091d365a8763';
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

async function main() {
    console.log(`Checking Admin: ${ADMIN_ADDRESS}`);

    // Look for recent created objects
    const txs = await client.queryTransactionBlocks({
        filter: { FromAddress: ADMIN_ADDRESS },
        options: { showObjectChanges: true },
        limit: 10,
        order: 'descending'
    });

    for (const tx of txs.data) {
        if (tx.objectChanges) {
            for (const change of tx.objectChanges) {
                if (change.type === 'created') {
                    console.log(`\n[CREATED] ${change.objectType}`);
                    console.log(`ID: ${change.objectId}`);
                }
            }
        }
    }
}

main().catch(console.error);
