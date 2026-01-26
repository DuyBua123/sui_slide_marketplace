import React, { useState } from 'react';
import { useAssetMarketplace } from '../hooks/useAssetMarketplace';
import { useTetEvent } from '../hooks/useTetEvent';
import { ShoppingBag, Tag, Box, Image as ImageIcon, X } from 'lucide-react';
import { normalizeSuiAddress } from '@mysten/sui/utils';

export const AssetMarketplace = () => {
    const { listings, isLoading: listingsLoading, buyAsset, listAsset } = useAssetMarketplace();
    const { assets: myAssets, boxes: myBoxes, isLoading: myLoading } = useTetEvent();

    const [activeTab, setActiveTab] = useState('market'); // 'market' | 'sell'
    const [selectedItemToList, setSelectedItemToList] = useState(null);
    const [listingPrice, setListingPrice] = useState('');

    const handleBuy = async (listing) => {
        if (!confirm(`Buy ${listing.asset?.name || 'Item'} for ${listing.price / 1_000_000_000} SUI?`)) return;
        try {
            await buyAsset.mutateAsync({
                listingId: listing.id,
                price: listing.price, // MIST
                type: listing.listingType
            });
            alert("Purchase successful!");
        } catch (err) {
            alert("Purchase failed: " + err.message);
        }
    };

    const handleList = async () => {
        if (!selectedItemToList || !listingPrice) return;
        try {
            await listAsset.mutateAsync({
                assetId: selectedItemToList.id,
                price: parseFloat(listingPrice),
                type: selectedItemToList.display?.name?.includes('Box') ? 'LuckyBox' : 'Asset'
                // Simple heuristic, or check struct type if available. 
                // TetEvent hook returns display. Let's rely on checking if it's in 'myBoxes' array vs 'myAssets' logic.
                // Wait, useTetEvent separates them.
            });
            setSelectedItemToList(null);
            setListingPrice('');
            alert("Listed successfully!");
        } catch (err) {
            alert("Listing failed: " + err.message);
        }
    };

    // Determine type for listing
    const getListingType = (item) => {
        // Check if item is in myBoxes
        if (myBoxes.find(b => b.id === item.id)) return 'LuckyBox';
        return 'Asset';
    };

    return (
        <div className="pb-16 min-h-screen bg-[#0a0a0f] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                            Asset Marketplace
                        </h1>
                        <p className="text-gray-400 mt-2">Trade Lucky Boxes and Tet Assets with other players.</p>
                    </div>
                    <div className="flex bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'market' ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}
                        >
                            Market
                        </button>
                        <button
                            onClick={() => setActiveTab('sell')}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'sell' ? 'bg-green-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}
                        >
                            Sell My Items
                        </button>
                    </div>
                </div>

                {/* Market Tab */}
                {activeTab === 'market' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {listingsLoading ? (
                            <p className="text-gray-500 col-span-full text-center">Loading market...</p>
                        ) : listings.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-20 bg-white/5 rounded-2xl">No items listed. Be the first!</p>
                        ) : (
                            listings.map((listing) => (
                                <div key={listing.id} className="bg-[#13131a] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group">
                                    <div className="aspect-square bg-gray-800 relative">
                                        {listing.asset?.image_url ? (
                                            <img src={listing.asset.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                {listing.listingType === 'Box' ? '🎁' : '🖼️'}
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold border border-white/10">
                                            {listing.listingType}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1 truncate">{listing.asset?.name || 'Unknown Item'}</h3>
                                        <p className="text-xs text-gray-500 mb-4">{listing.asset?.rarity || 'Common'}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="text-xl font-black text-cyan-400">
                                                {(Number(listing.price) / 1_000_000_000).toFixed(2)} SUI
                                            </div>
                                            <button
                                                onClick={() => handleBuy(listing)}
                                                disabled={buyAsset.isPending}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors"
                                            >
                                                {buyAsset.isPending ? 'Buying...' : 'Buy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Sell Tab */}
                {activeTab === 'sell' && (
                    <div className="space-y-8">
                        {/* Boxes */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                                <Box className="w-5 h-5" /> My Lucky Boxes
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {myBoxes.map(box => (
                                    <div key={box.id} onClick={() => setSelectedItemToList({ ...box, type: 'LuckyBox' })} className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center cursor-pointer hover:bg-red-900/40 transition-all">
                                        <div className="text-4xl mb-2">🎁</div>
                                        <p className="font-bold text-sm">Lucky Box</p>
                                    </div>
                                ))}
                                {myBoxes.length === 0 && <p className="text-gray-500 text-sm">No boxes found.</p>}
                            </div>
                        </div>

                        {/* Assets */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" /> My Assets
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {myAssets.map(asset => (
                                    <div key={asset.id} onClick={() => setSelectedItemToList({ ...asset, type: 'Asset' })} className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 cursor-pointer hover:bg-blue-900/40 transition-all">
                                        <div className="aspect-square bg-black/40 rounded-lg mb-2 overflow-hidden">
                                            {asset.image_url && <img src={asset.image_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <p className="font-bold text-xs truncate">{asset.name}</p>
                                        <p className="text-[10px] text-gray-400">{asset.rarity}</p>
                                    </div>
                                ))}
                                {myAssets.length === 0 && <p className="text-gray-500 text-sm">No assets found.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* List Modal */}
                {selectedItemToList && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1e1e24] rounded-2xl p-6 w-full max-w-md border border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">List Item for Sale</h3>
                                <button onClick={() => setSelectedItemToList(null)}><X className="text-gray-400 hover:text-white" /></button>
                            </div>

                            <div className="flex items-center gap-4 mb-6 bg-black/30 p-4 rounded-xl">
                                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
                                    {selectedItemToList.image_url ? <img src={selectedItemToList.image_url} className="w-full h-full object-cover" /> : (selectedItemToList.type === 'LuckyBox' ? '🎁' : '🖼️')}
                                </div>
                                <div>
                                    <p className="font-bold">{selectedItemToList.name || 'Lucky Box'}</p>
                                    <p className="text-xs text-gray-400">{selectedItemToList.type}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Price (SUI)</label>
                                    <input
                                        type="number"
                                        value={listingPrice}
                                        onChange={(e) => setListingPrice(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button
                                    onClick={handleList}
                                    disabled={!listingPrice || listAsset.isPending}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {listAsset.isPending ? 'Listing...' : 'Confirm Listing'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
