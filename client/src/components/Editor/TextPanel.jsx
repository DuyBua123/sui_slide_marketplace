import { Type, Sparkles } from 'lucide-react';
import { TextPresets } from './TextPresets';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Text Panel - Canva-style text sidebar
 */
export const TextPanel = () => {
    const { addElement } = useSlideStore();

    const handleAddTextBox = () => {
        addElement('text', {
            text: 'Click to edit',
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#ffffff',
            x: 400,
            y: 250,
            width: 200,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Add Text Box Button */}
            <div className="p-3 border-b border-white/5">
                <button
                    onClick={handleAddTextBox}
                    className="w-full bg-purple-600 hover:bg-purple-500 rounded-lg py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all"
                >
                    <Type className="w-4 h-4" />
                    Add a text box
                </button>
            </div>

            {/* Magic Write Button */}
            <div className="p-3 border-b border-white/5">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all">
                    <Sparkles className="w-4 h-4" />
                    Magic Write
                </button>
            </div>

            {/* Text Presets */}
            <div className="flex-1 overflow-y-auto p-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-3">Default text styles</h3>
                <TextPresets />
            </div>

            {/* Apps Section */}
            <div className="p-3 border-t border-white/5">
                <h3 className="text-xs font-semibold text-gray-400 mb-2">Apps</h3>
                <div className="text-xs text-gray-500 text-center py-2">
                    Text apps coming soon...
                </div>
            </div>
        </div>
    );
};

export default TextPanel;
