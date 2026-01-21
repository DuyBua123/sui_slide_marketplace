import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { CategoryGrid } from './CategoryGrid';
import { ShapesLibrary } from './ShapesLibrary';
import { IconsLibrary } from './IconsLibrary';

/**
 * Enhanced Elements Panel - Canva-style with categories
 */
export const ElementsPanel = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-3 border-b border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search elements"
                        className="w-full bg-gray-800 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Generate Images Button */}
            <div className="p-3 border-b border-white/5">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all">
                    <Sparkles className="w-4 h-4" />
                    Generate images
                </button>
            </div>

            {/* Category Grid or Selected Category Content */}
            <div className="flex-1 overflow-y-auto p-3">
                {activeCategory === null ? (
                    <>
                        <h3 className="text-xs font-semibold text-gray-400 mb-3">Browse categories</h3>
                        <CategoryGrid onSelectCategory={setActiveCategory} />
                    </>
                ) : (
                    <div>
                        {/* Back button */}
                        <button
                            onClick={() => setActiveCategory(null)}
                            className="text-sm text-gray-400 hover:text-white mb-3 flex items-center gap-1"
                        >
                            ← Back to categories
                        </button>

                        {/* Category Content */}
                        {activeCategory === 'shapes' && <ShapesLibrary />}
                        {activeCategory === 'graphics' && <IconsLibrary />}
                        {activeCategory === 'photos' && (
                            <div className="text-xs text-gray-500 text-center py-8">
                                Photos integration coming soon...
                            </div>
                        )}
                        {!['shapes', 'graphics', 'photos'].includes(activeCategory) && (
                            <div className="text-xs text-gray-500 text-center py-8">
                                {activeCategory} content coming soon...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElementsPanel;
