import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { TemplateGallery } from "./TemplateGallery";

/**
 * Design Panel - Canva-style design/templates sidebar
 */
export const DesignPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors">
      {/* Generate Design Button Section */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <button className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]">
          <Sparkles className="w-4 h-4 fill-white/20" />
          Generate a design
        </button>
      </div>

      {/* Search Bar Section */}
      <div className="p-4 border-b border-gray-100 dark:border-white/5">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search professional templates..."
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 dark:focus:border-purple-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Template Gallery Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-gray-950">
        <div className="mb-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-1">
            Explore Templates
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic">
            Select a layout to instantly transform your slide
          </p>
        </div>

        <TemplateGallery searchQuery={searchQuery} />
      </div>

      {/* Recently Used Section */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">
            Recently used
          </h3>
          {/* Optional "Clear All" link can go here */}
        </div>

        <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center py-6 font-medium border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-transparent">
          Your history will appear here
        </div>
      </div>
    </div>
  );
};

export default DesignPanel;
