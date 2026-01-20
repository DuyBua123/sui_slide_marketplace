import { useState } from 'react';
import {
    Type, Heading1, Square, Circle, Minus, Image,
    Upload, Loader2
} from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';
import { uploadToPinata } from '../../utils/pinata';

/**
 * Toolbox component with element tools
 */
export const Toolbox = () => {
    const addElement = useSlideStore((state) => state.addElement);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const tools = [
        {
            id: 'text',
            label: 'Text',
            icon: <Type className="w-5 h-5" />,
            onClick: () => addElement('text', {
                text: 'Click to edit',
                x: 100 + Math.random() * 200,
                y: 100 + Math.random() * 100
            }),
        },
        {
            id: 'heading',
            label: 'Heading',
            icon: <Heading1 className="w-5 h-5" />,
            onClick: () => addElement('text', {
                text: 'Heading',
                fontSize: 48,
                fontFamily: 'Arial Black',
                x: 100 + Math.random() * 200,
                y: 100 + Math.random() * 100,
                width: 400,
            }),
        },
        {
            id: 'rect',
            label: 'Rectangle',
            icon: <Square className="w-5 h-5" />,
            onClick: () => addElement('rect', {
                x: 150 + Math.random() * 200,
                y: 150 + Math.random() * 100
            }),
        },
        {
            id: 'circle',
            label: 'Circle',
            icon: <Circle className="w-5 h-5" />,
            onClick: () => addElement('circle', {
                x: 200 + Math.random() * 200,
                y: 200 + Math.random() * 100
            }),
        },
        {
            id: 'line',
            label: 'Line',
            icon: <Minus className="w-5 h-5" />,
            onClick: () => addElement('line', {
                x: 100 + Math.random() * 200,
                y: 100 + Math.random() * 100
            }),
        },
    ];

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const result = await uploadToPinata(file, file.name);
            addElement('image', {
                src: result.url,
                ipfsHash: result.hash,
                x: 100 + Math.random() * 200,
                y: 100 + Math.random() * 100,
            });
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(error.message);
            // Fallback to local
            const reader = new FileReader();
            reader.onload = (event) => {
                addElement('image', {
                    src: event.target?.result,
                    x: 100 + Math.random() * 200,
                    y: 100 + Math.random() * 100,
                });
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {/* Elements */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Elements
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={tool.onClick}
                            className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all group"
                        >
                            <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
                                {tool.icon}
                            </span>
                            <span className="text-[10px] font-medium text-gray-500 group-hover:text-white transition-colors">
                                {tool.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Media */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Media
                </h3>
                <label className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all ${isUploading
                        ? 'bg-yellow-600/20 border-yellow-500/40'
                        : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border-blue-500/20 hover:border-blue-500/40'
                    } border`}>
                    {isUploading ? (
                        <>
                            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                            <span className="text-xs font-medium text-yellow-400">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-medium text-blue-400">Upload Image</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                    />
                </label>
                {uploadError && (
                    <p className="text-[10px] text-red-400 mt-2">Using local fallback</p>
                )}
            </div>

            {/* Tips */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Quick Tips</h4>
                <ul className="space-y-1 text-[10px] text-gray-600">
                    <li>• Double-click text to edit</li>
                    <li>• Shift+Click to multi-select</li>
                    <li>• Drag elements to snap to center</li>
                </ul>
            </div>
        </div>
    );
};

export default Toolbox;
