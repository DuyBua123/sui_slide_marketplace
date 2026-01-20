import { useState } from 'react';
import { useSlideStore } from '../../store/useSlideStore';
import { uploadToPinata, getIPFSUrl } from '../../utils/pinata';

/**
 * Toolbox component with draggable elements
 * Text, Shapes (Rect, Circle, Line), Image upload with IPFS
 */
export const Toolbox = () => {
    const addElement = useSlideStore((state) => state.addElement);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const tools = [
        {
            id: 'text',
            label: 'Text',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
            ),
            onClick: () => addElement('text', { text: 'Click to edit', x: 100 + Math.random() * 200, y: 100 + Math.random() * 100 }),
        },
        {
            id: 'heading',
            label: 'Heading',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            ),
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
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="4" y="6" width="16" height="12" rx="2" strokeWidth={2} />
                </svg>
            ),
            onClick: () => addElement('rect', { x: 150 + Math.random() * 200, y: 150 + Math.random() * 100 }),
        },
        {
            id: 'circle',
            label: 'Circle',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="8" strokeWidth={2} />
                </svg>
            ),
            onClick: () => addElement('circle', { x: 200 + Math.random() * 200, y: 200 + Math.random() * 100 }),
        },
        {
            id: 'line',
            label: 'Line',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20L20 4" />
                </svg>
            ),
            onClick: () => addElement('line', { x: 100 + Math.random() * 200, y: 100 + Math.random() * 100 }),
        },
    ];

    /**
     * Handle image upload to Pinata IPFS
     */
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            // Upload to Pinata IPFS
            const result = await uploadToPinata(file, file.name);

            // Add image element with IPFS URL
            addElement('image', {
                src: result.url,
                ipfsHash: result.hash,
                x: 100 + Math.random() * 200,
                y: 100 + Math.random() * 100,
            });

            console.log('Image uploaded to IPFS:', result);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(error.message);

            // Fallback: use local data URL if IPFS fails
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
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Elements
            </h3>

            <div className="space-y-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={tool.onClick}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all duration-200 group"
                    >
                        <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
                            {tool.icon}
                        </span>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            {tool.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Image upload with IPFS */}
            <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Media (IPFS)
                </h3>
                <label className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${isUploading
                        ? 'bg-yellow-600/20 border-yellow-500/40'
                        : 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border-blue-500/20 hover:border-blue-500/40'
                    } border`}>
                    {isUploading ? (
                        <>
                            <svg className="w-5 h-5 text-yellow-400 animate-spin" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm font-medium text-yellow-400">Uploading to IPFS...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-blue-400">Upload Image</span>
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

                {/* Error message */}
                {uploadError && (
                    <p className="text-xs text-red-400 mt-2">
                        IPFS upload failed. Using local fallback.
                    </p>
                )}

                {/* IPFS info */}
                <p className="text-xs text-gray-500 mt-2">
                    Images are stored permanently on IPFS via Pinata
                </p>
            </div>

            {/* Keyboard shortcuts help */}
            <div className="mt-6 pt-4 border-t border-white/5">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-1 text-xs text-gray-600">
                    <div><kbd className="px-1 bg-gray-800 rounded">Delete</kbd> Remove element</div>
                    <div><kbd className="px-1 bg-gray-800 rounded">Esc</kbd> Deselect</div>
                </div>
            </div>
        </div>
    );
};

export default Toolbox;
