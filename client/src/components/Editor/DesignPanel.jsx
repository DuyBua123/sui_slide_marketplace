import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { TemplateGallery } from './TemplateGallery';

/**
 * Design Panel - Canva-style design/templates sidebar
 */
export const DesignPanel = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="flex flex-col h-full">
            {/* Generate Design Button */}
            <div className="p-3 border-b border-white/5">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all">
                    <Sparkles className="w-4 h-4" />
                    Generate a design
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates"
                        className="w-full bg-gray-800 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Template Gallery */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 mb-1">Templates</h3>
                    <p className="text-[10px] text-gray-500">Choose a template to start</p>
                </div>

                <TemplateGallery searchQuery={searchQuery} />
            </div>

            {/* Recently Used Section */}
            <div className="p-3 border-t border-white/5">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">Recently used</h3>
                <div className="text-xs text-gray-500 text-center py-2">
                    No recent templates
                </div>
            </div>
        </div>
    );
};

export default DesignPanel;
