import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Minus, Plus, ChevronDown, Sparkles, Wand2
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
    'Helvetica',
    'Palatino',
];

const textEffects = [
    { id: 'none', label: 'None' },
    { id: 'shadow', label: 'Shadow' },
    { id: 'outline', label: 'Outline' },
    { id: 'lift', label: 'Lift' },
];

/**
 * Enhanced Text Toolbar - Canva-style with all text controls
 */
export const TextToolbar = ({ element, onAnimateClick }) => {
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

    const toggleUnderline = () => {
        handleChange('textDecoration', element.textDecoration === 'underline' ? 'none' : 'underline');
    };

    const adjustFontSize = (delta) => {
        const currentSize = element.fontSize || 24;
        const newSize = Math.max(8, Math.min(200, currentSize + delta));
        handleChange('fontSize', newSize);
    };

    const handleEffectChange = (effectId) => {
        if (effectId === 'none') {
            handleChange('shadowEnabled', false);
            handleChange('strokeEnabled', false);
        } else if (effectId === 'shadow') {
            handleChange('shadowEnabled', true);
            handleChange('shadowColor', '#000000');
            handleChange('shadowBlur', 10);
            handleChange('shadowOffsetX', 5);
            handleChange('shadowOffsetY', 5);
            handleChange('shadowOpacity', 0.5);
        } else if (effectId === 'outline') {
            handleChange('strokeEnabled', true);
            handleChange('stroke', '#000000');
            handleChange('strokeWidth', 2);
        } else if (effectId === 'lift') {
            handleChange('shadowEnabled', true);
            handleChange('shadowColor', '#000000');
            handleChange('shadowBlur', 20);
            handleChange('shadowOffsetX', 0);
            handleChange('shadowOffsetY', 8);
            handleChange('shadowOpacity', 0.3);
        }
    };

    return (
        <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {/* Font Family */}
            <select
                value={element.fontFamily || 'Arial'}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="bg-gray-800 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 min-w-[110px]"
            >
                {fontFamilies.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                    </option>
                ))}
            </select>

            <div className="w-px h-6 bg-white/10" />

            {/* Font Size */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => adjustFontSize(-2)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Decrease font size"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <input
                    type="number"
                    value={Math.round(element.fontSize || 24)}
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 24)}
                    className="w-12 bg-gray-800 border border-white/10 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-blue-500"
                />
                <button
                    onClick={() => adjustFontSize(2)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Increase font size"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Text Color */}
            <div className="relative">
                <input
                    type="color"
                    value={element.fill || '#ffffff'}
                    onChange={(e) => handleChange('fill', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-white/20"
                    title="Text Color"
                />
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Bold, Italic, Underline */}
            <button
                onClick={toggleBold}
                className={`p-1.5 rounded transition-colors ${element.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Bold"
            >
                <Bold className="w-3.5 h-3.5" />
            </button>

            <button
                onClick={toggleItalic}
                className={`p-1.5 rounded transition-colors ${element.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Italic"
            >
                <Italic className="w-3.5 h-3.5" />
            </button>

            <button
                onClick={toggleUnderline}
                className={`p-1.5 rounded transition-colors ${element.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Underline"
            >
                <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-6 bg-white/10" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => handleChange('align', 'left')}
                    className={`p-1.5 rounded transition-colors ${(element.align || 'left') === 'left' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                        }`}
                    title="Align Left"
                >
                    <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => handleChange('align', 'center')}
                    className={`p-1.5 rounded transition-colors ${element.align === 'center' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                        }`}
                    title="Align Center"
                >
                    <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => handleChange('align', 'right')}
                    className={`p-1.5 rounded transition-colors ${element.align === 'right' ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                        }`}
                    title="Align Right"
                >
                    <AlignRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Letter Spacing */}
            <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] text-gray-400">Letter</span>
                <input
                    type="range"
                    min="-50"
                    max="200"
                    value={element.letterSpacing || 0}
                    onChange={(e) => handleChange('letterSpacing', parseInt(e.target.value))}
                    className="w-16 h-1"
                    title="Letter Spacing"
                />
                <span className="text-[10px] text-gray-500 w-6 text-right">{element.letterSpacing || 0}</span>
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Line Height */}
            <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] text-gray-400">Line</span>
                <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={element.lineHeight || 1.2}
                    onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                    className="w-16 h-1"
                    title="Line Height"
                />
                <span className="text-[10px] text-gray-500 w-6 text-right">{(element.lineHeight || 1.2).toFixed(1)}</span>
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Effects */}
            <div className="relative">
                <select
                    onChange={(e) => handleEffectChange(e.target.value)}
                    className="bg-gray-800 border border-white/10 rounded pl-2 pr-6 py-1.5 text-xs focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    title="Text Effects"
                >
                    {textEffects.map((effect) => (
                        <option key={effect.id} value={effect.id}>
                            {effect.label}
                        </option>
                    ))}
                </select>
                <Sparkles className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>

            <div className="w-px h-6 bg-white/10" />

            {/* Animate Button */}
            <button
                onClick={onAnimateClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                title="Animate"
            >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Animate</span>
            </button>

            <div className="w-px h-6 bg-white/10" />

            {/* Opacity */}
            <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] text-gray-400">Opacity</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={element.opacity ?? 1}
                    onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                    className="w-16 h-1"
                />
                <span className="text-[10px] text-gray-500 w-8 text-right">{Math.round((element.opacity ?? 1) * 100)}%</span>
            </div>
        </div>
    );
};

export default TextToolbar;
