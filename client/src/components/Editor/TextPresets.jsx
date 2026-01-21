import { Type, Sparkles, Hash } from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';
import { textPresets } from './textPresetsConfig';




/**
 * Text Presets - Preset text styles
 */
export const TextPresets = () => {
    const { addElement } = useSlideStore();

    const handleAddPreset = (presetKey) => {
        const preset = textPresets[presetKey];
        addElement('text', {
            ...preset,
            x: 100,
            y: 100,
        });
    };

    return (
        <div className="space-y-4">
            {/* Headings */}
            <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Add a heading</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => handleAddPreset('heading1')}
                        className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                    >
                        <span className="text-2xl font-bold group-hover:text-purple-400">Add a heading</span>
                    </button>
                    <button
                        onClick={() => handleAddPreset('heading2')}
                        className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                    >
                        <span className="text-xl font-bold group-hover:text-purple-400">Add a heading</span>
                    </button>
                    <button
                        onClick={() => handleAddPreset('heading3')}
                        className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                    >
                        <span className="text-lg font-bold group-hover:text-purple-400">Add a heading</span>
                    </button>
                </div>
            </div>

            {/* Subheadings */}
            <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Add a subheading</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => handleAddPreset('subheading1')}
                        className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                    >
                        <span className="text-base font-medium text-gray-300 group-hover:text-purple-400">Add a subheading</span>
                    </button>
                    <button
                        onClick={() => handleAddPreset('subheading2')}
                        className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                    >
                        <span className="text-sm font-medium text-gray-300 group-hover:text-purple-400">Add a subheading</span>
                    </button>
                </div>
            </div>

            {/* Body Text */}
            <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Add a bit of body text</h4>
                <button
                    onClick={() => handleAddPreset('body')}
                    className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                >
                    <span className="text-sm text-gray-400 group-hover:text-purple-400">
                        Add a bit of body text
                    </span>
                </button>
            </div>

            {/* Dynamic Text */}
            <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Dynamic text</h4>
                <button
                    onClick={() => {
                        addElement('text', {
                            text: 'Page 1',
                            fontSize: 12,
                            fontFamily: 'Arial',
                            fill: '#9ca3af',
                            x: 870,
                            y: 510,
                        });
                    }}
                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-white/10 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                >
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                        <Hash className="w-4 h-4" />
                    </div>
                    <span className="text-xs group-hover:text-purple-400">Page numbers</span>
                </button>
            </div>
        </div>
    );
};

export default TextPresets;
