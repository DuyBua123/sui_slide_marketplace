import React, { useState } from 'react';
import { useTetEvent } from '../hooks/useTetEvent';
import { Gift, Sparkles, Coins, Flame, ChevronRight, AlertCircle } from 'lucide-react';

/**
 * TetEventPage - Dedicated Lunar New Year Event Page
 * 
 * Features:
 * - Event info and how to earn ET
 * - Lucky Box purchase & opening
 * - Asset gallery
 * - Fusion system (craft Epic from 5 Rare)
 */
export const TetEventPage = () => {
    const {
        boxes,
        assets,
        tokenBalance,
        isLoading,
        buyBox,
        openBox,
        craftEpicAsset
    } = useTetEvent();

    const [openingBoxId, setOpeningBoxId] = useState(null);
    const [showResult, setShowResult] = useState(null);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [activeTab, setActiveTab] = useState('boxes');

    const handleBuyBox = async () => {
        try {
            await buyBox.mutateAsync();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleOpenBox = async (boxId) => {
        setOpeningBoxId(boxId);
        try {
            await openBox.mutateAsync(boxId);
            setShowResult({ success: true });
            setTimeout(() => setShowResult(null), 3000);
        } catch (error) {
            alert('Failed to open box: ' + error.message);
        } finally {
            setOpeningBoxId(null);
        }
    };

    const handleSelectAsset = (assetId) => {
        if (selectedAssets.includes(assetId)) {
            setSelectedAssets(selectedAssets.filter(id => id !== assetId));
        } else if (selectedAssets.length < 5) {
            setSelectedAssets([...selectedAssets, assetId]);
        }
    };

    const handleCraft = async () => {
        if (selectedAssets.length !== 5) return;
        try {
            await craftEpicAsset.mutateAsync(selectedAssets);
            setSelectedAssets([]);
            alert('Fusion complete! Check your assets.');
        } catch (error) {
            alert('Fusion failed: ' + error.message);
        }
    };

    const rareAssets = assets.filter(a => a.rarity === 'Rare');

    return (
        <div className="pb-16">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-red-700 via-red-600 to-orange-500">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 text-8xl">🐉</div>
                    <div className="absolute bottom-10 right-10 text-8xl">🧧</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-30">🎆</div>
                </div>

                <div className="relative z-10 p-8 md:p-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/20 rounded-full mb-4 border border-yellow-400/30">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm font-bold text-yellow-300">Limited Time Event</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        🎊 Tết Lucky Box 🎊
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
                        Celebrate Lunar New Year with exclusive rewards! Open Lucky Boxes to win rare Tet-themed assets.
                    </p>

                    {/* ET Balance Display */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/30 rounded-full backdrop-blur-sm border border-white/20">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        <span className="text-2xl font-black text-yellow-400">{tokenBalance}</span>
                        <span className="text-white/70">Event Tokens</span>
                    </div>
                </div>
            </div>

            {/* How to Earn ET */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 mb-8 border border-amber-200 dark:border-amber-700/30">
                <h2 className="text-xl font-black text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    How to Earn Event Tokens (ET)
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-black/30 rounded-xl p-4 border border-amber-200 dark:border-amber-700/30">
                        <div className="text-3xl mb-2">📤</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Sell Slides</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sell your Tet-themed slides to unique buyers</p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-xl p-4 border border-amber-200 dark:border-amber-700/30">
                        <div className="text-3xl mb-2">👥</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Unique Buyers</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Each NEW buyer = 1 ET reward (anti-cheat protected)</p>
                    </div>
                    <div className="bg-white dark:bg-black/30 rounded-xl p-4 border border-amber-200 dark:border-amber-700/30">
                        <div className="text-3xl mb-2">🔄</div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Keep Creating</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">More quality slides = more unique buyers = more ET!</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('boxes')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'boxes'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                >
                    🎁 Lucky Boxes
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'assets'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                >
                    🏆 My Assets ({assets.length})
                </button>
                <button
                    onClick={() => setActiveTab('fusion')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'fusion'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                >
                    🔥 Fusion Lab
                </button>
            </div>

            {/* Lucky Boxes Tab */}
            {activeTab === 'boxes' && (
                <div className="space-y-6">
                    {/* Buy Box Section */}
                    <div className="bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="text-8xl animate-bounce">🎁</div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-black text-white mb-2">Buy Lucky Box</h3>
                            <p className="text-white/80 mb-4">Each box costs 1 Event Token (ET). Win exclusive Tet assets!</p>
                            <button
                                onClick={handleBuyBox}
                                disabled={buyBox.isPending || parseInt(tokenBalance) < 1}
                                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-red-800 font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {buyBox.isPending ? '⏳ Buying...' : '🎁 Buy for 1 ET'}
                            </button>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <h4 className="text-white font-bold mb-2">Prize Chances</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between text-white/70"><span>Nothing</span><span>50%</span></div>
                                <div className="flex justify-between text-white/90"><span>Voucher</span><span>20%</span></div>
                                <div className="flex justify-between text-blue-300"><span>Sticker (Rare)</span><span>10%</span></div>
                                <div className="flex justify-between text-purple-300"><span>Animation (Epic)</span><span>10%</span></div>
                                <div className="flex justify-between text-yellow-300"><span>Video (Legendary)</span><span>10%</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Owned Boxes */}
                    {boxes.length > 0 ? (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Boxes ({boxes.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {boxes.map((box) => (
                                    <div
                                        key={box.id}
                                        className={`bg-gradient-to-br from-red-500 to-orange-400 rounded-xl p-4 text-center ${openingBoxId === box.id ? 'animate-pulse' : ''
                                            }`}
                                    >
                                        <div className="text-5xl mb-3">🎁</div>
                                        <button
                                            onClick={() => handleOpenBox(box.id)}
                                            disabled={openingBoxId === box.id}
                                            className="w-full py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-yellow-100 transition-all disabled:opacity-70"
                                        >
                                            {openingBoxId === box.id ? '✨ Opening...' : 'Open'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-500 dark:text-gray-400">No Lucky Boxes yet. Buy one with your Event Tokens!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Assets Tab */}
            {activeTab === 'assets' && (
                <div>
                    {assets.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {assets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className={`bg-white dark:bg-white/5 rounded-xl p-4 border-2 transition-all ${asset.rarity === 'Legendary' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' :
                                            asset.rarity === 'Epic' ? 'border-purple-400' :
                                                asset.rarity === 'Rare' ? 'border-blue-400' : 'border-gray-200 dark:border-white/10'
                                        }`}
                                >
                                    <div className="text-5xl text-center mb-3">
                                        {asset.asset_type === 'Sticker' && '🐲'}
                                        {asset.asset_type === 'Animation' && '🎆'}
                                        {asset.asset_type === 'Video' && '🎬'}
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 truncate">{asset.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{asset.asset_type}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${asset.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                asset.rarity === 'Epic' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    asset.rarity === 'Rare' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {asset.rarity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl">
                            <div className="text-6xl mb-4">🎭</div>
                            <p className="text-gray-500 dark:text-gray-400">No assets yet. Open Lucky Boxes to win!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Fusion Tab */}
            {activeTab === 'fusion' && (
                <div className="space-y-6">
                    {/* Fusion Info */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Flame className="w-8 h-8" />
                            <h3 className="text-2xl font-black">Fusion Lab</h3>
                        </div>
                        <p className="text-white/80 mb-4">
                            Combine <strong>5 Rare assets</strong> to attempt crafting an <strong>Epic asset</strong>!
                        </p>
                        <div className="flex items-center gap-2 text-yellow-300">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-bold">Warning: 50% chance of failure. All assets will be burned!</span>
                        </div>
                    </div>

                    {/* Asset Selection */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Select 5 Rare Assets ({selectedAssets.length}/5)
                        </h3>

                        {rareAssets.length > 0 ? (
                            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {rareAssets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        onClick={() => handleSelectAsset(asset.id)}
                                        className={`bg-white dark:bg-white/5 rounded-xl p-3 text-center cursor-pointer transition-all border-2 ${selectedAssets.includes(asset.id)
                                                ? 'border-purple-500 ring-2 ring-purple-500/30'
                                                : 'border-gray-200 dark:border-white/10 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="text-4xl mb-2">
                                            {asset.asset_type === 'Sticker' && '🐲'}
                                            {asset.asset_type === 'Animation' && '🎆'}
                                            {asset.asset_type === 'Video' && '🎬'}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{asset.name}</p>
                                        {selectedAssets.includes(asset.id) && (
                                            <div className="mt-2 text-purple-500 font-bold text-xs">✓ Selected</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <p className="text-gray-500">No Rare assets available for fusion.</p>
                            </div>
                        )}
                    </div>

                    {/* Craft Button */}
                    <button
                        onClick={handleCraft}
                        disabled={selectedAssets.length !== 5 || craftEpicAsset.isPending}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30"
                    >
                        {craftEpicAsset.isPending ? '🔥 Crafting...' : `🔥 Craft Epic Asset (${selectedAssets.length}/5)`}
                    </button>
                </div>
            )}

            {/* Result Modal */}
            {showResult && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowResult(null)}>
                    <div className="bg-gradient-to-br from-red-600 to-orange-500 p-12 rounded-3xl text-center animate-bounce-in">
                        <div className="text-8xl mb-4">🎆</div>
                        <h3 className="text-3xl font-black text-white mb-2">Box Opened!</h3>
                        <p className="text-white/80">Check your assets tab for your prize!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TetEventPage;
