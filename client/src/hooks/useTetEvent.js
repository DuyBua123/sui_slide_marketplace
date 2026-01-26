import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui/utils';

// Package and module configuration
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';
const MODULE_LUCKY_BOX = 'lucky_box';
const MODULE_ASSET = 'asset';
const MODULE_FUSION = 'fusion_system';
const MODULE_EVENT_TOKEN = 'event_token';

// Type definitions for querying owned objects
const TYPE_LUCKY_BOX = `${PACKAGE_ID}::${MODULE_LUCKY_BOX}::LuckyBox`;
const TYPE_TET_ASSET = `${PACKAGE_ID}::${MODULE_ASSET}::Asset`;
const TYPE_EVENT_TOKEN = `${PACKAGE_ID}::${MODULE_EVENT_TOKEN}::EVENT_TOKEN`;

// Shared Objects (Updated automatically via sync-config.js after deployment)
const GAME_CONFIG_ID = import.meta.env.VITE_GAME_CONFIG_ID || '0x0';
const RANDOM_ID = '0x8'; // SUI Random Object ID (constant)

export const useTetEvent = () => {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    // 1. Fetch Owned Lucky Boxes
    const { data: boxes, isLoading: boxesLoading } = useQuery({
        queryKey: ['ownedLuckyBoxes', account?.address],
        queryFn: async () => {
            if (!account?.address || PACKAGE_ID === '0x0') return [];
            const objects = await client.getOwnedObjects({
                owner: account.address,
                filter: { StructType: TYPE_LUCKY_BOX },
                options: { showContent: true, showDisplay: true },
            });
            return objects.data.map(obj => ({
                ...obj.data?.content?.fields,
                id: obj.data?.objectId,
                display: obj.data?.display?.data,
            }));
        },
        enabled: !!account?.address,
    });

    // 2. Fetch Owned Tet Assets (Stickers, Videos, Animations)
    const { data: assets, isLoading: assetsLoading } = useQuery({
        queryKey: ['ownedTetAssets', account?.address],
        queryFn: async () => {
            if (!account?.address || PACKAGE_ID === '0x0') return [];
            const objects = await client.getOwnedObjects({
                owner: account.address,
                filter: { StructType: TYPE_TET_ASSET },
                options: { showContent: true, showDisplay: true },
            });
            return objects.data.map(obj => ({
                ...obj.data?.content?.fields,
                id: obj.data?.objectId,
                display: obj.data?.display?.data,
            }));
        },
        enabled: !!account?.address,
    });

    // 3. Fetch Event Token Balance
    const { data: tokenBalance, isLoading: balanceLoading } = useQuery({
        queryKey: ['eventTokenBalance', account?.address],
        queryFn: async () => {
            if (!account?.address || PACKAGE_ID === '0x0') return '0';
            try {
                const balance = await client.getBalance({
                    owner: account.address,
                    coinType: TYPE_EVENT_TOKEN,
                });
                return balance.totalBalance;
            } catch {
                return '0';
            }
        },
        enabled: !!account?.address,
    });

    // 4. Fetch Event Token Coins (for spending)
    const { data: tokenCoins } = useQuery({
        queryKey: ['eventTokenCoins', account?.address],
        queryFn: async () => {
            if (!account?.address || PACKAGE_ID === '0x0') return [];
            const coins = await client.getCoins({
                owner: account.address,
                coinType: TYPE_EVENT_TOKEN,
            });
            return coins.data;
        },
        enabled: !!account?.address,
    });

    // ============ Actions ============

    // Buy Lucky Box (costs 1 ET - Event Token)
    const buyBox = useMutation({
        mutationFn: async () => {
            if (!tokenCoins || tokenCoins.length === 0) {
                throw new Error("You don't have any Event Tokens. Sell slides to unique buyers to earn ET!");
            }

            const tx = new Transaction();

            // Get the first ET coin and use it for payment
            const etCoin = tokenCoins[0];

            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_LUCKY_BOX}::buy_box`,
                arguments: [tx.object(etCoin.coinObjectId)],
            });

            return await signAndExecute({ transaction: tx });
        },
        onSuccess: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['ownedLuckyBoxes'] }),
                queryClient.invalidateQueries({ queryKey: ['eventTokenBalance'] }),
                queryClient.invalidateQueries({ queryKey: ['eventTokenCoins'] })
            ]);
        },
    });

    // Open Box (uses Random and GameConfig)
    const openBox = useMutation({
        mutationFn: async (boxId) => {
            console.log("Attempting to open box:", boxId, typeof boxId);

            if (!boxId) throw new Error("Box ID is missing (undefined/null)");

            if (GAME_CONFIG_ID === '0x0') {
                console.error("GameConfig ID is missing!");
                throw new Error("Game Config ID not set");
            }

            const normalizedGameConfig = normalizeSuiAddress(String(GAME_CONFIG_ID));
            const normalizedRandom = normalizeSuiAddress(String(RANDOM_ID));
            const normalizedBoxId = normalizeSuiAddress(String(boxId));

            console.log("Normalized IDs:", { normalizedGameConfig, normalizedRandom, normalizedBoxId });

            const tx = new Transaction();
            tx.setGasBudget(100000000);

            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_LUCKY_BOX}::open_box`,
                arguments: [
                    tx.object(normalizedBoxId),
                    tx.object(normalizedRandom),
                    tx.object(normalizedGameConfig),
                ],
            });

            console.log("Transaction constructed, requesting signature...");
            const result = await signAndExecute({ transaction: tx });
            console.log("Transaction result:", result);
            return result;
        },
        onError: (err) => {
            console.error("Open Box Logic Error:", err);
        },
        onSuccess: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            queryClient.invalidateQueries({ queryKey: ['ownedLuckyBoxes'] });
            queryClient.invalidateQueries({ queryKey: ['ownedTetAssets'] });
        }
    });

    // Craft Epic Asset (combine 5 assets)
    const craftEpicAsset = useMutation({
        mutationFn: async (assetIds) => {
            if (assetIds.length !== 5) throw new Error("Need exactly 5 assets");
            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_FUSION}::craft_epic_asset`,
                arguments: [
                    tx.makeMoveVec({ objects: assetIds.map(id => tx.object(id)) }),
                    tx.object(RANDOM_ID),
                ],
            });
            return await signAndExecute({ transaction: tx });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ownedTetAssets'] });
        }
    });

    return {
        // Data
        boxes: boxes || [],
        assets: assets || [],
        tokenBalance: tokenBalance || '0',
        tokenCoins: tokenCoins || [],

        // Loading states
        isLoading: boxesLoading || assetsLoading || balanceLoading,

        // Actions
        buyBox,
        openBox,
        craftEpicAsset,
    };
};
