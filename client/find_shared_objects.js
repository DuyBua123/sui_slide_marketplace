import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const SENDER = '0x8adb25330e748d1b5ae2359dd89eaaf49701f2c386b012188371091d365a8763';
const PACKAGE_ID = '0xdcd1be38d1ce61af308a575ed1c1616875647db8b9b6297013d4bcab5645a248';

async function main() {
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });

    console.log(`Searching for deployment TX of package ${PACKAGE_ID}...`);
    const txs = await client.queryTransactionBlocks({
        filter: { FromAddress: SENDER },
        options: { showEffects: true, showObjectChanges: true },
        limit: 20,
        order: 'descending'
    });

    console.log(`Found ${txs.data.length} transactions.\n`);

    for (const tx of txs.data) {
        if (!tx.objectChanges) continue;

        // Check if this TX published the package
        const publishedPackage = tx.objectChanges.find(c =>
            c.type === 'published' && c.packageId === PACKAGE_ID
        );

        if (publishedPackage) {
            console.log("=== FOUND DEPLOYMENT TX ===");
            console.log(`Digest: ${tx.digest}\n`);

            console.log("Created Objects:");
            tx.objectChanges.forEach(c => {
                if (c.type === 'created') {
                    console.log(`  - ${c.objectType}`);
                    console.log(`    ID: ${c.objectId}`);
                }
            });
            return;
        }
    }

    console.log("Deployment TX not found in recent transactions.");
    console.log("Listing all shared object creations for reference:");

    for (const tx of txs.data) {
        if (!tx.objectChanges) continue;
        const shared = tx.objectChanges.filter(c =>
            c.type === 'created' && c.objectType?.includes(PACKAGE_ID)
        );
        if (shared.length > 0) {
            console.log(`\nTX: ${tx.digest}`);
            shared.forEach(s => console.log(`  - ${s.objectType}: ${s.objectId}`));
        }
    }
}
main();
