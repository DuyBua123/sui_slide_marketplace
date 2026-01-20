import { useRef } from 'react';
import { Upload, FlipHorizontal, FlipVertical } from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';
import { uploadToPinata } from '../../utils/pinata';

/**
 * Image toolbar - shown when image is selected
 */
export const ImageToolbar = ({ element }) => {
    const fileInputRef = useRef(null);
    const updateElement = useSlideStore((state) => state.updateElement);

    if (!element || element.type !== 'image') return null;

    const handleChange = (key, value) => {
        updateElement(element.id, { [key]: value });
    };

    const handleReplace = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await uploadToPinata(file, file.name);
            handleChange('src', result.url);
        } catch (error) {
            // Fallback to local
            const reader = new FileReader();
            reader.onload = (event) => {
                handleChange('src', event.target?.result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const toggleFlipX = () => {
        handleChange('flipX', !element.flipX);
    };

    const toggleFlipY = () => {
        handleChange('flipY', !element.flipY);
    };

    return (
        <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {/* Replace Image */}
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
            >
                <Upload className="w-4 h-4" />
                Replace
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplace}
                className="hidden"
            />

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Flip Horizontal */}
            <button
                onClick={toggleFlipX}
                className={`p-1.5 rounded transition-colors ${element.flipX ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Flip Horizontal"
            >
                <FlipHorizontal className="w-4 h-4" />
            </button>

            {/* Flip Vertical */}
            <button
                onClick={toggleFlipY}
                className={`p-1.5 rounded transition-colors ${element.flipY ? 'bg-blue-600 text-white' : 'hover:bg-white/10'
                    }`}
                title="Flip Vertical"
            >
                <FlipVertical className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Opacity */}
            <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-gray-400">Opacity</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={element.opacity ?? 1}
                    onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                    className="w-20"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round((element.opacity ?? 1) * 100)}%</span>
            </div>
        </div>
    );
};

export default ImageToolbar;
