import { useSlideStore } from '../../store/useSlideStore';
import {
    Palette, Move, RotateCw, Maximize2, Layers,
    Copy, Trash2, Type, ArrowUpCircle, ArrowDownCircle,
    Film, Sparkles
} from 'lucide-react';

const animations = [
    { id: null, label: 'None' },
    { id: 'pulse', label: 'Pulse' },
    { id: 'spin', label: 'Spin' },
    { id: 'bounce', label: 'Bounce' },
    { id: 'wobble', label: 'Wobble' },
];

const transitions = [
    { id: 'none', label: 'None' },
    { id: 'fade', label: 'Fade' },
    { id: 'pushLeft', label: 'Push Left' },
    { id: 'pushRight', label: 'Push Right' },
    { id: 'scale', label: 'Scale' },
];

/**
 * Properties Panel for selected element and slide settings
 */
export const PropertiesPanel = () => {
    const {
        slides,
        currentSlideIndex,
        selectedId,
        selectedIds,
        updateElement,
        deleteSelectedElements,
        copySelected,
        bringToFront,
        sendToBack,
        setSlideBackground,
        setSlideTransition,
    } = useSlideStore();

    const currentSlide = slides[currentSlideIndex];
    const elements = currentSlide?.elements || [];
    const selectedElement = elements.find((el) => el.id === selectedId);

    const handleChange = (key, value) => {
        if (selectedId) {
            updateElement(selectedId, { [key]: value });
        }
    };

    return (
        <div className="space-y-4">
            {/* Slide Settings */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Slide Settings
                </h3>

                {/* Background Color */}
                <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-2">Background</label>
                    <div className="flex gap-2">
                        {['#1a1a2e', '#0f172a', '#1e1b4b', '#14532d', '#7f1d1d', '#ffffff'].map((color) => (
                            <button
                                key={color}
                                onClick={() => setSlideBackground(color)}
                                className={`w-8 h-8 rounded-lg border-2 transition-all ${currentSlide?.background === color ? 'border-blue-500 scale-110' : 'border-transparent'
                                    }`}
                                style={{ background: color }}
                            />
                        ))}
                        <input
                            type="color"
                            value={currentSlide?.background || '#1a1a2e'}
                            onChange={(e) => setSlideBackground(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer"
                        />
                    </div>
                </div>

                {/* Transition */}
                <div>
                    <label className="text-xs text-gray-500 block mb-2 flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        Transition
                    </label>
                    <select
                        value={currentSlide?.transition || 'fade'}
                        onChange={(e) => setSlideTransition(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                        {transitions.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Element Properties */}
            {selectedElement ? (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
                    </h3>

                    {/* Position */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                <Move className="w-3 h-3" /> X
                            </label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.x)}
                                onChange={(e) => handleChange('x', parseFloat(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                <Move className="w-3 h-3" /> Y
                            </label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.y)}
                                onChange={(e) => handleChange('y', parseFloat(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Size (for rect, text, image) */}
                    {(selectedElement.type === 'rect' || selectedElement.type === 'text' || selectedElement.type === 'image') && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                    <Maximize2 className="w-3 h-3" /> Width
                                </label>
                                <input
                                    type="number"
                                    value={Math.round(selectedElement.width || 0)}
                                    onChange={(e) => handleChange('width', parseFloat(e.target.value))}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                    <Maximize2 className="w-3 h-3" /> Height
                                </label>
                                <input
                                    type="number"
                                    value={Math.round(selectedElement.height || 0)}
                                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Rotation */}
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                            <RotateCw className="w-3 h-3" /> Rotation
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={selectedElement.rotation || 0}
                                onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-xs text-gray-400 w-10">{Math.round(selectedElement.rotation || 0)}°</span>
                        </div>
                    </div>

                    {/* Colors */}
                    {selectedElement.type !== 'image' && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                    <Palette className="w-3 h-3" /> Fill
                                </label>
                                <input
                                    type="color"
                                    value={selectedElement.fill || '#ffffff'}
                                    onChange={(e) => handleChange('fill', e.target.value)}
                                    className="w-full h-8 rounded-lg cursor-pointer"
                                />
                            </div>
                            {selectedElement.type !== 'text' && (
                                <div>
                                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                        <Palette className="w-3 h-3" /> Stroke
                                    </label>
                                    <input
                                        type="color"
                                        value={selectedElement.stroke || '#000000'}
                                        onChange={(e) => handleChange('stroke', e.target.value)}
                                        className="w-full h-8 rounded-lg cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text specific */}
                    {selectedElement.type === 'text' && (
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                                <Type className="w-3 h-3" /> Font Size
                            </label>
                            <input
                                type="number"
                                value={selectedElement.fontSize || 24}
                                onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Animation */}
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                            <Sparkles className="w-3 h-3" /> Animation
                        </label>
                        <select
                            value={selectedElement.animation || ''}
                            onChange={(e) => handleChange('animation', e.target.value || null)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            {animations.map((a) => (
                                <option key={a.id || 'none'} value={a.id || ''}>{a.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Z-Index Controls */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => bringToFront(selectedId)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                        >
                            <ArrowUpCircle className="w-3 h-3" /> Front
                        </button>
                        <button
                            onClick={() => sendToBack(selectedId)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                        >
                            <ArrowDownCircle className="w-3 h-3" /> Back
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={copySelected}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs text-blue-400 transition-colors"
                        >
                            <Copy className="w-3 h-3" /> Copy
                        </button>
                        <button
                            onClick={deleteSelectedElements}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs text-red-400 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-500">Select an element to edit properties</p>
                </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Shortcuts</h4>
                <div className="space-y-1 text-xs text-gray-600">
                    <div><kbd className="px-1 bg-gray-800 rounded">Ctrl+Z</kbd> Undo</div>
                    <div><kbd className="px-1 bg-gray-800 rounded">Ctrl+Y</kbd> Redo</div>
                    <div><kbd className="px-1 bg-gray-800 rounded">Ctrl+C</kbd> Copy</div>
                    <div><kbd className="px-1 bg-gray-800 rounded">Ctrl+V</kbd> Paste</div>
                    <div><kbd className="px-1 bg-gray-800 rounded">↑↓←→</kbd> Nudge</div>
                    <div><kbd className="px-1 bg-gray-800 rounded">Shift+Click</kbd> Multi-select</div>
                </div>
            </div>
        </div>
    );
};

export default PropertiesPanel;
