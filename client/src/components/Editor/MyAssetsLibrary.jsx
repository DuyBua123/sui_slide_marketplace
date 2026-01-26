import { Search, Image as ImageIcon, Video, Gift } from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../../store/useSlideStore";
import { useTetEvent } from "../../hooks/useTetEvent";

export const MyAssetsLibrary = () => {
    const { addElement } = useSlideStore();
    const { assets, isLoading } = useTetEvent();
    const [search, setSearch] = useState("");

    const handleAddAsset = (asset) => {
        // Determine type: 'image' or 'video'
        // asset.asset_type might be "Video", "Sticker", "Animation"
        const isVideo = asset.asset_type === "Video";
        const elementType = isVideo ? "video" : "image";

        addElement(elementType, {
            src: asset.url || asset.image_url || asset.display?.image_url,
            x: 100,
            y: 100,
            width: 300,
            height: 300, // Default size
            name: asset.name
            // For video, maybe extra props? VideoElement handles it.
        });
    };

    const filteredAssets = (assets || []).filter(a =>
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.rarity?.toLowerCase().includes(search.toLowerCase())
    );

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'Legendary': return 'bg-yellow-500 text-black';
            case 'Epic': return 'bg-purple-600 text-white';
            case 'Rare': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    if (isLoading) return <div className="text-center p-4 text-gray-500">Loading assets...</div>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search my assets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-purple-500/30 transition-all font-medium"
                />
            </div>

            {filteredAssets.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                    <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No assets found.</p>
                    <p className="mt-1">Play Tet Event to win items!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {filteredAssets.map((asset) => (
                        <button
                            key={asset.id}
                            onClick={() => handleAddAsset(asset)}
                            className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500 transition-all shadow-sm active:scale-95 bg-gray-100 dark:bg-gray-800"
                        >
                            {asset.asset_type === 'Video' ? (
                                <video src={asset.url || asset.display?.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                            ) : (
                                <img
                                    src={asset.url || asset.display?.image_url}
                                    alt={asset.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            )}

                            <div className="absolute top-1 left-1">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm ${getRarityColor(asset.rarity)}`}>
                                    {asset.rarity ? asset.rarity[0] : 'C'}
                                </span>
                            </div>

                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                                <span className="text-white text-[10px] font-bold truncate w-full text-center">{asset.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
