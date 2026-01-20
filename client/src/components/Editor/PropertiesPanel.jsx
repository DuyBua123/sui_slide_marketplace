import { useSlideStore } from '../../store/useSlideStore';

/**
 * Properties Panel for editing selected element
 */
export const PropertiesPanel = () => {
    const { elements, selectedId, updateElement, deleteElement, bringToFront, sendToBack, duplicateElement } = useSlideStore();
    const selectedElement = elements.find((el) => el.id === selectedId);

    if (!selectedElement) {
        return (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Properties
                </h3>
                <p className="text-gray-500 text-sm">Select an element to edit its properties</p>
            </div>
        );
    }

    const handleChange = (key, value) => {
        updateElement(selectedId, { [key]: value });
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Properties
            </h3>

            {/* Element type badge */}
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium capitalize">
                {selectedElement.type}
            </div>

            {/* Position */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Position</label>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-500">X</label>
                        <input
                            type="number"
                            value={Math.round(selectedElement.x)}
                            onChange={(e) => handleChange('x', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Y</label>
                        <input
                            type="number"
                            value={Math.round(selectedElement.y)}
                            onChange={(e) => handleChange('y', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Size (for rect, text, image) */}
            {(selectedElement.type === 'rect' || selectedElement.type === 'text' || selectedElement.type === 'image') && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">Width</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.width)}
                                onChange={(e) => handleChange('width', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Height</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.height || 0)}
                                onChange={(e) => handleChange('height', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Radius (for circle) */}
            {selectedElement.type === 'circle' && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Radius</label>
                    <input
                        type="number"
                        value={Math.round(selectedElement.radius)}
                        onChange={(e) => handleChange('radius', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>
            )}

            {/* Rotation */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Rotation</label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation || 0}
                    onChange={(e) => handleChange('rotation', Number(e.target.value))}
                    className="w-full accent-blue-500"
                />
                <div className="text-xs text-gray-500 text-right">{Math.round(selectedElement.rotation || 0)}°</div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Colors</label>
                <div className="grid grid-cols-2 gap-2">
                    {selectedElement.fill !== undefined && (
                        <div>
                            <label className="text-xs text-gray-500">Fill</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selectedElement.fill}
                                    onChange={(e) => handleChange('fill', e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                                />
                                <input
                                    type="text"
                                    value={selectedElement.fill}
                                    onChange={(e) => handleChange('fill', e.target.value)}
                                    className="flex-1 px-2 py-1 bg-black/30 border border-white/10 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                    {selectedElement.stroke !== undefined && (
                        <div>
                            <label className="text-xs text-gray-500">Stroke</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={selectedElement.stroke}
                                    onChange={(e) => handleChange('stroke', e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                                />
                                <input
                                    type="text"
                                    value={selectedElement.stroke}
                                    onChange={(e) => handleChange('stroke', e.target.value)}
                                    className="flex-1 px-2 py-1 bg-black/30 border border-white/10 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Text specific */}
            {selectedElement.type === 'text' && (
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Font</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">Size</label>
                            <input
                                type="number"
                                value={selectedElement.fontSize}
                                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Family</label>
                            <select
                                value={selectedElement.fontFamily}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="Arial">Arial</option>
                                <option value="Arial Black">Arial Black</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Text Content</label>
                        <textarea
                            value={selectedElement.text}
                            onChange={(e) => handleChange('text', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                        />
                    </div>
                </div>
            )}

            {/* Z-index controls */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Layer</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => bringToFront(selectedId)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors"
                    >
                        Bring to Front
                    </button>
                    <button
                        onClick={() => sendToBack(selectedId)}
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors"
                    >
                        Send to Back
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-white/10">
                <button
                    onClick={() => duplicateElement(selectedId)}
                    className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-lg text-sm text-blue-400 transition-colors"
                >
                    Duplicate
                </button>
                <button
                    onClick={() => deleteElement(selectedId)}
                    className="w-full px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default PropertiesPanel;
