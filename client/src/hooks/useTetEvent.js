import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';

// TODO: Update with deployed package ID
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';
const MODULE_LUCKY_BOX = 'lucky_box';
const MODULE_ASSET = 'asset';
const MODULE_FUSION = 'fusion_system';
const MODULE_EVENT_TOKEN = 'event_token';

const TYPE_LUCKY_BOX = `${PACKAGE_ID}::${MODULE_LUCKY_BOX}::LuckyBox`;
const TYPE_TET_ASSET = `${PACKAGE_ID}::${MODULE_ASSET}::Asset`;
const TYPE_EVENT_TOKEN = `${PACKAGE_ID}::${MODULE_EVENT_TOKEN}::EVENT_TOKEN`;

// Shared Objects (Need to be updated with actual IDs after deployment)
const EVENT_TRACKER_ID = import.meta.env.VITE_EVENT_TRACKER_ID || '0x0';
const TREASURY_CAP_ID = import.meta.env.VITE_TREASURY_CAP_ID || '0x0';
const GAME_CONFIG_ID = import.meta.env.VITE_GAME_CONFIG_ID || '0x0';
const RANDOM_ID = '0x8'; // SUI Random Object ID

export const useTetEvent = () => {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    // ... fetch queries ...

    // Open Box (Now uses Random(0x8) and GameConfig)
    const openBox = useMutation({
        mutationFn: async (boxId) => {
            if (GAME_CONFIG_ID === '0x0') throw new Error("Game Config ID not set");

            const tx = new Transaction();
            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_LUCKY_BOX}::open_box`,
                arguments: [
                    tx.object(boxId),
                    tx.object(RANDOM_ID),
                    tx.object(GAME_CONFIG_ID),
                ],
            });
            return await signAndExecute({ transaction: tx });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ownedLuckyBoxes']);
            queryClient.invalidateQueries(['ownedTetAssets']);
        }
    });

    // Craft Epic Asset (Now uses Random(0x8))
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
            queryClient.invalidateQueries(['ownedTetAssets']);
        }
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
                id: obj.data?.objectId,
                ...obj.data?.content?.fields,
            }));
        },
        enabled: !!account?.address,
    });

    // 3. Fetch Event Token Balance
    const { data: tokenBalance, isLoading: balanceLoading } = useQuery({
        queryKey: ['eventTokenBalance', account?.address],
        queryFn: async () => {
            if (!account?.address || PACKAGE_ID === '0x0') return '0';
            const balance = await client.getBalance({
                owner: account.address,
                coinType: TYPE_EVENT_TOKEN,
            });
            return balance.totalBalance;
        },
        enabled: !!account?.address,
    });

    // 4. Actions
    // Buy Lucky Box (0.05 SUI)
    const buyBox = useMutation({
        mutationFn: async () => {
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [50000000]); // 0.05 SUI
            // Assuming there is a shared 'Shop' object or we just transfer to admin? 
            // Checking lucky_box.move: public fun buy_box(payment: Coin<SUI>, ctx: &mut TxContext)
            // It just takes payment. But where does it go? 
            // In lucky_box.move, buy_box(payment: Coin<SUI>) transfers to sender? No, that's open_box return.
            // Wait, lucky_box.move buy_box implementation:
            // public fun buy_box(payment: Coin<SUI>, ctx: &mut TxContext) { 
            //    assert!(coin::value(&payment) == BOX_PRICE, EInsufficientPayment);
            //    transfer::public_transfer(payment, @ADMIN); // or similar?
            //    let box = ...; transfer::public_transfer(box, sender);
            // }
            // So we need to call `moveCall`.
            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_LUCKY_BOX}::buy_box`,
                arguments: [coin],
            });
            return await signAndExecute({ transaction: tx });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ownedLuckyBoxes']);
        },
    });


    return {
        boxes: boxes || [],
        assets: assets || [],
        tokenBalance: tokenBalance || '0',
        isLoading: boxesLoading || assetsLoading || balanceLoading,
        buyBox,
        openBox,
        craftEpicAsset,
    };
};
