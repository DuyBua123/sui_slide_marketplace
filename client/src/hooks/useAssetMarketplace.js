import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { getWalrusUrl } from '../utils/walrus';

// Constants
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || '0x0';
const MODULE_MARKET = 'event_market';
const MODULE_ASSET = 'asset';
const MODULE_LUCKY_BOX = 'lucky_box';

const EVENT_ASSET_LISTED = `${PACKAGE_ID}::${MODULE_MARKET}::AssetListed`;
const EVENT_BOX_LISTED = `${PACKAGE_ID}::${MODULE_MARKET}::BoxListed`;
const EVENT_ASSET_SOLD = `${PACKAGE_ID}::${MODULE_MARKET}::AssetSold`;
const EVENT_BOX_SOLD = `${PACKAGE_ID}::${MODULE_MARKET}::BoxSold`;

export const useAssetMarketplace = () => {
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const queryClient = useQueryClient();

    // 1. Fetch Active Listings (Events -> Objects)
    // We query events to find what *was* listed. Then verify existence on-chain.
    const { data: listings, isLoading: listingsLoading } = useQuery({
        queryKey: ['assetMarketplaceListings'],
        queryFn: async () => {
            if (PACKAGE_ID === '0x0') return [];

            // Fetch Listed Events
            // Note: In production, queryEvents pagination should be handled.
            // For now, we fetch last 50 events.
            const events = await client.queryEvents({
                query: { MoveModule: { package: PACKAGE_ID, module: MODULE_MARKET } },
                limit: 50,
                order: 'descending'
            });

            // Filter for Listed events
            const listedEventMap = new Map(); // Map<ListingID, Event>
            const soldSet = new Set(); // Set<ListingID>
            const delistedSet = new Set(); // TODO: Add Delisted Event if exists? Contract doesn't emit Delisted?
            // Checking contract: delist_asset transfers back. Doesn't emit event?
            // Wait, contract DOES NOT EMIT Delist event!
            // This makes it hard to track delisting from events only.
            // BUT we confirm existence via `multiGetObjects`. If deleted, it returns null/error.

            for (const ev of events.data) {
                const type = ev.type;
                const fields = ev.parsedJson;
                const listingId = fields.listing_id;

                if (type === EVENT_ASSET_LISTED || type === EVENT_BOX_LISTED) {
                    if (!soldSet.has(listingId) && !listedEventMap.has(listingId)) {
                        listedEventMap.set(listingId, { ...fields, type });
                    }
                } else if (type === EVENT_ASSET_SOLD || type === EVENT_BOX_SOLD) {
                    soldSet.add(listingId);
                    if (listedEventMap.has(listingId)) {
                        listedEventMap.delete(listingId);
                    }
                }
            }

            const activeListingIds = Array.from(listedEventMap.keys());

            if (activeListingIds.length === 0) return [];

            // Verify existence and fetch details
            const objects = await client.multiGetObjects({
                ids: activeListingIds,
                options: { showContent: true, showDisplay: true }
            });

            const verifiedListings = [];
            objects.forEach((objResponse) => {
                if (objResponse.data) {
                    const fields = objResponse.data.content?.fields;
                    const listingId = objResponse.data.objectId;
                    const originalEvent = listedEventMap.get(listingId);

                    if (fields) {
                        verifiedListings.push({
                            id: listingId,
                            seller: fields.seller,
                            price: fields.price,
                            // Content depends on type
                            // AssetListing has 'asset' field
                            // BoxListing has 'box' field
                            asset: (() => {
                                const raw = fields.asset || fields.box;
                                if (!raw) return null;
                                const rawFields = raw.fields || raw;
                                return {
                                    ...raw,
                                    ...rawFields,
                                    url: getWalrusUrl(rawFields?.url),
                                    image_url: getWalrusUrl(rawFields?.url || rawFields?.display?.image_url)
                                };
                            })(),
                            listingType: fields.asset ? 'Asset' : 'Box',
                            // Add extra metadata if needed
                        });
                    }
                }
            });

            return verifiedListings;
        }
    });

    // 2. Actions

    // List Asset
    const listAsset = useMutation({
        mutationFn: async ({ assetId, price, type }) => {
            const tx = new Transaction();
            const normalizedAssetId = normalizeSuiAddress(String(assetId));

            // Function name depends on type
            const func = type === 'LuckyBox' ? 'list_box' : 'list_asset';

            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_MARKET}::${func}`,
                arguments: [
                    tx.object(normalizedAssetId),
                    tx.pure.u64(BigInt(price * 1_000_000_000)) // Assuming input is SUI, convert to MIST
                ]
            });

            return await signAndExecute({ transaction: tx });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assetMarketplaceListings'] });
            queryClient.invalidateQueries({ queryKey: ['ownedTetAssets'] });
            queryClient.invalidateQueries({ queryKey: ['ownedLuckyBoxes'] });
        }
    });

    // Buy Asset
    const buyAsset = useMutation({
        mutationFn: async ({ listingId, price, type }) => {
            const tx = new Transaction();
            const normalizedListingId = normalizeSuiAddress(String(listingId));

            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);

            const func = type === 'Box' ? 'buy_box' : 'buy_asset';
            const listingType = type === 'Box'
                ? `${PACKAGE_ID}::${MODULE_MARKET}::BoxListing`
                : `${PACKAGE_ID}::${MODULE_MARKET}::AssetListing`;

            tx.moveCall({
                target: `${PACKAGE_ID}::${MODULE_MARKET}::${func}`,
                arguments: [
                    tx.object(normalizedListingId),
                    coin
                ]
            });

            return await signAndExecute({ transaction: tx });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assetMarketplaceListings'] });
            queryClient.invalidateQueries({ queryKey: ['ownedTetAssets'] });
            queryClient.invalidateQueries({ queryKey: ['ownedLuckyBoxes'] });
        }
    });

    return {
        listings: listings || [],
        isLoading: listingsLoading,
        listAsset,
        buyAsset
    };
};
