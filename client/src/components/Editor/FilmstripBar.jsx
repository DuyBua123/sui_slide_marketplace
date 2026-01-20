import { useState } from 'react';
import { Plus, Grid3x3, ZoomIn, ZoomOut, Maximize2, Copy, Trash2 } from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Enhanced Filmstrip Bar - Canva style with grid view and zoom controls
 */
export const FilmstripBar = () => {
    const [viewMode, setViewMode] = useState('filmstrip'); // 'filmstrip' | 'grid'
    const [zoom, setZoom] = useState(100);
    const [thumbnails, setThumbnails] = useState({});

    const {
        slides,
        currentSlideIndex,
        setCurrentSlideIndex,
        addSlide,
        deleteSlide,
        duplicateSlide,
        reorderSlides,
    } = useSlideStore();

    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Drag handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e, toIndex) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== toIndex) {
            reorderSlides(draggedIndex, toIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleZoomChange = (delta) => {
        setZoom((prev) => Math.max(10, Math.min(200, prev + delta)));
    };

    return (
        <div className="h-20 bg-[#0d0d0d] border-t border-white/5 flex items-center px-4 gap-3">
            {/* Slides */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        draggable
                        onClick={() => setCurrentSlideIndex(index)}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={() => {
                            setDraggedIndex(null);
                            setDragOverIndex(null);
                        }}
                        className={`relative group cursor-pointer ${draggedIndex === index ? 'opacity-50' : ''
                            }`}
                    >
                        {/* Drop indicator */}
                        {dragOverIndex === index && draggedIndex !== index && (
                            <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-purple-500" />
                        )}

                        {/* Thumbnail */}
                        <div
                            className={`w-28 h-16 rounded-lg border-2 transition-all ${index === currentSlideIndex
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                    : 'border-white/10 hover:border-white/30'
                                }`}
                            style={{ background: slide.background || '#1a1a2e' }}
                        >
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                                {index + 1}
                            </div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        duplicateSlide(index);
                                    }}
                                    className="p-1 bg-white/20 hover:bg-white/30 rounded"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                                {slides.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSlide(index);
                                        }}
                                        className="p-1 bg-red-500/50 hover:bg-red-500/70 rounded"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add slide */}
                <button
                    onClick={() => addSlide()}
                    className="flex-shrink-0 w-28 h-16 rounded-lg border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-1"
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-[9px] text-gray-500">Add page</span>
                </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 border-l border-white/5 pl-3">
                {/* Grid view toggle */}
                <button
                    onClick={() => setViewMode(viewMode === 'filmstrip' ? 'grid' : 'filmstrip')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    title="Grid view"
                >
                    <Grid3x3 className="w-4 h-4" />
                </button>

                {/* Zoom */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleZoomChange(-10)}
                        className="p-1 hover:bg-white/10 rounded"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-gray-400 w-10 text-center">{zoom}%</span>
                    <button
                        onClick={() => handleZoomChange(10)}
                        className="p-1 hover:bg-white/10 rounded"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Fullscreen */}
                <button className="p-1.5 hover:bg-white/10 rounded" title="Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                </button>

                {/* Slide counter */}
                <span className="text-xs text-gray-500">
                    {currentSlideIndex + 1} / {slides.length}
                </span>
            </div>
        </div>
    );
};

export default FilmstripBar;
