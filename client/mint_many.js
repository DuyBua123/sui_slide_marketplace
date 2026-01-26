import { execSync } from 'child_process';

const PACKAGE_ID = '0xdcd1be38d1ce61af308a575ed1c1616875647db8b9b6297013d4bcab5645a248';
const TRACKER_ID = '0x3387c6d4b7db26cc66de7354ec9d96a2a8084e3187367661cd3442281bae421c';
const MODULE = 'event';
const FUNC = 'record_event_sale';
const TARGET = '0x7c1bb0dd8d98eb70b962835fc73c47e43769c5ca3894e6a73baf3c4a5f216f0a';

function generateFakeAddress() {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

console.log(`Minting 10 ET for ${TARGET}...`);

for (let i = 0; i < 10; i++) {
    const fakeBuyer = generateFakeAddress();
    console.log(`[${i + 1}/10] Minting via buyer ${fakeBuyer.slice(0, 8)}...`);
    try {
        // Run synchronously to avoid sequence number issues
        execSync(`sui client call --package ${PACKAGE_ID} --module ${MODULE} --function ${FUNC} --args ${TRACKER_ID} ${TARGET} ${fakeBuyer} --gas-budget 10000000 --json`, { stdio: 'ignore' });
        console.log("Success.");
    } catch (e) {
        console.error(`Failed iteration ${i + 1}`);
    }
}
console.log("Batch minting complete!");
