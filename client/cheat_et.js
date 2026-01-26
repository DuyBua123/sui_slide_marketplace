import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Valid Addresses from Debugging Session
const PACKAGE_ID = '0xdcd1be38d1ce61af308a575ed1c1616875647db8b9b6297013d4bcab5645a248';
const TRACKER_ID = '0x3387c6d4b7db26cc66de7354ec9d96a2a8084e3187367661cd3442281bae421c';
const MODULE_NAME = 'event';
const FUNCTION_NAME = 'record_event_sale';

// Load Keystore (for signing the cheat transaction)
// We need a signer (payer of gas). We can use the active address from local keystore.
const HOMEDIR = process.env.HOME || process.env.USERPROFILE;
const KEYSTORE_PATH = path.join(HOMEDIR, '.sui', 'sui_config', 'sui.keystore');

async function main() {
    const targetAddress = process.argv[2];

    if (!targetAddress) {
        console.error("Usage: node cheat_et.js <RECIPIENT_ADDRESS>");
        console.error("Example: node cheat_et.js 0x123...");
        process.exit(1);
    }

    console.log(`Preparing to cheat 1 ET for: ${targetAddress}`);

    // Initialize Client
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });

    // Load Keypair
    let keypair;
    try {
        const keystoreContent = fs.readFileSync(KEYSTORE_PATH, 'utf8');
        const keys = JSON.parse(keystoreContent);
        // Use the first key
        const keyData = keys[0];
        // Decode key (usually base64)
        // If it starts with 'suiprivkey', need specialized decoding.
        // Assuming standard base64 for simplicity or just try to instantiate.
        // For 'suiprivkey', we need @mysten/sui/cryptography etc.
        // Let's rely on user having a valid key at index 0.
        // If this fails, user might need to use CLI directly.

        // Simpler: Just tell user to run CLI command?
        // CLI command for PTB is complex.
        // Let's assume user works with node script if we provide cleaner approach.
        // Actually, importing keypair from keystore manually is brittle.
        // Better: Instructions to run a SUI CLIENT call?
        // No, sui client call cannot easily generate random address argument.

        // Let's use `sui client call` but with a HARDCODED fake buyer?
        // If we hardcode fake buyer, it works ONCE.
        // User needs 1 ET. Once is enough?

    } catch (e) {
        console.log("Could not load keystore automatically. " + e.message);
    }
}

// Switching strategy:
// Writing a Node script that uses the installed @mysten/sui to generic Keypair is hard without private key input.
// BUT I can generate a random address in JS easily.
// I will output the EXACT SUI CLIENT COMMAND for the user to copy-paste.
// This avoids me needing to access their keystore file directly (security/complexity).

function generateFakeAddress() {
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

const fakeBuyer = generateFakeAddress();
const cmd = `sui client call --package ${PACKAGE_ID} --module ${MODULE_NAME} --function ${FUNCTION_NAME} --args ${TRACKER_ID} ${process.argv[2] || '<YOUR_ADDRESS>'} ${fakeBuyer} --gas-budget 10000000`;

console.log("\nCopy and run this command in your terminal to get 1 ET:");
console.log("-------------------------------------------------------");
console.log(cmd);
console.log("-------------------------------------------------------\n");
