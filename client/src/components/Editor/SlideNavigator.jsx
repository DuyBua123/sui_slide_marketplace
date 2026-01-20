import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { useSlideStore } from '../../store/useSlideStore';

/**
 * Filmstrip Slide Navigator - Bottom bar with thumbnails and drag-drop reordering
 */
export const SlideNavigator = () => {
    const scrollRef = useRef(null);
    const [thumbnails, setThumbnails] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const {
        slides,
        currentSlideIndex,
        setCurrentSlideIndex,
        addSlide,
        deleteSlide,
        duplicateSlide,
        reorderSlides,
    } = useSlideStore();

    // Generate thumbnails
    useEffect(() => {
        const generateThumbnails = () => {
            if (window.__slideStage) {
                const newThumbnails = { ...thumbnails };
                newThumbnails[currentSlideIndex] = window.__slideStage.toDataURL({ pixelRatio: 0.12 });
                setThumbnails(newThumbnails);
            }
        };
        const timer = setTimeout(generateThumbnails, 500);
        return () => clearTimeout(timer);
    }, [currentSlideIndex, slides]);

    const scrollToSlide = useCallback((index) => {
        if (scrollRef.current) {
            const slideWidth = 140;
            scrollRef.current.scrollTo({
                left: index * slideWidth - scrollRef.current.offsetWidth / 2 + slideWidth / 2,
                behavior: 'smooth',
            });
        }
    }, []);

    const handleSlideClick = (index) => {
        setCurrentSlideIndex(index);
        scrollToSlide(index);
    };

    const handleAddSlide = () => {
        addSlide();
        setTimeout(() => scrollToSlide(currentSlideIndex + 1), 100);
    };

    const handleDeleteSlide = (e, index) => {
        e.stopPropagation();
        if (slides.length > 1) {
            deleteSlide(index);
        }
    };

    const handleDuplicateSlide = (e, index) => {
        e.stopPropagation();
        duplicateSlide(index);
        setTimeout(() => scrollToSlide(index + 1), 100);
    };

    // Drag and Drop handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, toIndex) => {
        e.preventDefault();
        const fromIndex = draggedIndex;

        if (fromIndex !== null && fromIndex !== toIndex) {
            reorderSlides(fromIndex, toIndex);
        }

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="h-28 bg-gray-950 border-t border-white/5 flex items-center px-4 gap-3 flex-shrink-0">
            {/* Slide Counter */}
            <div className="flex-shrink-0 text-sm text-gray-500 w-16">
                {currentSlideIndex + 1}/{slides.length}
            </div>

            {/* Slides Filmstrip */}
            <div
                ref={scrollRef}
                className="flex-1 flex items-center gap-3 overflow-x-auto py-2 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        draggable
                        onClick={() => handleSlideClick(index)}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 group ${draggedIndex === index ? 'opacity-50' : ''
                            } ${dragOverIndex === index ? 'scale-105' : ''}`}
                    >
                        {/* Drop Indicator */}
                        {dragOverIndex === index && draggedIndex !== index && (
                            <div className="absolute -left-1.5 top-0 bottom-0 w-1 bg-purple-500 rounded-full" />
                        )}

                        {/* Thumbnail Container */}
                        <div
                            className={`w-32 h-[72px] rounded-lg overflow-hidden transition-all ${index === currentSlideIndex
                                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950'
                                    : 'ring-1 ring-white/10 hover:ring-white/30'
                                }`}
                        >
                            {/* Thumbnail or Placeholder */}
                            <div
                                className="w-full h-full"
                                style={{ background: slide.background || '#1a1a2e' }}
                            >
                                {thumbnails[index] ? (
                                    <img
                                        src={thumbnails[index]}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-[10px] text-gray-500">Slide {index + 1}</span>
                                    </div>
                                )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button
                                    onClick={(e) => handleDuplicateSlide(e, index)}
                                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                    title="Duplicate"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                                {slides.length > 1 && (
                                    <button
                                        onClick={(e) => handleDeleteSlide(e, index)}
                                        className="p-1.5 bg-red-500/50 hover:bg-red-500/70 rounded transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Slide Number */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gray-800 rounded text-[10px] font-medium">
                            {index + 1}
                        </div>
                    </div>
                ))}

                {/* Add Slide Button */}
                <button
                    onClick={handleAddSlide}
                    className="flex-shrink-0 w-32 h-[72px] rounded-lg border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-1"
                >
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Add Slide</span>
                </button>
            </div>
        </div>
    );
};

export default SlideNavigator;
