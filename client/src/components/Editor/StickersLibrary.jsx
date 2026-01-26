import { Smile, Gift } from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../../store/useSlideStore";
import { useTetEvent } from "../../hooks/useTetEvent";

export const StickersLibrary = () => {
    const { addElement } = useSlideStore();
    const { assets, isLoading } = useTetEvent();

    // Filter out only Sticker type
    const myStickers = (assets || []).filter(a => a.asset_type === 'Sticker');

    const handleAddSticker = (sticker) => {
        addElement("image", {
            src: sticker.url || sticker.display?.image_url,
            // Stickers might be transparent PNGs
            x: 200,
            y: 200,
            width: 200,
            height: 200,
            name: sticker.name
        });
    };

    if (isLoading) return <div className="text-center p-4 text-xs text-gray-500">Loading your stickers...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">My Stickers</h4>
                <Gift className="w-3 h-3 text-red-500" />
            </div>

            {myStickers.length === 0 ? (
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl text-center border border-dashed border-gray-200 dark:border-white/10">
                    <p className="text-[10px] text-gray-400">No stickers owned.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {myStickers.map((sticker) => (
                        <button
                            key={sticker.id}
                            onClick={() => handleAddSticker(sticker)}
                            className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500 transition-all shadow-sm active:scale-95 bg-white dark:bg-gray-800 p-2"
                            title={sticker.name}
                        >
                            <img
                                src={sticker.url || sticker.display?.image_url}
                                alt={sticker.name}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                            {sticker.rarity === 'Legendary' && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="border-t border-gray-100 dark:border-white/5 my-4" />

            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Editor Stickers</h4>
            <div className="p-4 text-center text-[10px] text-gray-400 italic">
                More stickers coming soon...
            </div>
        </div>
    );
};
