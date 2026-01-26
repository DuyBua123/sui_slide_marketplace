import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { CategoryGrid } from "./CategoryGrid";
import { ShapesLibrary } from "./ShapesLibrary";
import { IconsLibrary } from "./IconsLibrary";
import { VideoLibrary } from "./VideoLibrary";
import { AudioLibrary } from "./AudioLibrary";
import { ThreeDLibrary } from "./ThreeDLibrary";
import { PhotosLibrary } from "./PhotosLibrary";

/**
 * Enhanced Elements Panel - Canva-style with categories
 */
export const ElementsPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-transparent transition-colors">
      {/* Search Bar Section */}
      <div className="p-3 border-b border-gray-100 dark:border-white/5">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-600 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elements"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* AI Image Generation Button */}
      <div className="p-3 border-b border-gray-100 dark:border-white/5">
        <button className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-purple-500/15 active:scale-[0.98]">
          <Sparkles className="w-4 h-4 fill-white/10" />
          Generate images
        </button>
      </div>

      {/* Category Grid or Library Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {activeCategory === null ? (
          <>
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">
              Browse Categories
            </h3>
            <CategoryGrid onSelectCategory={setActiveCategory} />
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Modern Back Button */}
            <button
              onClick={() => setActiveCategory(null)}
              className="cursor-pointer group flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-all mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-fit"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to categories
            </button>

            {/* Content Renderers */}
            <div className="space-y-4">
              {activeCategory === "shapes" && <ShapesLibrary />}
              {activeCategory === "graphics" && <IconsLibrary />}
              {activeCategory === "videos" && <VideoLibrary />}
              {activeCategory === "audio" && <AudioLibrary />}
              {activeCategory === "3d" && <ThreeDLibrary />}
              {activeCategory === "photos" && <PhotosLibrary />}

              {/* Fallback for Coming Soon categories */}
              {!["shapes", "graphics", "videos", "audio", "3d", "photos"].includes(activeCategory) && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center py-16 flex flex-col items-center gap-4 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/50 dark:bg-transparent px-4">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <span className="text-xl">✨</span>
                  </div>
                  <p className="italic font-medium leading-relaxed">
                    {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}{" "}
                    integration is being polished and will be available soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementsPanel;
