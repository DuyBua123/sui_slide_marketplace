import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Minus, Plus
} from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

const fontFamilies = [
    'Arial',
    'Arial Black',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Impact',
    'Comic Sans MS',
];

/**
 * Text formatting toolbar - shown when text is selected
 */
export const TextToolbar = ({ element }) => {
    const updateElement = useSlideStore((state) => state.updateElement);

    if (!element || element.type !== 'text') return null;

    const handleChange = (key, value) => {
        updateElement(element.id, { [key]: value });
    };

    const toggleBold = () => {
        handleChange('fontWeight', element.fontWeight === 'bold' ? 'normal' : 'bold');
    };

    const toggleItalic = () => {
        handleChange('fontStyle', element.fontStyle === 'italic' ? 'normal' : 'italic');
    };

    const adjustFontSize = (delta) => {
        const currentSize = element.fontSize || 24;
        const newSize = Math.max(8, Math.min(200, currentSize + delta));
        handleChange('fontSize', newSize);
    };

    return (
        <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {/* Font Family */}
            <select
                value={element.fontFamily || 'Arial'}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="bg-gray-800 border border-white/10 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 max-w-[120px]"
            >
                {fontFamilies.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                    </option>
                ))}
            </select>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Font Size */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => adjustFontSize(-2)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                    type="number"
                    value={Math.round(element.fontSize || 24)}
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 24)}
                    className="w-12 bg-gray-800 border border-white/10 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
                />
                <button
                    onClick={() => adjustFontSize(2)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Bold */}
            <button
                onClick={toggleBold}
                className={`p-1.5 rounded transition-colors ${element.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>

            {/* Italic */}
            <button
                onClick={toggleItalic}
                className={`p-1.5 rounded transition-colors ${element.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Text Color */}
            <div className="relative">
                <input
                    type="color"
                    value={element.fill || '#ffffff'}
                    onChange={(e) => handleChange('fill', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-2 border-white/20"
                    title="Text Color"
                />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => handleChange('align', 'left')}
                    className={`p-1.5 rounded transition-colors ${(element.align || 'left') === 'left' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                        }`}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => handleChange('align', 'center')}
                    className={`p-1.5 rounded transition-colors ${element.align === 'center' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                        }`}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" />
                </button>
                <button
                    onClick={() => handleChange('align', 'right')}
                    className={`p-1.5 rounded transition-colors ${element.align === 'right' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                        }`}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TextToolbar;
